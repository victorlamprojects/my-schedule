const mongoose = require('mongoose');
const schema = mongoose.Schema;

const dailySchema = new schema({
	events:[{
		type: mongoose.ObjectId
	}]
});

const DailyEvent = mongoose.model('Daily', dailySchema);

module.exports = DailyEvent;