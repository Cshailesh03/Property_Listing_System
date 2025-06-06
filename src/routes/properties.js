const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { 
  validateCreateProperty, 
  validateUpdateProperty, 
  validatePagination,
  validateMongoId 
} = require('../middleware/validation');


router.get('/', optionalAuth, validatePagination, propertyController.getProperties);
router.get('/search', optionalAuth, validatePagination, propertyController.searchProperties);
router.get('/:id', optionalAuth, validateMongoId(), propertyController.getPropertyById);

router.post('/', authenticate, validateCreateProperty, propertyController.createProperty);
router.put('/:id', authenticate, validateMongoId(), validateUpdateProperty, propertyController.updateProperty);
router.delete('/:id', authenticate, validateMongoId(), propertyController.deleteProperty);

module.exports = router;
