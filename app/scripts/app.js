import React from 'react';
import {
	Router,
	Route,
	IndexRoute,
	hashHistory,
	IndexRedirect,
} from 'react-router';
import {ApolloProvider} from 'react-apollo';
import {hot} from 'react-hot-loader';

import HoodieApi from './services/hoodie.services';

import LibraryApp from './components/library/library-app.components';
import LibraryMain from './components/library/library-main.components';
import LibraryList from './components/library/library-list.components';
import LibraryCreate from './components/library/library-create.components';
import LibraryReview from './components/library/library-review.components';
import LibraryHosting from './components/library/library-hosting.components';
import LibraryHostingCreate from './components/library/library-hosting-create.components';
import LibraryDetails from './components/library/library-details.components';
import LibrarySee from './components/library/library-see.components';
import LibraryFontsInUse from './components/library/library-fontinuse.components';
import LibraryFontsInUseCreate from './components/library/library-fontinuse-create.components';
import LibraryFontsInUseList from './components/library/library-fontinuse-list.components';

import OnboardingApp from './components/onboarding/onboarding-app.components';

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

import FontTester from './font-test/font-tester.components.jsx';

import GlyphTester from './font-test/glyph-tester.components.jsx';
/* #if debug */
import ReplayViewer from './debug/replay-viewer.components';
/* #end */

import apolloClient from './services/graphcool.services';

// This is a hacky function to get the hot reload during development
// this will go away as soon as we upgrade to RR4
Router.prototype.componentWillReceiveProps = function componentWillReceiveProps(
	nextProps,
) {
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
				pathname: '/library/home',
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

// eslint-disable-next-line
class AppRoutes extends React.PureComponent {
	render() {
		return (
			<ApolloProvider client={apolloClient}>
				<Router history={hashHistory} onUpdate={trackUrl}>
					<Route component={App} name="app" path="/">
						<Route
							path="dashboard"
							component={Dashboard}
							onEnter={redirectToLogin}
						/>
						<Route path="onboarding" component={OnboardingApp} />
						/* #if debug */
						<Route
							path="replay"
							path="replay/:replayId"
							component={ReplayViewer}
						/>
						<Route path="debug" component={ReplayViewer} />
						/* #endif */
						<Route path="testfont" component={FontTester} />
						<Route path="testglyph/:unicode" component={GlyphTester} />
						<Route
							path="signin"
							component={AccountApp}
							onEnter={redirectToDashboard}
						>
							<Route path="reset" component={ResetPassword} />
							<Route path="forgotten" component={ForgottenPassword} />
							<IndexRoute component={Signin} />
						</Route>
						<Route
							path="signup"
							component={AccountApp}
							onEnter={redirectToDashboard}
						>
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
							<Route
								component={AccountDashboard}
								path="home"
								name="home"
								onEnter={redirectToLogin}
							>
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
								<Route
									path="change-password"
									component={AccountChangePassword}
								/>
							</Route>
							<Route
								path="details"
								component={AccountDashboard}
								name="details"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={AccountSubscription} />
								<Route
									path="billing-address"
									component={AccountBillingAddress}
								/>
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
						<Route component={LibraryApp} path="library">
							<IndexRedirect to="home" />
							<Route
								component={LibraryMain}
								path="home"
								name="list"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={LibraryList} />
							</Route>
							<Route
								path="hosting"
								component={LibraryMain}
								name="hosting"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={LibraryHosting} />
								<Route path="create" component={LibraryHostingCreate} />
							</Route>
							<Route
								path="hosting/:hostedDomainId"
								component={LibraryMain}
								name="seeHosting"
								onEnter={redirectToLogin}
							>
								<Route path="edit" component={LibraryHostingCreate} />
							</Route>
							<Route
								path="create"
								component={LibraryMain}
								name="create"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={LibraryCreate} />
							</Route>
							<Route
								path="review"
								component={LibraryReview}
								name="review"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={LibraryReview} />
							</Route>
							<Route
								exact
								path="fontinuse"
								component={LibraryMain}
								name="fontInUseList"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={LibraryFontsInUseList} />
								<Route path="create" component={LibraryFontsInUseCreate} />
							</Route>
							<Route
								path="fontinuse/:fontinuseID"
								component={LibraryMain}
								name="seeFontInUse"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={LibraryFontsInUse} />
								<Route path="edit" component={LibraryFontsInUseCreate} />
							</Route>
							<Route
								path="project/:projectID"
								component={LibraryMain}
								name="see"
								onEnter={redirectToLogin}
							>
								<IndexRoute component={LibrarySee} />
								<Route path="details" component={LibraryDetails} />
							</Route>
						</Route>
						<Route component={AcademyApp} path="academy">
							<IndexRedirect to="home" />
							<Route
								component={AcademyDashboard}
								path="home"
								name="home"
								onEnter={redirectToLogin}
							>
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
				</Router>
			</ApolloProvider>
		);
	}
}

export default hot(module)(AppRoutes);
