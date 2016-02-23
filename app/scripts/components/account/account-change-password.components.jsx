import React from 'react';
import InputWithLabel from '../shared/input-with-label.components.jsx';

export default class AccountChangePassword extends React.Component {
	render() {
		return (
			<div className="account-base account-change-password">
				<InputWithLabel required={true} label="My current password"/>
				<div className="account-change-password-line">
					<InputWithLabel required={true} label="New password"/>
					<InputWithLabel required={true} label="New password, again"/>
				</div>
			</div>
		);
	}
}
