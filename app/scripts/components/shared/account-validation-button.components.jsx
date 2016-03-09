import React from 'react';
import WaitForLoad from '../wait-for-load.components.jsx';

export default class AccountValidationButton extends React.Component {
	render() {
		return (
			<button type="submit" className="account-button account-validation-button" onClick={this.props.click}>
				<WaitForLoad loaded={!this.props.loading} secColor={true}>
					{this.props.label}
				</WaitForLoad>
			</button>
		);
	}
}
