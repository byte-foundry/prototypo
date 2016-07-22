import React from 'react';
import {Link} from 'react-router';

export default class AllowedTopBarWithPayment extends React.Component {
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
							<Link to="/account/credits">
								<div className="slider-demo-overlay-text-more-wrap">
									<div className="slider-demo-overlay-text-more-text">Buy export credits</div>
								</div>
							</Link>
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
