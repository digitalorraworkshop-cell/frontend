const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Find an employee
        const employee = await User.findOne({ role: 'employee' });
        
        // Generate token for employee
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: employee._id, role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        const api = axios.create({
            baseURL: 'https://backend-upwl.onrender.com/api',
            headers: { Authorization: `Bearer ${token}` }
        });

        // Get tasks to find one to start tracking
        const resTasks = await api.get('/tasks');
        const tasks = resTasks.data;
        if (tasks.length === 0) {
            console.log("No tasks found");
            process.exit(1);
        }
        
        const task = tasks[0];
        console.log("Trying to start tracking task:", task._id);

        try {
            const startRes = await api.post(`/tasks/${task._id}/start-tracking`);
            console.log("Success!", startRes.status);
            console.log(startRes.data);
        } catch (err) {
            console.log("FAILED!");
            console.log("Status:", err.response?.status);
            console.log("Data:", err.response?.data);
            console.log("Message:", err.message);
        }

    } catch (e) {
        console.error("Setup error:", e);
    } finally {
        mongoose.disconnect();
    }
}
run();
