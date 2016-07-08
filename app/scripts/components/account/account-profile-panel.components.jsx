import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

import InputWithLabel from '../shared/input-with-label.components.jsx';
import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import SelectWithLabel from '../shared/select-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class AccountProfilePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			infos: {},
		};

		//function binding
		this.changeAccount = this.changeAccount.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					infos: head.toJS().infos,
					loading: head.toJS().loading,
					errors: head.toJS().errors,
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
		});
	}

	render() {
		const values = [
			{value: 'graphic_designer', label: 'a graphic designer'},
			{value: 'artistic_director', label: 'an artistic director'},
			{value: 'web_developer', label: 'a web developer'},
			{value: 'type_designer', label: 'a type designer'},
		];

		return this.state.infos.accountValues
			? (
				<form className="account-base account-profile-panel" onSubmit={this.changeAccount}>
					<DisplayWithLabel label="My email" data={this.state.infos.accountValues.username}/>
					<div className="account-profile-panel-line">
						<InputWithLabel ref="firstname" label="First name" required={true} inputValue={this.state.infos.accountValues.firstname}/>
						<InputWithLabel ref="lastname" label="Last name" required={false} inputValue={this.state.infos.accountValues.lastname}/>
					</div>
					<SelectWithLabel ref="css" label="I am" noResultsText="No result for this search" name="occupation" className="input-with-label-input" options={values} inputValue={this.state.infos.accountValues.css}/>
					<div className="account-profile-panel-line">
						<InputWithLabel ref="website" label="My website" placeholder="www.mj.com" required={false} inputValue={this.state.infos.accountValues.website}/>
						<InputWithLabel ref="twitter" label="Twitter account" placeholder="@thecat" required={false} inputValue={this.state.infos.accountValues.twitter}/>
					</div>
					<AccountValidationButton label="Save infos"/>
				</form>
			)
			: false;
	}
}
