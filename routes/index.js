const express = require("express");
const router = express.Router();

//const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");

/* GET routes */

// All Messages, only show if signed in
router.get("/", function (req, res) {
	if (res.locals.currentUser) {
		res.render("index", {
			title: "Members Only",
			user: res.locals.currentUser,
		});
	} else {
		res.redirect("/login");
	}
});

router.get("/login", function (req, res, next) {
	res.render("login", {
		title: "Log In",
	});
});

router.get("/signup", function (req, res) {
	res.render("signup", { title: "Sign up" });
});

router.get("/join", function (req, res) {
	res.render("join", { user: res.locals.currentUser, errorMessage: false });
});

router.get("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

/* POST routes */

router.post(
	"/login",
	passport.authenticate("local", {
		failureRedirect: "/login",
		successRedirect: "/",
	})
);

//Sign-up
router.post("/signup", [
	// NOTE: Should sanitize first and last names too
	body("username", "Name must contain at least 6 characters")
		.trim()
		.isLength({ min: 6 }),
	body("password", "Password must be at least 6 characters").isLength({
		min: 6,
	}),
	body("passwordConfirmation", "Passwords must match!").custom(
		(value, { req }) => {
			return value === req.body.password;
		}
	),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
			// if err, do something
			if (err) {
				return next(err);
			} else {
				// otherwise, create new user with hashed password
				const user = new User({
					username: req.body.username,
					password: hashedPassword,
					firstname: req.body.firstname,
					lastname: req.body.lastname,
				});

				// Re-render form with error messages if there are errors
				if (!errors.isEmpty()) {
					res.render("signup", {
						errorMessage: "Error, please try again",
						errors: errors.array(),
					});
					return;
				} else {
					// Data is valid
					// Check if username is taken
					const usernameTaken = await User.findOne({
						username: req.body.username,
					})
						.collation({ locale: "en", strength: 2 })
						.exec();

					if (usernameTaken) {
						//re-render signup form with error message
						res.render("signup", {
							errorMessage: "Error, username unavailable",
						});
					} else {
						await user.save();
						res.redirect("/");
					}
				}
			}
		});
	}),
]);

router.post("/join", [
	body("accessCode").trim().escape(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			//re-render with blank form and error messages
			res.render("join", {
				user: res.locals.currentUser,
				errorMessage: errors.toString(),
			});
			return;
		} else if (!res.locals.user) {
			//No user session, redirect to login page
			res.redirect("/login");
		} else {
			// Compare entered result to our secret access code
			if (req.body.accessCode !== process.env.SECRET) {
				// not correct, re-render join form
				res.render("join", {
					user: res.locals.currentUser,
					errorMessage: "wrong secret, try again",
				});
				return;
			} else {
				//code is correct, set user to member and send to message board
				const memberUser = req.user;
				memberUser.member = true;
				await User.findByIdAndUpdate(req.user.id, memberUser);
				res.redirect("/");
			}
		}
	}),
]);

module.exports = router;
