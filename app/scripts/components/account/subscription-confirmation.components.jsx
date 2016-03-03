import React from 'react';
import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class SubscriptionConfirmation extends React.Component {
	render() {
		return (
			<div className="account-base subscription-confirmation">
				<div className="subscription-title">
					Great, you chose the Professional annual subscription!
				</div>
				<div className="columns">
					<div className="third-column">
						You will be charged every year the following amount
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data="$144.0" nolabel={true}/>
					</div>
				</div>
				<div className="columns">
					<div className="third-column">
						You will be charged every year the following amount
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data="$144.0" nolabel={true}/>
					</div>
				</div>
				<div className="columns">
					<div className="third-column">
						You will be charged every year the following amount
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data="$144.0" nolabel={true}/>
					</div>
				</div>
				<div className="columns">
					<div className="third-column">
						You will be charged every year the following amount
					</div>
					<div className="two-third-column">
						<DisplayWithLabel data="$144.0" nolabel={true}/>
					</div>
				</div>
				<AccountValidationButton label="I confirm my subscription"/>
			</div>
		);
	}
}
