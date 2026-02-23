const mongoose = require('mongoose');
require('dotenv').config();

const database = require('./config/database');
const Role = require('./models/role.model');
const Account = require('./models/account.model');

async function checkUsers() {
    await database.connect();
    const accounts = await Account.find({}).populate('role_id');
    for (const acc of accounts) {
        console.log("Email:", acc.email);
        console.log("Role ID:", acc.role_id ? acc.role_id._id : "None");
        if (acc.role_id) {
            console.log("Role Title:", acc.role_id.title);
            console.log("Has product-category_create?", acc.role_id.permissions.includes("product-category_create"));
        } else {
            console.log("User has no role object attached.");
        }
        console.log("-------------------");
    }
    process.exit(0);
}
checkUsers();
