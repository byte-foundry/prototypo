import React from 'react';
import moment from 'moment';
import WaitForLoad from './wait-for-load.components.jsx';

export default class SubscriptionWidget extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] SubscriptionWidget');
		}
		const since = `Since ${moment
			.unix(this.props.subscription.start)
			.format('DD/MM/YYYY')}`;
		const trial = `Trial ends the ${moment
			.unix(this.props.subscription.trial_end)
			.format('DD/MM/YYYY')}`;
		const amount = `$${(this.props.subscription.plan.amount / 100).toFixed(
			2,
		)}/month`;
		let infos;

		if (this.props.subscription.trial_end) {
			infos = <div className="subscription-widget-info-cell">{trial}</div>;
		}
		else if (
			this.props.subscription.discount
			&& this.props.subscription.discount.coupon
		) {
			const coupon = `Discount will ends the ${moment
				.unix(this.props.subscription.discount.end)
				.format('DD/MM/YYYY')}`;

			infos = <div className="subscription-widget-info-cell">{coupon}</div>;
		}
		return (
			<div className="subscription-widget">
				<WaitForLoad loaded={this.props.loaded}>
					<h3>Subscription to the {this.props.subscription.plan.name} plan</h3>
					<div className="subscription-widget-info">
						<div className="subscription-widget-info-cell">{since}</div>
						{infos}
						<div className="subscription-widget-info-cell">{amount}</div>
						<div className="subscription-widget-info-cell">
							<button
								className="subscription-widget-info-cell-button"
								onClick={() => {
									this.props.unsubscribe(this.props.subscription.id);
								}}
							>
								Cancel
							</button>
						</div>
					</div>
				</WaitForLoad>
			</div>
		);
	}
}
