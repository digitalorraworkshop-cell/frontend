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
        const admin = await User.findOne({ role: 'admin' });
        
        // Create an Admin task assigned to the employee
        const adminTask = await Task.create({
            title: 'Admin Assigned Task',
            description: 'Task from admin',
            assignedTo: employee._id,
            assignedBy: admin._id,
            assignType: 'ADMIN',
            dueDate: new Date(),
            priority: 'High',
            status: 'Pending'
        });

        // Generate token for employee
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: employee._id, role: employee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        const api = axios.create({
            baseURL: 'http://localhost:5001/api',
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Trying to start tracking ADMIN task:", adminTask._id);

        try {
            const startRes = await api.post(`/tasks/${adminTask._id}/start-tracking`);
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
