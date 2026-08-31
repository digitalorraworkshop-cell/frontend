const express = require('express');
const router = express.Router();
const {
    createMeeting,
    getMeetings,
    getTodayTimeline,
    getMeetingStats,
    getMeetingById,
    updateMeeting,
    cancelMeeting,
    completeMeeting,
    addMeetingNotes,
    addActionItem,
    respondInvitation,
    sendInvitations,
    getGoogleIntegrationStatus,
    getGoogleAuthUrl,
    handleGoogleCallback,
    disconnectGoogle,
    deleteMeeting
} = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

// Primary Meeting Endpoints
router.post('/', protect, createMeeting);
router.get('/', protect, getMeetings);
router.get('/today-timeline', protect, getTodayTimeline);
router.get('/stats', protect, getMeetingStats);

// Google Calendar & Meet Integration
router.get('/google-status', protect, getGoogleIntegrationStatus);
router.get('/google-auth-url', protect, getGoogleAuthUrl);
router.post('/google-callback', protect, handleGoogleCallback);
router.post('/google-disconnect', protect, disconnectGoogle);

// Single Meeting Operations
router.get('/:id', protect, getMeetingById);
router.put('/:id', protect, updateMeeting);
router.put('/:id/cancel', protect, cancelMeeting);
router.put('/:id/complete', protect, completeMeeting);
router.post('/:id/notes', protect, addMeetingNotes);
router.post('/:id/action-items', protect, addActionItem);
router.post('/:id/invitation-response', protect, respondInvitation);
router.post('/:id/send-invitations', protect, sendInvitations);
router.delete('/:id', protect, deleteMeeting);

module.exports = router;
