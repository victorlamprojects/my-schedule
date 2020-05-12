const mongoose = require('mongoose');
const schema = mongoose.Schema;

const timetableSchema = new schema({
	Monday:[{
		type: String,
		maxlength: 4,
		minlength: 4
	}],
	Tuesday:[{
		type: String,
		maxlength: 4,
		minlength: 4
	}],
	Wednesday:[{
		type: String,
		maxlength: 4,
		minlength: 4
	}],
	Thursday:[{
		type: String,
		maxlength: 4,
		minlength: 4
	}],
	Friday:[{
		type: String,
		maxlength: 4,
		minlength: 4
	}],
	Saturday:[{
		type: String,
		maxlength: 4,
		minlength: 4
	}],
	Sunday:[{
		type: String,
		maxlength: 4,
		minlength: 4
	}]
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;