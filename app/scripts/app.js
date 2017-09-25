import React from 'react';
import {Router, Route, IndexRoute, hashHistory, IndexRedirect} from 'react-router';
import {ApolloProvider} from 'react-apollo';

import HoodieApi from './services/hoodie.services';

import AcademyApp from './components/academy/academy-app.components';
import AcademyDashboard from './components/academy/academy-dashboard.components';
import AcademyHome from './components/academy/academy-home.components';
import AcademyCourse from './components/academy/academy-course.components';
import Dashboard from './components/dashboard.components';
import Signin from './components/signin.components';
import ForgottenPassword from './components/forgotten-password.components';
import ResetPassword from './components/reset-password.components';
import Register from './components/register.components';

import AccountApp from './components/account/account-app.components';
import AccountDashboard from './components/account/account-dashboard.components';
import AccountHome from './components/account/account-home.components';
import AccountSuccess from './components/account/account-success.components';
import AccountProfile from './components/account/account-profile-panel.components';
import AccountChangePassword from './components/account/account-change-password.components';
import AccountBillingAddress from './components/account/account-billing-address.components';
import AccountAddCard from './components/account/account-add-card.components';
import AccountChangePlan from './components/account/account-change-plan.components';
import AccountSubscription from './components/account/account-subscription.components';
import AccountConfirmPlan from './components/account/account-confirm-plan.components';
import AccountOrganization from './components/account/account-organization.components';
import AccountInvoiceList from './components/account/account-invoice-list.components';
import AccountPrototypoLibrary from './components/account/account-prototypo-library.components.jsx';
import Subscription from './components/account/subscription.components';
import StartApp from './components/start/start-app.components';
/* #if debug */
import ReplayViewer from './debug/replay-viewer.components';
/* #end */

function trackUrl() {
	ga('send', 'pageview', {page: this.state.location.pathname});
}

import apolloClient from './services/graphcool.services';

// This is a hacky function to get the hot reload during development
// this will go away as soon as we upgrade to RR4
Router.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	const components = [];

	function grabComponents(element) {
		// This only works for routes, adjust accordingly for plain config
		if (element.props && element.props.component) {
			components.push(element.props.component);
		}
		if (element.props && element.props.children) {
			React.Children.forEach(element.props.children, grabComponents);
		}
	}
	grabComponents(nextProps.routes || nextProps.children);
	components.forEach(React.createElement); // force patching
};

class App extends React.Component {
	render() {
		return this.props.children;
	}
}

function redirectToDashboard(nextState, replace) {
	if (HoodieApi.isLoggedIn()) {
		if (nextState.location.query && nextState.location.query.subscribe) {
			replace({
				pathname: '/account/subscribe',
				state: {nextPathname: nextState.location.pathname},
				query: {plan: nextState.location.query.subscribe},
			});
		}
		else {
			replace({
				pathname: '/start',
				state: {nextPathname: nextState.location.pathname},
			});
		}
	}
}

function redirectToLogin(nextState, replace) {
	if (!HoodieApi.isLoggedIn()) {
		replace({
			pathname: '/signin',
			query: {
				prevHash: nextState.location.pathname,
				...nextState.location.query,
			},
			state: {nextPathname: nextState.location.pathname},
		});
	}
	if (nextState.location.query.buy_credits) {
		LocalClient.instance().dispatchAction('/store-value', {
			openBuyCreditsModal: true,
		});
	}
}

function redirectToSignup(nextState, replace) {
	if (!HoodieApi.isLoggedIn()) {
		replace({
			pathname: '/signup',
			query: {
				prevHash: nextState.location.pathname,
				...nextState.location.query,
			},
			state: {nextPathname: nextState.location.pathname},
		});
	}
}

function trackUrl() {
	ga('send', 'pageview', {page: this.state.location.pathname});
}

export default class AppRoutes extends React.PureComponent {
	render() {
		return (
			<ApolloProvider client={apolloClient}>
				<Router history={hashHistory} onUpdate={trackUrl}>
					<Route component={App} name="app" path="/">
						<Route path="dashboard" component={Dashboard} onEnter={redirectToLogin} />
						/* #if debug */
						<Route path="replay" path="replay/:replayId" component={ReplayViewer} />
						<Route path="debug" component={ReplayViewer} />
						/* #endif */
						<Route path="signin" component={AccountApp} onEnter={redirectToDashboard}>
							<Route path="reset" component={ResetPassword} />
							<Route path="forgotten" component={ForgottenPassword} />
							<IndexRoute component={Signin} />
						</Route>
						<Route path="signup" component={AccountApp} onEnter={redirectToDashboard}>
							<IndexRoute component={Register} />
						</Route>
						<Route component={AccountApp} path="account">
							<IndexRedirect to="home" />
							<Route
								path="billing"
								component={AccountDashboard}
								name="billing"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AccountInvoiceList} />
							</Route>
							<Route component={AccountDashboard} path="home" name="home" onEnter={redirectToLogin}>
								<IndexRoute component={AccountHome} />
							</Route>
							<Route
								component={AccountDashboard}
								path="success"
								name="success"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AccountSuccess} />
							</Route>
							<Route
								path="profile"
								component={AccountDashboard}
								name="profile"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AccountProfile} />
								<Route path="change-password" component={AccountChangePassword} />
							</Route>
							<Route
								path="details"
								component={AccountDashboard}
								name="details"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AccountSubscription} />
								<Route path="billing-address" component={AccountBillingAddress} />
								<Route path="add-card" component={AccountAddCard} />
								<Route path="change-plan" component={AccountChangePlan} />
								<Route path="confirm-plan" component={AccountConfirmPlan} />
							</Route>
							<Route
								path="organization"
								component={AccountDashboard}
								name="organization"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AccountOrganization} />
							</Route>
							<Route
								path="prototypo-library"
								component={AccountDashboard}
								name="library"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AccountPrototypoLibrary} />
							</Route>
							<Route
								path="subscribe"
								component={Subscription}
								name="subscribe"
								onEnter={redirectToSignup}
							/>
						</Route>
						<Route component={AcademyApp} path="academy">
							<IndexRedirect to="home" />
							<Route component={AcademyDashboard} path="home" name="home" onEnter={redirectToLogin}>
								<IndexRoute component={AcademyHome} />
							</Route>
							<Route
								path="course/:courseSlug(/:partName)"
								component={AcademyDashboard}
								name="course"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AcademyCourse} />
							</Route>
						</Route>
					</Route>
					<Route path="start" component={StartApp} onEnter={redirectToLogin} />
				</Router>
			</ApolloProvider>
		);
	}
}
