const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const MessageSchema = new Schema({
	// need message text, ref to user who wrote it, timestamp...what else?
	title: { type: String, required: true },
	text: { type: String, required: true },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	timestamp: { type: Date, default: Date.now },
});

MessageSchema.virtual("formatted_timestamp").get(function () {
	return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Message", MessageSchema);
