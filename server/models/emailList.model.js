const mongoose = require("mongoose");
const schema = mongoose.Schema;

const EmailListSchema = new schema({
	email: {
		type: String,
		require: true
	}
});

const EmailList = mongoose.model('EmailList', EmailListSchema);

module.exports = EmailList;