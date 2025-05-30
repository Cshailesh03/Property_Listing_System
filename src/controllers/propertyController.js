const Property = require('../models/Property');
const { getRedisClient } = require('../config/database');
const { buildPropertyFilter } = require('../utils/filterBuilder');
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

    // Clear cache for property list
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

    // Build filter from query parameters
    const filter = buildPropertyFilter(req.query);
    
    // Create cache key
    const cacheKey = `properties:${JSON.stringify({ filter, page, limit })}`;
    
    // Check cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query database
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

    // Cache the response
    await cacheService.set(cacheKey, response, 3600); // 1 hour

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check cache
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

    // Cache the property
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

    // Check if user is the owner
    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this property'
      });
    }

    // Update property
    Object.assign(property, req.body);
    await property.save();

    // Clear related cache
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

    // Check if user is the owner
    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this property'
      });
    }

    await property.deleteOne();

    // Clear related cache
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
    const { q, ...filters } = req.query;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    let searchQuery = buildPropertyFilter(filters);

    // Add text search if query provided
    if (q) {
      searchQuery.$text = { $search: q };
    }

    const [properties, total] = await Promise.all([
      Property.find(searchQuery)
        .populate('createdBy', 'name email')
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(searchQuery)
    ]);

    res.json({
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
    });
  } catch (error) {
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
