import React from 'react';
import {Link} from 'react-router';

import LocalClient from '~/stores/local-client.stores.jsx';
import Log from '~/services/log.services.js';
import Price from '../shared/price.components';

export default class AllowedTopBarWithPayment extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			country: 'US',
		};

		this.openGoProModal = this.openGoProModal.bind(this);
	}

	openGoProModal() {
		// TODO: Intercom tracking
		window.Intercom('trackEvent', 'openGoProModalFromFile');
		Log.ui('GoProModal.FromFile');
		this.client.dispatchAction('/store-value', {
			openGoProModal: true,
		});
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	async componentDidMount() {
		const response = await fetch('//freegeoip.net/json/');
		const data = await response.json();

		this.setState({country: data.country_code});
	}

	render() {
		const freeAccount = this.props.freeAccount;
		const credits = this.props.credits;
		const {country} = this.state;

		const overlay = freeAccount && (!credits || credits <= 0)
			? (
				<div className="allowed-top-bar-with-payment-demo-overlay">
					<div className="allowed-top-bar-with-payment-demo-overlay-text">
						<Link to="/account/subscribe" onClick={this.trackSubscriptionClick}>
							<span>This feature is available with the professional subscription</span>
						</Link>
						<div className="allowed-top-bar-with-payment-demo-overlay-text-more">
							<div className="allowed-top-bar-with-payment-demo-overlay-text-more-half" onClick={this.openGoProModal}>
								<div className="allowed-top-bar-with-payment-demo-overlay-text-more-wrap allowed-top-bar-with-payment-subscribe">
									<div className="allowed-top-bar-with-payment-demo-overlay-text-more-text">Subscribe to full version</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
			: false;

		return (
			<div className="allowed-top-bar-with-payment is-disabled">
				{overlay}
				{this.props.children}
			</div>
		);
	}
}
