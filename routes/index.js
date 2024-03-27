const express = require("express");
const router = express.Router();

const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

/* GET routes */

// All Messages, only show if signed in
router.get("/", function (req, res) {
	res.render("index", { title: "Members Only", username: "bob123" });
});

/* POST routes */

//Login
router.post("/login", function (req, res) {
	res.send("Not yet implemented"); //TODO
});

//Sign-up
router.post("/signup", function (req, res) {
	res.send("Not yet implemented"); //TODO
});

module.exports = router;
