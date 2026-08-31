const express = require('express');
const router = express.Router();
const { getPayrollSummary } = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getPayrollSummary);

module.exports = router;
