import React from 'react';
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
	}

	render() {
		const plans = {
			'personal_monthly': {
				header: 'Monthly',
				title: 'Try Prototypo Pro subscription for $1 only',
				features: [
					'Unlimited font exports',
					'Full ranges for all parameters',
					'Parameter individualization for more custom fonts',
				],
				cta: '$15 after the first month.',
				subcta: 'No commitment!',
				link: {
					text: 'Want Prototypo for cheap, check out our annual offer.',
					to: '/account/subscribe?plan=personal_annual_99',
				},
			},
			'personal_annual_99': {
				header: 'Annual',
				title: 'Pay Prototypo Pro subscription for 1 year and get 3 free months',
				features: [
					'Unlimited font exports',
					'Full ranges for all parameters',
					'Parameter individualization for more custom fonts',
				],
				cta: 'Less money same features',
				subcta: 'Get 3 months free',
				link: {
					text: 'Want less commitment, try our montly offer',
					to: '/account/subscribe?plan=personal_monthly',
				},
			},
		};

		if (plans[this.props.plan]) {
			const {
				header,
				title,
				features,
				cta,
				subcta,
				link,
			} = plans[this.props.plan];

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
