import PropTypes from 'prop-types';
import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import TwitterLogin from 'react-twitter-auth';
import GoogleLogin from 'react-google-login';
import {compose, graphql, gql} from 'react-apollo';

import isProduction from '../helpers/is-production.helpers';
import {TWITTER_REQUEST_TOKEN_URL} from '../services/hoodie.services';

import Button from './shared/new-button.components';

const FACEBOOK_APP_ID = isProduction() ? '360143951128760' : '569126220107317';

class OAuthButtons extends React.PureComponent {
	constructor(props) {
		super(props);

		this.responseFacebook = this.responseFacebook.bind(this);
		this.responseTwitter = this.responseTwitter.bind(this);
		this.responseGoogle = this.responseGoogle.bind(this);
	}

	async responseFacebook(response) {
		const facebookToken = response.accessToken;
		const graphcoolResponse = await this.props.authenticateFacebookUser(facebookToken);
		const graphcoolToken = graphcoolResponse.data.auth.token;

		this.props.onLogin(response.email, graphcoolToken);
	}

	async responseTwitter({oauthVerifier, oauthToken}) {
		const graphcoolResponse = await this.props.authenticateTwitterUser(oauthToken, oauthVerifier);
		const {email, token} = graphcoolResponse.data.auth;

		this.props.onLogin(email, token);
	}

	async responseGoogle(response) {
		const graphcoolResponse = await this.props.authenticateGoogleUser(response.accessToken);
		const {token} = graphcoolResponse.data.auth;

		this.props.onLogin(response.profileObj.email, token);
	}

	render() {
		const {className, id} = this.props;

		return (
			<div className={className} id={id}>
				<FacebookLogin
					appId={FACEBOOK_APP_ID}
					autoLoad={false}
					fields="name,email"
					callback={this.responseFacebook}
					render={renderProps => (
						<Button className="oauth-button oauth-button--facebook" fluid onClick={renderProps.onClick}>
							<div className="oauth-button-icon">
								<svg width="25px" height="25px" enableBackground="new 0 0 266.893 266.895" version="1.1" viewBox="0 0 266.89 266.9">
									<path d="m18.812 4.5879c-7.857 0-14.225 6.3676-14.225 14.225v229.27c0 7.855 6.3666 14.225 14.225 14.225h123.43v-99.803h-33.584v-38.895h33.584v-28.684c0-33.287 20.33-51.414 50.025-51.414 14.224 0 26.45 1.0592 30.012 1.5332v34.787l-20.596 0.009766c-16.148 0-19.275 7.6745-19.275 18.936v24.832h38.516l-5.0156 38.895h-33.5v99.803h65.674c7.854 0 14.223-6.3686 14.223-14.225v-229.27c0-7.857-6.3677-14.225-14.223-14.225h-229.27z" fill="currentColor" />
								</svg>
							</div>
							<span className="oauth-button-content">Facebook</span>
						</Button>
					)}
				/>
				<TwitterLogin
					callback={this.responseTwitter}
					requestTokenUrl={TWITTER_REQUEST_TOKEN_URL}
					render={renderProps => (
						<Button className="oauth-button oauth-button--twitter" fluid onClick={renderProps.onClick}>
							<div className="oauth-button-icon">
								{React.cloneElement(renderProps.icon, {style: {color: '#fff'}})}
							</div>
							<span className="oauth-button-content">Twitter</span>
						</Button>
					)}
				/>
				<GoogleLogin
					clientId="245602847933-kpiga4d7u65pb105lr8ede4vo5csd9ic.apps.googleusercontent.com"
					buttonText="Login"
					onSuccess={this.responseGoogle}
					onFailure={this.responseGoogle}
					render={renderProps => (
						<Button className="oauth-button oauth-button--google" fluid onClick={renderProps.onClick}>
							<div className="oauth-button-icon">
								<svg version="1.1" width="18px" height="18px" viewBox="0 0 48 48" className="abcRioButtonSvg"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
							</div>
							<span className="oauth-button-content">Google</span>
						</Button>
					)}
				/>
			</div>
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
    auth: authenticateTwitterUser(oAuthToken: $token, oAuthVerifier: $verifier) {
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
			authenticateTwitterUser: (token, verifier) => mutate({variables: {token, verifier}}),
		}),
	}),
	graphql(authenticateFacebookUserMutation, {
		props: ({mutate}) => ({
			authenticateFacebookUser: facebookToken => mutate({variables: {facebookToken}}),
		}),
	}),
	graphql(getUserQuery, {
		options: {fetchPolicy: 'network-only'},
	}),
)(OAuthButtons);
