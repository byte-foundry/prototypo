import React from 'react';

import {monthlyConst, annualConst, agencyMonthlyConst, agencyAnnualConst} from '../data/plans.data.js';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

import Modal from './shared/modal.components.jsx';
import Price from './shared/price.components.jsx';
import Button from './shared/button.components.jsx';

export default class GoProModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			country: 'US',
			billing: 'annually',
			agencyCount: 4,
		};

		this.goSubscribe = this.goSubscribe.bind(this);
		this.switchMonthlyBilling = this.switchMonthlyBilling.bind(this);
		this.switchAnnualBilling = this.switchAnnualBilling.bind(this);
		this.decreaseAgencyCount = this.decreaseAgencyCount.bind(this);
		this.increaseAgencyCount = this.increaseAgencyCount.bind(this);
		this.updateAgencyCount = this.updateAgencyCount.bind(this);
		this.openIntercomChat = this.openIntercomChat.bind(this);
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
		document.location.href = `#/account/subscribe?plan=personal_${this.state.billing === 'monthly' ? 'monthly' : 'annual_99'}`;
		window.Intercom('trackEvent', 'openSubscribeFromGoPro');
		Log.ui('Subscribe.FromFile');
	}

	switchMonthlyBilling() {
		this.setState({billing: 'monthly'});
	}

	switchAnnualBilling() {
		this.setState({billing: 'annually'});
	}

	decreaseAgencyCount() {
		if (this.state.agencyCount > 1) {
			this.setState({agencyCount: this.state.agencyCount - 1});
		}
	}

	increaseAgencyCount() {
		this.setState({agencyCount: this.state.agencyCount + 1});
	}

	updateAgencyCount(event) {
		this.setState({agencyCount: parseInt(event.target.value)});
	}

	openIntercomChat() {
		window.Intercom('trackEvent', 'clickedOnContactUsFromGoProModal');
		window.Intercom('showNewMessage', `Hi! I am interested in subscribing to a company plan for ${this.state.agencyCount} licences`);
	}

	render() {
		const {country} = this.state;

		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-content">
					<div className="pricing-switch">
						<div className={`pricing-switch-item ${this.state.billing === 'monthly' ? 'is-active' : ''}`} onClick={this.switchMonthlyBilling}>
							Monthly billing
						</div>
						<div className={`pricing-switch-item ${this.state.billing === 'annually' ? 'is-active' : ''}`} onClick={this.switchAnnualBilling}>
							Annual billing
						</div>
					</div>
					<div className="pricing">
						<div className="pricing-item" onClick={this.goSubscribe}>
							<div className="pricing-item-title">
								Pro
								<div className="pricing-item-title-more">
									Just right for freelancer and independant graphic designer
								</div>
							</div>
							<div className="pricing-item-subtitle">
								<div className="pricing-item-subtitle-price">
									<div className="pricing-item-subtitle-price-value"><span className="pricing-item-subtitle-price-value-currency">$</span>{this.state.billing === 'annually' ? annualConst.monthlyPrice : monthlyConst.price}<span className="pricing-item-subtitle-price-value-freq">per month</span></div>
									<div className="pricing-item-subtitle-price-info">{this.state.billing === 'monthly' ? 'First month for $1' : <br/>}</div>
								</div>
							</div>
							<ul className="pricing-item-features">
								<li className="pricing-item-feature">
									More diverse fonts with full range on all parameters
								</li>
								<li className="pricing-item-feature">
									Perfectly customized with glyph individualization groups
								</li>
								<li className="pricing-item-feature">
									Tune to perfection using the manual edition and component editing
								</li>
								<li className="pricing-item-feature">
									&nbsp;
								</li>
								<li className="pricing-item-feature">
									&nbsp;
								</li>
							</ul>
							<div className="pricing-item-cta">
								Make me pro!
							</div>
						</div>
						<div className="pricing-item" onClick={this.goSubscribeAgency}>
							<div className="pricing-item-title">
								Company
								<div className="pricing-item-title-more">
									Perfect for agencies and company
								</div>
							</div>
							<div className="pricing-item-subtitle">
								<div className="pricing-item-subtitle-price">
									<div className="pricing-item-subtitle-price-value">
										<span className="pricing-item-subtitle-price-value-currency">$</span>
										{this.state.billing === 'annually' ? agencyAnnualConst.monthlyPrice * this.state.agencyCount : agencyMonthlyConst.monthlyPrice * this.state.agencyCount}
										<span className="pricing-item-subtitle-price-value-freq">per month</span>
									</div>
									<div className="pricing-item-subtitle-price-info agency">
										<span className="input-number-decrement" onClick={this.decreaseAgencyCount}>–</span>
										<input className="input-number" type="text" value={this.state.agencyCount} min="1" max="100" onChange={this.updateAgencyCount}/>
										<span className="input-number-text">users</span>
										<span className="input-number-increment" onClick={this.increaseAgencyCount}>+</span>
									</div>
								</div>
							</div>
							<ul className="pricing-item-features">
								<li className="pricing-item-feature">
									More diverse fonts with full range on all parameters
								</li>
								<li className="pricing-item-feature">
									Perfectly customized with glyph individualization groups
								</li>
								<li className="pricing-item-feature">
									Tune to perfection using the manual edition and component editing
								</li>
								<li className="pricing-item-feature">
									Manage your team licenses
								</li>
								<li className="pricing-item-feature">
									Premium 24h support
								</li>
							</ul>
							<div className="pricing-item-cta" onClick={this.openIntercomChat}>
								Contact us
							</div>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}
