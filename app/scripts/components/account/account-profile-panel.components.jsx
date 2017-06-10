import React from 'react';
import {graphql, gql, compose} from 'react-apollo';

import InputWithLabel from '../shared/input-with-label.components';
import DisplayWithLabel from '../shared/display-with-label.components';
import SelectWithLabel from '../shared/select-with-label.components';
import AccountValidationButton from '../shared/account-validation-button.components';
import FormError from '../shared/form-error.components';
import FormSuccess from '../shared/form-success.components';
import WaitForLoad from '../wait-for-load.components';

class AccountProfilePanel extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			success: false,
			errors: '',
		};

		this.jobtitles = [
			{value: 'graphic_designer', label: 'a graphic designer'},
			{value: 'student', label: 'a student'},
			{value: 'teacher', label: 'a teacher'},
			{value: 'type_designer', label: 'a type designer'},
			{value: 'web_developer', label: 'a web developer'},
		];

		this.changeAccount = this.changeAccount.bind(this);
	}

	async changeAccount(e) {
		e.preventDefault();

		this.setState({success: false, errors: ''});

		try {
			const firstName = this.refs.firstName.inputValue;
			const lastName = this.refs.lastName.inputValue;
			const occupation = this.refs.occupation.inputValue.value;
			const website = this.refs.website.inputValue;
			const twitter = this.refs.twitter.inputValue;
			// avoid empty string being recorded into Intercom
			const phone = this.refs.phone.inputValue || undefined;
			const skype = this.refs.skype.inputValue;

			if (!firstName) {
				throw new Error('First name is required.');
			}

			await this.props.updateProfile({
				firstName,
				lastName,
				occupation,
				website,
				twitter,
				phone,
				skype,
			});

			this.setState({success: true});
		}
		catch (err) {
			this.setState({errors: err.message});
		}
	}

	render() {
		const {
			loading,
			email,
			firstName,
			lastName,
			occupation,
			website,
			twitter,
			phone,
			skype,
		} = this.props;
		const {success, errors} = this.state;

		if (loading) {
			return (
				<div className="account-base account-profile-panel">
					<WaitForLoad loading />
				</div>
			);
		}

		return (
			<form className="account-base account-profile-panel" onSubmit={this.changeAccount}>
				<DisplayWithLabel label="My email">
					{email}
				</DisplayWithLabel>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel ref="firstName" label="First name" required inputValue={firstName} />
					</div>
					<div className="half-column">
						<InputWithLabel
							ref="lastName"
							label="Last name"
							placeholder="Doe"
							required={false}
							inputValue={lastName}
						/>
					</div>
				</div>
				<SelectWithLabel
					ref="occupation"
					label="I am"
					name="occupation"
					className="input-with-label-input"
					placeholder="an architect"
					options={this.jobtitles}
					inputValue={occupation}
				/>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel
							ref="website"
							label="My website"
							placeholder="www.domain.com"
							required={false}
							inputValue={website}
						/>
					</div>
					<div className="half-column">
						<InputWithLabel
							ref="twitter"
							label="Twitter account"
							placeholder="@johnDoe"
							required={false}
							inputValue={twitter}
						/>
					</div>
				</div>
				<div className="columns">
					<div className="half-column">
						<InputWithLabel label="Phone number" type="tel" ref="phone" inputValue={phone} />
					</div>
					<div className="half-column">
						<InputWithLabel label="Skype ID" ref="skype" inputValue={skype} />
					</div>
				</div>
				{success && <FormSuccess successText="You've successfully updated your profile." />}
				{errors && <FormError errorText={errors} />}
				<AccountValidationButton label="Save infos" />
			</form>
		);
	}
}

const userProfileQuery = gql`
	query getUserProfile {
		user {
			id
			email
			firstName
			lastName
			occupation
			website
			twitter
			phone
			skype
		}
	}
`;

const updateProfileMutation = gql`
	mutation updateProfile(
		$id: ID!,
		$firstName: String,
		$lastName: String,
		$occupation: String,
		$website: String,
		$twitter: String,
		$phone: String,
		$skype: String,
	) {
		updateUser(
			id: $id,
			firstName: $firstName,
			lastName: $lastName,
			occupation: $occupation,
			website: $website,
			twitter: $twitter,
			phone: $phone,
			skype: $skype,
		) {
			id
			email
			firstName
			lastName
			occupation
			website
			twitter
			phone
			skype
		}
	}
`;

export default compose(
	graphql(userProfileQuery, {
		props: ({data}) => {
			if (data.loading) {
				return {loading: true};
			}

			return data.user;
		},
	}),
	graphql(updateProfileMutation, {
		props: ({mutate, ownProps}) => ({
			updateProfile: (values) => {
				if (window.Intercom) {
					const fullName = values.firstName + values.lastName ? ` ${values.lastName}` : '';

					window.Intercom('update', {
						name: fullName,
						twitter: values.twitter,
						website: values.website,
						occupation: values.occupation,
						phone: values.phone,
						skype: values.skype,
					})
				}

				mutate({
					variables: {
						...values,
						id: ownProps.id,
					},
				});
			}
		}),
	}),
)(AccountProfilePanel);
