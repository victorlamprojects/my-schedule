import React, {Component} from 'react';
const axios = require('axios');
export default class Home extends Component{
	constructor(props){
		super(props);
		this.state = {
			quoteHTML: ''
		}
		this.html = "";
	}
	async componentDidMount(){
		let res = await axios.get('/api/user/quote');
		let quote = res.data;
		let html = 	<blockquote>
						<p style={{
							margin: "0"
						}}><strong><em>{quote.split(' - ')[0].replace(/"/gi, "")}</em></strong></p>
						<footer><strong>{quote.split(' - ')[1]}</strong></footer>
					</blockquote>
					;
		this.setState({
			quoteHTML: html
		});
	}
	render(){
		return(
			<div className="quotes">
				{this.state.quoteHTML}
			</div>
		)
	}
}