const mongoose = require('mongoose');

const externalGuestSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, default: '' },
    invitationStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined', 'Tentative', 'No Response'],
        default: 'Pending'
    }
}, { _id: true });

const participantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['Organizer', 'Presenter', 'Participant', 'Optional'],
        default: 'Participant'
    },
    invitationStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined', 'Tentative', 'No Response'],
        default: 'Pending'
    }
}, { _id: false });

const actionItemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String, default: '' },
    dueDate: { type: Date },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const timelineSchema = new mongoose.Schema({
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedByName: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, default: '' }
}, { _id: false });

const meetingSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Meeting title is required'],
        trim: true
    },
    meetingType: {
        type: String,
        enum: [
            'Employee Meeting',
            'Client Meeting',
            'Team Meeting',
            'Project Meeting',
            'HR Meeting',
            'Interview',
            'One-to-One',
            'Department Meeting',
            'Management Meeting',
            'External Meeting',
            'Custom Meeting'
        ],
        default: 'Team Meeting'
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    agenda: {
        type: String,
        default: '',
        trim: true
    },
    date: {
        type: String, // Stored in YYYY-MM-DD for fast querying and indexing
        required: [true, 'Meeting date is required'],
        index: true
    },
    startTime: {
        type: String, // e.g. "14:30" or "02:30 PM"
        required: [true, 'Start time is required']
    },
    endTime: {
        type: String, // e.g. "15:30" or "03:30 PM"
        required: [true, 'End time is required']
    },
    timezone: {
        type: String,
        default: 'IST (UTC+5:30)'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    participants: {
        type: [participantSchema],
        default: []
    },
    externalGuests: {
        type: [externalGuestSchema],
        default: []
    },
    platform: {
        type: String,
        enum: ['Google Meet', 'Microsoft Teams', 'Zoom', 'Custom Meeting Link', 'In-Person / Physical Location', 'In-App Meeting', 'In-App Video Call'],
        default: 'Google Meet'
    },
    meetingLink: {
        type: String,
        default: '',
        trim: true
    },
    googleCalendarEventId: {
        type: String,
        default: ''
    },
    googleMeetCode: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: 'Google Meet Virtual Room'
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
        default: 'Scheduled',
        index: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    relatedProject: {
        type: String,
        default: '',
        trim: true
    },
    relatedClient: {
        type: String,
        default: '',
        trim: true
    },
    clientEmail: {
        type: String,
        default: '',
        trim: true
    },
    relatedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reminderMinutes: {
        type: Number,
        default: 15
    },
    meetingNotes: {
        type: String,
        default: ''
    },
    decisions: {
        type: String,
        default: ''
    },
    actionItems: {
        type: [actionItemSchema],
        default: []
    },
    followUpDate: {
        type: Date
    },
    followUpNotes: {
        type: String,
        default: ''
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    activityTimeline: {
        type: [timelineSchema],
        default: []
    }
}, {
    timestamps: true
});

// Index for fast calendar and search queries
meetingSchema.index({ date: 1, status: 1 });
meetingSchema.index({ organizer: 1, date: 1 });
meetingSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
