import React from 'react';

export default class IAmMobile extends React.PureComponent {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] NotABrowser');
		}

		return (
			<div id="notloggedin">
				<div className="sign-in">
					<div className="sign-in-sorry-logo" />
					<h1 className="sign-in-sorry-message">Sorry :(</h1>
					<div className="sign-in-sorry-text">
						{' '}
						Prototypo is not currently available on mobile browser.
					</div>
				</div>
			</div>
		);
	}
}
