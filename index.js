const express = require("express");
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const flash = require("express-flash");
const path = require("path");

const dotenv = require("dotenv");

dotenv.config();

const database = require("./config/database");
database.connect();

// Require routes AFTER model is defined
const route = require("./routes/client/index.route");
const adminRoutes = require("./routes/admin/index.route");

const app = express();
const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

// Session & Flash
app.use(cookieSession({
    name: 'session',
    keys: ['PRODUCT_MANAGEMENT_SECRET_KEY'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(flash());

// System config
const systemConfig = require("./config/system");
systemConfig(app);

// Routes
route(app);
adminRoutes(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app