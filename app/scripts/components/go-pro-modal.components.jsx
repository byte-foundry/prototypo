import React from 'react';

import {monthlyConst, annualConst, agencyMonthlyConst, agencyAnnualConst} from '../data/plans.data.js';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

import Modal from './shared/modal.components.jsx';
import getCurrency from '../helpers/currency.helpers.js';

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
		let agencyPrice = this.state.billing === 'annually' ? agencyAnnualConst.monthlyPrice * this.state.agencyCount : agencyMonthlyConst.monthlyPrice * this.state.agencyCount;

		agencyPrice = agencyPrice.toString().split('.');
		if (agencyPrice.length > 1) {
			agencyPrice = <span>{agencyPrice[0]}<span className="pricing-item-subtitle-price-value-small">.{agencyPrice[1]}</span></span>;
		}
		let agencyMarkup;

		if (getCurrency(this.state.country) === 'EUR') {
			agencyMarkup = <span>{agencyPrice}<span className="pricing-item-subtitle-price-value-currency"> €</span><span className="pricing-item-subtitle-price-value-freq">per month</span></span>;
		}
		else {
			agencyMarkup = <span>
				<span className="pricing-item-subtitle-price-value-currency">$</span>
				{agencyPrice}
				<span className="pricing-item-subtitle-price-value-freq">per month</span>
			</span>;
		}
		let proPrice = this.state.billing === 'annually' ? annualConst.monthlyPrice : monthlyConst.price;

		proPrice = proPrice.toString().split('.');
		if (proPrice.length > 1) {
			proPrice = <span>{proPrice[0]}<span className="pricing-item-subtitle-price-value-small">.{proPrice[1]}</span></span>;
		}
		let proMarkup;

		if (getCurrency(this.state.country) === 'EUR') {
			proMarkup = <span>{proPrice}<span className="pricing-item-subtitle-price-value-currency"> €</span><span className="pricing-item-subtitle-price-value-freq">per month</span></span>;
		}
		else {
			proMarkup = <span><span className="pricing-item-subtitle-price-value-currency">$</span>{proPrice}<span className="pricing-item-subtitle-price-value-freq">per month</span></span>;
		}

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
							{this.state.billing === 'monthly'
							? <div className="pricing-item-offerRibbon">
								<div className="pricing-item-offerRibbon-content">1<sup>st</sup> month for {getCurrency(this.state.country) === 'EUR' ? '1€' : '$1'}</div>
							</div>
							 : false}
							<div className="pricing-item-title">
								Pro
								<div className="pricing-item-title-more">
									Just right for freelancer and independant graphic designer
								</div>
							</div>
							<div className="pricing-item-subtitle">
								<div className="pricing-item-subtitle-price">
									<div className="pricing-item-subtitle-price-value">{proMarkup}</div>
									<div className="pricing-item-subtitle-price-info">{this.state.billing === 'monthly' ? `Try it now, without commitment!` : <br/>}</div>
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
								{this.state.billing === 'monthly' ? `Try it for ${getCurrency(this.state.country) === 'EUR' ? '1€' : '$1'}` : 'Make me pro!'}
							</div>
						</div>
						<div className="pricing-item" onClick={this.goSubscribeAgency}>
							<div className="pricing-item-title">
								Company
								<div className="pricing-item-title-more">
									Great for teams and growing businesses. Contact us for more informations!
								</div>
							</div>
							<div className="pricing-item-subtitle">
								<div className="pricing-item-subtitle-price">
									<div className="pricing-item-subtitle-price-value">
										{agencyMarkup}
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
