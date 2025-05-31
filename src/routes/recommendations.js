const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');
const { validateRecommendation, validatePagination, validateMongoId } = require('../middleware/validation');

router.use(authenticate);

router.post('/', validateRecommendation, recommendationController.recommendProperty);
router.get('/', validatePagination, recommendationController.getRecommendations);
router.delete('/:recommendationId', validateMongoId('recommendationId'), recommendationController.deleteRecommendation);

module.exports = router;
