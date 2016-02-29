import React from 'react';

export default class AccountValidationButton extends React.Component {
	render() {
		return (
			<div className="account-button account-validation-button" onClick={this.props.onClick}>
				{this.props.label}
			</div>
		);
	}
}
