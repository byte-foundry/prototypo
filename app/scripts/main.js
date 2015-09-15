import pleaseWait from 'please-wait';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});

// Naughty naughty browser sniffing.
// TODO: replace UA sniffing by feature detection. Here's what we need:
// - document.fonts
// - what else?
var ua = navigator.userAgent;
var isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1;
var isIE = ua.indexOf('Trident') !== -1;

import React from 'react';
import Router from 'react-router';

import Dashboard from './components/dashboard.components.jsx';
import SitePortal from './components/site-portal.components.jsx';
import NotLoggedIn from './components/not-logged-in.components.jsx';
import Subscriptions from './components/subscriptions.components.jsx';
import Signin from './components/signin.components.jsx';
import ForgottenPassword from './components/forgotten-password.components.jsx';
import NotABrowser from './components/not-a-browser.components.jsx';

import Remutable from 'remutable';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
import RemoteClient from './stores/remote-client.stores.jsx';
const { Patch } = Remutable;

import {Typefaces} from './services/typefaces.services.js';
// import Prototypo from '../../node_modules/prototypo.js/dist/prototypo.js';
import PrototypoCanvas from '../../node_modules/prototypo-canvas/dist/prototypo-canvas.js';
import HoodieApi from './services/hoodie.services.js';
import uuid from 'node-uuid';
import {FontValues, AppValues} from './services/values.services.js';
import {Commits} from './services/commits.services.js';

if ( isSafari || isIE ) {
	const Route = Router.Route,
		RouteHandler = Router.RouteHandler,
		DefaultRoute = Router.DefaultRoute;

	const content = document.getElementById('content');

	React.render(<NotABrowser />, content);

} else {

	Stripe.setPublishableKey('pk_test_bK4DfNp7MqGoNYB3MNfYqOAi');

	const stores = {};
	const localServer = new LocalServer(stores).instance;
	LocalClient.setup(localServer);
	const localClient = LocalClient.instance();
	const eventBackLog = stores['/eventBackLog'] = new Remutable({
		from: 0,
		to: undefined,
		eventList: [
			undefined
		]
	});

	const fontTab = stores['/fontTab'] = new Remutable({});

	const fontControls = stores['/fontControls'] = new Remutable({
		values: {},
	});

	const fontParameters = stores['/fontParameters'] = new Remutable({});

	const sideBarTab = stores['/sideBarTab'] = new Remutable({});

	const fontStore = stores['/fontStore'] = new Remutable({});

	const tagStore = stores['/tagStore'] = new Remutable({
		selected: 'all',
		pinned: [],
	});

	const glyphs = stores['/glyphs'] = new Remutable({
		selected: 'A',
	});

	const fontTemplate = stores['/fontTemplate'] = new Remutable({
	});

	const panel = stores['/panel'] = new Remutable({
		mode: [],
		textFontSize: 6,
		wordFontSize: 4.5,
	});

	const commits = stores['/commits'] = new Remutable({
	});

	const canvasEl = window.canvasElement = document.createElement('canvas');
	canvasEl.className = "prototypo-canvas-container-canvas";
	canvasEl.width = 0;
	canvasEl.height = 0;
	//RemoteClient.createClient('sub80scription','http://localhost:43430');

	//HoodieApi.on('connected',() => {
	//	RemoteClient.initRemoteStore('stripe', `/stripe${uuid.v4()}$$${HoodieApi.instance.hoodieId}`,'subscription');
	//});

	async function createStores() {

		//I know this is ugly but for now it's like this.
		//We need some transient state to know when we loaded appValues
		let appValuesLoaded = false;

		const saveAppValues = _.debounce(() => {
			if (!appValuesLoaded) {
				return;
			}

			const appValues = panel.head.toJS();
			appValues.selected = glyphs.get('selected');
			appValues.tab = fontTab.get('tab');
			appValues.pinned = tagStore.get('pinned');
			appValues.template = fontTemplate.get('selected');
			appValues.latestCommit = commits.get('latest');

			AppValues.save({typeface:'default', values:appValues});
		}, 300);

		window.addEventListener('unload', () => {
			saveAppValues();
			FontValues.save({typeface: 'default', values: fontControls.head.toJS()});
		})

		const actions = {
			'/load-params': ({controls, presets}) => {
				const patch = fontParameters
					.set('parameters',controls)
					.set('presets', presets)
					.commit();
				localServer.dispatchUpdate('/fontParameters',patch);
			},
			'/load-values': (params) => {
				const patch = fontControls
					.set('values',params)
					.commit();
				localServer.dispatchUpdate('/fontControls',patch);
				localClient.dispatchAction('/store-action',{store:'/fontControls',patch});
				localClient.dispatchAction('/update-font', params);
			},
			'/load-glyphs': (params) => {
				const patch = glyphs
					.set('glyphs',params)
					.commit()
				localServer.dispatchUpdate('/glyphs',patch);
			},
			'/load-tags': (params) => {
				const patch = tagStore
					.set('tags',params)
					.commit()
				localServer.dispatchUpdate('/tagStore',patch);
			},
			'/select-tag': (params) => {
				const patch = tagStore
					.set('selected',params)
					.commit();

				localServer.dispatchUpdate('/tagStore',patch);
			},
			'/toggle-pinned': (params) => {
				const pinned = _.xor(tagStore.get('pinned'),[params]);
				const patch = tagStore
					.set('pinned',pinned)
					.commit();

				localServer.dispatchUpdate('/tagStore',patch);
				saveAppValues();
			},
			'/create-font': (params) => {
				const patch = fontStore
					.set('fontName', params.font.ot.familyName)
					.commit();
				localServer.dispatchUpdate('/fontStore',patch);
			},
			'/update-font': (params) => {
				// we need a non-empty params object
				if ( !params || !Object.keys( params ).length ) {
					return;
				}

				fontInstance.update(params);
			},
			'/go-back': () => {

				const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');
				const event = eventBackLog.get('eventList')[eventIndex];
				const eventList = eventBackLog.get('eventList');

				if (eventIndex > 1) {

					const revert = Patch.revert(Patch.fromJSON(event.patch));
					localServer.dispatchUpdate('/eventBackLog',
						eventBackLog.set('from',eventIndex)
							.set('to',eventIndex - 1).commit());
					localServer.dispatchUpdate(event.store,revert);

				}
			},
			'/go-forward':() => {

				const eventIndex = eventBackLog.get('to');

				if (eventIndex) {

					const event = eventBackLog.get('eventList')[eventIndex+1];
					const eventList = eventBackLog.get('eventList');

					if (event) {

						localServer.dispatchUpdate('/eventBackLog',
							eventBackLog.set('from',eventIndex)
								.set('to',eventIndex + 1).commit());
						localServer.dispatchUpdate(event.store,Patch.fromJSON(event.patch));

					}

				}

			},
			'/store-action':({store,patch,label}) => {

				const newEventList = Array.from(eventBackLog.get('eventList'));
				const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');

				if (newEventList.length - 1 > eventIndex) {

					newEventList.splice(eventIndex + 1, newEventList.length);

				}

				newEventList.push(
					{
						patch:patch.toJSON(),
						store:store,
						label:label,
					});
				const eventPatch = eventBackLog.set('eventList',newEventList)
					.set('to',undefined)
					.set('from',newEventList.length - 1).commit();
				localServer.dispatchUpdate('/eventBackLog',eventPatch);
			},
			'/select-glyph':({unicode}) => {
					const patch = glyphs.set('selected',unicode).commit();
					localServer.dispatchUpdate('/glyphs', patch);

					fontInstance.displayChar(String.fromCharCode(unicode));

					const newViewMode = _.union(panel.get('mode'),['glyph']);
					if (newViewMode.length > 0) {
						const patch = panel.set('mode',newViewMode).commit();
						localServer.dispatchUpdate('/panel', patch);
					}

					saveAppValues();
			},
			'/toggle-lock-list': ({}) => {
				const lockState = glyphs.get('locked');
				const patch = glyphs.set('locked', !lockState).commit();
				localServer.dispatchUpdate('/glyphs', patch);
			},
			'/store-panel-param': (params) => {
				_.forEach(params, (value, name) => {
					panel.set(name,value);
				});
				const patch = panel.commit();
				localServer.dispatchUpdate('/panel',patch);
				saveAppValues();
			},
			'/store-text': ({value, propName}) => {
				const patch = panel.set(propName,value).commit();
				const subset = panel.head.toJS().text + panel.head.toJS().word;
				localServer.dispatchUpdate('/panel',patch);

				fontInstance.subset = typeof subset === 'string' ? subset : '';
				saveAppValues();
			},
			'/load-app-values': ({values}) => {
				values.selected = values.selected || 'A'.charCodeAt(0);
				const patchGlyph = glyphs.set('selected', values.selected).commit();
				localServer.dispatchUpdate('/glyphs', patchGlyph);

				const patchTab = fontTab.set('tab', values.tab || 'Func').commit();
				localServer.dispatchUpdate('/fontTab',patchTab);

				const patchTag = tagStore.set('pinned', values.pinned || []).commit();
				localServer.dispatchUpdate('/tagStore',patchTag);

				const patchCommit = commits.set('latest', values.latestCommit).commit();
				localServer.dispatchUpdate('/commits',patchCommit);

				values.mode = values.mode || ['glyph'];

				_.forEach(values, (value, name) => {
					panel.set(name,value);
				})

				const patchPanel = panel.commit();

				localServer.dispatchUpdate('/panel', patchPanel);
				const patchTemplate = fontTemplate.set('selected',values.template).commit();
				localServer.dispatchUpdate('/fontTemplate', patchTemplate);

				appValuesLoaded = true;
			},
			'/change-tab-font':({name}) => {

				const patch = fontTab.set('tab',name).commit();
				localServer.dispatchUpdate('/fontTab', patch);
				saveAppValues();

			},
			'/change-font': async (repo) => {
				const patch = fontTemplate.set('selected',repo)
					.set('loadingFont',true).commit();
				localServer.dispatchUpdate('/fontTemplate', patch);

				const typedataJSON = await Typefaces.getFont(repo);
				const typedata = JSON.parse(typedataJSON);

				const initValues = {};
				_.each(typedata.controls ,(group) => {
					return _.each(group.parameters, (param) => {
						initValues[param.name] = param.init;
					});
				});

				await fontInstance.loadFont( typedata.fontinfo.familyName, typedataJSON );

				localClient.dispatchAction('/create-font', fontInstance);

				localClient.dispatchAction('/load-params', typedata);
				localClient.dispatchAction('/load-glyphs', fontInstance.font.altMap);
				localClient.dispatchAction('/load-tags', typedata.fontinfo.tags);
				const patchEndLoading = fontTemplate.set('loadingFont',false).commit();
				localServer.dispatchUpdate('/fontTemplate',patch);
				
				try {
					const fontValues = await FontValues.get({typeface: repo});
					localClient.dispatchAction('/load-values', _.extend(initValues,fontValues.values));
				}
				catch (err) {
					const values =  _.extend(fontControls.get('values'),initValues)
					localClient.dispatchAction('/load-values',values);
					FontValues.save({
						typeface: repo,
						values,
					});
					console.error(err);
				}
			},
			'/login': async () => {
				await loadStuff();
				location.href = '#/dashboard';
			},
			'/logout': async () => {
				try {
					await HoodieApi.logout();
					location.href = '#/signin';
				}
				catch (error) {
					console.log(`you probably don't have internet`);
					location.href = '#/signin';
				}
			},
			'/load-commits': async (repo) => {

				const repos = ['prototypo', 'john-fell.ptf', 'venus.ptf'];
				try {
					const lastcommitsJSON = await Promise.all(repos.map((repo) => {
						return Commits.getCommits(repo);
					}));
					const lastCommits = lastcommitsJSON
						.reduce((a, b) => {
							return a.concat(JSON.parse(b));
						}, [])
						.filter((commit) => {
							return commit.commit.message.indexOf('Changelog') !== -1;
						})
						.sort((a, b) => {
							if (a.commit.author.date < b.commit.author.date) {
								return -1;
							}
							if (a.commit.author.date > b.commit.author.date) {
								return 1;
							}
							return 0;
						})
						.reverse();

					// console.log(lastcommits);
					const patch = commits.set('list',lastCommits).commit();

					localServer.dispatchUpdate('/commits', patch);
				}
				catch (err) {
					const patch = commits.set('error', 'Cannot get commit').commit();

					localServer.dispatchUpdate('/commits', patch);
				}
			},
			'/view-commit': ({latest}) => {
				const patch = commits.set('latest',latest).commit();

				localServer.dispatchUpdate('/commits', patch);
				saveAppValues();
			}
		}

		localServer.on('action',({path, params}) => {

			if ( actions[path] !== void 0 ) {
				actions[path](params);
			}

		}, localServer.lifespan);


		await loadStuff();
	}

	async function loadStuff() {
		//Login checking and app and font values loading
		try {
			await HoodieApi.setup();

			let appValues;
			try {
				appValues = await AppValues.get({typeface: 'default'});
			}
			catch(err) {
				appValues = {
					values: {
						mode: ['glyph', 'word'],
						selected: 'A'.charCodeAt(0).toString(),
						word: 'Hello',
						text: 'World',
						template: 'venus.ptf',
						pos: ['Point', 457, -364],
					}
				};

				console.error(err);
			}

			localClient.dispatchAction('/load-app-values', appValues);

			const typedataJSON = await Typefaces.getFont(appValues.values.template || 'venus.ptf');
			const typedata = JSON.parse(typedataJSON);

			const initValues = {};
			_.each(typedata.controls ,(group) => {
				return _.each(group.parameters, (param) => {
					initValues[param.name] = param.init;
				});
			});

			// const prototypoSource = await Typefaces.getPrototypo();
			let workerDeps = document.querySelector('script[src*=prototypo\\.]').src;
			let workerUrl;

			// The worker will be built from URL during development, and from
			// source in production.
			if ( process.env.NODE_ENV !== 'production' ) {
				workerUrl = '/prototypo-canvas/src/worker.js';
			}

			const fontPromise = PrototypoCanvas.init({
				canvas: canvasEl,
				workerUrl,
				workerDeps,
			});

			const font = window.fontInstance = await fontPromise;
			const subset = appValues.values.text + appValues.values.word;
			await font.loadFont( typedata.fontinfo.familyName, typedataJSON );
			font.subset = typeof subset === 'string' ? subset : '';
			font.displayChar( appValues.values.selected );
			localClient.dispatchAction('/create-font', font);

			localClient.dispatchAction('/load-params', typedata);
			localClient.dispatchAction('/load-glyphs', font.font.altMap);
			localClient.dispatchAction('/load-tags', typedata.fontinfo.tags);

			localClient.dispatchAction('/load-commits');
			fontInstance.displayChar(String.fromCharCode(glyphs.get('selected')));

			try {
				const fontValues = await FontValues.get({typeface: appValues.values.template});
				localClient.dispatchAction('/load-values', _.extend(initValues,fontValues.values));
			}
			catch (err) {
				const values =  _.extend(fontControls.get('values'),initValues)
				localClient.dispatchAction('/load-values',values);
				FontValues.save({
					typeface: appValues.values.template,
					values,
				});
				console.error(err);
			}
		}
		catch (err) {
			location.href = '#/signin';
		}
	}

	createStores()
		.then(() => {
			const Route = Router.Route,
				RouteHandler = Router.RouteHandler,
				DefaultRoute = Router.DefaultRoute;

			const content = document.getElementById('content');

			class App extends React.Component {
				render() {
					return (
						<RouteHandler />
					);
				}
			}

			let Routes = (
				<Route handler={App} name="app" path="/">
					<DefaultRoute handler={SitePortal}/>
					<Route name="dashboard" handler={Dashboard}/>
					<Route name="signin" handler={NotLoggedIn}>
						<Route name="forgotten" handler={ForgottenPassword}/>
						<DefaultRoute handler={Signin}/>
					</Route>
					<Route name="subscription" handler={Subscriptions}/>
				</Route>
			);

			Router.run(Routes, function (Handler) {
				React.render(<Handler />, content);
			});
		});
}
