import React from 'react';

export default class AccountHome extends React.Component {
	render() {
		return (
			<div className="account-base account-home">
				<p>
					Welcome to your Prototypo account dashboard. You'll find all the necessary info to manage your subscription and billing here.
				</p>
				<h2>Our Youtube channel</h2>
				<p>
					You will find tutorials and other interesting videos on our <a className="account-link" href="https://www.youtube.com/channel/UCmBqMb0koPoquJiSUykdOTw" target="_blank">Youtube channel!</a>
				</p>
				<iframe width="710" height="420" src="https://www.youtube.com/embed/szrJICcJOJI?list=PLxNRc5qdYUC9zQ_yXhIgQck8cfwCb1CQk" frameBorder="0" allowFullScreen></iframe>
			</div>
		);
	}
}
