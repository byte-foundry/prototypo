import React from 'react';
import Signin from './signin.components.jsx';
import Register from './register.components.jsx';
import pleaseWait from 'please-wait';

export default class NotLoggedIn extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}
	render() {
		return (
			<div id="notloggedin">
				<Signin />
				<Register />
			</div>
		)
	}
}
