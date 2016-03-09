import React from 'react';

export default class AccountValidationButton extends React.Component {
	render() {
		return (
			<button type="submit" className="account-button account-validation-button" onClick={this.props.onClick}>
				{this.props.label}
			</button>
		);
	}
}
