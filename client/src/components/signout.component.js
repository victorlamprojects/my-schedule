import React, { Component } from 'react';
const cookies = require('js-cookie');
export default class Signin extends Component {
  	constructor(props) {
  		super(props);
  		cookies.set('jwt', '');
  		alert('Sign Out Successfully');
  		this.props.history.push('/');
  	}
  	render(){
  		return (
  			<p>Signing Out</p>
		);
  	}
}