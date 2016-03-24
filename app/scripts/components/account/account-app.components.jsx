import React from 'react';
import pleaseWait from 'please-wait';

export default class AccountApp extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="account-app">
				{this.props.children}
			</div>
		);
	}
}
