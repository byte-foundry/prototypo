import React from 'react';

import InputWithLabel from '../shared/input-with-label.components.jsx'
import DisplayWithLabel from '../shared/display-with-label.components.jsx';

export default class AccountProfilePanel extends React.Component {
	render() {
		return (
			<div className="account-base account-profile-panel">
				<DisplayWithLabel label="My email" data="mj@prototypo.io"/>
				<div className="account-profile-panel-line">
					<InputWithLabel label="First name" placeholder="MJ" required={true} store="/accountStore" model="firstName"/>
					<InputWithLabel label="Last name" placeholder="thecat" required={false} store="/accountStore" model="lastName"/>
				</div>
				<InputWithLabel label="I am" required={false} store="/accountStore" model="work"/>
				<div className="account-profile-panel-line">
					<InputWithLabel label="My website" placeholder="www.mj.com" required={false} store="/accountStore" model="website"/>
					<InputWithLabel label="Twitter account" placeholder="@thecat" required={false} store="/accountStore" model="twitter"/>
				</div>
			</div>
		);
	}
}
