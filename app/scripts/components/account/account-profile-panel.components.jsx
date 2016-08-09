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
				<form className="account-base account-profile-panel" onSubmit={(e) => {this.changeAccount(e);}}>
					<DisplayWithLabel label="My email">
						{this.state.infos.accountValues.username}
					</DisplayWithLabel>
					<div className="columns">
						<div className="half-column">
							<InputWithLabel ref="firstname" label="First name" required={true} inputValue={this.state.infos.accountValues.firstname}/>
						</div>
						<div className="half-column">
							<InputWithLabel ref="lastname" label="Last name" required={false} inputValue={this.state.infos.accountValues.lastname}/>
						</div>
					</div>
					<SelectWithLabel ref="css" label="I am" noResultsText="No result for this search" name="occupation" className="input-with-label-input" placeholder="an architect" options={values} inputValue={this.state.infos.accountValues.css}/>
					<div className="columns">
						<div className="half-column">
							<InputWithLabel ref="website" label="My website" placeholder="www.mj.com" required={false} inputValue={this.state.infos.accountValues.website}/>
						</div>
						<div className="half-column">
							<InputWithLabel ref="twitter" label="Twitter account" placeholder="@thecat" required={false} inputValue={this.state.infos.accountValues.twitter}/>
						</div>
					</div>
					<AccountValidationButton label="Save infos"/>
				</form>
			)
			: false;
	}
}
