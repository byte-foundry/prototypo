import PropTypes from 'prop-types';
import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import TwitterLogin from 'react-twitter-auth';
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

	render() {
		const {className} = this.props;

		return (
			<div className={className}>
				<FacebookLogin
					appId={FACEBOOK_APP_ID}
					autoLoad={false}
					fields="name,email"
					callback={this.responseFacebook}
					render={renderProps => (
						<Button className="oauth-button oauth-button--facebook" fluid onClick={renderProps.onClick}>
							Sign in with Facebook
						</Button>
					)}
				/>
				<TwitterLogin
					callback={this.responseTwitter}
					requestTokenUrl={TWITTER_REQUEST_TOKEN_URL}
					render={renderProps => (
						<Button className="oauth-button oauth-button--twitter" fluid onClick={renderProps.onClick}>
							{renderProps.icon}
							Sign in with Twitter
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
};

const getUserQuery = gql`
  query getUser {
    user {
      id
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
