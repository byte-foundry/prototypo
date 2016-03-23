import React from 'react';
import Classnames from 'classnames';
import Lifespan from 'lifespan';
import {Link} from 'react-router';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class SubscriptionSidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			infos: {},
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					infos: head.toJS().infos,
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
		const plans = {
			'personal_monthly': 'Professional monthly subscription',
			'personal_annual': 'Professional annual subscription',
		};
		const username = this.state.infos.accountValues && this.state.infos.accountValues.username
			? <div>You're signed in as <span className="subscription-sidebar-info-emphase">{this.state.infos.accountValues.username}</span>,</div>
			: false;
		const names = this.state.infos.accountValues && (this.state.infos.accountValues.firstname || this.state.infos.accountValues.lastname)
			? <div>we know you as <span className="subscription-sidebar-info-emphase">{`${this.state.infos.accountValues.firstname} ${this.state.infos.accountValues.lastname}`}</span></div>
			: false;
		const plan = this.state.infos && this.state.infos.plan
			? <div>and you chose the <span className="subscription-sidebar-info-emphase">{plans[this.state.infos.plan]}</span>.</div>
			: false;
		const card = this.state.infos.card && this.state.infos.card
			? <div>You registered a payment card with us, its expiration date is <span className="subscription-sidebar-info-emphase">{this.state.infos.card.exp_month}/{this.state.infos.card.exp_year}</span></div>
			: false;
			const data = this.state.infos.accountValues && !this.context.router.isActive('/account/create/confirmation')
			? (
				<div className="subscription-sidebar-info">
					{username}
					{names}
					{plan}
					{card}
				</div>
			)
			: false;

		return (
			<div className="subscription-sidebar">
				<ul className="subscription-sidebar-steps">
					<SubscriptionSidebarItem number="1" label="Sign up" done={!!username} route="/account/create" index={true} />
					<SubscriptionSidebarItem number="2" label="Choose a plan" done={!!plan} route="/account/create/choose-a-plan"/>
					<SubscriptionSidebarItem number="3" label="Add a card" done={!!card} route="/account/create/add-card"/>
					<SubscriptionSidebarItem number="4" label="Billing address" done={this.state.infos.address} route="/account/create/billing-address"/>
					<SubscriptionSidebarItem number="5" label="Confirmation" route="/account/create/confirmation"/>
				</ul>
				{data}
			</div>
		);
	}
}

SubscriptionSidebar.contextTypes = {
	router: React.PropTypes.object.isRequired,
};


class SubscriptionSidebarItem extends React.Component {
	render() {
		const classes = Classnames({
			'subscription-sidebar-steps-step': true,
			'is-finish': this.props.done,
		});

		return (
			<li className={classes}>
				<div className="subscription-sidebar-steps-step-number">{this.props.number}</div>
				<div className="subscription-sidebar-steps-step-label"><Link onlyActiveOnIndex={this.props.index} activeClassName="subscription-sidebar-steps-step-link" to={this.props.route}>{this.props.label}</Link></div>
			</li>
		);
	}
}

SubscriptionSidebarItem.contextTypes = {
	router: React.PropTypes.object.isRequired,
};
