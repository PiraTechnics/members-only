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
router.post("/mew-message", [
	//sanitize input and add the message to the database
	body("title", "Title should be at least 8 characters long")
		.isLength({
			min: 8,
		})
		.escape(),
	body("message-body", "Message must be at least 10 characters")
		.isLength({ min: 8 })
		.escape(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render("new-message", {
				user: res.locals.currentUser,
				errorMessage: errors.toString(),
			});
			return;
		} else if (!res.locals.user) {
			//No user session, redirect to login page
			res.redirect("/login");
		} else {
			//everything correct, save message to DB and show message board with new posting
			const message = new Message({
				title: req.body.title,
				text: req.body.message,
				user: res.locals.user,
			});

			await message.save();
			const allMessages = await Message.find();

			// Currently 404'ing here. FIND OUT WHY

			/* 			res.render("message-board", {
				title: "Members Only",
				user: res.locals.user,
				messages: allMessages,
			}); */
		}
	}),
]);

module.exports = router;
