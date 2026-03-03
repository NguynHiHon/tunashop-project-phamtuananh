const express = require('express');
const router = express.Router();
const { getAdvisorRecommendation } = require('../controllers/aiAdvisorController');

// POST /api/ai/advisor
router.post('/advisor', getAdvisorRecommendation);

module.exports = router;
