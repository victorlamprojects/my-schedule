import React, {Component} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
const axios = require('axios');
export default class SignUpForm extends Component{
	constructor(props){
		super(props);
		this.state = {
			show: false,
			username: '',
			password: '',
			name: '',
			email: ''
		}
		this.onCloseForm = this.props.onCloseForm;
	}
	handleClose = ()=>{
		this.setState({show: false});
		this.onCloseForm();
	}
	handleShow = ()=>{
		this.setState({show: true,
			username: '',
			password: '',
			name: '',
			email: ''});
	}
	handleInputChange = (e)=>{
		const { value, name } = e.target;
		this.setState({
			[name]: value
		});
	}
	submit = ()=>{
		//validating
		if(this.state.name.trim() === ''){
			alert('Name cannot be emtpy!');
			return;
		}
		if(this.state.username.trim() === ''){
			alert('Username cannot be emtpy!');
			return;
		}
		if(this.state.password.trim() === ''){
			alert('Password cannot be emtpy!');
			return;
		}
		if(this.state.email.trim() === ''){
			alert('Email cannot be emtpy!');
			return;
		}
		let user = JSON.parse(JSON.stringify(this.state));
		delete user.show;
		axios.post('/api/add', user)
		.then((res)=>{
			alert(res.data);
			if(res.data === 'User added successfully!'){
				this.setState({show: false});
			}
		});
	}
	render(){
		return(
			<>
	      	<Button variant="dark" className="ml-4"  onClick={this.handleShow}>
	        	Sign Up
	      	</Button>

	      	<Modal show={this.state.show} onHide={this.handleClose}>
	        	<Modal.Header closeButton>
	          	<Modal.Title>Sign Up Form</Modal.Title>
	        	</Modal.Header>
	        	<Modal.Body>
					<Form>
						<Form.Group>
						    <Form.Label>Name</Form.Label>
						    <Form.Control placeholder="Name" name="name" onChange={this.handleInputChange} autoFocus />
					  	</Form.Group>
					  	<Form.Group>
						    <Form.Label>Username</Form.Label>
						    <Form.Control placeholder="Username" name="username" onChange={this.handleInputChange} />
					  	</Form.Group>
					  	<Form.Group>
					    	<Form.Label>Password</Form.Label>
					    	<Form.Control type="password" placeholder="Password" name="password" onChange={this.handleInputChange} />
					  	</Form.Group>
					  	<Form.Group controlId="formBasicEmail">
						    <Form.Label>Email address</Form.Label>
						    <Form.Control type="email" placeholder="Enter email" name="email" onChange={this.handleInputChange} />
						    <Form.Text className="text-muted">
						      We'll never share your email with anyone else.
						    </Form.Text>
					  	</Form.Group>
					</Form>
	        	</Modal.Body>
	        	<Modal.Footer>
		          	<Button variant="secondary" onClick={this.handleClose}>
		            Close
		          	</Button>
		          	<Button variant="dark" onClick={this.submit}>
		            	Sign Up
		          	</Button>
	        	</Modal.Footer>
	      	</Modal>
	    </>
		);
	}
}