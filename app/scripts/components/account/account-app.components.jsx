import React from 'react';
import Router from 'react-router';
import pleaseWait from 'please-wait';

export default class AccountApp extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		const RouteHandler = Router.RouteHandler;

		return (
			<div className="account-app">
				<RouteHandler />
			</div>
		);
	}
}
