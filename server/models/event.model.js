const mongoose = require('mongoose');
const schema = mongoose.Schema;

const eventSchema = new schema({
	date: {
		type: Date
	},
	title:{
		type: String,
		required: true
	},
	location:{
		type: String,
		default: null
	},
	event_type:{
		type: String,
		default: "none"
	},
	time_start:{
		type: Date,
		default: null
	},
	time_end:{
		type: Date,
		default: null
	},
	details:{
		type: String,
		default: null
	},
	is_allday:{
		type: Boolean,
		default: false
	},
	is_alert:{
		type: Boolean,
		default: false
	},
	is_repeated: {
		type: Boolean,
		default: false
	},
	repeated_type: {
		type: String,
		default: null
	},
	is_email:{
		type: Boolean,
		default: false
	},
	alert_time:{
		type: Date,
		default: null
	},
	participants:[{
		type:mongoose.ObjectId
	}],
	expiry_date:{
		type: Date,
		default: null
	}
}, {
	timestamp: true
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;