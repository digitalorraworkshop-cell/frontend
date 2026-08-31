const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance, getAllAttendance, getTodayAttendance, getAdminStats, startBreak, endBreak, getAttendanceHistory, getEmployeeSummary, getAttendanceByDate, bulkUpdateAttendance, startMeeting, endMeeting } = require('../controllers/attendanceController');
const { protect, admin, isManager } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/check-in', protect, upload.single('image'), checkIn);
router.post('/check-out', protect, checkOut);
router.post('/checkout', protect, checkOut);
router.post('/break-start', protect, startBreak);
router.post('/break-end', protect, endBreak);
router.post('/meeting-start', protect, startMeeting);
router.post('/meeting-end', protect, endMeeting);
router.get('/stats', protect, isManager, getAdminStats);
router.get('/today', protect, getTodayAttendance);
router.get('/history', protect, getAttendanceHistory);
router.get('/summary', protect, getEmployeeSummary);
router.get('/by-date', protect, isManager, getAttendanceByDate);
router.post('/bulk-update', protect, isManager, bulkUpdateAttendance);
router.get('/user/:id', protect, getAttendance);
router.get('/:id', protect, getAttendance);
router.get('/', protect, isManager, getAllAttendance);

module.exports = router;

