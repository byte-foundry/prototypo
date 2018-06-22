import React from 'react';
import {Link} from 'react-router';

import LocalClient from '../../stores/local-client.stores.jsx';
import Log from '../../services/log.services.js';
import withCountry from '../shared/with-country.components';

class AllowedTopBarWithPayment extends React.Component {
	constructor(props) {
		super(props);

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

	trackSubscriptionClick() {
		window.Intercom('trackEvent', 'subscriptionClickfromFile');
		Log.ui('SubscriptionClick.FromFile');
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	render() {
		const {freeAccount, credits} = this.props;

		const overlay
			= freeAccount && (!credits || credits <= 0) ? (
				<div className="allowed-top-bar-with-payment-demo-overlay">
					<div className="allowed-top-bar-with-payment-demo-overlay-text">
						<Link to="/account/subscribe" onClick={this.trackSubscriptionClick}>
							<span>
								This feature is available with the professional subscription
							</span>
						</Link>
						<div className="allowed-top-bar-with-payment-demo-overlay-text-more">
							<div
								className="allowed-top-bar-with-payment-demo-overlay-text-more-half"
								onClick={this.openGoProModal}
							>
								<div className="allowed-top-bar-with-payment-demo-overlay-text-more-wrap allowed-top-bar-with-payment-subscribe">
									<div className="allowed-top-bar-with-payment-demo-overlay-text-more-text">
										Subscribe to full version
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				false
			);

		return (
			<div className="allowed-top-bar-with-payment is-disabled">
				{overlay}
				{this.props.children}
			</div>
		);
	}
}

export default withCountry(AllowedTopBarWithPayment);
