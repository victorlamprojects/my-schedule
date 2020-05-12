import React, {Component} from 'react';
import {Modal, Form, Row, Col} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
const axios = require('axios');
class EventForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			show: false,
			title: '',
			location: '',
			event_type: 'Study',
			date: new Date(),
			time_start: new Date(),
			time_end: new Date(),
			details: '',
			is_allday: false,
			is_repeated: false,
			repeated_type: 'Daily',
			is_alert: false,
			is_email: false,
			alert_time: null,
			expiry_date: null,
			participants: []
		}
		this.formType = this.props.formType || 0;		//0 for create, 1 for edit
		this.evt = null;
		//set button list
		this.button = [];
		if(this.formType === 0){
			this.button.push(<button type="button" className="btn btn-primary" onClick={this.handleSubmit}>
            	Add
      		</button>);
		}
		else{
			this.button.push(<button type="button" className="btn btn-success" onClick={this.handleUpdate}>
            	Update
      		</button>);
      		this.button.push(<button type="button" className="btn btn-danger" onClick={this.handleDelete}>
            	Delete
      		</button>);
		}

		this.onCloseForm = this.props.onCloseForm;
	}
	clientSideCheck = ()=>{
		if(this.state.title === ''){
    		alert("Event title cannot be empty!");
    		return false;
    	}

    	if(this.state.time_end != null && this.state.time_end < this.state.time_start){
    		alert("Start time must be earlier than end time!");
    		return false;
    	}
    	return true;
	}
    handleClose = (isReload=false) => {
    	this.setState({
    		show: false
    	});
    	this.onCloseForm(isReload);
    };
    handleSubmit = ()=>{
    	if(!this.clientSideCheck()){
    		return;
    	}
    	let body = JSON.parse(JSON.stringify(this.state));
    	delete body.show;
    	if(!body.is_alert){
    		body.is_email = false;
    		body.alert_time = null;
    	}
    	else if(body.alert_time === null){
    		body.alert_time = body.time_start;
    	}
    	body.date = new Date(this.state.time_start.getFullYear(), this.state.time_start.getMonth(), this.state.time_start.getDate());
    	axios.post('/api/user/addEvent', body)
    	.then((res)=>{
    		console.log("Success");
    		alert("Event successfully added.");
    		this.handleClose(true);
    	});
    }
  	handleShow = (evt) => {
  		//Clear and show
  		if(this.formType === 0){
  			this.setState({
				show: true,
				title: '',
				location: '',
				event_type: 'Study',
				date: new Date(),
				time_start: new Date(),
				time_end: new Date(),
				details: '',
				is_allday: false,
				is_repeated: false,
				repeated_type: 'Daily',
				is_alert: false,
				is_email: false,
				alert_time: null,
				participants: []
			});
  		}
  		else{
  			this.evt = evt;
  			this.setState({
				show: true,
				title: evt.title,
				location: evt.location,
				event_type: evt.event_type,
				date: new Date(evt.date),
				time_start: new Date(evt.time_start),
				time_end: new Date(evt.time_end),
				details: evt.details,
				is_allday: evt.is_allday,
				is_repeated: evt.is_repeated,
				repeated_type: evt.repeated_type,
				is_alert: evt.is_alert,
				is_email: evt.is_email,
				alert_time: evt.alert_time,
				participants: evt.participants
			});
  		}
    };
    handleUpdate = ()=>{
    	//Update
    	if(!this.clientSideCheck()){
    		return;
    	}
    	if(this.evt._id == null){
    		alert("Cannot find exisiting event id.");
    		return;
    	}
    	//Delete it first
    	axios.post('/api/user/deleteEvent',{
    		e_id: this.evt._id
    	})
    	.then((res)=>{
    		if(res.data === 'Event deleted successfully.'){
    			//Add new one
		    	let body = JSON.parse(JSON.stringify(this.state));
		    	delete body.show;
		    	if(!body.is_alert){
		    		body.is_email = false;
		    		body.alert_time = null;
		    	}
		    	else if(body.alert_time === null){
		    		body.alert_time = body.time_start;
		    	}
		    	body.date = new Date(this.state.time_start.getFullYear(), this.state.time_start.getMonth(), this.state.time_start.getDate());
		    	axios.post('/api/user/addEvent', body)
		    	.then((res)=>{
		    		alert("Event successfully updated.");
		    		this.handleClose(true);
		    	});
    		}
    		else{
    			alert("Error occurs while modifying event");
    			this.handleClose(true);
    		}
    		
    	})
    	.catch((err)=>{
    		alert("Error occurs while modifying event.");
    		console.log(err);
    		this.handleClose(true);
    	});
    	
    }
    handleDelete = async ()=>{
    	if(this.evt._id == null){
    		alert("Cannot find exisiting event id.");
    		return;
    	}
    	axios.post('/api/user/deleteEvent',{
    		e_id: this.evt._id
    	})
    	.then((res)=>{
    		alert(res.data);
    		this.handleClose(true);
    	})
    	.catch((err)=>{
    		alert("Error occurs while deleting.");
    		console.log(err);
    		this.handleClose(true);
    	});
    }

  	render(){
	  	return (
	  		<>
	      	<button hidden={this.formType!=0} className="float-right mr-3 addButton" onClick={this.handleShow}>
		        +
	      	</button>
  			<Modal show={this.state.show} onHide={evt=>this.handleClose(false)}>
	        <Modal.Header closeButton>
	          <Modal.Title>New Event</Modal.Title>
	        </Modal.Header>
	        <Modal.Body>
	        	<Form>
			  		<Form.Group as={Row} controlId="formEventTitle">
					    <Form.Label column sm={3}>
					      	Event Title
					    </Form.Label>
					    <Col sm={9}>
					      <Form.Control onChange={evt=>this.setState({title: evt.target.value})} placeholder="Event Title" value={this.state.title}/>
					    </Col>
			 	 	</Form.Group>
			 	 	<Form.Group as={Row} controlId="formEventType">
					    <Form.Label column sm={3}>
					      	Event Type
					    </Form.Label>
					    <Col sm={4}>
					      <Form.Control as="select" onChange={evt=>this.setState({event_type: evt.target.value})} value={this.state.event_type}>
					      	<option>Study</option>
					      	<option>Work</option>
					      	<option>Exercise</option>
					      	<option>Meeting</option>
					      	<option>Others</option>
					    </Form.Control>
					    </Col>
			 	 	</Form.Group>
			 	 	<Form.Group as={Row} controlId="formEventLocation">
					    <Form.Label column sm={3}>
					      	Location
					    </Form.Label>
					    <Col sm={9}>
					      <Form.Control onChange={evt=>this.setState({location: evt.target.value})} placeholder="Location" value={this.state.location}/>
					    </Col>
			 	 	</Form.Group>
			 	 	<Form.Group as={Row} controlId="formEventAllDay">
					    <Col sm={8}>
						    <Form.Check
						    	onChange={evt=>this.setState({is_allday: evt.target.checked,
						    									time_end: evt.target.checked?null:this.state.time_end})}
						        custom
						        type='checkbox'
						        label="All Day"
						        style={{
						        	userSelect: 'none',
									MozUserSelect: 'none'
						        }}
						        checked={this.state.time_end}
						    />
					    </Col>
			 	 	</Form.Group>
			 	 	<Form.Group as={Row} controlId="formEventStartTime">
					    <Form.Label column sm={3}>
					      	Start Time
					    </Form.Label>
					    <Col sm={9}>
					    	{!this.state.is_allday?
					    		<DatePicker
							      selected={this.state.time_start}
							      onChange={date => this.setState({time_start: date})}
							      showTimeSelect
							      timeFormat="HH:mm"
							      timeIntervals={15}
							      timeCaption="time"
							      dateFormat="dd MMM yyyy h:mm aa"
							    />
					    		:
					    		<DatePicker
							      selected={this.state.time_start}
							      onChange={date => this.setState({time_start: date})}
							      timeCaption="time"
							      dateFormat="dd MMM yyyy"
							    />
					    	}
					      	
					    </Col>
			 	 	</Form.Group>
			 	 	<Form.Group as={Row} controlId="formEventEndTime" hidden={this.state.is_allday}>
					    <Form.Label column sm={3}>
					      	End Time
					    </Form.Label>
					    <Col sm={9}>
					      	<DatePicker
						      selected={this.state.time_end}
						      onChange={date => this.setState({time_end: date})}
						      showTimeSelect
						      timeFormat="HH:mm"
						      timeIntervals={15}
						      timeCaption="time"
						      dateFormat="dd MMM yyyy h:mm aa"
						    />
					    </Col>
			 	 	</Form.Group>
			 	 	<Form.Group as={Row} controlId="formEventDetails">
					    <Form.Label column sm={3}>
					      	Details
					    </Form.Label>
					    <Col sm={9}>
					      <Form.Control as="textarea" onChange={evt=>this.setState({details: evt.target.value})} placeholder="Details" value={this.state.details}/>
					    </Col>
			 	 	</Form.Group>
					<fieldset>
						<Form.Group as={Row} controlId="formEventRepeat">
							<Form.Label as="legend" column sm={3}>
							Recurrence
							</Form.Label>
							<Col sm={5}>
						        <Form.Check
							    	onChange={evt=>this.setState({
							    				is_repeated: evt.target.checked,
							    				expiry_date: null
							    			})}
							        custom
							        type='checkbox'
							        label="Repeat the event"
							        style={{
							        	userSelect: 'none',
										MozUserSelect: 'none',
										top: '25%'
							        }}
							        checked={this.state.is_repeated}
							    />
						  	</Col>
						  	<Col sm={4} hidden={!this.state.is_repeated}>
							  	<Form.Control as="select" onChange={evt=>this.setState({repeated_type: evt.target.value})} value={this.state.repeated_type}>
							      	<option>Daily</option>
							      	<option>Weekly</option>
							      	<option>Monthly</option>
							    </Form.Control>
							</Col>
						</Form.Group>
						<Form.Group as={Row} controlId="formEventRepeatExpiryDate" hidden={!this.state.is_repeated}>
							<Form.Label as="legend" column sm={3}>
							Expiry Date
							</Form.Label>
							<Col>
						        <DatePicker
							      selected={this.state.expiry_date}
							      onChange={date => this.setState({expiry_date: date})}
							      showTimeSelect
							      timeFormat="HH:mm"
							      timeIntervals={15}
							      timeCaption="time"
							      dateFormat="dd MMM yyyy h:mm aa"
							    />
						  	</Col>
						</Form.Group>
						<Form.Group as={Row} controlId="formEventAlert">
							<Form.Label as="legend" column sm={3}>
							Alert
							</Form.Label>
							<Col sm={3}>
						        <Form.Check
						        	id="alert"
							    	onChange={evt=>this.setState({is_alert: evt.target.checked,
							    									alert_time: evt.target.checked?this.state.alert_time:null})}
							        custom
							        inline
							        type='checkbox'
							        label="Alert"
							        style={{
							        	userSelect: 'none',
										MozUserSelect: 'none',
										top: '25%'
							        }}
							        checked={this.state.is_alert}
							    />
						  	</Col>
						  	<Col sm={4} hidden={!this.state.is_alert}>
						        <Form.Check
						        	id="emailAlert"
							    	onChange={evt=>this.setState({is_email: evt.target.checked})}
							        custom
									inline
							        type='checkbox'
							        label="Email Alert"
							        style={{
							        	userSelect: 'none',
										MozUserSelect: 'none',
										top: '25%'
							        }}
							        checked={this.state.is_email}
							    />
						  	</Col>
						  	
						</Form.Group>
						<Form.Group as={Row} controlId="formEventAlertDetails" hidden={!this.state.is_alert}>
							<Form.Label as="legend" column sm={3}>
							</Form.Label>
							<Col sm={9}>
							  	<DatePicker
							      selected={this.state.alert_time}
							      onChange={date => this.setState({alert_time: date})}
							      showTimeSelect
							      timeFormat="HH:mm"
							      timeIntervals={15}
							      timeCaption="time"
							      dateFormat="dd MMM yyyy h:mm aa"
							    />
							</Col>
						</Form.Group>
					</fieldset>
				</Form>
	        </Modal.Body>
	        <Modal.Footer>
	        	{this.button}
				<button type="button" className="btn btn-primary" onClick={evt=>this.handleClose(false)}>
					Close
				</button>
	        </Modal.Footer>
	      	</Modal>
	    </>
	  )
	}
}

export default EventForm;