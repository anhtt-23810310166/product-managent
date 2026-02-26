const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const flash = require("express-flash");
const path = require("path");

const dotenv = require("dotenv");

dotenv.config();

const passport = require("./helpers/passport");

const database = require("./config/database");
database.connect();

// Require routes AFTER model is defined
const route = require("./routes/client/index.route");
const adminRoutes = require("./routes/admin/index.route");

const app = express();
const port = process.env.PORT || 3000;

// Tạo HTTP server và gắn Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 2e7 // Tăng buffer lên 20MB cho phép gửi file/ảnh base64 dung lượng lớn
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

// Session & Flash
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'PRODUCT_MANAGEMENT_SECRET_KEY'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(flash());

// Passport OAuth
app.use(passport.initialize());

// System config
const systemConfig = require("./config/system");
systemConfig(app);

// Routes
route(app);
adminRoutes(app);

// Socket.IO
require("./sockets/chat.socket")(io);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).render("client/pages/errors/404", {
        pageTitle: "404 Not Found"
    });
});

// Global Error Handler (phải đặt sau tất cả routes)
const errorHandler = require("./middlewares/errorHandler.middleware");
app.use(errorHandler);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app