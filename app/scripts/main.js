import '../styles/main.scss';
import '../../node_modules/normalize.css/normalize.css';
import '../../node_modules/please-wait/build/please-wait.css';
import '../../node_modules/react-gemini-scrollbar/node_modules/gemini-scrollbar/gemini-scrollbar.css';
import '../styles/components/family.scss';
import '../styles/components/edit-param-group.scss';
import '../styles/components/input-group.scss';
import '../styles/components/fonts-collection.scss';
import '../styles/components/warning-message.scss';
import '../styles/components/undo-redo-menu.scss';
import '../styles/components/replay-playlist.scss';
import '../styles/components/create-param-group.scss';
import '../styles/components/nps-message.scss';
import '../styles/components/top-bar-menu.scss';
import '../styles/components/side-tabs.scss';
import '../styles/components/search-glyph-list.scss';
import '../styles/components/account.scss';
import '../styles/components/checkbox-with-img.scss';
import '../styles/components/forgotten-password.scss';
import '../styles/components/prototypo-canvas.scss';
import '../styles/components/glyph-list.scss';
import '../styles/components/modal.scss';
import '../styles/components/cards-widget.scss';
import '../styles/components/prototypo-text.scss';
import '../styles/components/sliders.scss';
import '../styles/components/variant.scss';
import '../styles/components/alternate-menu.scss';
import '../styles/components/hover-view-menu.scss';
import '../styles/components/help-panel.scss';
import '../styles/components/not-a-browser.scss';
import '../styles/components/onboarding.scss';
import '../styles/components/action-bar.scss';
import '../styles/components/glyph-btn.scss';
import '../styles/components/delete-param-group.scss';
import '../styles/components/prototypo-word.scss';
import '../styles/components/individualize-button.scss';
import '../styles/components/canvas-glyph-input.scss';
import '../styles/components/news-feed.scss';
import '../styles/components/close-button.scss';
import '../styles/components/progress-bar.scss';
import '../styles/components/contextual-menu.scss';
import '../styles/components/wait-for-load.scss';
import '../styles/components/zoom-buttons.scss';
import '../styles/components/controls-tabs.scss';
import '../styles/components/tutorials.scss';
import '../styles/components/account/account-app.scss';
import '../styles/components/account/account-profile.scss';
import '../styles/components/account/account-change-password.scss';
import '../styles/components/account/account-billing-address.scss';
import '../styles/components/account/account-add-card.scss';
import '../styles/components/account/account-subscription.scss';
import '../styles/components/account/account-change-plan.scss';
import '../styles/components/subscription/subscription.scss';
import '../styles/components/subscription/subscription-sidebar.scss';
import '../styles/components/subscription/subscription-choose-plan.scss';
import '../styles/components/shared/input-with-label.scss';
import '../styles/components/shared/display-with-label.scss';
import '../styles/components/shared/columns.scss';
import '../styles/components/shared/billing-address.scss';
import '../styles/components/shared/account-validation-button.scss';
import '../styles/components/shared/form-error.scss';
import '../styles/lib/spinners/3-wave.scss';
import '../styles/lib/spinkit.scss';
import '../styles/lib/_variables.scss';
import '../styles/layout.scss';
import '../styles/userAdmin.scss';
import '../styles/tracking.scss';
import '../styles/layout/topbar.scss';
import '../styles/layout/dashboard.scss';
import '../styles/layout/signin.scss';
import '../styles/layout/glyph-panel.scss';
import '../styles/layout/replay.scss';
import '../styles/layout/prototypopanel.scss';
import '../styles/layout/workboard.scss';
import '../styles/layout/sidebar.scss';
import '../styles/main.scss';
import '../styles/_variables.scss';

import pleaseWait from 'please-wait';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, hashHistory} from 'react-router';

import Dashboard from './components/dashboard.components.jsx';
import SitePortal from './components/site-portal.components.jsx';
import Subscriptions from './components/subscriptions.components.jsx';
import Signin from './components/signin.components.jsx';
import ForgottenPassword from './components/forgotten-password.components.jsx';
import NotABrowser from './components/not-a-browser.components.jsx';
import IAmMobile from './components/i-am-mobile.components.jsx';
import Register from './components/register.components.jsx';

import AccountApp from './components/account/account-app.components.jsx';
import AccountDashboard from './components/account/account-dashboard.components.jsx';
import AccountHome from './components/account/account-home.components.jsx';
import AccountProfile from './components/account/account-profile-panel.components.jsx';
import AccountChangePassword from './components/account/account-change-password.components.jsx';
import AccountDetails from './components/account/account-details.components.jsx';
import AccountBillingAddress from './components/account/account-billing-address.components.jsx';
import AccountAddCard from './components/account/account-add-card.components.jsx';
import AccountChangePlan from './components/account/account-change-plan.components.jsx';
import AccountSubscription from './components/account/account-subscription.components.jsx';
import Subscription from './components/account/subscription.components.jsx';
import SubscriptionChoosePlan from './components/account/subscription-choose-plan.components.jsx';
import SubscriptionAccountInfo from './components/account/subscription-account-info.components.jsx';
import SubscriptionAddCard from './components/account/subscription-add-card.components.jsx';
import SubscriptionBillingAddress from './components/account/subscription-billing-address.components.jsx';
import SubscriptionConfirmation from './components/account/subscription-confirmation.components.jsx';

import HoodieApi from './services/hoodie.services.js';
import {FontValues} from './services/values.services.js';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
import Stores from './stores/creation.stores.jsx';

import selectRenderOptions from './helpers/userAgent.helpers.js';
import {saveAppValues} from './helpers/loadValues.helpers.js';
import {loadStuff} from './helpers/appSetup.helpers.js';

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

window.Stripe && window.Stripe.setPublishableKey('pk_test_PkwKlOWOqSoimNJo2vsT21sE');

const stores = window.prototypoStores = Stores;

const debugStore = Stores['/debugStore'];
const fontControls = Stores['/fontControls'];
const intercomStore = Stores['/intercomStore'];

function saveErrorLog(error) {
	const debugLog = {
		events: debugStore.events,
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
}

/* #if debug */
const localServer = new LocalServer(stores, {
	debugPath: [
		'/debugStore',
		'/save-debug-log',
		'/store-in-debug-font',
		'/show-details',
	],
	logStore: stores.logStore,
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

	//I know this is ugly but for now it's like this.
	//We need some transient state to know when we loaded appValues
	window.addEventListener('unload', () => {
		saveAppValues();
		FontValues.save({typeface: 'default', values: fontControls.head.toJS()});
	});

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
				const patch = intercomStore.set('tags', data.tags.tags).commit();

				localServer.dispatchUpdate('/intercomStore', patch);
			},
		}
	);

	localServer.on('action', ({path, params}) => {
		eventDebugger.storeEvent(path, params);

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
	}
	/* #end */
}

function redirectToLogin(nextState, replace) {
	if (!HoodieApi.isLoggedIn()) {
		replace({
			pathname: '/signin',
			state: {nextPathname: nextState.location.pathname},
		});
	}
}

function redirectToDashboard(nextState, replace) {
	if (HoodieApi.isLoggedIn()) {
		replace({
			pathname: '/dashboard',
			state: {nextPathname: nextState.location.pathname},
		});
	}
}

function chooseGoodAccountStep(nextState, replace) {

	const infos = Stores['/userStore'].get('infos');

	if (infos.accountValues.username && /\/account\/create\/?$/.test(nextState.location.pathname)) {
		replace({
			pathname: '/account/create/choose-a-plan',
			state: {nextPathname: nextState.location.pathname},
		});
	}
}

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

		createStores()
			.then(() => {

				ReactDOM.render((
					<Router history={hashHistory}>
						<Route component={App} name="app" path="/">
							<IndexRoute component={SitePortal}/>
							<Route path="dashboard" component={Dashboard} onEnter={redirectToLogin}/>
							/* #if debug */
							<Route path="replay" path="replay/:replayId" component={ReplayViewer}/>
							<Route path="debug" component={ReplayViewer}/>
							/* #end */
							<Route path="signin" component={AccountApp} onEnter={redirectToDashboard}>
								<Route path="forgotten" component={ForgottenPassword}/>
								<IndexRoute component={Signin}/>
							</Route>
							<Route path="signup" component={AccountApp} onEnter={redirectToDashboard}>
								<IndexRoute component={Register}/>
							</Route>
							<Route path="subscription" component={Subscriptions}/>
							<Route component={AccountApp} path="account">
								<Route component={AccountDashboard} name="home">
									<IndexRoute component={AccountHome}/>
								</Route>
								<Route path="profile" component={AccountDashboard} name="profile">
									<IndexRoute component={AccountProfile}/>
									<Route path="change-password" component={AccountChangePassword}/>
								</Route>
								<Route path="details" component={AccountDashboard} name="details">
									<IndexRoute component={AccountSubscription}/>
									<Route path="billing-address" component={AccountBillingAddress}/>
									<Route path="add-card" component={AccountAddCard}/>
									<Route path="change-plan" component={AccountChangePlan}/>
								</Route>
								<Route path="create" component={Subscription} name="create">
									<IndexRoute component={SubscriptionAccountInfo} onEnter={chooseGoodAccountStep}/>
									<Route path="choose-a-plan" component={SubscriptionChoosePlan}/>
									<Route path="add-card" component={SubscriptionAddCard}/>
									<Route path="billing-address" component={SubscriptionBillingAddress}/>
									<Route path="Confirmation" component={SubscriptionConfirmation}/>
								</Route>
							</Route>
						</Route>
					</Router>
				), content);
			}
		);
	}
);
