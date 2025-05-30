const Property = require('../models/Property');
const cacheService = require('./cacheService');

class PropertyService {
  async createProperty(data, userId) {
    const property = await Property.create({
      ...data,
      createdBy: userId
    });

    // Clear cache
    await cacheService.clearPattern('properties:*');
    
    return property;
  }

  async updateProperty(propertyId, updates, userId) {
    const property = await Property.findOneAndUpdate(
      { _id: propertyId, createdBy: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (property) {
      // Clear specific property cache and list cache
      await cacheService.del(`property:${propertyId}`);
      await cacheService.clearPattern('properties:*');
    }

    return property;
  }

  async deleteProperty(propertyId, userId) {
    const property = await Property.findOneAndDelete({
      _id: propertyId,
      createdBy: userId
    });

    if (property) {
      // Clear cache
      await cacheService.del(`property:${propertyId}`);
      await cacheService.clearPattern('properties:*');
    }

    return property;
  }

  async getPropertiesWithFilters(filters, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(filters)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filters)
    ]);

    return {
      properties,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  async getPropertyAnalytics(userId) {
    const analytics = await Property.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalProperties: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalValue: { $sum: '$price' },
          byType: {
            $push: {
              type: '$type',
              listingType: '$listingType'
            }
          }
        }
      }
    ]);

    return analytics[0] || {
      totalProperties: 0,
      avgPrice: 0,
      totalValue: 0,
      byType: []
    };
  }
}

module.exports = new PropertyService();
