import React from 'react';

export default class AccountHome extends React.Component {
	render() {
		return (
			<div className="account-base account-home">
				<h1>Hi [First name]!</h1>
				<p>
					[List of contextual messages]
				</p>
				<p>
					[List of tips]
				</p>
			</div>
		);
	}
}
