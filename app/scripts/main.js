import 'babel-polyfill';
import pleaseWait from 'please-wait';

import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';

import './styles';

import NotABrowser from './components/not-a-browser.components';
import IAmMobile from './components/i-am-mobile.components';
import App from './app';

import HoodieApi from './services/hoodie.services';
import LocalClient from './stores/local-client.stores';
import LocalServer from './stores/local-server.stores';
import Stores from './stores/creation.stores';

import selectRenderOptions from './helpers/userAgent.helpers';
import {loadStuff} from './helpers/appSetup.helpers';
import isProduction from './helpers/is-production.helpers';

import appValuesAction from './actions/appValues.actions';
import exportAction from './actions/export.actions';
import fontAction from './actions/font.actions';
import fontControlsAction from './actions/fontControls.actions';
import fontInfosAction from './actions/fontInfos.actions';
import fontParametersAction from './actions/fontParameters.actions';
import glyphsAction from './actions/glyphs.actions';
import indivAction from './actions/indiv.actions';
import panelAction from './actions/panel.actions';
import searchAction from './actions/search.actions';
import tagStoreAction from './actions/tagStore.actions';
import undoStackAction from './actions/undoStack.actions';
import userLifecycleAction from './actions/user-lifecycle.actions';

import EventDebugger, {debugActions} from './debug/eventLogging.debug';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});

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

		const stores = (window.prototypoStores = Stores);

		const prototypoStore = Stores['/prototypoStore'];

		/* #if debug */
		const localServer = new LocalServer(stores, {
			debugPath: ['/debugStore', '/save-debug-log', '/store-in-debug-font', '/show-details'],
			logStore: stores['/prototypoStore'],
		}).instance;
		/* #end */
		/* #if prod,dev */
		const localServer = new LocalServer(stores).instance;
		/* #end */

		LocalClient.setup(localServer);
		const fluxEvent = new Event('fluxServer.setup');

		window.dispatchEvent(fluxEvent);

		const eventDebugger = new EventDebugger();

		async function createStores() {
			const actions = Object.assign(
				{},
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
				},
			);

			localServer.on(
				'action',
				({path, params}) => {
					// eventDebugger.storeEvent(path, params);
					if (process.env.__SHOW_ACTION__) { // eslint-disable-line
						console.log(`[ACTION] ${path}`);
					}

					if (actions[path] !== undefined) {
						actions[path](params);
					}
				},
				localServer.lifespan,
			);

			/* #if debug */
			if (location.hash.indexOf('#/replay') === -1) {
				await loadStuff();
			}
			else {
				await eventDebugger.replayEventFromFile();
			}
			/* #end */
			/* #if prod,dev */
			try {
				await HoodieApi.setup();

				await loadStuff();
			}
			catch (err) {
				if (err.message.includes('Not authenticated')) {
					localServer.dispatchAction('/clean-data');
				}

				console.log(err);
				const fontInstanceLoaded = new Event('fontInstance.loaded');

				window.dispatchEvent(fontInstanceLoaded);
			}
			/* #end */
		}

		const canvasEl = (window.canvasElement = document.createElement('canvas'));

		canvasEl.className = 'prototypo-canvas-container-canvas';
		canvasEl.width = 0;
		canvasEl.height = 0;

		const content = document.getElementById('content');

		HoodieApi.setup()
			.then(() => {
				if (
					location.hash.indexOf('signin') === -1
					&& location.hash.indexOf('account') === -1
					&& location.hash.indexOf('signup') === -1
				) {
					location.href = '#/start';
				}
			})
			.catch(() => {
				if (
					location.hash.indexOf('signin') === -1
					&& location.hash.indexOf('account') === -1
					&& location.hash.indexOf('signup') === -1
				) {
					location.href = '#/start';
				}
				const event = new CustomEvent('values.loaded');

				window.dispatchEvent(event);
			});

		window.addEventListener('values.loaded', () => {
			const render = (Component) => {
				ReactDOM.render(
					<AppContainer>
						<Component />
					</AppContainer>,
					content,
				);
			};

			render(App);

			// If the dev server is available
			// we can hot reload changes into the browser
			if (module.hot) {
				module.hot.accept('./app', () => {
					const NextApp = require('./app').default; // eslint-disable-line

					render(NextApp);
				});
			}
		});

		createStores();
	},
);
