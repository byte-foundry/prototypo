import React from 'react';
import {Link} from 'react-router';

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
					'Unlimited font exports',
					'Full ranges for all parameters',
					'Parameter individualization for more custom fonts',
				],
				cta: <span><Price amount={15} country={country}/> after the first month.</span>,
				subcta: 'No commitment!',
				link: {
					text: 'Want Prototypo for cheap, check out our annual offer.',
					to: '/account/subscribe?plan=personal_annual_99',
				},
			},
			'personal_annual_99': {
				header: 'Annual',
				title: 'Buy Prototypo Pro subscription for 1 year, get 4 months for free',
				features: [
					'Unlimited font exports',
					'Full ranges for all parameters',
					'Parameter individualization for more custom fonts',
				],
				cta: (
					<div>
						<div>
							<Price amount={8.25} country={country}/>/month
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
