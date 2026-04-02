const mongoose = require('mongoose');
const User = require('./backend/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        for (const user of users) {
            console.log(`- Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
        }

        // Test a sample login if needed
        // const email = 'test@example.com';
        // const pass = 'password123';
        // const u = await User.findOne({ email });
        // if (u) {
        //     const match = await u.matchPassword(pass);
        //     console.log(`Match for ${email}: ${match}`);
        // }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

verify();
