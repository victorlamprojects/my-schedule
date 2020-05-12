const mongoose = require('mongoose');
const schema = mongoose.Schema;

const monthlySchema = new schema({
	events:[{
		type: mongoose.ObjectId
	}]
});

const MonthlyEvent = mongoose.model('Monthly', monthlySchema);

module.exports = MonthlyEvent;