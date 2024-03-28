const express = require("express");
const path = require("path");
const session = require("express-session");

const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

/**
 * -------------- GENERAL SETUP  ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require("dotenv").config();

const indexRouter = require("./routes/index");
//const usersRouter = require("./routes/users");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/**
 * -------------- DATABASE ----------------
 */

//const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 */

app.use(
	session({
		store: MongoStore.create({
			mongoUrl: process.env.DB_STRING,
		}),
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
		},
	})
);

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await User.findOne({ username: username });
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				// Passwords do not match
				return done(null, false, { message: "Incorrect password" });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err);
	}
});

app.use(passport.session());

/**
 * -------------- ROUTES ----------------
 */

app.use("/", indexRouter);
//app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
