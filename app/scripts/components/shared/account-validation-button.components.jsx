import React from 'react';
import WaitForLoad from '../wait-for-load.components.jsx';

export default class AccountValidationButton extends React.Component {
	render() {
		const type = this.props.click ? 'button' : 'submit';

		return (
			<button type={type} disabled={this.props.loading} className="account-button account-validation-button" disabled={this.props.disabled} onClick={this.props.click}>
				<WaitForLoad loaded={!this.props.loading} secColor={true}>
					{this.props.label}
				</WaitForLoad>
			</button>
		);
	}
}
