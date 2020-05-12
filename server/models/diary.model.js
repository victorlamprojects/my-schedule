const mongoose = require('mongoose');
const schema = mongoose.Schema;

const diarySchema = new schema({
	user_id: {
		type: mongoose.ObjectId
	},
	content:{
		type: String
	}
}, {
	timestamp: true
});

const Diary = mongoose.model('Diary', diarySchema);

module.exports = Diary;