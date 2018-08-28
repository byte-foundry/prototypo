import React from 'react';

export default class OAuthButtons extends React.PureComponent {
	render() {
		return <div />;
	}
}

OAuthButtons.defaultProps = {
	onLogin: () => {},
	authenticateGoogleUser: () => {},
	authenticateTwitterUser: () => {},
	authenticateFacebookUser: () => {},
};
