import React from 'react';
//import Signin from './signin.components.jsx';
//import Register from './register.components.jsx';
import pleaseWait from 'please-wait';

export default class NotLoggedIn extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] NotLoggedIn');
		}
		return (
			<div id="notloggedin">
				{this.props.children}
			</div>
		);
	}
}
