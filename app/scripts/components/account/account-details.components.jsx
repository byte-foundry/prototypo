import React from 'react';
import Router from 'react-router';

export default class AccountDetails extends React.Component {
	render() {
		const RouteHandler = Router.RouteHandler;

		return (
			<div className="account-details">
				{this.props.children}
			</div>
		);
	}
}
