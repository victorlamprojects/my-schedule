const router = require('express').Router();
const CronJob = require('cron').CronJob;
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Common = require('./common');
let User = require('../models/user.model');
let Event = require('../models/event.model');
let Daily = require('../models/dailyEvent.model');
let Weekly = require('../models/weeklyEvent.model');
let Monthly = require('../models/monthlyEvent.model');
let quotes = fs.readFileSync(path.join(__dirname, '../src/quotes_bank.txt')).toString().split('\n');
let quote = quotes[Math.floor(Math.random()*quotes.length)];

//Search user info by user id
//If not given id or cannot find the user, return {}
router.route('/').get((req, res)=>{
	userID = req.user._id;
	User.findById(userID, '-password', (err, user)=>{
		foundUser = {};
		if(!user){
			foundUser = {};
		}
		else{
			foundUser= user;
		}
		res.json(foundUser);
	});
})

//Update a user's info
router.route('/update').post((req, res)=>{
	let query = {_id: req.user._id};
	let user = {
		name: req.body.name,
		email: req.body.email
	}
	if(req.body.password != null){
		user.password = req.body.password;
	}
	User.findOneAndUpdate(query, user, (err, user)=>{
		if(err){
			res.json('Error occurs while updating user information.');
		}
		else{
			res.json('Update successfully.');
		}
	},{useFindAndModify: false});
});

//Get event list if pass no id
router.route('/events/:id?').get((req, res)=>{
	let eventID = req.params.id;
	let query = {_id: req.user._id};
	User.findOne(query, (err, user)=>{
		if(err || !user){
			res.json({});
		}
		else if(eventID == null){			//return event list
			let eventList = {
				events: null
			}
			eventList.events = user.events;
			res.json(eventList);
		}
		else{								//return sepecific event
			Event.findById({_id: eventID}, (err, event)=>{
				if(err || !event){
					res.json({});
				}
				else{
					res.json(event);
				}
			});
		}
	});
});


//Add events
router.route('/addEvent').post((req, res)=>{
	let query = {_id: req.user._id};
	let event = req.body;
	User.findOne(query, (err, user)=>{
		if(err){
			return res.json('Error occurs while adding event.');;
		}
		if(user){
			//parse date
			event.date = Common.isDate(event.date) ? new Date(event.date) : null;
			event.time_start = Common.isDate(event.time_start)? new Date(event.time_start) : null;
			event.time_end = Common.isDate(event.time_end)? new Date(event.time_end) : null;

			if(event.is_alert){
				let alert_t = event.alert_time;
				if(alert_t == null || alert_t.trim() == ''){
					event.alert_time = event.time_start;
				}
				else{
					event.alert_time = new Date(event.alert_time);
				}
			}
			//Add self as event participant
			event.participants = [user._id];

			let e = new Event(event);
			e.save()
			.then(async ()=>{
				if(e.is_repeated){
					switch(e.repeated_type){
						case "Daily":
							if(user.daily == null){
								let d = new Daily({
									events: [e._id]
								});
								await d.save()
								.then(()=>{
									user.daily = d._id;
								});
							}
							else {
								let d = user.daily;
								await Daily.findById(d, async (err, daily)=>{
									if(err){
										return res.json(err);
									}
									if(!daily){
										return res.json("Daily table not found!");
									}
									daily.events.push(e._id);
									await daily.save()
										.catch(err=>res.json('Cannot add event to daily table.'));
								});
							}
							break;
						case "Weekly":
							if(user.weekly == null){
								let d = new Weekly({
									events: [e._id]
								});
								await d.save()
								.then(()=>{
									user.weekly = d._id;
								});
							}
							else {
								let d = user.weekly;
								await Weekly.findById(d, async (err, weekly)=>{
									if(err){
										return res.json(err);
									}
									if(!weekly){
										return res.json("Weekly table not found!");
									}
									weekly.events.push(e._id);
									await weekly.save()
										.catch(err=>res.json('Cannot add event to weekly table.'));
								});
							}
							break;
						case "Monthly":
							if(user.monthly == null){
								let d = new Monthly({
									events: [e._id]
								});
								await d.save()
								.then(()=>{
									user.monthly = d._id;
								});
							}
							else {
								let d = user.monthly;
								await Monthly.findById(d, async (err, monthly)=>{
									if(err){
										return res.json(err);
									}
									if(!monthly){
										return res.json("Monthly table not found!");
									}
									monthly.events.push(e._id);
									await monthly.save()
										.catch(err=>res.json('Cannot add event to monthly table.'));
								});
							}
							break;
						default:
							break;
					}
				}
				else{
					if(user.events == null){
						user.events = [e._id];
					}
					else{
						user.events.push(e._id);
					}	
				}
				
				user.save()
					.catch((err)=>res.json('Cannot add event to the current user.'));
				res.json('Event added successfully.');
			})
			.catch((err)=>res.json(`Error: ${err}`));

		}
		else{
			res.json('User not found.');
		}
	});
});

//Update event
router.route('/updateEvent').post((req, res)=>{
	let query = {_id: req.user._id};
	let event = req.body.event;
	if(event.participants != null){
		delete event.participants;
	}
	User.findOne(query, (err, user)=>{
		if(err){
			return res.json('Error occurs while adding event.');;
		}
		if(user){
			//Check if id is valid
			if(user.events.indexOf(event._id) == -1){
				res.json('This event does not belong to the user.');
				return;
			}
			//parse date
			event.date = Common.isDate(event.date) ? new Date(event.date) : null;
			event.time_start = new Date(event.time_start);
			event.time_end = new Date(event.time_end);
			if(event.time_start ==  'Invalid Date'){
				delete event.time_start;
			}
			if(event.time_end ==  'Invalid Date'){
				delete event.time_end;
			}

			if(event.is_alert){
				let alert_t = event.alert_time;
				if(alert_t == null || alert_t.trim() == ''){
					event.alert_time = event.time_start;
				}
				else{
					event.alert_time = new Date(event.alert_time);
				}
			}
			if(event.is_alert){
				let alert_t = event.alert_time;
				if(alert_t == null || alert_t.trim() == ''){
					event.alert_time = event.time_start;
				}
				else{
					event.alert_time = new Date(event.alert_time);
				}
			}
			let eventQuery = {_id: event._id};
			delete event._id;
			Event.findOneAndUpdate(eventQuery, event,{useFindAndModify: false})
			.then(()=>res.json('Event updated successfully.'))
			.catch((err)=>res.json('Error occurs while updating event information.'));
		}
		else{
			res.json('User not found.');
		}
	});
});

//Delete event
router.route('/deleteEvent').post((req, res)=>{
	let query = {_id: req.user._id};
	User.findOne(query, async (err, user)=>{
		if(err){
			res.json("Error occurs while finding user.");
			return;
		}
		if(!user){
			res.json("User not found.");
			return;
		}
		let eventId = req.body.e_id
		//find in normal events
		let evts = user.events;
		let daily = user.daily;
		let weekly = user.weekly;
		let monthly = user.monthly;
		if(evts != null && evts.includes(eventId)){
			const index = evts.indexOf(eventId);
			if(index > -1){
				evts.splice(index, 1);
				Common.deleteDocument({_id: eventId}, Event);
				user.events = evts;
				user.save()
				.then(res.json('Event deleted successfully.'))
				.catch((err)=>res.json('Cannot update the current user.'));
				return;
			}
		}
		else{
			if(daily != null){
				let dailyEvent = await Daily.findById(daily);
				if(dailyEvent){
					//found daily in Daily table
					let list = dailyEvent.events;
					if(list != null && list.includes(eventId)){
						const index = list.indexOf(eventId);
						if(index > -1){
							list.splice(index, 1);
							Common.deleteDocument({_id: eventId}, Event);
							dailyEvent.events = list;
							dailyEvent.save()
							.then(res.json('Event deleted successfully.'))
							.catch((err)=>res.json('Cannot update the daily table.'));
							return;
						}
					}
				}
			}
			if(weekly != null){
				let weeklyEvent = await Weekly.findById(weekly);
				if(weeklyEvent){
					//found weekly in Weekly table
					let list = weeklyEvent.events;
					if(list != null && list.includes(eventId)){
						const index = list.indexOf(eventId);
						if(index > -1){
							list.splice(index, 1);
							Common.deleteDocument({_id: eventId}, Event);
							weeklyEvent.events = list;
							weeklyEvent.save()
							.then(res.json('Event deleted successfully.'))
							.catch((err)=>res.json('Cannot update the weekly table.'));
							return;
						}
					}
				}
			}
			if(monthly != null){
				let monthlyEvent = await Monthly.findById(monthly);
				if(monthlyEvent){
					//found monthly in Monthly table
					let list = monthlyEvent.events;
					if(list != null && list.includes(eventId)){
						const index = list.indexOf(eventId);
						if(index > -1){
							list.splice(index, 1);
							Common.deleteDocument({_id: eventId}, Event);
							monthlyEvent.events = list;
							monthlyEvent.save()
							.then(res.json('Event deleted successfully.'))
							.catch((err)=>res.json('Cannot update the monthly table.'));
							return;
						}
					}
				}
			}
		}
		res.json("Event not found in your event list.");
		return;
	});
});

router.route('/getCurMonthRepeatingEvents').post((req, res)=>{
	let query = {_id: req.user._id};
	let dateS = new Date(req.body.year, req.body.month-1, 1);//first date of the month
	let dateE = new Date(req.body.year, req.body.month, 1);	//last date of the month
	let eventList = [];
	User.findOne(query, async (err, user)=>{
		if(err){
			res.json('Error occurs while finding user.');
			return;
		}
		if(!user){
			res.json({daily:daily});
			return;
		}
		//loop daily event
		let daily = user.daily;
		if(daily != null){
			let dailyEvent = await Daily.findById(daily);
			if(dailyEvent){
				let list = dailyEvent.events;
				let q = {
					date: {"$lt": dateE}
				}
				list = await Common.getListOfEvents(list, q, Event);
				for(let i=0;i<list.length;i++){
					if(list[i] != null && (list[i].expiry_date == null || dateS < list[i].expiry_date)){
						eventList.push(list[i]._id);
					}
				}
			}
		}
		//loop weekly event
		let weekly = user.weekly;
		if(weekly != null){
			let weekyEvent = await Weekly.findById(weekly);
			if(weekyEvent){
				let list = weekyEvent.events;
				let q = {
					date: {"$lt": dateE}
				}
				list = await Common.getListOfEvents(list, q, Event);
				for(let i=0;i<list.length;i++){
					if(list[i] != null && (list[i].expiry_date == null || dateS < list[i].expiry_date)){
						eventList.push(list[i]._id);
					}
				}
			}
		}
		//loop monthly event
		let monthly = user.monthly;
		if(monthly != null){
			let monthlyEvent = await Monthly.findById(monthly);
			if(monthlyEvent){
				let list = monthlyEvent.events;
				let q = {
					date: {"$lt": dateE}
				};
				list = await Common.getListOfEvents(list, q, Event);
				for(let i=0;i<list.length;i++){
					if(list[i] != null && (list[i].expiry_date == null || dateS < list[i].expiry_date)){
						eventList.push(list[i]._id);
					}
				}
			}
		}
		res.json({eventList:eventList});
	})
});

//Get the event of specific date
router.route('/date').post((req,res)=>{
	let query = {_id: req.user._id};
	let eventList = [];
	let dateS = new Date(req.body.year, req.body.month-1, req.body.date);
	User.findOne(query, async (err, user)=>{
		if(err){
			res.json('Error occurs while finding user.');
			return;
		}
		if(!user){
			res.json({todayEvents:eventList});
			return;
		}
		//loop daily event
		let daily = user.daily;
		if(daily != null){
			let dailyEvent = await Daily.findById(daily);
			if(dailyEvent){
				let list = dailyEvent.events;
				let q = {
					date: {"$lte": dateS}
				}
				list = await Common.getListOfEvents(list, q, Event);
				for(let i=0;i<list.length;i++){
					if(list[i].expiry_date == null){
						eventList.push(list[i]._id);
					}
				}
			}
		}
		//loop weekly event
		let weekly = user.weekly;
		if(weekly != null){
			let weekyEvent = await Weekly.findById(weekly);
			if(weekyEvent){
				let list = weekyEvent.events;
				let q = {
					date: {"$lte": dateS}
				}
				list = await Common.getListOfEvents(list, q, Event);
				for(let i=0;i<list.length;i++){
					if(list[i] != null && list[i].date.getDay() == dateS.getDay()){
						if(list[i].expiry_date == null){
							eventList.push(list[i]._id);
						}
					}
				}
			}
		}
		//loop monthly
		let monthly = user.monthly;
		if(monthly != null){
			let monthlyEvent = await Monthly.findById(monthly);
			if(monthlyEvent){
				let list = monthlyEvent.events;
				let q = {
					date: {"$lte": dateS}
				};
				list = await Common.getListOfEvents(list, q, Event);
				for(let i=0;i<list.length;i++){
					if(list[i] != null && list[i].date.getDate() == dateS.getDate()){
						if(list[i].expiry_date == null){
							eventList.push(list[i]._id);
						}
					}
				}
			}
		}
		let evt = await Common.getListOfEvents(user.events,{ date: dateS },Event);
		for(let i=0;i<evt.length;i++){
			eventList.push(evt[i]._id);
		}
		res.json({eventList:eventList});
	})
});

router.get('/quote', (req, res)=>{
	res.json(quote);
})

//Changing quote every 30 minutes
new CronJob('0 */30 * * * *', ()=>{
	let quotes = fs.readFileSync(path.join(__dirname, '../src/quotes_bank.txt')).toString().split('\n');
	quote = quotes[Math.floor(Math.random()*quotes.length)];
}, null, true);

module.exports = router;