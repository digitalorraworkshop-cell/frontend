const mongoose = require('mongoose');
const Task = require('./models/Task');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        
        // Find a task
        const task = await Task.findOne();
        if (!task) {
            console.log("No task found");
            process.exit(0);
        }
        
        console.log("Task found:", task._id);
        
        // Simulate startTrackingTask
        const assigneeId = task.assignedTo ? (task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo.toString()) : null;
        console.log("Assignee ID:", assigneeId);
        
        task.isTracking = true;
        task.currentTrackingStartTime = new Date();
        await task.save();
        
        console.log("Task saved successfully!");
        
        // Simulate stopTrackingTask
        task.isTracking = false;
        task.currentTrackingStartTime = null;
        await task.save();
        console.log("Task stopped successfully!");

    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        mongoose.disconnect();
    }
}
test();
