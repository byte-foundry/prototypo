import React from 'react';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

import Modal from './shared/modal.components.jsx';
import Price from './shared/price.components.jsx';

export default class GoProModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			country: 'US',
		};

		this.goSubscribe = this.goSubscribe.bind(this);
		this.goCredits = this.goCredits.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	async componentDidMount() {
		const response = await fetch('//freegeoip.net/json/');
		const data = await response.json();

		this.setState({country: data.country_code});
	}

	goSubscribe() {
		this.client.dispatchAction('/store-value', {openGoProModal: false});
		document.location.href = '#/account/create';
		window.Intercom('trackEvent', 'openSubscribeFromGoPro');
		Log.ui('Subscribe.FromFile');
	}

	goCredits() {
		this.client.dispatchAction('/store-value', {
			openGoProModal: false,
			openBuyCreditsModal: true,
		});
		window.Intercom('trackEvent', 'openBuyCreditsModalFromGoPro');
		Log.ui('BuyCreditsModal.FromFile');
	}

	render() {
		const {country} = this.state;

		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">UPGRADE TO FULL VERSION!</div>
				<div className="modal-container-content">
					<p>With the full version you'll be able to use all the parameters and export your font to use it on a website or on any desktop application (Adobe Illustrator, Ms Word&hellip;).</p>
					<p>You access the full version by either subscribing to a pro plan or buying credits.</p>
					<div className="go-pro-choices">
						<div className="go-pro-choice go-pro-subscription" onClick={this.goSubscribe}>
							<div className="pro-version-big"></div>
							<h2 className="go-pro-choice-title">Subscribe to a pro plan!</h2>
							<p className="go-pro-choice-subtitle">And export as many projects as you want, <br/>when you want.</p>
							<div className="go-pro-choice-plans">
								<p className="go-pro-choice-plan">
									<span className="go-pro-choice-plan-title">Monthly plan</span>
									<br/><Price amount={15} country={country} />/month without commitment
								</p>
								<p className="go-pro-choice-plan">
									<span className="go-pro-choice-plan-title">Annual plan</span>
									<br/><Price amount={99} country={country} />/year save more than 5 months!
								</p>
							</div>
						</div>
						<div className="go-pro-choice go-pro-credits" onClick={this.goCredits}>
							<div className="buy-credits-big"></div>
							<h2 className="go-pro-choice-title">Buy 5 export credits for <Price amount={5} country={country} />!</h2>
							<p className="go-pro-choice-subtitle">You are free to use these credits as you like. <br/>No time limit.</p>
							<p><span className="go-pro-choice-plan-title">Exporting one font cost 1 credits.</span></p>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}
