import React from 'react';

import DisplayWithLabel from '../shared/display-with-label.components.jsx';

export default class AccountSubscription extends React.Component {
	render() {
		return (
			<div className="account-base account-subscription">
				<DisplayWithLabel label="Your plan" data="Monthly professional subscription"/>
				<p>
					Your subscription will automatically renew on <span className="account-emphase">03/09/2016</span> and you will be charged <span className="account-emphase">$15</span>
				</p>
				<DisplayWithLabel label="Your card" data="card data"/>
				<DisplayWithLabel nolabel={true} data="card data"/>
			</div>
		);
	}
}
