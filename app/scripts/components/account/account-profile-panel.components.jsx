import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import InputWithLabel from '../shared/input-with-label.components.jsx';
import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import SelectWithLabel from '../shared/select-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import FormError from '../shared/form-error.components.jsx';
import FormSuccess from '../shared/form-success.components.jsx';

export default class AccountProfilePanel extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			infos: {},
			errors: [],
		};

		this.changeAccount = this.changeAccount.bind(this);
		this.jobtitles = [
			{value: 'graphic_designer', label: 'a graphic designer'},
			{value: 'student', label: 'a student'},
			{value: 'teacher', label: 'a teacher'},
			{value: 'type_designer', label: 'a type designer'},
			{value: 'web_developer', label: 'a web developer'},
		];

	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					infos: head.toJS().d.infos,
					errors: head.toJS().d.profileForm.errors,
					success: head.toJS().d.profileForm.success,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeAccount(e) {
		e.preventDefault();
		this.client.dispatchAction('/change-account-info', {
			firstname: this.refs.firstname.inputValue,
			lastname: this.refs.lastname.inputValue,
			css: this.refs.css.inputValue,
			website: this.refs.website.inputValue,
			twitter: this.refs.twitter.inputValue,
			phone: this.refs.phone.inputValue,
			skype: this.refs.skype.inputValue,
		});
	}

	render() {
		return this.state.infos.accountValues
			? (
				<form className="account-base account-profile-panel" onSubmit={this.changeAccount}>
					<DisplayWithLabel label="My email">
						{this.state.infos.accountValues.username}
					</DisplayWithLabel>
					<div className="columns">
						<div className="half-column">
							<InputWithLabel ref="firstname" label="First name" required={true} inputValue={this.state.infos.accountValues.firstname}/>
						</div>
						<div className="half-column">
							<InputWithLabel ref="lastname" label="Last name" placeholder="Doe" required={false} inputValue={this.state.infos.accountValues.lastname}/>
						</div>
					</div>
					<SelectWithLabel
						ref="css"
						label="I am"
						name="css"
						className="input-with-label-input"
						placeholder="an architect"
						options={this.jobtitles}
						inputValue={this.state.infos.accountValues.css}/>
					<div className="columns">
						<div className="half-column">
							<InputWithLabel ref="website" label="My website" placeholder="www.domain.com" required={false} inputValue={this.state.infos.accountValues.website}/>
						</div>
						<div className="half-column">
							<InputWithLabel ref="twitter" label="Twitter account" placeholder="@johnDoe" required={false} inputValue={this.state.infos.accountValues.twitter}/>
						</div>
					</div>
					<div className="columns">
						<div className="half-column">
							<InputWithLabel label="Phone number" type="tel" ref="phone" inputValue={this.state.infos.accountValues.phone} />
						</div>
						<div className="half-column">
							<InputWithLabel label="Skype ID" ref="skype" inputValue={this.state.infos.accountValues.skype} />
						</div>
					</div>
					{this.state.success && <FormSuccess successText="You've successfully updated your profile."/>}
					{this.state.errors.map((err) => {return <FormError key={err} errorText={err}/>;})}
					<AccountValidationButton label="Save infos"/>
				</form>
			)
			: false;
	}
}
