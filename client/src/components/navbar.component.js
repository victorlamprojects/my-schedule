import React, {Component} from 'react';
import {Nav, Navbar} from "react-bootstrap";

export default class Navs extends Component{
	render(){
		return(
			<Navbar bg="dark" variant="dark">
			    <Navbar.Brand href="/">Schedule</Navbar.Brand>
			    <Nav className="mr-auto">
			      	<Nav.Link href="/">Home</Nav.Link>
			      	<Nav.Link href="/calendar">Calendar</Nav.Link>
			      	<Nav.Link href="/signout">Sign Out</Nav.Link>
			    </Nav>
		    </Navbar>
		)
	}
}