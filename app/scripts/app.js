import React from 'react';
import {Route, Redirect, Switch} from 'react-router-dom';

import {hot} from 'react-hot-loader';

import ProtectedRoute from './protected-route.components';
import AcademyApp from './components/academy/academy-app.components';
import LibraryApp from './components/library/library-app.components';
import OnboardingApp from './components/onboarding/onboarding-app.components';
import Dashboard from './components/dashboard.components';

import Signin from './components/signin.components';
import ForgottenPassword from './components/forgotten-password.components';
import ResetPassword from './components/reset-password.components';
import Register from './components/register.components';

import AccountApp from './components/account/account-app.components';
import FontTester from './font-test/font-tester.components';
import GlyphTester from './font-test/glyph-tester.components';
/* #if debug */
import ReplayViewer from './debug/replay-viewer.components';
/* #end */

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			initialLoad: true,
		};
	}

	componentDidUpdate() {
		window.ga('set', 'page', this.props.location.pathname);
		window.ga('send', 'pageview');
	}

	componentWillReceiveProps() {
		if (this.state.initialLoad) {
			this.setState({initialLoad: false});
		}
	}

	render() {
		return (
			<Switch>
				<Route path="/signin" exact component={Signin} />
				<Route path="/signin/reset" component={ResetPassword} />
				<Route path="/signin/forgotten" component={ForgottenPassword} />
				<Route path="/signup" component={Register} />

				<Route path="/academy" component={AcademyApp} />

				{/* User only routes */}
				<ProtectedRoute path="/library" component={LibraryApp} />
				<ProtectedRoute path="/onboarding" component={OnboardingApp} />
				{!this.state.initialLoad && (
					<ProtectedRoute path="/dashboard" component={Dashboard} />
				)}
				<ProtectedRoute path="/account" component={AccountApp} />

				{/* #if debug */}
				<ProtectedRoute
					path="/replay"
					path="/replay/:replayId"
					component={ReplayViewer}
				/>
				<ProtectedRoute path="/debug" component={ReplayViewer} />
				{/* #endif */}
				<ProtectedRoute path="/testfont" component={FontTester} />
				<ProtectedRoute path="/testglyph/:unicode" component={GlyphTester} />

				<Redirect path="*" to="/library" />
			</Switch>
		);
	}
}

export default hot(module)(App);
