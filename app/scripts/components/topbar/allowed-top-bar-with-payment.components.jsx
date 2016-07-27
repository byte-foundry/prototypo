import React from 'react';
import {Link} from 'react-router';

import LocalClient from '~/stores/local-client.stores.jsx';

export default class AllowedTopBarWithPayment extends React.Component {
	constructor(props) {
		super(props);
		this.openBuyCreditsModal = this.openBuyCreditsModal.bind(this);
	}

	openBuyCreditsModal() {
		this.client.dispatchAction('/store-value', {openBuyCreditsModal: true});
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	render() {
		const freeAccount = this.props.freeAccount;
		const credits = this.props.credits;

		const overlay = freeAccount && (!credits || credits <= 0)
			? (
				<div className="slider-demo-overlay">
					<div className="slider-demo-overlay-text">
						<Link to="/account/create">
							<span>This feature is available with the professional subscription</span>
						</Link>
						<div className="slider-demo-overlay-text-more">
							<Link to="/account/create">
								<div className="slider-demo-overlay-text-more-wrap">
									<div className="slider-demo-overlay-text-more-text">Subscribe to full version</div>
								</div>
							</Link>
							<div className="slider-demo-overlay-text-more-text-separator"></div>
							<div onClick={this.openBuyCreditsModal}>
								<div className="slider-demo-overlay-text-more-wrap">
									<div className="slider-demo-overlay-text-more-text">Buy export credits</div>
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
