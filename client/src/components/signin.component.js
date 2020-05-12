import React, { Component } from 'react';
import {Form, Button} from 'react-bootstrap';
import SignUpForm from './signup.form.component'
const axios = require('axios');
const cookies = require('js-cookie');
export default class Signin extends Component {
  constructor(props) {
    //must call base class constructor
    super(props);

    //define member variable in state object
    this.state = {
      username : '',
      password: ''
    };
    //must bind in order to use this in callback
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  handleInputChange = (event) => {
    const { value, name } = event.target;
    this.setState({
      [name]: value
    });
  }
  onSubmit = (e) => {
    if(e!=null){
      e.preventDefault();
    }
    axios({ 
      url: '/api/signin',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true, 
      credentials: 'include', 
      data: this.state
    })
    .then(res => {
      if (res.status === 200) {
        cookies.set('jwt', res.data.token);
        this.props.history.push('/');
      }
      else {
        const error = new Error(res.error);
        throw error;
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error while signing in.');
    });
  }
  formClose = ()=>{
    window.location.reload();
  }
  render() {
    return (
      <Form style={{width: '400px',margin: '1em auto', border: '2px solid black', borderRadius:'5px'}} className="p-3">
        <Form.Label as="legend"  column="lg" style={{textAlign: 'center'}}>
            Sign in to continue
        </Form.Label>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control value={this.state.username} name="username" onChange={this.handleInputChange} placeholder="username" required autoFocus />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control value={this.state.password} name="password" type="password" onChange={this.handleInputChange} onKeyDown={(evt)=>{if(evt.keyCode === 13) this.onSubmit(null)}} placeholder="Password" required />
        </Form.Group>
        <Button variant="dark" onClick={this.onSubmit} >
          Submit
        </Button>
        <SignUpForm onCloseForm={this.formClose}/>
      </Form>
    );
  }
}