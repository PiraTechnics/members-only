const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();

const conn = process.env.DB_STRING;

const connection = mongoose.createConnection(conn);

const UserSchema = new Schema({
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	member: { type: Boolean, required: true, default: false },
});

module.exports = connection.model("User", UserSchema);
