import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';

import Modal from './shared/modal.components.jsx';

export default class GoProModal extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.goSubscribe = this.goSubscribe.bind(this);
		this.goCredits = this.goCredits.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	goSubscribe() {
		this.client.dispatchAction('/store-value', {openGoProModal: false});
		document.location.href = '#/account/create';
	}

	goCredits() {
		this.client.dispatchAction('/store-value', {
			openGoProModal: false,
			openBuyCreditsModal: true,
		});
	}

	render() {
		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">EXPORT YOUR FONT NOW!</div>
				<div className="modal-container-content">
					<p>Export your font to use it on a website or on any desktop application (Adobe Illustrator, Ms Word&hellip;)</p>
					<div className="go-pro-choices">
						<div className="go-pro-choice go-pro-subscription" onClick={this.goSubscribe}>
							<img src="../assets/images/pro-version-big.svg" />
							<h2 className="go-pro-choice-title">Subscribe to a pro plan!</h2>
							<p className="go-pro-choice-subtitle">And export as many projects as you want, <br/>when you want.</p>
							<div className="go-pro-choice-plans">
								<p className="go-pro-choice-plan">
									<span className="go-pro-choice-plan-title">Monthly plan</span>
									<br/>15/month without commitment
								</p>
								<p className="go-pro-choice-plan">
									<span className="go-pro-choice-plan-title">Annual plan</span>
									<br/>99/year: save more than 5 months!
								</p>
							</div>
						</div>
						<div className="go-pro-choice go-pro-credits" onClick={this.goCredits}>
							<img src="../assets/images/buy-credits-big.svg" />
							<h2 className="go-pro-choice-title">Buy 5 export credits for 5!</h2>
							<p className="go-pro-choice-subtitle">You are free to use these credits as you like. <br/>No time limit.</p>
							<p><span className="go-pro-choice-plan-title">Exporting one font cost 1 credits.</span></p>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}
