import pleaseWait from 'please-wait';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});

import React from 'react';
import Router from 'react-router';
//import uuid from 'node-uuid';
import PrototypoCanvas from 'prototypo-canvas';

import Dashboard from './components/dashboard.components.jsx';
import SitePortal from './components/site-portal.components.jsx';
import NotLoggedIn from './components/not-logged-in.components.jsx';
import Subscriptions from './components/subscriptions.components.jsx';
import Signin from './components/signin.components.jsx';
import ForgottenPassword from './components/forgotten-password.components.jsx';
import NotABrowser from './components/not-a-browser.components.jsx';
import IAmMobile from './components/i-am-mobile.components.jsx';

import {Typefaces} from './services/typefaces.services.js';
import HoodieApi from './services/hoodie.services.js';
import {FontValues, AppValues} from './services/values.services.js';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
//import RemoteClient from './stores/remote-client.stores.jsx';
//import {BatchUpdate} from './helpers/undo-stack.helpers.js';

import * as Stores from './stores/creation.stores.jsx';
import {copyFontValues, loadFontValues, saveAppValues} from './helpers/loadValues.helpers.js';

window.Stripe && window.Stripe.setPublishableKey('pk_test_bK4DfNp7MqGoNYB3MNfYqOAi');

const stores = window.prototypoStores = Stores;

const {
	debugStore,
	fontControls,
	fontParameters,
	tagStore,
	glyphs,
	fontVariant,
	fontInfos,
	panel,
	individualizeStore,
	intercomStore,
	searchStore,
} = Stores;

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
const localClient = LocalClient.instance();

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

const debugServerUrl = 'http://debugloglist-p7rs57pe.cloudapp.net';

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
	let appValuesLoaded = false;

	window.addEventListener('unload', () => {
		saveAppValues(appValuesLoaded);
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
		{
			'/save-debug-log': () => {
				const debugLog = {
					events: debugStore.get('events'),
					message: `voluntarily submitted by ${HoodieApi.instance.email}`,
					stack: (new Error()).stack,
					date: new Date(),
					values: debugStore.get('values'),
				};

				const data = JSON.stringify(debugLog);

				fetch(`${debugServerUrl}/errors/`, {
					method: 'POST',
					body: data,
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
				});
			},
			'/store-in-debug-font': ({prefix, typeface, data}) => {
				const values = debugStore.get('values');

				if (!values[prefix]) {
					values[prefix] = {};
				}
				values[prefix][typeface] = data;
				debugStore.set('values', values).commit();
			},
			'/load-intercom-info': (data) => {
				const patch = intercomStore.set('tags', data.tags.tags).commit();

				localServer.dispatchUpdate('/intercomStore', patch);
			},
		},
	);

	localServer.on('action', ({path, params}) => {

		if (path.indexOf('debug') === -1
			&& location.hash.indexOf('#/replay') === -1) {
			const events = debugStore.get('events');

			events.push({path, params});
			debugStore.set('events', events).commit();
		}

		if (actions[path] !== undefined) {
			actions[path](params);
		}

	}, localServer.lifespan);

	if (location.hash.indexOf('#/replay') !== -1) {
		const hash = location.hash.split('/');
		const result = await fetch(`${debugServerUrl}/events-logs/${hash[hash.length - 1]}.json`);
		const data = await result.json();
		const eventsToPlay = data.events;
		const values = data.values;

		debugStore.set('values', values).commit();

		async function execEvent(events, i, to) {
			if (i < events.length) {
				if (i === 1) {
					const familySelected = fontVariant.get('family');
					const text = panel.get('text');
					const word = panel.get('word');
					const selected = glyphs.get('selected');

					await setupFontInstance({
						values: {
							familySelected,
							text,
							word,
							selected,
						},
					});
				}

				if (to && (i === to)) {
					console.log('WAITING FOR RENDER PLZ!!');
					pleaseWait.instance.finish();
					return;
				}

				console.log(`replaying event at path ${events[i].path}`);
				console.log(events[i].params);

				if (events[i].path !== '/login') {
					localClient.dispatchAction(events[i].path, events[i].params);
				}

				return await new Promise((resolve) => {
					setTimeout(() => {
						resolve(execEvent(events, i + 1, to));
					}, 100);
				});
			}
			else {
				return;
			}
		}

		await execEvent(eventsToPlay, 0, 6);
		setTimeout(() => {
			execEvent(eventsToPlay, 6);
		}, 1500);
	}
	else {
		await loadStuff();
	}
}

async function setupFontInstance(appValues) {
		const template = appValues.values.familySelected ? appValues.values.familySelected.template : undefined;
		const typedataJSON = await Typefaces.getFont(template || 'venus.ptf');
		const typedata = JSON.parse(typedataJSON);

		// const prototypoSource = await Typefaces.getPrototypo();
		const workerDeps = document.querySelector('script[src*=prototypo\\.]').src;
		let workerUrl;

		// The worker will be built from URL during development, and from
		// source in production.
		if (process.env.NODE_ENV !== 'production') {
			workerUrl = '/prototypo-canvas/src/worker.js';
		}

		const fontPromise = PrototypoCanvas.init({
			canvas: canvasEl,
			workerUrl,
			workerDeps,
		});

		const font = window.fontInstance = await fontPromise;
		const subset = appValues.values.text + appValues.values.word;

		await font.loadFont(typedata.fontinfo.familyName, typedataJSON);
		font.subset = typeof subset === 'string' ? subset : '';
		font.displayChar(appValues.values.selected);
		return {font, subset, typedata};
}

async function loadStuff() {
	//Login checking and app and font values loading
	try {
		const defaultValues = {
				values: {
					mode: ['glyph', 'word'],
					selected: 'A'.charCodeAt(0).toString(),
					onboard: false,
					onboardstep: 'welcome',
					word: 'Hello',
					text: 'World',
					pos: ['Point', 457, -364],
					familySelected: {
						template: 'venus.ptf',
					},
					variantSelected: {
						db: 'venus.ptf',
					},
					savedSearch: [],
				},
			};

		let appValues;

		try {
			appValues = await AppValues.get({typeface: 'default'});
			appValues.values = _.extend(defaultValues.values, appValues.values);
		}
		catch (err) {
			appValues = defaultValues;
			console.error(err);
		}

		localClient.dispatchAction('/load-app-values', appValues);

		const {typedata} = await setupFontInstance(appValues);

		localClient.dispatchAction('/create-font', fontInstance.font.ot.getEnglishName('fontFamily'));

		localClient.dispatchAction('/load-params', {controls: typedata.controls, presets: typedata.presets});
		localClient.dispatchAction('/load-glyphs', _.mapValues(
			fontInstance.font.altMap,
			(glyph) => {
				return _.map(
					glyph,
					(alt) => {
						return {
							src: {
								tags: alt.src && alt.src.tags || [],
								characterName: alt.src && alt.src.characterName || '',
								unicode: alt.src && alt.src.unicode	|| '',
								glyphName: alt.src && alt.src.glyphName || '',
							},
							name: alt.name,
							altImg: alt.altImg,
						};
					}
				);
			}
		));
		localClient.dispatchAction('/load-tags', typedata.fontinfo.tags);

		localClient.dispatchAction('/load-commits');
		fontInstance.displayChar(String.fromCharCode(glyphs.get('selected')));

		loadFontValues(typedata, appValues.values.variantSelected.db);
	}
	catch (err) {
		console.error(err);
		location.href = '#/signin';
	}
}

if (mobile) {
	const content = document.getElementById('content');

	React.render(<IAmMobile />, content);
}
else if (isSafari || isIE) {
	const content = document.getElementById('content');

	React.render(<NotABrowser />, content);

}
else {

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
