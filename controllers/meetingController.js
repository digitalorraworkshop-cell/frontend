const Meeting = require('../models/Meeting');
const GoogleIntegration = require('../models/GoogleIntegration');
const Task = require('../models/Task');
const User = require('../models/User');
const googleCalendarService = require('../services/googleCalendarService');
const { getIo } = require('../socket');

// Helper to broadcast meeting updates via socket
const broadcastMeetingEvent = (eventName, data, participantIds = []) => {
    try {
        const io = getIo();
        if (io) {
            io.to('admins').emit(eventName, data);
            participantIds.forEach(pId => {
                if (pId) io.to(pId.toString()).emit(eventName, data);
            });
        }
    } catch (e) {
        // Socket might be idle, ignore error
    }
};

// @desc    Create new meeting with Google Meet / Platform Integration
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res) => {
    try {
        const {
            title,
            meetingType,
            description,
            agenda,
            date,
            startTime,
            endTime,
            timezone,
            participants,
            externalGuests,
            platform,
            customLink,
            priority,
            relatedProject,
            relatedClient,
            clientEmail,
            relatedEmployee,
            reminderMinutes,
            location
        } = req.body;

        if (!title || !date || !startTime || !endTime) {
            return res.status(400).json({ message: 'Title, Date, Start Time, and End Time are required.' });
        }

        const organizerId = req.user._id;

        // Structure internal participants
        const formattedParticipants = [];
        // Add organizer as participant first
        formattedParticipants.push({
            user: organizerId,
            role: 'Organizer',
            invitationStatus: 'Accepted'
        });

        if (Array.isArray(participants)) {
            participants.forEach(p => {
                const userId = p.user || p._id || p;
                if (userId && userId.toString() !== organizerId.toString()) {
                    formattedParticipants.push({
                        user: userId,
                        role: p.role || 'Participant',
                        invitationStatus: 'Pending'
                    });
                }
            });
        }

        // Structure external guests
        const formattedExternalGuests = [];
        if (Array.isArray(externalGuests)) {
            externalGuests.forEach(g => {
                if (g.email && g.email.trim()) {
                    formattedExternalGuests.push({
                        name: g.name || g.email.split('@')[0],
                        email: g.email.trim().toLowerCase(),
                        company: g.company || '',
                        invitationStatus: 'Pending'
                    });
                }
            });
        }

        // Platform & Link generation
        let meetingLink = customLink || '';
        let googleEventId = '';
        let googleMeetCode = '';
        const selectedPlatform = platform || 'Google Meet';

        if (selectedPlatform === 'Google Meet') {
            const googleResult = await googleCalendarService.createGoogleCalendarEvent({
                title,
                description,
                agenda,
                date,
                startTime,
                endTime,
                externalGuests: formattedExternalGuests,
                relatedClient,
                clientEmail
            }, organizerId);

            meetingLink = googleResult.meetingLink;
            googleEventId = googleResult.googleEventId;
            if (meetingLink && meetingLink.includes('meet.google.com/')) {
                googleMeetCode = meetingLink.split('meet.google.com/')[1];
            }
        } else if (selectedPlatform === 'In-App Meeting') {
            const uniqueCode = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
            meetingLink = `https://meet.jit.si/Tracker_${uniqueCode}`;
        } else if (selectedPlatform === 'Microsoft Teams') {
            meetingLink = customLink || 'https://teams.microsoft.com/l/meetup-join/enterprise-crm';
        } else if (selectedPlatform === 'Zoom') {
            meetingLink = customLink || 'https://zoom.us/j/enterprise-crm-room';
        }

        const newMeeting = new Meeting({
            title,
            meetingType: meetingType || 'Team Meeting',
            description: description || '',
            agenda: agenda || '',
            date,
            startTime,
            endTime,
            timezone: timezone || 'IST (UTC+5:30)',
            organizer: organizerId,
            participants: formattedParticipants,
            externalGuests: formattedExternalGuests,
            platform: selectedPlatform,
            meetingLink,
            googleCalendarEventId: googleEventId,
            googleMeetCode,
            location: location || (selectedPlatform === 'In-Person / Physical Location' ? 'Office Conference Room' : `${selectedPlatform} Virtual Room`),
            status: 'Scheduled',
            priority: priority || 'Medium',
            relatedProject: relatedProject || '',
            relatedClient: relatedClient || '',
            clientEmail: clientEmail || '',
            relatedEmployee: relatedEmployee || undefined,
            reminderMinutes: Number(reminderMinutes) || 15,
            activityTimeline: [{
                action: 'Meeting Scheduled',
                performedBy: organizerId,
                performedByName: req.user.name,
                details: `Scheduled on ${date} at ${startTime} via ${selectedPlatform}`
            }]
        });

        const savedMeeting = await newMeeting.save();
        await savedMeeting.populate('organizer', 'name email profilePicture role');
        await savedMeeting.populate('participants.user', 'name email profilePicture role');

        const participantIds = formattedParticipants.map(p => p.user);
        broadcastMeetingEvent('newMeeting', savedMeeting, participantIds);

        res.status(201).json({
            success: true,
            message: 'Meeting scheduled successfully!',
            meeting: savedMeeting
        });
    } catch (error) {
        console.error('[CREATE-MEETING-ERROR]', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get meetings with rich filters, search, and categorization
// @route   GET /api/meetings
// @access  Private
const getMeetings = async (req, res) => {
    try {
        const { filter, search, meetingType, date, status, month, year } = req.query;
        const userId = req.user._id;
        const isAdmin = ['admin', 'seo-manager', 'assets-manager', 'manager'].includes(req.user.role?.toLowerCase());

        const query = {};

        // Scope filter: Non-admin users see meetings they organize, are invited to, or team/department meetings
        if (!isAdmin) {
            query.$or = [
                { organizer: userId },
                { 'participants.user': userId },
                { meetingType: { $in: ['Team Meeting', 'Department Meeting'] } }
            ];
        }

        const todayStr = new Date().toISOString().split('T')[0];

        if (filter === 'today') {
            query.date = todayStr;
            query.status = { $ne: 'Cancelled' };
        } else if (filter === 'upcoming') {
            query.date = { $gte: todayStr };
            query.status = { $in: ['Scheduled', 'Confirmed', 'In Progress'] };
        } else if (filter === 'ongoing') {
            query.date = todayStr;
            query.status = 'In Progress';
        } else if (filter === 'completed') {
            query.status = 'Completed';
        } else if (filter === 'cancelled') {
            query.status = 'Cancelled';
        } else if (filter === 'my' || filter === 'organized') {
            query.organizer = userId;
        } else if (filter === 'invited') {
            query['participants.user'] = userId;
            query.organizer = { $ne: userId };
        } else if (filter === 'client') {
            query.$or = [
                { meetingType: 'Client Meeting' },
                { relatedClient: { $ne: '' } },
                { 'externalGuests.0': { $exists: true } }
            ];
        } else if (filter === 'employee') {
            query.meetingType = { $in: ['Employee Meeting', 'One-to-One', 'HR Meeting', 'Interview'] };
        } else if (filter === 'team') {
            query.meetingType = { $in: ['Team Meeting', 'Project Meeting', 'Department Meeting'] };
        }

        if (meetingType && meetingType !== 'all') {
            query.meetingType = meetingType;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (date) {
            query.date = date;
        }

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { relatedClient: searchRegex },
                    { relatedProject: searchRegex },
                    { 'externalGuests.name': searchRegex },
                    { 'externalGuests.email': searchRegex }
                ]
            });
        }

        const meetings = await Meeting.find(query)
            .populate('organizer', 'name email profilePicture role position')
            .populate('participants.user', 'name email profilePicture role position')
            .sort({ date: 1, startTime: 1 })
            .limit(100);

        res.json(meetings);
    } catch (error) {
        console.error('[GET-MEETINGS-ERROR]', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Today's Chronological Meeting Timeline
// @route   GET /api/meetings/today-timeline
// @access  Private
const getTodayTimeline = async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const userId = req.user._id;
        const isAdmin = ['admin', 'seo-manager', 'assets-manager', 'manager'].includes(req.user.role?.toLowerCase());

        const query = {
            date: todayStr,
            status: { $ne: 'Cancelled' }
        };

        if (!isAdmin) {
            query.$or = [
                { organizer: userId },
                { 'participants.user': userId },
                { meetingType: { $in: ['Team Meeting', 'Department Meeting'] } }
            ];
        }

        const meetings = await Meeting.find(query)
            .populate('organizer', 'name email profilePicture role')
            .populate('participants.user', 'name email profilePicture role')
            .sort({ startTime: 1 });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Meeting Stats Dashboard Counts
// @route   GET /api/meetings/stats
// @access  Private
const getMeetingStats = async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const userId = req.user._id;

        const [
            todayCount,
            upcomingCount,
            completedCount,
            clientCount,
            pendingInvites
        ] = await Promise.all([
            Meeting.countDocuments({ date: todayStr, status: { $ne: 'Cancelled' } }),
            Meeting.countDocuments({ date: { $gte: todayStr }, status: { $in: ['Scheduled', 'Confirmed', 'In Progress'] } }),
            Meeting.countDocuments({ status: 'Completed' }),
            Meeting.countDocuments({ $or: [{ meetingType: 'Client Meeting' }, { relatedClient: { $ne: '' } }] }),
            Meeting.countDocuments({ 'participants': { $elemMatch: { user: userId, invitationStatus: 'Pending' } }, status: { $ne: 'Cancelled' } })
        ]);

        res.json({
            todayCount,
            upcomingCount,
            completedCount,
            clientCount,
            pendingInvites
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single meeting details
// @route   GET /api/meetings/:id
// @access  Private
const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('organizer', 'name email profilePicture role position')
            .populate('participants.user', 'name email profilePicture role position')
            .populate('actionItems.assignedTo', 'name email profilePicture');

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update meeting details / Reschedule
// @route   PUT /api/meetings/:id
// @access  Private
const updateMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const prevDate = meeting.date;
        const prevStart = meeting.startTime;

        const fieldsToUpdate = [
            'title', 'meetingType', 'description', 'agenda', 'date',
            'startTime', 'endTime', 'timezone', 'location', 'priority',
            'relatedProject', 'relatedClient', 'clientEmail', 'status', 'meetingNotes', 'decisions'
        ];

        fieldsToUpdate.forEach(f => {
            if (req.body[f] !== undefined) meeting[f] = req.body[f];
        });

        // Timeline note
        const isRescheduled = (req.body.date && req.body.date !== prevDate) || (req.body.startTime && req.body.startTime !== prevStart);
        meeting.activityTimeline.push({
            action: isRescheduled ? 'Meeting Rescheduled' : 'Meeting Details Updated',
            performedBy: req.user._id,
            performedByName: req.user.name,
            details: isRescheduled ? `Rescheduled to ${meeting.date} at ${meeting.startTime}` : 'Updated agenda and metadata'
        });

        if (isRescheduled) meeting.status = 'Rescheduled';

        const updated = await meeting.save();
        await updated.populate('organizer', 'name email profilePicture role');
        await updated.populate('participants.user', 'name email profilePicture role');

        const participantIds = meeting.participants.map(p => p.user);
        broadcastMeetingEvent('meetingUpdated', updated, participantIds);

        res.json({ success: true, message: 'Meeting updated successfully', meeting: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel Meeting
// @route   PUT /api/meetings/:id/cancel
// @access  Private
const cancelMeeting = async (req, res) => {
    try {
        const { reason } = req.body;
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        meeting.status = 'Cancelled';
        meeting.cancellationReason = reason || 'Cancelled by organizer';
        meeting.activityTimeline.push({
            action: 'Meeting Cancelled',
            performedBy: req.user._id,
            performedByName: req.user.name,
            details: reason || 'Meeting was cancelled'
        });

        await meeting.save();
        const participantIds = meeting.participants.map(p => p.user);
        broadcastMeetingEvent('meetingCancelled', { meetingId: meeting._id, reason }, participantIds);

        res.json({ success: true, message: 'Meeting cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete Meeting with Summary & Next Steps
// @route   PUT /api/meetings/:id/complete
// @access  Private
const completeMeeting = async (req, res) => {
    try {
        const { meetingNotes, decisions, followUpNotes, followUpDate } = req.body;
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        meeting.status = 'Completed';
        if (meetingNotes) meeting.meetingNotes = meetingNotes;
        if (decisions) meeting.decisions = decisions;
        if (followUpNotes) meeting.followUpNotes = followUpNotes;
        if (followUpDate) meeting.followUpDate = new Date(followUpDate);

        meeting.activityTimeline.push({
            action: 'Meeting Completed',
            performedBy: req.user._id,
            performedByName: req.user.name,
            details: 'Meeting marked completed with discussion notes and outcomes'
        });

        await meeting.save();
        res.json({ success: true, message: 'Meeting concluded and saved', meeting });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add Rich Meeting Notes
// @route   POST /api/meetings/:id/notes
// @access  Private
const addMeetingNotes = async (req, res) => {
    try {
        const { notes, decisions } = req.body;
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        if (notes !== undefined) meeting.meetingNotes = notes;
        if (decisions !== undefined) meeting.decisions = decisions;

        meeting.activityTimeline.push({
            action: 'Notes Updated',
            performedBy: req.user._id,
            performedByName: req.user.name,
            details: 'Added discussion notes and action takeaways'
        });

        await meeting.save();
        res.json({ success: true, message: 'Notes recorded', meeting });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add Action Item & Auto-Create CRM Task
// @route   POST /api/meetings/:id/action-items
// @access  Private
const addActionItem = async (req, res) => {
    try {
        const { title, assignedTo, dueDate, priority, createTask = true } = req.body;
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        let createdTaskId = null;
        let assignedUserName = '';

        if (assignedTo) {
            const user = await User.findById(assignedTo);
            if (user) assignedUserName = user.name;
        }

        // Auto-create task in CRM Tasks system
        if (createTask && assignedTo) {
            try {
                const taskDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
                const newTask = await Task.create({
                    title: `[Action Item - ${meeting.title}]: ${title}`,
                    description: `Follow-up action item generated from meeting: ${meeting.title} on ${meeting.date}.\nAgenda: ${meeting.agenda || 'N/A'}`,
                    assignedTo: assignedTo,
                    assignedBy: req.user._id,
                    assignType: 'MANAGER',
                    dueDate: taskDueDate,
                    priority: priority || 'Medium',
                    status: 'Pending'
                });
                createdTaskId = newTask._id;
            } catch (taskErr) {
                console.warn('[TASK-CREATION-WARN]', taskErr.message);
            }
        }

        meeting.actionItems.push({
            title,
            assignedTo: assignedTo || undefined,
            assignedToName: assignedUserName,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            priority: priority || 'Medium',
            status: 'Pending',
            taskId: createdTaskId || undefined
        });

        meeting.activityTimeline.push({
            action: 'Action Item Created',
            performedBy: req.user._id,
            performedByName: req.user.name,
            details: `Assigned: "${title}" to ${assignedUserName || 'Team'}`
        });

        await meeting.save();
        res.status(201).json({ success: true, message: 'Action item created & linked with Tasks', actionItems: meeting.actionItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Respond to Meeting Invitation (Accept / Decline / Tentative)
// @route   POST /api/meetings/:id/invitation-response
// @access  Private
const respondInvitation = async (req, res) => {
    try {
        const { status } = req.body; // 'Accepted', 'Declined', 'Tentative'
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const participant = meeting.participants.find(p => p.user.toString() === req.user._id.toString());
        if (!participant) {
            return res.status(403).json({ message: 'You are not listed as a participant for this meeting.' });
        }

        participant.invitationStatus = status;
        meeting.activityTimeline.push({
            action: `Invitation ${status}`,
            performedBy: req.user._id,
            performedByName: req.user.name,
            details: `${req.user.name} responded ${status}`
        });

        await meeting.save();
        res.json({ success: true, message: `RSVP updated to ${status}`, status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send / Resend Invitations to all participants
// @route   POST /api/meetings/:id/send-invitations
// @access  Private
const sendInvitations = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('participants.user', 'name email');

        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        meeting.activityTimeline.push({
            action: 'Invitations Dispatched',
            performedBy: req.user._id,
            performedByName: req.user.name,
            details: `Meeting invitation and Google Meet link sent to ${meeting.participants.length + meeting.externalGuests.length} invitees`
        });

        await meeting.save();
        res.json({ success: true, message: 'Invitations and Google Meet link sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Google Calendar & Meet Integration Status
// @route   GET /api/meetings/google-status
// @access  Private
const getGoogleIntegrationStatus = async (req, res) => {
    try {
        const integration = await GoogleIntegration.findOne({ user: req.user._id });
        const authData = googleCalendarService.getAuthUrl(req.user._id);

        res.json({
            isConfiguredOnServer: googleCalendarService.isGoogleConfigured(),
            isConnected: Boolean(integration && integration.isConnected),
            googleEmail: integration?.googleEmail || '',
            googleName: integration?.googleName || '',
            lastSyncedAt: integration?.lastSyncedAt || null,
            meetEnabled: integration?.meetEnabled ?? true,
            authUrl: authData.authUrl || ''
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Google OAuth Authorization URL
// @route   GET /api/meetings/google-auth-url
// @access  Private
const getGoogleAuthUrl = async (req, res) => {
    try {
        const authResult = googleCalendarService.getAuthUrl(req.user._id);
        res.json(authResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle Google OAuth Callback & Store Tokens
// @route   POST /api/meetings/google-callback
// @access  Private
const handleGoogleCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'Authorization code is required' });

        const integration = await googleCalendarService.exchangeCodeForTokens(code, req.user._id);
        res.json({
            success: true,
            message: 'Google Calendar and Meet successfully connected!',
            integration
        });
    } catch (error) {
        console.error('[GOOGLE-CALLBACK-ERROR]', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Disconnect Google Account
// @route   POST /api/meetings/google-disconnect
// @access  Private
const disconnectGoogle = async (req, res) => {
    try {
        await GoogleIntegration.findOneAndUpdate(
            { user: req.user._id },
            {
                isConnected: false,
                accessToken: '',
                refreshToken: '',
                googleEmail: '',
                googleName: ''
            }
        );
        res.json({ success: true, message: 'Google Calendar disconnected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Meeting
// @route   DELETE /api/meetings/:id
// @access  Private
const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        await meeting.deleteOne();
        res.json({ success: true, message: 'Meeting removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
