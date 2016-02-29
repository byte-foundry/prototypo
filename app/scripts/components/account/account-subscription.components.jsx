import React from 'react';

import DisplayWithLabel from '../shared/display-with-label.components.jsx';

export default class AccountSubscription extends React.Component {
	render() {
		const cardDetail = (
			<div className="account-subscription-card">
				<div className="account-subscription-card-number">**** **** **** 1234</div>
				<div className="account-subscription-card-expiry">will expire on 01/18</div>
				<div className="account-subscription-card-buttons">
					<div className="account-subscription-card-buttons-button account-subscription-card-buttons-make-default"></div>
					<div className="account-subscription-card-buttons-button account-subscription-card-buttons-delete"></div>
				</div>
			</div>
		);

		return (
			<div className="account-base account-subscription">
				<DisplayWithLabel label="Your plan" data="Monthly professional subscription"/>
				<p>
					Your subscription will automatically renew on <span className="account-emphase">03/09/2016</span> and you will be charged <span className="account-emphase">$15</span>
				</p>
				<DisplayWithLabel label="Your card" data={cardDetail}/>
				<DisplayWithLabel className="is-inactive" nolabel={true} data={cardDetail}/>
			</div>
		);
	}
}
