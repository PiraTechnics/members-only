const express = require("express");
const router = express.Router();

const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

/* GET routes */

router.get("/new-message", function (req, res) {
	if (req.isAuthenticated()) {
		res.render("new-message", {
			title: "Members Only",
		});
	} else {
		res.redirect("/login");
	}
});

router.get(
	"/message-board",
	asyncHandler(async (req, res, next) => {
		if (req.isAuthenticated()) {
			const allMessages = await Message.find()
				.populate("user", "username")
				.exec();
			console.log("did we get here?");
			res.render("message-board", {
				title: "Members Only",
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
			});
			return;
		} else if (!req.isAuthenticated()) {
			//No user session, redirect to login page
			res.redirect("/login");
		} else {
			//everything correct, save message to DB and show message board with new posting
			const message = new Message({
				title: req.body.title,
				text: req.body.message,
				user: req.user,
			});

			await message.save();
			const allMessages = await Message.find();

			res.render("message-board", {
				title: "Members Only",
				messages: allMessages,
			});
		}
	}),
]);

module.exports = router;
