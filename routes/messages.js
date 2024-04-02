const express = require("express");
const router = express.Router();

//const Message = require("../models/message");
const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

/* GET routes */

router.get("/new-message", function (req, res) {
	if (res.locals.currentUser) {
		res.render("new-message", {
			title: "Members Only",
			user: res.locals.currentUser,
		});
	} else {
		res.redirect("/login");
	}
});

router.get(
	"/message-board",
	asyncHandler(async (req, res, next) => {
		if (res.locals.currentUser) {
			const allMessages = await Message.find();
			res.render("message-board", {
				title: "Members Only",
				user: res.locals.user,
				messages: allMessages,
			});
		} else {
			res.redirect("/login");
		}
	})
);

/* POST routes */
router.post("/new-message", [
	//sanitize input and add the message to the database
	body("title", "Title should be at least 6 characters long")
		.isLength({
			min: 6,
		})
		.escape(),
	body("message", "Message must be at least 8 characters")
		.isLength({ min: 8 })
		.escape(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			console.log(errors);

			res.render("new-message", {
				title: "Members Only",
				user: res.locals.currentUser,
			});
			return;
		} else if (!req.isAuthenticated()) {
			//No user session, redirect to login page
			res.redirect("/login");
		} else {
			//everything correct, save message to DB and show message board with new posting

			console.log(res.locals.user);
			console.log(req.user);

			const message = new Message({
				title: req.body.title,
				text: req.body.message,
				user: res.locals.user._id,
			});

			await message.save();
			const allMessages = await Message.find();

			res.render("message-board", {
				title: "Members Only",
				user: res.locals.user,
				messages: allMessages,
			});
		}
	}),
]);

module.exports = router;
