import './styles';

import pleaseWait from 'please-wait';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, hashHistory, IndexRedirect} from 'react-router';
import {ApolloProvider} from 'react-apollo';

import Dashboard from './components/dashboard.components.jsx';
import Maintenance from './components/maintenance.components.jsx';
import Signin from './components/signin.components.jsx';
import ForgottenPassword from './components/forgotten-password.components.jsx';
import ResetPassword from './components/reset-password.components.jsx';
import NotABrowser from './components/not-a-browser.components.jsx';
import IAmMobile from './components/i-am-mobile.components.jsx';
import Register from './components/register.components.jsx';

import AccountApp from './components/account/account-app.components.jsx';
import AccountDashboard from './components/account/account-dashboard.components.jsx';
import AccountHome from './components/account/account-home.components.jsx';
import AccountSuccess from './components/account/account-success.components.jsx';
import AccountProfile from './components/account/account-profile-panel.components.jsx';
import AccountChangePassword from './components/account/account-change-password.components.jsx';
import AccountBillingAddress from './components/account/account-billing-address.components.jsx';
import AccountAddCard from './components/account/account-add-card.components.jsx';
import AccountChangePlan from './components/account/account-change-plan.components.jsx';
import AccountSubscription from './components/account/account-subscription.components.jsx';
import AccountConfirmPlan from './components/account/account-confirm-plan.components.jsx';
import AccountOrganization from './components/account/account-organization.components.jsx';
import AccountInvoiceList from './components/account/account-invoice-list.components.jsx';
import Subscription from './components/account/subscription.components.jsx';
import StartApp from './components/start/start-app.components.jsx';

import apolloClient from './services/graphcool.services.js';
import HoodieApi from './services/hoodie.services.js';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
import Stores from './stores/creation.stores.jsx';

import selectRenderOptions from './helpers/userAgent.helpers.js';
import {loadStuff} from './helpers/appSetup.helpers.js';
import isProduction from './helpers/is-production.helpers';

import appValuesAction from './actions/appValues.actions.jsx';
import exportAction from './actions/export.actions.jsx';
import fontAction from './actions/font.actions.jsx';
import fontControlsAction from './actions/fontControls.actions.jsx';
import fontInfosAction from './actions/fontInfos.actions.jsx';
import fontParametersAction from './actions/fontParameters.actions.jsx';
import glyphsAction from './actions/glyphs.actions.jsx';
import indivAction from './actions/indiv.actions.jsx';
import panelAction from './actions/panel.actions.jsx';
import searchAction from './actions/search.actions.jsx';
import tagStoreAction from './actions/tagStore.actions.jsx';
import undoStackAction from './actions/undoStack.actions.jsx';
import userLifecycleAction from './actions/user-lifecycle.actions.jsx';

import EventDebugger, {debugActions} from './debug/eventLogging.debug.jsx';
/* #if debug */
import ReplayViewer from './debug/replay-viewer.components.jsx';
/* #end */

function trackUrl() {
	ga('send', 'pageview', {page: this.state.location.pathname});
}

window.addEventListener('unload', () => {
	worker.port.postMessage({type: 'closeAll'});
	worker.port.close();
});

selectRenderOptions(
	() => {
		const content = document.getElementById('content');

		ReactDOM.render(<IAmMobile />, content);
	},
	() => {
		const content = document.getElementById('content');

		ReactDOM.render(<NotABrowser />, content);
	},
	() => {

		const stripeKey = isProduction()
			? 'pk_live_CVrzdDZTEowrAZaRizc4G14c'
			: 'pk_test_PkwKlOWOqSoimNJo2vsT21sE';

		window.Stripe && window.Stripe.setPublishableKey(stripeKey);

		const stores = window.prototypoStores = Stores;

		const prototypoStore = Stores['/prototypoStore'];

			/*function saveErrorLog(error) {
			const debugLog = {
				events: prototypoStore.events,
				message: err.message,
				stack: error.stack,
				date: new Date(),
			};

			const data = JSON.stringify(debugLog);

			fetch('http://localhost:9002/errors/', {
				method: 'POST',
				body: data,
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
				},
			});
		}*/

		/* #if debug */
		const localServer = new LocalServer(stores, {
			debugPath: [
				'/debugStore',
				'/save-debug-log',
				'/store-in-debug-font',
				'/show-details',
			],
			logStore: stores['/prototypoStore'],
		}).instance;
		/* #end */
		/* #if prod */
		const localServer = new LocalServer(stores).instance;
		/* #end */

		LocalClient.setup(localServer);
		const fluxEvent = new Event('fluxServer.setup');

		window.dispatchEvent(fluxEvent);

		const eventDebugger = new EventDebugger();

		async function createStores() {

			const actions = {};

			_.assign(actions,
				appValuesAction,
				exportAction,
				fontAction,
				fontControlsAction,
				fontInfosAction,
				fontParametersAction,
				glyphsAction,
				indivAction,
				panelAction,
				searchAction,
				tagStoreAction,
				undoStackAction,
				debugActions,
				userLifecycleAction,
				{
					'/load-intercom-info': (data) => {
						const patch = prototypoStore.set('intercomTags', data.tags.tags).commit();

						localServer.dispatchUpdate('/prototypoStore', patch);
					},
				}
			);

			localServer.on('action', ({path, params}) => {
				//eventDebugger.storeEvent(path, params);
				if (process.env.__SHOW_ACTION__) {
					console.log(`[ACTION] ${path}`);
				}

				if (actions[path] !== undefined) {
					actions[path](params);
				}

			}, localServer.lifespan);

			/* #if debug */
			if (location.hash.indexOf('#/replay') === -1) {
				await loadStuff();
			}
			else {
				await eventDebugger.replayEventFromFile();
			}
			/* #end */
			/* #if prod */
			try {
				await HoodieApi.setup();

				await loadStuff();
			}
			catch (err) {
				console.log(err);
				const fontInstanceLoaded = new Event('fontInstance.loaded');

				window.dispatchEvent(fontInstanceLoaded);
			}
			/* #end */
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

		const canvasEl = window.canvasElement = document.createElement('canvas');

		canvasEl.className = 'prototypo-canvas-container-canvas';
		canvasEl.width = 0;
		canvasEl.height = 0;

		const content = document.getElementById('content');

		class App extends React.Component {
			render() {
				return this.props.children;
			}
		}

			/*HoodieApi.setup()
			.then(() => {
				if (location.hash.indexOf('signin') === -1 && location.hash.indexOf('account') === -1 && location.hash.indexOf('signup') === -1 &&  location.hash.indexOf('dashboard') === -1) {
					location.href = '#/start';
				}
			})
			.catch(() => {

				if (location.hash.indexOf('signin') === -1 && location.hash.indexOf('account') === -1 && location.hash.indexOf('signup') === -1 &&  location.hash.indexOf('dashboard') === -1) {
					location.href = '#/start';
				}
				const event = new CustomEvent('values.loaded');

				window.dispatchEvent(event);
			});*/
		ReactDOM.render((
			<Maintenance/>
		), content);

			/*window.addEventListener('values.loaded', () => {
			ReactDOM.render((
				<ApolloProvider client={apolloClient}>
					<Router history={hashHistory} onUpdate={trackUrl}>
						<Route component={App} name="app" path="/">
							<IndexRoute component={Maintenance}/>
						</Route>
						<Route component={App} name="app" path="/">
							<Route path="dashboard" component={Dashboard} onEnter={redirectToLogin}/>
							/* #if debug
							<Route path="replay" path="replay/:replayId" component={ReplayViewer}/>
							<Route path="debug" component={ReplayViewer}/>
							/* #endif
							<Route path="signin" component={AccountApp} onEnter={redirectToDashboard}>
								<Route path="reset" component={ResetPassword}/>
								<Route path="forgotten" component={ForgottenPassword}/>
								<IndexRoute component={Signin}/>
							</Route>
							<Route path="signup" component={AccountApp} onEnter={redirectToDashboard}>
								<IndexRoute component={Register}/>
							</Route>
							<Route component={AccountApp} path="account">
								<IndexRedirect to="home" />
								<Route path="billing" component={AccountDashboard} name="billing" onEnter={redirectToLogin}>
									<IndexRoute component={AccountInvoiceList}/>
								</Route>
								<Route component={AccountDashboard} path="home" name="home" onEnter={redirectToLogin}>
									<IndexRoute component={AccountHome}/>
								</Route>
								<Route component={AccountDashboard} path="success" name="success" onEnter={redirectToLogin}>
									<IndexRoute component={AccountSuccess}/>
								</Route>
								<Route path="profile" component={AccountDashboard} name="profile" onEnter={redirectToLogin}>
									<IndexRoute component={AccountProfile}/>
									<Route path="change-password" component={AccountChangePassword}/>
								</Route>
								<Route path="details" component={AccountDashboard} name="details" onEnter={redirectToLogin}>
									<IndexRoute component={AccountSubscription}/>
									<Route path="billing-address" component={AccountBillingAddress}/>
									<Route path="add-card" component={AccountAddCard}/>
									<Route path="change-plan" component={AccountChangePlan}/>
									<Route path="confirm-plan" component={AccountConfirmPlan}/>
								</Route>
								<Route path="organization" component={AccountDashboard} name="organization" onEnter={redirectToLogin}>
									<IndexRoute component={AccountOrganization} />
								</Route>
								<Route path="subscribe" component={Subscription} name="subscribe" onEnter={redirectToSignup}></Route>
							</Route>
						</Route>
						<Route path="start" component={StartApp} onEnter={redirectToLogin}/>
					</Router>
				</ApolloProvider>
			), content);

		});

		createStores();*/
	}
);
