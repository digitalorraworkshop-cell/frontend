const mongoose = require('mongoose');

const googleIntegrationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    googleEmail: {
        type: String,
        default: ''
    },
    googleName: {
        type: String,
        default: ''
    },
    accessToken: {
        type: String,
        default: ''
    },
    refreshToken: {
        type: String,
        default: ''
    },
    tokenExpiryDate: {
        type: Date
    },
    calendarId: {
        type: String,
        default: 'primary'
    },
    meetEnabled: {
        type: Boolean,
        default: true
    },
    autoSync: {
        type: Boolean,
        default: true
    },
    lastSyncedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GoogleIntegration', googleIntegrationSchema);
