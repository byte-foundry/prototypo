import React from 'react';
import Signin from './signin.components.jsx';
import Register from './register.components.jsx';

export default class NotLoggedIn extends React.component {
	render() {
		return (
			<div id="notLoggedIn">
				<Signin />
				<Register />
			</div>
		)
	}
}
