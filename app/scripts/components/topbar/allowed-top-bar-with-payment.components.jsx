import React from 'react';
import {Link} from 'react-router';
import vatrates from 'vatrates';

import LocalClient from '~/stores/local-client.stores.jsx';
import Log from '~/services/log.services.js';

export default class AllowedTopBarWithPayment extends React.Component {
	constructor(props) {
		super(props);
		this.openBuyCreditsModal = this.openBuyCreditsModal.bind(this);
		this.state = {};
	}

	openBuyCreditsModal() {
		this.client.dispatchAction('/store-value', {openBuyCreditsModal: true});
		window.Intercom('trackEvent', 'openBuyCreditsModalFromFile');
		Log.ui('BuyCreditsModal.FromFile');
	}

	trackSubscriptionClick() {
		window.Intercom('trackEvent', 'subscriptionClickfromFile');
		Log.ui('SubscriptionClick.FromFile');
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	componentDidMount() {
		const url = '//freegeoip.net/json/';

		/* #if prod */
		fetch(url)
			.then((response) => {
				if (response) {
					return response.json();
				}
			})
			.then((response) => {
				if (response.country_code in vatrates) {
					this.setState({
						currency: '€',
					});
				}
				else {
					this.setState({
						currency: '$',
					});
				}
			})
			.catch((error) => {
				this.setState({
					currency: '$',
				});
			});
		/* #end */
	}

	render() {
		const freeAccount = this.props.freeAccount;
		const credits = this.props.credits;

		const overlay = freeAccount && (!credits || credits <= 0)
			? (
				<div className="allowed-top-bar-with-payment-demo-overlay">
					<div className="allowed-top-bar-with-payment-demo-overlay-text">
						<Link to="/account/create" onClick={this.trackSubscriptionClick}>
							<span>This feature is available with the professional subscription</span>
						</Link>
						<div className="allowed-top-bar-with-payment-demo-overlay-text-more">
							<Link to="/account/create" className="allowed-top-bar-with-payment-demo-overlay-text-more-half" onClick={this.trackSubscriptionClick}>
								<div className="allowed-top-bar-with-payment-demo-overlay-text-more-wrap allowed-top-bar-with-payment-subscribe">
									<div className="allowed-top-bar-with-payment-demo-overlay-text-more-text">Subscribe to full version</div>
								</div>
							</Link>
							<div className="allowed-top-bar-with-payment-demo-overlay-text-more-text-separator"></div>
							<div onClick={this.openBuyCreditsModal} className="allowed-top-bar-with-payment-demo-overlay-text-more-half">
								<div className="allowed-top-bar-with-payment-demo-overlay-text-more-wrap allowed-top-bar-with-payment-credits">
									<div className="allowed-top-bar-with-payment-demo-overlay-text-more-text">Buy export credits.<br/>3 credits for 9{this.state.currency}</div>
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
