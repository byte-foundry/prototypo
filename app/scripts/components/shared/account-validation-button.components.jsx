import React from 'react';

import WaitForLoad from '../wait-for-load.components.jsx';

export default class AccountValidationButton extends React.PureComponent {
	render() {
		const type = this.props.click ? 'button' : 'submit';

		return (
			<button
				type={type}
				className="account-button account-validation-button"
				disabled={this.props.disabled || this.props.loading}
				onClick={this.props.click}
			>
				<WaitForLoad loaded={!this.props.loading} secColor={true}>
					{this.props.label}
				</WaitForLoad>
			</button>
		);
	}
}
