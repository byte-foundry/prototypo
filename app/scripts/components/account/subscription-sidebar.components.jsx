import React from 'react';
import Classnames from 'classnames';

export default class SubscriptionSidebar extends React.Component {
	render() {
		return (
			<div className="subscription-sidebar">
				<ul className="subscription-sidebar-steps">
					<SubscriptionSidebarItem number="1" label="Sign up" route="/account/create" />
					<SubscriptionSidebarItem number="2" label="Choose a plan" route="/account/create/choose-a-plan"/>
					<SubscriptionSidebarItem number="3" label="Add a card" route="/account/create/add-card"/>
					<SubscriptionSidebarItem number="4" label="Billing address" route="/account/create/billing-address"/>
					<SubscriptionSidebarItem number="5" label="Confirmation" route="/account/create/confirmation"/>
				</ul>
			</div>
		);
	}
}


class SubscriptionSidebarItem extends React.Component {
	render() {
		const classes = Classnames({
			'subscription-sidebar-steps-step': true,
			'is-active': this.context.router.isActive(this.props.route),
			'is-finish': false,
		});

		return (
			<li className={classes}>
				<div className="subscription-sidebar-steps-step-number">{this.props.number}</div>
				<div className="subscription-sidebar-steps-step-label">{this.props.label}</div>
			</li>
		)
	}
}

SubscriptionSidebarItem.contextTypes = {
	router: React.PropTypes.object.isRequired,
};
