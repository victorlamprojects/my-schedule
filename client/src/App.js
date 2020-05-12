import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {Helmet} from 'react-helmet'
import withAuth from './components/withAuth.component';
import Navs from "./components/navbar.component";
import Home from "./components/home.component";
import Calendar from "./components/calendar.component";
import Signin from "./components/signin.component";
import SignOut from "./components/signout.component";

function App() {
	return (
	<Router>
	    <Navs/>
	    <br/>
	    <div>
	    	<Switch>
		    	<Route path='/' exact component = {withAuth(Home)} />
		    	<Route path='/calendar' component = {withAuth(Calendar)} />
		    	<Route path="/signin" component={Signin} />
		    	<Route path="/signout" component={withAuth(SignOut)} />
		    </Switch>
	    </div>
	</Router>
	);
}

export default App;
