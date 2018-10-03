import 'babel-polyfill';
import pleaseWait from 'please-wait';

import React from 'react';
import {ApolloProvider} from 'react-apollo';
import ReactDOM from 'react-dom';
import {Router, Route} from 'react-router-dom';
import {StripeProvider} from 'react-stripe-elements';

import _forOwn from 'lodash/forOwn';

import './styles';

import NotABrowser from './components/not-a-browser.components';
import IAmMobile from './components/i-am-mobile.components';
import App from './app';

import apolloClient from './services/graphcool.services';
import HoodieApi from './services/hoodie.services';
import LocalClient from './stores/local-client.stores';
import LocalServer from './stores/local-server.stores';
import Stores from './stores/creation.stores';
import history from './services/history.services';

import selectRenderOptions from './helpers/userAgent.helpers';
import {loadStuff} from './helpers/appSetup.helpers';
import isProduction from './helpers/is-production.helpers';

import FontMediator from './prototypo.js/mediator/FontMediator';

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

const loader = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});

const STRIPE_PUBLISHABLE_KEY = isProduction()
	? 'pk_live_CVrzdDZTEowrAZaRizc4G14c'
	: 'pk_test_PkwKlOWOqSoimNJo2vsT21sE';

selectRenderOptions(
	() => {
		ReactDOM.render(<IAmMobile />, document.getElementById('content'), () => {
			loader.finish();
		});
	},
	() => {
		ReactDOM.render(<NotABrowser />, document.getElementById('content'), () => {
			loader.finish();
		});
	},
	async () => {
		const stores = Stores;

		window.prototypoStores = Stores;

		const prototypoStore = Stores['/prototypoStore'];

		/* eslint-disable no-redeclare */
		/* #if debug */
		// const localServer = new LocalServer(stores, {
		//	debugPath: ['/debugStore', '/save-debug-log', '/store-in-debug-font', '/show-details'],
		//	logStore: stores['/prototypoStore'],
		// }).instance;
		/* #end */
		/* #if prod,dev */
		const localServer = new LocalServer(stores).instance;
		/* #end */
		/* eslint-enable no-redeclare */

		LocalClient.setup(localServer);

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
			userLifecycleAction,
			{
				'/load-intercom-info': (data) => {
					const patch = prototypoStore
						.set('intercomTags', data.tags.tags)
						.commit();

					localServer.dispatchUpdate('/prototypoStore', patch);
				},
			},
		);

		localServer.on(
			'action',
			({path, params}) => {
				if (process.env.__SHOW_ACTION__) {
					// eslint-disable-line
					console.log(`[ACTION] ${path}`);
				}

				if (actions[path] !== undefined) {
					actions[path](params);
				}
			},
			localServer.lifespan,
		);

		const fluxEvent = new Event('fluxServer.setup');

		window.dispatchEvent(fluxEvent);

		const templates = await Promise.all(
			prototypoStore.get('templateList').map(async ({templateName}) => {
				const typedataJSON = await import(/* webpackChunkName: "ptfs" */ `../../dist/templates/${templateName}/font.json`);
				const glyphs = [];

				_forOwn(typedataJSON.glyphs, (glyph) => {
					if (!glyphs[glyph.unicode]) {
						glyphs[glyph.unicode] = [];
					}
					glyphs[glyph.unicode].push(glyph);
				});
				const initValues = {};

				typedataJSON.controls.forEach(group =>
					group.parameters.forEach((param) => {
						initValues[param.name] = param.init;
					}),
				);
				return {
					name: templateName,
					json: typedataJSON,
					initValues,
					glyphs,
				};
			}),
		);

		await FontMediator.init(templates);

		const patch = prototypoStore.set('templatesData', templates).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		try {
			await HoodieApi.setup();

			await loadStuff();
		}
		catch (err) {
			if (!err.message.includes('Not authenticated yet')) {
				console.error(err);
			}
		}

		ReactDOM.render(
			<ApolloProvider client={apolloClient}>
				<StripeProvider apiKey={STRIPE_PUBLISHABLE_KEY}>
					<Router history={history}>
						<Route component={App} />
					</Router>
				</StripeProvider>
			</ApolloProvider>,
			document.getElementById('content'),
			() => {
				loader.finish();
			},
		);
	},
);
