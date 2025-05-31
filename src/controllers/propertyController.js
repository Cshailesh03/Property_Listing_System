const Property = require('../models/Property');
const { getRedisClient } = require('../config/database');
const { buildPropertyFilter , buildSortOptions} = require('../utils/filterBuilder');
const { validationResult } = require('express-validator');
const cacheService = require('../services/cacheService');

const createProperty = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const propertyData = {
      ...req.body,
      createdBy: req.user.id
    };

    const property = await Property.create(propertyData);

    await cacheService.clearPattern('properties:*');

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

const getProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = buildPropertyFilter(req.query);
    
    const cacheKey = `properties:${JSON.stringify({ filter, page, limit })}`;
    
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter)
    ]);

    const response = {
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    };

    await cacheService.set(cacheKey, response, 3600); // 1 hour

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `property:${id}`;
    const cachedProperty = await cacheService.get(cacheKey);
    if (cachedProperty) {
      return res.json(cachedProperty);
    }

    const property = await Property.findById(id)
      .populate('createdBy', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const response = {
      success: true,
      data: property
    };

    await cacheService.set(cacheKey, response, 3600);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this property'
      });
    }

    Object.assign(property, req.body);
    await property.save();

    await cacheService.clearPattern(`property:${id}`);
    await cacheService.clearPattern('properties:*');

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this property'
      });
    }

    await property.deleteOne();

    await cacheService.clearPattern(`property:${id}`);
    await cacheService.clearPattern('properties:*');

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const searchProperties = async (req, res, next) => {
  try {
    const { 
      q, 
      sortBy = 'date_desc',
      page = 1,
      limit = 20,
      ...filters 
    } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

 
    const cleanedFilters = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanedFilters[key] = typeof value === 'string' ? value.trim() : value;
      }
    }

    let searchQuery = buildPropertyFilter(cleanedFilters);
  
    if (q && q.trim()) {
      searchQuery.$text = { $search: q };
    }

    let propertyQuery = Property.find(
      searchQuery,
      q && q.trim() ? { score: { $meta: 'textScore' } } : {}
    );
    
    if (q && q.trim()) {
      if (sortBy === 'relevance' || !sortBy) {
        propertyQuery.sort({ score: { $meta: 'textScore' }, createdAt: -1 });
      } else {
        const customSort = buildSortOptions(sortBy);
        propertyQuery.sort({ ...customSort, score: { $meta: 'textScore' } });
      }
    } else {
      const sortOptions = buildSortOptions(sortBy);
      propertyQuery.sort(sortOptions);
    }

    propertyQuery
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limitNum)
      .lean();

    const [properties, total] = await Promise.all([
      propertyQuery,
      Property.countDocuments(searchQuery)
    ]);

    console.log(`Final result: ${properties.length} properties found, total: ${total}`);

    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: pageNum,
          pages: totalPages,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNum + 1 : null,
          prevPage: hasPrevPage ? pageNum - 1 : null
        },
        filters: {
          applied: Object.keys(cleanedFilters).length > 0 ? cleanedFilters : null,
          textSearch: q || null,
          sortBy
        }
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties
};
