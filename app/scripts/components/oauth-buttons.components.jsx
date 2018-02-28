import PropTypes from 'prop-types';
import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import {compose, graphql, gql} from 'react-apollo';

import isProduction from '../helpers/is-production.helpers';

import Button from './shared/new-button.components';

const FACEBOOK_APP_ID = isProduction() ? '360143951128760' : '569126220107317';

class OAuthButtons extends React.PureComponent {
	constructor(props) {
		super(props);

		this.responseFacebook = this.responseFacebook.bind(this);
	}

	async responseFacebook(response) {
		const facebookToken = response.accessToken;
		const graphcoolResponse = await this.props.authenticateFacebookUser(facebookToken);
		const graphcoolToken = graphcoolResponse.data.authenticateFacebookUser.token;

		this.props.onLogin(response.email, graphcoolToken);
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
						<Button fluid onClick={renderProps.onClick}>Sign in with Facebook</Button>
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
};

const getUserQuery = gql`
  query getUser {
    user {
      id
    }
  }
`;

const authenticateFacebookUserMutation = gql`
  mutation AuthenticateFacebookUser($facebookToken: String!) {
    authenticateFacebookUser(facebookToken: $facebookToken) {
      token
    }
  }
`;

export default compose(
	graphql(authenticateFacebookUserMutation, {
		props: ({mutate}) => ({
			authenticateFacebookUser: facebookToken => mutate({variables: {facebookToken}}),
		}),
	}),
	graphql(getUserQuery, {
		options: {fetchPolicy: 'network-only'},
	}),
)(OAuthButtons);
