import React from 'react';
import pleaseWait from 'please-wait';

export default class IAmMobile extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] NotABrowser');
		}
		pleaseWait.instance.finish();
		return (
			<div id="notloggedin">
				<div className="sign-in">
					<h1>Sorry :( ! Prototypo is not currently available on mobile browser.</h1>
				</div>
			</div>
		)
	}
}
