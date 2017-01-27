import React from 'react';

import {monthlyConst, annualConst} from '../data/plans.data.js';

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
		};

		this.goSubscribe = this.goSubscribe.bind(this);
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
		document.location.href = '#/account/subscribe';
		window.Intercom('trackEvent', 'openSubscribeFromGoPro');
		Log.ui('Subscribe.FromFile');
	}

	render() {
		const {country} = this.state;

		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">UPGRADE TO FULL VERSION!</div>
				<div className="modal-container-content">
					<h3>Start using the full potential of Prototypo and begin your journey in the typeface world.</h3>
					<div className="pricing-switch">
						<div className="pricing-switch-item is-active">
							Monthly
						</div>
						<div className="pricing-switch-item">
							Annual
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
									<div className="pricing-item-subtitle-price-value"><span className="pricing-item-subtitle-price-value-currency">$</span>{monthlyConst.price}<span className="pricing-item-subtitle-price-value-freq">per month</span></div>
									<div className="pricing-item-subtitle-price-info">First month for $1</div>
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
									Tune to perfection using the manual edition
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
						<div className="pricing-item">
							<div className="pricing-item-title">
								Agency
								<div className="pricing-item-title-more">
									Perfect for agencies and company of 5 or more people
								</div>
							</div>
							<div className="pricing-item-subtitle">
								<div className="pricing-item-subtitle-price">
									<div className="pricing-item-subtitle-price-value"><span className="pricing-item-subtitle-price-value-currency">$</span>60<span className="pricing-item-subtitle-price-value-freq">per month</span></div>
									<div className="pricing-item-subtitle-price-info">For <span>5<span>&#x25b2;</span><span>&#x25bc;</span></span> users</div>
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
									Tune to perfection using the manual edition
								</li>
								<li className="pricing-item-feature">
									Manage your team licenses
								</li>
								<li className="pricing-item-feature">
									Discounts on large order of licenses
								</li>
							</ul>
							<div className="pricing-item-cta">
								Contact us
							</div>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}
