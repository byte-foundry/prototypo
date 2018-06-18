import React from 'react';
import PropTypes from 'prop-types';

import AccountValidationButton from './shared/account-validation-button.components.jsx';
import InputWithLabel from './shared/input-with-label.components.jsx';
import WarningMessage from './warning-message.components.jsx';

import HoodieApi from '../services/hoodie.services.js';

class ResetPassword extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			loadingCheck: false,
			loading: false,
			error: null,
		};

		this.handleForm = this.handleForm.bind(this);
		this.redirectToDashboard = this.redirectToDashboard.bind(this);
		this.redirectToReset = this.redirectToReset.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
	}

	async resetPassword(e) {
		e.preventDefault();

		if (this.state.error) {
			return;
		}

		if (e.target.password.value.length < 8) {
			return this.setState({error: 'Password is too short'});
		}

		this.setState({loading: true});

		const {location, history} = this.props;

		try {
			await HoodieApi.resetPassword(
				location.query.id.replace(/ /g, '+'), // avoid blank
				location.query.resetToken,
				e.target.password.value,
			);

			this.setState({loading: false});

			history.replace('/signin/reset?success');
		}
		catch (err) {
			trackJs.track(err);
			this.setState({
				fetchError: err.message,
				loading: false,
			});
		}
	}

	handleForm(e) {
		const {form} = e.target;

		this.setState({error: null});

		if (
			form['password-check'].value
			&& form.password.value !== form['password-check'].value
		) {
			// eslint-disable-line
			this.setState({error: 'The fields do not match'});
		}
	}

	redirectToDashboard() {
		this.props.router.push('/dashboard');
	}

	redirectToReset() {
		this.props.router.push('/signin/forgotten');
	}

	componentDidMount() {
		const {history, location} = this.props;
		const {success, id, resetToken} = location.query;

		// history parses query and replaces + with spaces
		const idWithPlus = id.replace(/ /g, '+');

		if (success) {
			return;
		}

		if (id && resetToken) {
			return this.checkResetToken(idWithPlus, resetToken);
		}

		this.setState({isTokenValid: false});
	}

	componentWillReceiveProps({location, history}) {
		const {success, id, resetToken} = location.query;

		if (success) {
			return;
		}

		if (id && resetToken) {
			return this.checkResetToken(id, resetToken);
		}

		this.setState({isTokenValid: false});
	}

	async checkResetToken(id, resetToken) {
		this.setState({loadingCheck: true});

		try {
			await HoodieApi.checkResetToken(id, resetToken);

			this.setState({isTokenValid: true, loadingCheck: false});
		}
		catch (err) {
			this.setState({isTokenValid: false, loadingCheck: false});
		}
	}

	render() {
		const {loading, loadingCheck, error, fetchError, isTokenValid} = this.state;
		const {location} = this.props;

		if (location.query.hasOwnProperty('success')) {
			return (
				<div className="forgotten-password sign-in sign-base">
					<div className="account-dashboard-icon" />
					<div className="account-header">
						<h1 className="account-title">Reset my password</h1>
					</div>
					<div className="account-dashboard-container">
						<div className="sign-in-form">
							<p>
								Your password has been successfully resetted. You can now go the
								app!
							</p>
							<AccountValidationButton
								click={this.redirectToDashboard}
								label="Go to the app"
							/>
						</div>
					</div>
				</div>
			);
		}

		if (!isTokenValid && !loadingCheck) {
			return (
				<div className="forgotten-password sign-in sign-base">
					<div className="account-dashboard-icon" />
					<div className="account-header">
						<h1 className="account-title">Reset my password</h1>
					</div>
					<div className="account-dashboard-container">
						<div className="sign-in-form">
							<p>
								It seems the link you clicked on is not valid anymore! Try
								requesting a new password.
							</p>
							<AccountValidationButton
								click={this.redirectToReset}
								label="Reset my password"
							/>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="forgotten-password sign-in sign-base">
				<div className="account-dashboard-icon" />
				<div className="account-header">
					<h1 className="account-title">Reset my password</h1>
				</div>
				<div className="account-dashboard-container">
					<form
						className="sign-in-form"
						onSubmit={this.resetPassword}
						onChange={this.handleForm}
					>
						<p className="forgotten-password-text">
							Please enter a new password:{' '}
							<span style={{fontSize: '8px'}}>
								(and please, don't forget it this time!)
							</span>
						</p>
						<InputWithLabel
							label="Password"
							info="(at least 8 character long)"
							placeholder="Password"
							error={!!this.state.error}
							name="password"
							type="password"
							required
						/>
						<InputWithLabel
							label="Confirm password"
							placeholder="Password"
							error={!!this.state.error}
							name="password-check"
							type="password"
							required
						/>
						{error
							|| (fetchError && <WarningMessage text={error || fetchError} />)}
						<AccountValidationButton
							loading={loading}
							label="Reset Password"
							disabled={!!this.state.error}
						/>
					</form>
				</div>
			</div>
		);
	}
}

ResetPassword.propTypes = {
	location: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default ResetPassword;
