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
import '../styles/components/subscriptions.scss';
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
import Router from 'react-router';

import Dashboard from './components/dashboard.components.jsx';
import SitePortal from './components/site-portal.components.jsx';
import NotLoggedIn from './components/not-logged-in.components.jsx';
import Subscriptions from './components/subscriptions.components.jsx';
import Signin from './components/signin.components.jsx';
import Register from './components/register.components.jsx';
import ForgottenPassword from './components/forgotten-password.components.jsx';
import NotABrowser from './components/not-a-browser.components.jsx';
import IAmMobile from './components/i-am-mobile.components.jsx';

import AccountApp from './components/account/account-app.components.jsx';
import AccountDashboard from './components/account/account-dashboard.components.jsx';
import AccountProfile from './components/account/account-profile-panel.components.jsx';
import AccountChangePassword from './components/account/account-change-password.components.jsx';
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
import userAction from './actions/user.actions.jsx';

import EventDebugger, {debugActions} from './debug/eventLogging.debug.jsx';
/* #if debug */
import ReplayViewer from './debug/replay-viewer.components.jsx';
/* #end */

window.Stripe && window.Stripe.setPublishableKey('pk_test_bK4DfNp7MqGoNYB3MNfYqOAi');

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
		userAction,
		debugActions,
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
		const bearer = window.location.search.replace(/.*?bt=(.*?)(&|$)/, '$1');

		if (bearer) {
			window.location.search = '';
			localStorage.bearerToken = bearer;
		}

		await HoodieApi.setup();

		if (location.hash === '#/signin') {
			location.href = '#/dashboard';
		}

		await loadStuff();
	}
	catch (err) {
		console.error(err);
		location.href = '#/signin';
	}
	/* #end */
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

		const Route = Router.Route;
		const RouteHandler = Router.RouteHandler;
		const DefaultRoute = Router.DefaultRoute;

		const content = document.getElementById('content');

		class App extends React.Component {
			render() {
				return (
					<RouteHandler />
				);
			}
		}

		createStores()
			.then(() => {

				const Routes = (
					<Route handler={App} name="app" path="/">
						<DefaultRoute handler={SitePortal}/>
						<Route name="dashboard" handler={Dashboard}/>
						/* #if debug */
						<Route name="replay" path="replay/:replayId" handler={ReplayViewer}/>
						<Route name="debug" handler={ReplayViewer}/>
						/* #end */
						<Route name="signin" handler={NotLoggedIn}>
							<Route name="forgotten" handler={ForgottenPassword}/>
							<Route name="signup" handler={Register}/>
							<DefaultRoute handler={Signin}/>
						</Route>
						<Route name="subscription" handler={Subscriptions}/>
						<Route handler={AccountApp} name="account">
							<DefaultRoute handler={AccountDashboard}/>
							<Route name="profile" handler={AccountDashboard}>
								<DefaultRoute handler={AccountProfile}/>
								<Route name="change-password" handler={AccountChangePassword}/>
							</Route>
							<Route name="create" path="create" handler={Subscription}>
								<DefaultRoute name="signup" handler={SubscriptionAccountInfo}/>
								<Route name="choose-a-plan" handler={SubscriptionChoosePlan}/>
								<Route name="add-card" handler={SubscriptionAddCard}/>
								<Route name="billing-address" handler={SubscriptionBillingAddress}/>
								<Route name="Confirmation" handler={SubscriptionConfirmation}/>
							</Route>
						</Route>
					</Route>
				);

				Router.run(Routes, function(Handler) {
					ReactDOM.render(<Handler />, content);
				});
			}
		);
	}
);
