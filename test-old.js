const mongoose = require('mongoose');

// mock ObjectId
const assignedTo = new mongoose.Types.ObjectId();

try {
    const assigneeId = assignedTo._id ? assignedTo._id.toString() : assignedTo.toString();
    console.log("Success! assigneeId:", assigneeId);
} catch (e) {
    console.error("Error:", e.message);
}
