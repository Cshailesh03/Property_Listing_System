const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');
const { validatePagination, validateMongoId } = require('../middleware/validation');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/', validatePagination, favoriteController.getFavorites);
router.post('/', 
  body('propertyId').isMongoId().withMessage('Invalid property ID'),
  favoriteController.addFavorite
);
router.delete('/:propertyId', validateMongoId('propertyId'), favoriteController.removeFavorite);

module.exports = router;
