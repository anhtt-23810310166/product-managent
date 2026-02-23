const mongoose = require('mongoose');
require('dotenv').config();

const database = require('./config/database');
const Role = require('./models/role.model');

async function test() {
    await database.connect();
    const roles = await Role.find({});
    for (const r of roles) {
        console.log("Role ID:", r._id);
        console.log("Title:", r.title);
        const hasPerm = r.permissions.includes("product-category_create");
        console.log("Has product-category_create?", hasPerm);
        
        // Print all permissions containing 'product'
        console.log("Product related permissions:", r.permissions.filter(p => p.includes("product")));
        console.log("-------------------");
    }
    process.exit(0);
}
test();
