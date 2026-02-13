const mongoose = require("mongoose");

module.exports.connect = () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
}
