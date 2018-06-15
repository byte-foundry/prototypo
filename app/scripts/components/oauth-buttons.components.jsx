import PropTypes from 'prop-types';
import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import TwitterLogin from 'react-twitter-auth';
import GoogleLogin from 'react-google-login';
import {compose, graphql, gql} from 'react-apollo';

import isProduction from '../helpers/is-production.helpers';
import {TWITTER_REQUEST_TOKEN_URL} from '../services/hoodie.services';

import Button from './shared/new-button.components';
import WaitForLoad from './wait-for-load.components';

const FACEBOOK_APP_ID = isProduction() ? '360143951128760' : '569126220107317';
const GOOGLE_CLIENT_ID = `498899515436-${
	isProduction()
		? 'aiq68iif29l3dh8pcrjgn8uvpht180vv'
		: '7c84imarpufkvf56olbpodnks3d3kg2p'
}.apps.googleusercontent.com`;

class OAuthButtons extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
		};

		this.responseFacebook = this.responseFacebook.bind(this);
		this.responseTwitter = this.responseTwitter.bind(this);
		this.responseGoogle = this.responseGoogle.bind(this);
	}

	async responseFacebook(response) {
		if (!response.email || !response.accessToken) {
			// TODO: handle this nicely
			return;
		}

		this.setState({loading: true});
		const facebookToken = response.accessToken;
		const graphcoolResponse = await this.props.authenticateFacebookUser(
			facebookToken,
		);
		const graphcoolToken = graphcoolResponse.data.auth.token;

		this.props.onLogin(response.email, graphcoolToken);
	}

	async responseTwitter({oauthVerifier, oauthToken, error}) {
		if (error) {
			// TODO: handle this nicely
			return;
		}

		this.setState({loading: true});
		const graphcoolResponse = await this.props.authenticateTwitterUser(
			oauthToken,
			oauthVerifier,
		);
		const {email, token} = graphcoolResponse.data.auth;

		this.props.onLogin(email, token);
	}

	async responseGoogle(response) {
		if (response.error) {
			// TODO: handle this nicely
			return;
		}

		this.setState({loading: true});
		const graphcoolResponse = await this.props.authenticateGoogleUser(
			response.accessToken,
		);
		const {token} = graphcoolResponse.data.auth;

		this.props.onLogin(response.profileObj.email, token);
	}

	render() {
		const {className, id} = this.props;
		const {loading} = this.state;

		return (
			<WaitForLoad loading={loading}>
				<div className={className} id={id}>
					<FacebookLogin
						appId={FACEBOOK_APP_ID}
						autoLoad={false}
						fields="name,email"
						callback={this.responseFacebook}
						render={renderProps => (
							<Button
								className="oauth-button oauth-button--facebook"
								fluid
								onClick={renderProps.onClick}
							>
								Facebook
							</Button>
						)}
					/>
					<TwitterLogin
						callback={this.responseTwitter}
						requestTokenUrl={TWITTER_REQUEST_TOKEN_URL}
						render={renderProps => (
							<Button
								className="oauth-button oauth-button--twitter"
								fluid
								onClick={renderProps.onClick}
							>
								Twitter
							</Button>
						)}
					/>
					<GoogleLogin
						clientId={GOOGLE_CLIENT_ID}
						buttonText="Login"
						onSuccess={this.responseGoogle}
						onFailure={this.responseGoogle}
						render={renderProps => (
							<Button
								className="oauth-button oauth-button--google"
								fluid
								onClick={renderProps.onClick}
							>
								Google
							</Button>
						)}
					/>
				</div>
			</WaitForLoad>
		);
	}
}

OAuthButtons.defaultProps = {
	onLogin: () => {},
};

OAuthButtons.propTypes = {
	onLogin: PropTypes.func,
	authenticateFacebookUser: PropTypes.func,
	authenticateTwitterUser: PropTypes.func,
	authenticateGoogleUser: PropTypes.func,
};

const getUserQuery = gql`
	query getUser {
		user {
			id
		}
	}
`;

const authenticateGoogleUserMutation = gql`
	mutation authenticateGoogleUser($token: String!) {
		auth: authenticateGoogleUser(googleToken: $token) {
			token
		}
	}
`;

const authenticateTwitterUserMutation = gql`
	mutation authenticateTwitterUser($token: String!, $verifier: String!) {
		auth: authenticateTwitterUser(
			oAuthToken: $token
			oAuthVerifier: $verifier
		) {
			token
		}
	}
`;

const authenticateFacebookUserMutation = gql`
	mutation AuthenticateFacebookUser($facebookToken: String!) {
		auth: authenticateFacebookUser(facebookToken: $facebookToken) {
			token
		}
	}
`;

export default compose(
	graphql(authenticateGoogleUserMutation, {
		props: ({mutate}) => ({
			authenticateGoogleUser: token => mutate({variables: {token}}),
		}),
	}),
	graphql(authenticateTwitterUserMutation, {
		props: ({mutate}) => ({
			authenticateTwitterUser: (token, verifier) =>
				mutate({variables: {token, verifier}}),
		}),
	}),
	graphql(authenticateFacebookUserMutation, {
		props: ({mutate}) => ({
			authenticateFacebookUser: facebookToken =>
				mutate({variables: {facebookToken}}),
		}),
	}),
	graphql(getUserQuery, {
		options: {fetchPolicy: 'network-only'},
	}),
)(OAuthButtons);
