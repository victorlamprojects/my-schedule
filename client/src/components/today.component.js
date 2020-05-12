import React, {Component} from 'react';
import { } from 'react-bootstrap';
const axios = require('axios');
class Today extends Component{
	constructor(props){
		super(props);

		this.state = {
			taskList: [],
			listItem: []
		}
		this.updateList = this.updateList.bind(this);
	}

	//Update list
	updateList = ()=>{
	}

	componentDidMount = ()=>{
		this.updateList();
	}

	render(){
		return (
			{this.state.listItem}
		);
	}

}
export default Today;