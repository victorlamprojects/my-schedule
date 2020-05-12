const mongoose = require('mongoose');
const schema = mongoose.Schema;

const weeklySchema = new schema({
	events:[{
		type: mongoose.ObjectId
	}]
});


const WeeklyEvent = mongoose.model('Weekly', weeklySchema);

module.exports = WeeklyEvent;