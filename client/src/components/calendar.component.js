import React, {Component , useState} from 'react';
import { Table, Modal, Button} from 'react-bootstrap';
import EventForm from './event.form.component';
const axios = require('axios');
const calendar = require('node-calendar');
let cal = new calendar.Calendar(calendar.SUNDAY);

export default class Calendar extends Component{
	constructor(props){
		super(props);

		let td = new Date();
		//initialize state
		this.state = {
			today: td,
			currentYear: td.getFullYear(),
			currentMonth: td.getMonth()+1,
			currentDay: td.getDate(),
			year: td.getFullYear(),
			month: td.getMonth()+1,
			day: td.getDate(),
			dates: cal.monthdayscalendar(td.getFullYear(), td.getMonth()+1),
			events: [],
			repeating_events: [],
			isShowDateEvents: false
		}
		//variables
		this.selectedEvent = null;
		//list variables
		this.week = calendar.day_name.map((dd)=>{
			return dd.slice(0,3);
		});
		this.week.unshift(this.week.pop());
		this.mon = calendar.month_name;
		//HTML variables
		this.weekItems = [];
		for(let i=0;i<7;i++){
			this.weekItems.push(<td className="calendarWeek" key={"week" + i.toString()}>{this.week[i]}</td>);
		}
		this.datesItems = null;
		this.DateEventsContent = "";
		this.dateEventsDate = [];

		//setter
		this.setDate = this.setDate.bind(this);
		this.setToday = this.setToday.bind(this);
		this.previous = this.previous.bind(this);
		this.next = this.next.bind(this);
		this.selectDate = this.selectDate.bind(this);

		//get request
		this.getEvents = this.getEvents.bind(this);
		this.getEvent = this.getEvent.bind(this);

		//refresh
		this.refresh = this.refresh.bind(this);
		this.loaded = false;

		//reference
		this.refEventForm = React.createRef();

		//helper functions
		this.getDateEvents = this.getDateEvents.bind(this);
		this.showDateEvents = this.showDateEvents.bind(this);
	}
	async componentDidMount(){
		await this.getEvents();
		await this.setDate(this.state.year,this.state.month,this.state.day);
	}
	setDate = async (y, m, d)=>{
		y = (Number(y)===-1)?this.state.year:y;
		m = (Number(m)===-1)?this.state.month:m;
		d = (Number(d)===-1)?this.state.day:d;
		let dates = cal.monthdayscalendar(y, m);
		this.datesItems = [];
		for (let i=0;i<dates.length;i++) {
			let items = [];
			for(let j=0;j<7;j++){
				if(Number(dates[i][j]) !== 0){
					let events = [];
					let evtObj = await this.getDateEvents(y, m, dates[i][j]);
					for(let i=0;i<evtObj.length;i++){
						if(i==4){
							events.push(<li className="eventMore" key={"more"}>...</li>);
							break;
						}
						events.push(<li className={"event"+evtObj[i].event_type} key={dates[i][j].toString() + i.toString()}>{evtObj[i].title}</li>);
					}
					let style={};
					if(y===this.state.year && m===this.state.month && dates[i][j]===d){
						style = {
							outline: "2px solid #FA4848"
						}
					}
					items.push(<td key={"Date" + i.toString()+j.toString()} onDoubleClick={()=>{this.showDateEvents(y, m, dates[i][j], evtObj)}} className="calendarDay" style={style} onClick={()=>this.selectDate(this.state.year, this.state.month,dates[i][j])}>
						<p className="calendarDate">{dates[i][j]}</p>
						<ul style={{boxSizing: 'border-box',
    								padding: '0'}}>
							{events}
						</ul>
					</td>);
				}
				else{
					items.push(<td key={"Date" + i.toString()+j.toString()}></td>);
				}
			}
			this.datesItems.push(<tr className="calendarRow" key={"DateRow" + i}>{items}</tr>);
	  	}
	  	this.loaded = true;
		await this.setState({
			year: y,
			month: m,
			day: d,
			dates: dates
		});
	}
	previous = async ()=>{
		let m = this.state.month-1;
		let y = this.state.year;
		if(Number(m) === 0){
			m = 12;
			y--;
		}
		this.loaded = false;
		await this.setDate(y, m, -1);
		this.refresh();
	}
	next = async ()=>{
		let m = this.state.month+1;
		let y = this.state.year;
		if(Number(m) === 13){
			m = 1;
			y++;
		}
		this.loaded = false;
		await this.setDate(y, m, -1);
		this.refresh();
	}
	setToday = ()=>{
		this.loaded = false;
		this.setDate(this.state.currentYear, this.state.currentMonth, this.state.currentDay);
	}
	selectDate = (y,m,d)=>{
		this.setDate(y, m, d);
	}

	getEvents = async ()=>{
		let res = await axios.get('/api/user/events');
		let evts = await res.data.events;
		let events = [];
		for(let i=0;i<evts.length;i++){
			let evt = await this.getEvent(evts[i]);
			events.push(evt);
		}
		
		res = await axios.post('/api/user/getCurMonthRepeatingEvents', {
			month: this.state.month,
			year: this.state.year
		});
		evts = await res.data.eventList;
		let repeating_events = [];
		for(let i=0;i<evts.length;i++){
			let evt = await this.getEvent(evts[i]);
			repeating_events.push(evt);
		}
		await this.setState({
			events: events,
			repeating_events: repeating_events
		});
	}
	getEvent = async(e_id)=>{
		let event = null;
		let res = await axios.get(`/api/user/events/${e_id}`);
		event = await res.data;
		return event;
	}
	getDateEvents = (y, m, d)=>{
		let events = [];
		//get normal list
		for(let i=0;i<this.state.events.length;i++){
			let date = new Date(this.state.events[i].date);
			if(date.getFullYear() === y && date.getMonth() === m-1 && date.getDate() === d){
				events.push(this.state.events[i]);
			}
		}
		let dateS = new Date(y, m-1, d);
		//get recurring event
		for(let i=0;i<this.state.repeating_events.length;i++){
			let expiry_date = this.state.repeating_events[i].expiry_date === null ? null: new Date(this.state.repeating_events[i].expiry_date);
			let date = new Date(this.state.repeating_events[i].date);
			if(dateS >= date && (expiry_date === null || dateS < expiry_date)){
				if(this.state.repeating_events[i].repeated_type === 'Monthly'){
					if(dateS.getDate() === date.getDate()){
						events.push(this.state.repeating_events[i]);
					}
				}
				else if(this.state.repeating_events[i].repeated_type === 'Weekly'){
					if(dateS.getDay() === date.getDay()){
						events.push(this.state.repeating_events[i]);
					}
				}
				else if(this.state.repeating_events[i].repeated_type === 'Daily'){
					events.push(this.state.repeating_events[i]);
				}
			}
		}
		return events;
	}
	//Refresh by getting all data again
	refresh = async ()=>{
		this.loaded = false;
		await this.getEvents();
		await this.setDate(-1, -1, -1);
	}

	closeForm = async(isReload)=>{
		if(isReload){
			await this.refresh();
		}
	}
	
	showSelectedEvent= (evt)=>{
		if(evt == null){
			return;
		}
		this.selectedEvent = evt;
		this.handleClose();
		this.refEventForm.current.handleShow(evt);
	}

	showDateEvents = (y, m, d, evts)=>{
		evts.sort((a,b)=>{
			if(a.is_allday){
				return -1;
			}
			if(b.is_allday){
				return 1;
			}
			let t_a = new Date(a.time_start);
			let t_b = new Date(b.time_start);
			let tt_a = new Date();
			let tt_b = new Date();
			tt_a.setHours(t_a.getHours());
			tt_b.setHours(t_b.getHours());
			tt_a.setMinutes(t_a.getMinutes());
			tt_b.setMinutes(t_b.getMinutes());
			return tt_a-tt_b;
		});
		this.dateEventsDate = d.toString() + "/" + m.toString() + "/" + y.toString();
		this.DateEventsContent = [];
		let dateList = [];
		//set date events content here
		for(let i=0;i<evts.length; i++){
			let date = new Date(evts[i].time_start);
			dateList.push(
				<li onDoubleClick={()=>{this.showSelectedEvent(evts[i])}} key={"EventDate"+i.toString()}>
					<span></span>
					<div className="time">{evts[i].is_allday?"All Day":date.toLocaleTimeString('en-US')}</div>
					<div className="title"><strong>{evts[i].title}</strong></div>
					<br/>
					<div className="content">{evts[i].details}</div>
				</li>
			);
		}
		this.DateEventsContent = <div className="timeline"><ul>{dateList}</ul></div>;
		this.handleShow();
	}
	handleClose = ()=>{
		this.setState({isShowDateEvents: false});
	}
	handleShow = ()=>{
		this.setState({isShowDateEvents: true});
	}

	render(){
		if(this.loaded){
			return(
			    <div className="calendar">
			    	<Modal show={this.state.isShowDateEvents} onHide={this.handleClose}>
				        <Modal.Header closeButton>
							<Modal.Title style={{width: "100%", textAlign:"center"}}>{this.dateEventsDate}</Modal.Title>
				        </Modal.Header>
				        <Modal.Body style={{
			    		backgroundColor: "RGBA(233,233,233, 0.9)"
			    	}}>{this.DateEventsContent}</Modal.Body>
		      		</Modal>
		      		<EventForm onCloseForm={this.closeForm} formType={1} ref={this.refEventForm}/>
				    <h3 className="text-center">
					    <span onClick={this.previous}><a href="#/" className="left-arrow"></a></span>
					    <span className="calendarTitle">{this.state.year} {this.mon[this.state.month]}</span>
					    <span onClick={this.next}><a href="#/" className="right-arrow"></a></span>
					    <EventForm onCloseForm={this.closeForm} formType={0}/>
				    </h3>
			      	<Table>
				  		<thead>
					    	<tr>
					      		{this.weekItems}
				    		</tr>
					  	</thead>
					  	<tbody>
					  		{this.datesItems}
					  	</tbody>
					</Table>	
				</div>
		    )
		}
		else{
			return (
				<p>Loading...</p>
			)
		}
		
	}
}