const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const targets = [
    'seomanager@example.com',
    'manoj@example.com',
    'skdigitalkanishka@gmail.com',
    'managerdigitalorra@gmail.com',
    'admin@kind.org.in'
];

const commonPasswords = [
    'Password@123',
    'password123',
    'AdminPassword123',
    'Password123',
    '12345678',
    'admin123',
    'kanishka4882',
    'manuj3058'
];

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected...');

        for (const email of targets) {
            const user = await User.findOne({ email });
            if (!user) {
                console.log(`User ${email} NOT FOUND`);
                continue;
            }
            console.log(`Checking user: ${email} (${user.name})`);
            for (const pass of commonPasswords) {
                const isMatch = await user.matchPassword(pass);
                if (isMatch) {
                    console.log(`[SUCCESS] MATCH FOUND for ${email}: ${pass}`);
                    break;
                }
            }
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
