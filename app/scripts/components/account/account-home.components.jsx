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
			.onUpdate(({head}) => {
				this.setState({
					firstname: head.toJS().infos.accountValues.firstname,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	render() {
		return (
			<div className="account-base account-home">
				<h1>Hi {this.state.firstname}!</h1>
				<p>
					Welcome to prototypo new account dashboard. You'll find all the necessary info to manage your subscription and billing here.
				</p>
			</div>
		);
	}
}
