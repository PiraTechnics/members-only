const express = require("express");
const router = express.Router();

const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");

/* GET routes */

// All Messages, only show if signed in
router.get("/", function (req, res) {
	res.render("index", { title: "Members Only", username: "bob123" });
});

router.get("/login", function (req, res, next) {
	res.render("login", { title: "Log In" });
});

router.get("/signup", function (req, res) {
	res.render("signup", { title: "Sign up" });
});

/* POST routes */

//Login -- currently gets stuck loading on submit
/* router.post("/login", function (req, res) {
	passport.authenticate("local", {
		failureRedirect: "/error",
		successRedirect: "/", 
	});
}); */

router.post("/login", function (req, res) {
	res.send("Not yet implemented!");
});

//Sign-up
router.post("/signup", [
	body("username", "Name must contain at least 6 characters")
		.trim()
		.isLength({ min: 6 }),
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
						title: "Error, please try again",
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
							title: "Error, username unavailable",
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

module.exports = router;
