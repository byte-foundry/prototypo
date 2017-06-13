import React from 'react';
import {Link} from 'react-router';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';
import AccountSidebar from './account-sidebar.components.jsx';

export default class AccountDashboard extends React.Component {
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
		const titles = {
			home: "My account",
			profile: "My account",
			details: "My account",
			create: "Subscribe to prototypo",
			createSignup: "Subscribe to prototypo",
			success: "My account",
			confirm: "My account",
			billing: "My account",
		};
		const subtitles = {
			home: `Hi ${this.state.firstname}!`,
			profile: "My profile",
			'change-password': "Change my password",
			details: "My account settings",
			create: "",
			createSignup: "",
			success: "Congratulations!",
			confirm: "",
			billing: "My billing history",
			'billing-address': 'My billing address',
			'add-card': "Add a card",
			'change-plan': 'Change my plan',
		};
		const title = titles[this.props.route.name];
		const subtitle = subtitles[this.props.location.pathname.split('/')[this.props.location.pathname.split('/').length - 1]];

		return (
			<div className="account-dashboard">
				<Link to="/dashboard">
					<div className="account-dashboard-icon"/>
				</Link>
				<div className="account-header">
					<h1 className="account-title">{title}</h1>
				</div>
				{
					subtitle === ""
					? false
					: (<h1 className="account-dashboard-page-title">{subtitle}</h1>)
				}
				<div className="account-dashboard-container">
					<AccountSidebar />
					{this.props.children}
				</div>
			</div>
		);
	}
}

AccountDashboard.contextTypes = {
	router: React.PropTypes.object.isRequired,
};
