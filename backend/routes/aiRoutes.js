const express = require('express');
const router = express.Router();
const { getAiInsights, queryAiAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/insights', protect, getAiInsights);
router.post('/query', protect, queryAiAssistant);

module.exports = router;
