const User = require("../models/User");
const Property = require("../models/Property");
const cacheService = require("../services/cacheService");


const recommendProperty = async (req, res, next) => {
  try {
    const { propertyId, recipientEmail, message } = req.body;
    const senderId = req.user.id;

    const [recipient, property] = await Promise.all([
      User.findOne({ email: recipientEmail }),
      Property.findById(propertyId),
    ]);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found",
      });
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await User.findByIdAndUpdate(recipient._id, {
      $push: {
        recommendationsReceived: {
          property: propertyId,
          recommendedBy: senderId,
          message: message || "",
          createdAt: new Date(),
        },
      },
    });

    await cacheService.clearPattern(`user:${recipient._id}:recommendations`);

    res.json({
      success: true,
      message: `Property recommended to ${recipientEmail} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: "recommendationsReceived.property",
        options: {
          skip,
          limit,
        },
      })
      .populate({
        path: "recommendationsReceived.recommendedBy",
        select: "name email",
      });

    const recommendations = user.recommendationsReceived.slice(
      skip,
      skip + limit
    );
    const total = user.recommendationsReceived.length;

    const response = {
      success: true,
      data: {
        recommendations,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const deleteRecommendation = async (req, res, next) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $pull: {
        recommendationsReceived: { _id: recommendationId },
      },
    });

    // Clear cache
    await cacheService.clearPattern(`user:${userId}:recommendations`);

    res.json({
      success: true,
      message: "Recommendation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recommendProperty,
  getRecommendations,
  deleteRecommendation,
};
