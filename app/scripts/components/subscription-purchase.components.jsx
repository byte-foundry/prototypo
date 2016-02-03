import React from 'react';
import WaitForLoad from './wait-for-load.components.jsx';

export default class SubscriptionPurchase extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] SubscriptionPurchase');
		}
		return (
			<div className="subscription-purchase">
				<WaitForLoad loaded={this.props.loaded}>
					<h1 className="subscription-purchase-title">You are not subscribed to Prototypo</h1>
					<div className="subscription-purchase-block">
						<div className="subscription-purchase-block-column">
							<p className="subscription-purchase-intro">Pay what you want for a 3 months trial period</p>
							<p className="subscription-purchase-intro">(Once the trial end the subscription will cost 19.00$/month)</p>
							<div className="input-group">
								<input type="text" ref="amount" />
								<div className="input-group-suffix">$</div>
							</div>
						<button className="subscription-purchase-button" onClick={() => {this.props.subscribe(React.findDOMNode(this.refs.amount).value);}}>Subscribe</button>
						</div>
						<div className="subscription-purchase-block-column">
							<p>I have a coupon from the kickstarter</p>
							<input className="subscription-purchase-input" type="text" ref="coupon" />
							<button className="subscription-purchase-button" onClick={() => {this.props.validate(React.findDOMNode(this.refs.coupon).value);}}>Validate my coupon</button>
						</div>
					</div>
				</WaitForLoad>
			</div>
		);
	}
}
