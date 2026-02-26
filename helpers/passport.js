// helpers/passport.js — Cấu hình Passport.js cho Google & Facebook OAuth 2.0

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const generateHelper = require("./generate");

// ==================== GOOGLE STRATEGY ====================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/user/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Tìm user theo googleId
        let user = await User.findOne({ googleId: profile.id, deleted: false });

        if (!user) {
            // Tìm theo email (trường hợp tài khoản đã tồn tại qua đăng ký thường)
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (email) {
                user = await User.findOne({ email: email, deleted: false });
                if (user) {
                    // Liên kết Google ID vào tài khoản cũ
                    user.googleId = profile.id;
                    if (!user.avatar && profile.photos && profile.photos[0]) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                    return done(null, user);
                }
            }

            // Tạo tài khoản mới
            user = new User({
                fullName: profile.displayName,
                email: email,
                avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
                googleId: profile.id,
                authType: "google",
                token: generateHelper.generateRandomString(20),
                status: "active"
            });
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// ==================== FACEBOOK STRATEGY ====================
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/user/auth/facebook/callback",
    profileFields: ["id", "displayName", "email", "photos"]
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Tìm user theo facebookId
        let user = await User.findOne({ facebookId: profile.id, deleted: false });

        if (!user) {
            // Tìm theo email
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (email) {
                user = await User.findOne({ email: email, deleted: false });
                if (user) {
                    user.facebookId = profile.id;
                    if (!user.avatar && profile.photos && profile.photos[0]) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                    return done(null, user);
                }
            }

            // Tạo tài khoản mới
            user = new User({
                fullName: profile.displayName,
                email: email,
                avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
                facebookId: profile.id,
                authType: "facebook",
                token: generateHelper.generateRandomString(20),
                status: "active"
            });
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize & Deserialize (chỉ lưu id vào session tạm cho passport)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
