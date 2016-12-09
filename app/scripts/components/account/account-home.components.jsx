import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class AccountHome extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					firstname: head.toJS().d.infos.accountValues.firstname,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (
			<div className="account-base account-home">
				<h1>Hi {this.state.firstname}!</h1>
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
