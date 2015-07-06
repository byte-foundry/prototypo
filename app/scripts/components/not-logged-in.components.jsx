import React from 'react';
import Signin from './signin.components.jsx';
import Register from './register.components.jsx';
import pleaseWait from 'please-wait';
import {RouteHandler} from 'react-router';

export default class NotLoggedIn extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}
	render() {
		return (
			<div id="notloggedin">
				<RouteHandler />
			</div>
		)
	}
}
