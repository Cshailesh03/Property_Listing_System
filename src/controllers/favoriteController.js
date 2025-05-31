const User = require('../models/User');
const Property = require('../models/Property');
const cacheService = require('../services/cacheService');

const addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: propertyId } },
      { new: true }
    ).populate('favorites');

    await cacheService.clearPattern(`user:${userId}:favorites`);

    res.json({
      success: true,
      message: 'Property added to favorites',
      data: user.favorites
    });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: propertyId } },
      { new: true }
    ).populate('favorites');

    await cacheService.clearPattern(`user:${userId}:favorites`);

    res.json({
      success: true,
      message: 'Property removed from favorites',
      data: user.favorites
    });
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const cacheKey = `user:${userId}:favorites:${page}:${limit}`;
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        options: {
          skip: (page - 1) * limit,
          limit: limit
        }
      });

    const response = {
      success: true,
      data: {
        favorites: user.favorites,
        pagination: {
          total: user.favorites.length,
          page,
          pages: Math.ceil(user.favorites.length / limit),
          limit
        }
      }
    };

    await cacheService.set(cacheKey, response, 3600);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};
