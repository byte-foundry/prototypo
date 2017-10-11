import PropTypes from 'prop-types';
import React from 'react';

import {
	monthlyConst,
	annualConst,
	agencyMonthlyConst,
	agencyAnnualConst,
} from '../../data/plans.data';

import Price from '../shared/price.components';

export default class SubscriptionSidebar extends React.PureComponent {
	constructor(props) {
		super(props);

		this.handleChangePlan = this.handleChangePlan.bind(this);
	}

	handleChangePlan(options) {
		return (e) => {
			e.preventDefault();
			this.props.onChangePlan(options);
		};
	}

	render() {
		const {country, plan, quantity, hasBeenSubscribing} = this.props;

		const plans = {
			[monthlyConst.prefix]: {
				header: 'Monthly',
				title: hasBeenSubscribing
					? <span>Try Prototypo Pro without commitment</span>
					: <span>
							Try Prototypo Pro subscription for
							{' '}
						<Price amount={1} country={country} />
						{' '}
							only
						</span>,
				features: [
					'More diverse fonts with full range on all parameters',
					'Perfectly customized with glyph individualization groups',
					'Tune to perfection using the manual edition and component editing',
				],
				cta: (
					<span>
						<Price amount={monthlyConst.price * this.props.percentPrice} country={country} />
						{' '}
						{hasBeenSubscribing ? ' / month' : <span><br />after the first month</span>}
					</span>
				),
				subcta: 'No commitment!',
				link: {
					text: 'Want Prototypo cheaper, check out our annual offer',
					onClick: this.handleChangePlan({plan: annualConst.prefix}),
				},
			},
			[annualConst.prefix]: {
				header: 'Annual',
				title: 'Buy Prototypo Pro subscription for 1 year, get 4 months for free',
				features: [
					'More diverse fonts with full range on all parameters',
					'Perfectly customized with glyph individualization groups',
					'Tune to perfection using the manual edition and component editing',
				],
				cta: (
					<span>
						<Price amount={annualConst.monthlyPrice * this.props.percentPrice} country={country} /> / month
					</span>
				),
				subcta: <span>Less money, same features<br />Get 4 months free</span>,
				link: {
					text: 'Want less commitment, try our monthly offer',
					onClick: this.handleChangePlan({plan: monthlyConst.prefix}),
				},
			},
			[agencyMonthlyConst.prefix]: {
				header: <span>Agencies<br />Monthly</span>,
				title: (
					<span>
						Prototypo multi-user plan, designed for professionnals, billed monthly
					</span>
				),
				features: ['All pro features', 'Manage your team licences', 'Premium 24h support'],
				cta: (
					<span>
						<Price amount={agencyMonthlyConst.monthlyPrice * quantity * this.props.percentPrice} country={country} />
						{' '}
						/ month
					</span>
				),
				subcta: (
					<span>
						No commitment!
						<br />
						<Price amount={agencyMonthlyConst.monthlyPrice * this.props.percentPrice} country={country} />
						{' '}
						× {quantity} per month
					</span>
				),
				link: {
					text: 'Want Prototypo cheaper, check out our annual offer',
					onClick: this.handleChangePlan({plan: agencyAnnualConst.prefix}),
				},
			},
			[agencyAnnualConst.prefix]: {
				header: <span>Agencies<br />Annual</span>,
				title: (
					<span>
						Prototypo multi-user plan, designed for professionnals, billed annually
					</span>
				),
				features: ['All pro features', 'Manage your team licences', 'Premium 24h support'],
				cta: (
					<span>
						<Price amount={agencyAnnualConst.monthlyPrice * quantity * this.props.percentPrice} country={country} />
						{' '}
						/ month
					</span>
				),
				subcta: (
					<span>
						Less money, same features
						<br />
						<Price amount={agencyAnnualConst.monthlyPrice * this.props.percentPrice} country={country} />
						{' '}
						× {quantity} per month
					</span>
				),
				link: {
					text: 'Want less commitment, try our monthly offer',
					onClick: this.handleChangePlan({plan: agencyMonthlyConst.prefix}),
				},
			},
		};

		if (plans[plan]) {
			const {header, title, features, cta, subcta, link} = plans[plan];

			return (
				<div className="subscription-sidebar">
					<h1 className="subscription-sidebar-header">{header}</h1>
					<h2 className="subscription-sidebar-title">{title}</h2>
					<ul className="subscription-sidebar-list-feat">
						{features.map(feat => (
							<li className="subscription-sidebar-list-feat-item">
								{feat}
							</li>
						))}
					</ul>
					<div className="subscription-sidebar-separator" />
					<div className="subscription-sidebar-cta">{cta}</div>
					<div className="subscription-sidebar-subcta">{subcta}</div>
					<a href="/account/subscribe" className="subscription-sidebar-link" onClick={link.onClick}>
						{link.text}
					</a>
				</div>
			);
		}

		return null;
	}
}

SubscriptionSidebar.propTypes = {
	plan: PropTypes.string.isRequired,
	quantity: PropTypes.number,
	hasBeenSubscribing: PropTypes.bool,
	onChangePlan: PropTypes.func,
};

SubscriptionSidebar.defaultProps = {
	quantity: 2,
	hasBeenSubscribing: false,
	onChangePlan: () => {},
};
