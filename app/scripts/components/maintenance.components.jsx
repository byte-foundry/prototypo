import React from 'react';
import pleaseWait from 'please-wait';

export default class Maintenance extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Signin');
		}

		return (
			<div className="account-app">
				<div className="sign-in sign-base">
					<div className="account-dashboard-icon"/>
					<div className="account-header">
						<h1 className="account-title">We'll be back soon</h1>
					</div>
					<h1 className="account-dashboard-page-title">Prototypo is under maintenance</h1>
					<div className="account-dashboard-container" style={{margin: '30px', textAlign: 'center'}}>
						Prototypo is under going maintenance to change our database provider. All your data are taken great care of. We'll be back around 2:30pm UTC.
					</div>
				</div>
			</div>
		);
	}
}
