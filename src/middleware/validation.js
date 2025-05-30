const { body, query, param, validationResult } = require('express-validator');

// Auth validations
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Property validations
const validateCreateProperty = [
  body('propertyId').notEmpty().withMessage('Property ID is required'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('type').isIn(['Apartment', 'Villa', 'Studio', 'Penthouse', 'Bungalow']).withMessage('Invalid property type'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('state').notEmpty().trim().withMessage('State is required'),
  body('city').notEmpty().trim().withMessage('City is required'),
  body('areaSqFt').isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('furnished').isIn(['Furnished', 'Unfurnished', 'Semi']).withMessage('Invalid furnished status'),
  body('availableFrom').isISO8601().withMessage('Available from must be a valid date'),
  body('listedBy').isIn(['Owner', 'Agent', 'Builder']).withMessage('Invalid listing source'),
  body('listingType').isIn(['sale', 'rent']).withMessage('Invalid listing type'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
];

const validateUpdateProperty = [
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
  body('type').optional().isIn(['Apartment', 'Villa', 'Studio', 'Penthouse', 'Bungalow']).withMessage('Invalid property type'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('areaSqFt').optional().isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('furnished').optional().isIn(['Furnished', 'Unfurnished', 'Semi']).withMessage('Invalid furnished status'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
];

// Recommendation validations
const validateRecommendation = [
  body('propertyId').isMongoId().withMessage('Invalid property ID'),
  body('recipientEmail').isEmail().normalizeEmail().withMessage('Please provide a valid recipient email'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message must not exceed 500 characters')
];

// Pagination validations
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// MongoDB ID validation
const validateMongoId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateProperty,
  validateUpdateProperty,
  validateRecommendation,
  validatePagination,
  validateMongoId
};
