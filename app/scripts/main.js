import pleaseWait from 'please-wait';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});

import React from 'react';
import Router from 'react-router';

import Dashboard from './components/dashboard.components.jsx';
import SitePortal from './components/site-portal.components.jsx';
import NotLoggedIn from './components/not-logged-in.components.jsx';
import Subscriptions from './components/subscriptions.components.jsx';
import Signin from './components/signin.components.jsx';
import ForgottenPassword from './components/forgotten-password.components.jsx';
import NotABrowser from './components/not-a-browser.components.jsx';
import IAmMobile from './components/i-am-mobile.components.jsx';

import HoodieApi from './services/hoodie.services.js';
import {FontValues, AppValues} from './services/values.services.js';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
import Stores from './stores/creation.stores.jsx';

import selectRenderOptions from './helpers/userAgent.helpers.js';
import {loadFontValues, saveAppValues} from './helpers/loadValues.helpers.js';
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

window.Stripe && window.Stripe.setPublishableKey('pk_test_bK4DfNp7MqGoNYB3MNfYqOAi');

debugger;
const stores = window.prototypoStores = Stores;

const debugStore =  Stores['/debugStore'];
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

const localServer = new LocalServer(stores).instance;

LocalClient.setup(localServer);
const fluxEvent = new Event('fluxServer.setup');

window.dispatchEvent(fluxEvent);

const localClient = LocalClient.instance();
const eventDebugger = new EventDebugger();

async function createStores() {
	try {
		const bearer = window.location.search.replace(/.*?bt=(.*?)(&|$)/, '$1');

		if (bearer) {
			window.location.search = '';
			localStorage.bearerToken = bearer;
		}

		await HoodieApi.setup();
	}
	catch (err) {
		console.error(err);
		location.href = '#/signin';
	}

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

	if (location.hash.indexOf('#/replay') === -1) {
		await loadStuff();
	}
	else {
		await eventDebugger.replayEventFromFile();
	}
}


selectRenderOptions(
	() => {
		const content = document.getElementById('content');

		React.render(<IAmMobile />, content);
	},
	() => {
		const content = document.getElementById('content');

		React.render(<NotABrowser />, content);
	},
	() => {
		const canvasEl = window.canvasElement = document.createElement('canvas');

		canvasEl.className = 'prototypo-canvas-container-canvas';
		canvasEl.width = 0;
		canvasEl.height = 0;

		createStores()
			.then(() => {
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

				const Routes = (
					<Route handler={App} name="app" path="/">
						<DefaultRoute handler={SitePortal}/>
						<Route name="dashboard" handler={Dashboard}/>
						<Route name="replay" path="replay/:replayId" handler={Dashboard}/>
						<Route name="signin" handler={NotLoggedIn}>
							<Route name="forgotten" handler={ForgottenPassword}/>
							<DefaultRoute handler={Signin}/>
						</Route>
						<Route name="subscription" handler={Subscriptions}/>
					</Route>
				);

				Router.run(Routes, function(Handler) {

					React.render(<Handler />, content);
				});
			});
		}
);
