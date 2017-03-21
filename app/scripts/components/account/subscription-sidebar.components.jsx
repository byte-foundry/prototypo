import React from 'react';
import {Link} from 'react-router';

import {monthlyConst, annualConst, agencyMonthlyConst, agencyAnnualConst} from '../../data/plans.data.js';

import LocalClient from '../../stores/local-client.stores.jsx';

import Price from '../shared/price.components.jsx';

export default class SubscriptionSidebar extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	render() {
		const {country, plan} = this.props;

		const plans = {
			'personal_monthly': {
				header: 'Monthly',
				title: <span>Try Prototypo Pro subscription for <Price amount={1} country={country}/> only</span>,
				features: [
					'More diverse fonts with full range on all parameters',
					'Perfectly customized with glyph individualization groups',
					'Tune to perfection using the manual edition and component editing',
				],
				cta: <span><Price amount={monthlyConst.price} country={country}/> after the first month.</span>,
				subcta: 'No commitment!',
				link: {
					text: 'Want Prototypo cheaper, check out our annual offer.',
					to: '/account/subscribe?plan=personal_annual_99',
				},
			},
			'personal_annual_99': {
				header: 'Annual',
				title: 'Buy Prototypo Pro subscription for 1 year, get 4 months for free',
				features: [
					'More diverse fonts with full range on all parameters',
					'Perfectly customized with glyph individualization groups',
					'Tune to perfection using the manual edition and component editing',
				],
				cta: (
					<div>
						<div>
							<Price amount={annualConst.monthlyPrice} country={country}/>/month
						</div>
						<div>
							Less money same features
						</div>
					</div>
				),
				subcta: 'Get 4 months free',
				link: {
					text: 'Want less commitment, try our montly offer',
					to: '/account/subscribe?plan=personal_monthly',
				},
			},
			'agency_monthly': {
				header: 'Agencies - Monthly subscription',
				title: <span>Prototypo multi-user plan, designed for professionnals, billed monthly.</span>,
				features: [
					'All pro features',
					'Manage your team licences',
					'Premium 24h support',
				],
				cta: <span><Price amount={agencyMonthlyConst.monthlyPrice} country={country}/> per month.</span>,
				subcta: 'No commitment!',
				link: {
					text: 'Want Prototypo cheaper, check out our annual offer.',
					to: '/account/subscribe?plan=agency_annual',
				},
			},
			'agency_annual': {
				header: 'Agencies - Annual subscription',
				title: <span>Prototypo multi-user plan, designed for professionnals, billed annually.</span>,
				features: [
					'All pro features',
					'Manage your team licences',
					'Premium 24h support',
				],
				cta: (
					<div>
						<div>
							<Price amount={agencyAnnualConst.monthlyConst} country={country}/>/month
						</div>
						<div>
							Less money same features
						</div>
					</div>
				),
				subcta: 'No commitment!',
				link: {
					text: 'Want less commitment, try our montly offer',
					to: '/account/subscribe?plan=agency_monthly',
				},
			},
		};

		if (plans[plan]) {
			const {
				header,
				title,
				features,
				cta,
				subcta,
				link,
			} = plans[plan];

			return (
				<div className="subscription-sidebar">
					<h1 className="subscription-sidebar-header">{header}</h1>
					<h2 className="subscription-sidebar-title">{title}</h2>
					<ul className="subscription-sidebar-list-feat">
						{(() => {
							return features.map((feat) => {
								return (
									<li className="subscription-sidebar-list-feat-item">
										{feat}
									</li>
								);
							});
						})()}
					</ul>
					<div className="subscription-sidebar-separator"></div>
					<div className="subscription-sidebar-cta">{cta}</div>
					<div className="subscription-sidebar-subcta">{subcta}</div>
					<Link className="subscription-sidebar-link" to={link.to}>{link.text}</Link>
				</div>
			);
		}
		else {
			return false;
		}
	}
}

SubscriptionSidebar.contextTypes = {
	router: React.PropTypes.object.isRequired,
};
