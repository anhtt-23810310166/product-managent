const express = require("express");

const dotenv = require("dotenv");

dotenv.config();

const database = require("./config/database");
database.connect();

// Require routes AFTER model is defined
const route = require("./routes/client/index.route");
const adminRoutes = require("./routes/admin/index.route");

const app = express();
const port = process.env.PORT || 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.static('public'));

// System config
const systemConfig = require("./config/system");
systemConfig(app);

// Routes
route(app);
adminRoutes(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});