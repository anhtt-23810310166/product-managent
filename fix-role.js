const mongoose = require('mongoose');
require('dotenv').config();

const database = require('./config/database');
const Role = require('./models/role.model');
const Account = require('./models/account.model');

async function fixUserRole() {
    await database.connect();
    
    // Find the Admin role
    const adminRole = await Role.findOne({ title: "Quản trị viên" });
    if (!adminRole) {
        console.log("Admin role not found!");
        process.exit(1);
    }
    
    console.log("Found Admin Role ID:", adminRole._id);
    
    // Find the admin user
    const adminUser = await Account.findOne({ email: "admin@gmail.com" });
    if (!adminUser) {
        console.log("Admin user not found!");
        process.exit(1);
    }
    
    console.log("Found Admin User:", adminUser.email);
    console.log("Current Role ID:", adminUser.role_id);
    
    // Update the user
    adminUser.role_id = adminRole._id;
    await adminUser.save();
    
    console.log("Successfully updated admin user's role to Quản trị viên.");
    process.exit(0);
}

fixUserRole();
