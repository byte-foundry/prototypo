import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import AccountManageSubUsers from './account-manage-sub-users.containers';

export default class AccountOrganization extends React.Component {
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
					subscription: head.toJS().d.subscription,
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
		const {subscription} = this.state;

		return (
			<div className="account-base account-organization">
				<h1>Manage Sub Users</h1>
				<AccountManageSubUsers max={subscription && subscription.quantity} />
			</div>
		);
	}
}
