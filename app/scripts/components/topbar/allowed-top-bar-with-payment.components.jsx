import React from 'react';

export default class AllowedTopBarWithPayment extends React.Component {
	render() {
		const freeAccount = this.props.freeAccount;
		const credits = this.props.credits;
		console.log(freeAccount, credits);

		const overlay = freeAccount && (!credits || credits <= 0)
			? (
				<div className="slider-demo-overlay">
					<a className="slider-demo-overlay-text" href="#/account/credits">
						<span>This feature is available with the professional subscription</span>
						<div className="slider-demo-overlay-text-more">
							<div className="slider-demo-overlay-text-more-text">Upgrade to full version</div>
						</div>
					</a>
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
