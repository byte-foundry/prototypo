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

function mobileAndTabletCheck() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}

var mobile = mobileAndTabletCheck();

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

import Remutable from 'remutable';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
import RemoteClient from './stores/remote-client.stores.jsx';
const { Patch } = Remutable;

import {Typefaces} from './services/typefaces.services.js';
import PrototypoCanvas from '../../node_modules/prototypo-canvas/dist/prototypo-canvas.js';
import HoodieApi from './services/hoodie.services.js';
import uuid from 'node-uuid';
import {FontValues, AppValues} from './services/values.services.js';
import {Commits} from './services/commits.services.js';
import XXHash from 'xxhashjs';

const hasher = XXHash(0xDEADBEEF);
if (mobile) {
	const Route = Router.Route,
		RouteHandler = Router.RouteHandler,
		DefaultRoute = Router.DefaultRoute;

	const content = document.getElementById('content');

	React.render(<IAmMobile />, content);
}
else if ( isSafari || isIE ) {
	const Route = Router.Route,
		RouteHandler = Router.RouteHandler,
		DefaultRoute = Router.DefaultRoute;

	const content = document.getElementById('content');

	React.render(<NotABrowser />, content);

} else {
	window.Stripe && window.Stripe.setPublishableKey('pk_test_bK4DfNp7MqGoNYB3MNfYqOAi');

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

	const templateList = stores['/templateList'] = new Remutable({
		list: [
			{
				sample:'john-fell-preview.svg',
				name:'Prototypo Fell',
				familyName:'Prototypo Fell',
				templateName:'john-fell.ptf',
			},
			{
				sample:'venus-preview.svg',
				name:'Prototypo Grotesk',
				familyName:'Prototypo Grotesk',
				templateName:'venus.ptf',
			}
		],
	});

	const fontLibrary = stores['/fontLibrary'] = new Remutable({
		fonts: [],
	});

	const fontVariant = stores['/fontVariant'] = new Remutable({
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
	//

	async function loadFontValues(typedata, typeface) {

		const initValues = {};
		_.each(typedata.controls ,(group) => {
			return _.each(group.parameters, (param) => {
				initValues[param.name] = param.init;
			});
		});

		try {
			const fontValues = await FontValues.get({typeface});
			localClient.dispatchAction('/load-values', _.extend(initValues,fontValues.values));
		}
		catch (err) {
			const values =  _.extend(fontControls.get('values'),initValues);
			localClient.dispatchAction('/load-values',values);
			FontValues.save({
				typeface: typeface,
				values,
			});
		}
	}

	async function createStores() {
		try {
			const bearer = window.location.search.replace(/.*?bt=(.*?)(&|$)/,'$1');

			if (bearer) {
				window.location.search = '';
				localStorage.bearerToken = bearer;
			}

			await HoodieApi.setup();
		}
		catch(err) {
			location.href = '#/signin';
		}

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
			appValues.latestCommit = commits.get('latest');
			appValues.library = fontLibrary.get('fonts');
			appValues.variantSelected = fontVariant.get('variant');
			appValues.familySelected = fontVariant.get('family');
			appValues.tagSelected = tagStore.get('selected');

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
				saveAppValues();
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

				const patchTag = tagStore
					.set('pinned', values.pinned || [])
					.set('selected', values.tagSelected || 'all')
					.commit();
				localServer.dispatchUpdate('/tagStore',patchTag);

				const patchCommit = commits.set('latest', values.latestCommit).commit();
				localServer.dispatchUpdate('/commits',patchCommit);

				const patchFonts = fontLibrary.set('fonts', values.library || []).commit();
				localServer.dispatchUpdate('/fontLibrary',patchCommit);

				const patchVariant = fontVariant
					.set('variant', values.variantSelected)
					.set('family', values.familySelected).commit();
				localServer.dispatchUpdate('/fontVariant',patchVariant);

				values.mode = values.mode || ['glyph'];

				_.forEach(values, (value, name) => {
					panel.set(name,value);
				})

				const patchPanel = panel.commit();

				localServer.dispatchUpdate('/panel', patchPanel);

				appValuesLoaded = true;
			},
			'/change-tab-font':({name}) => {

				const patch = fontTab.set('tab',name).commit();
				localServer.dispatchUpdate('/fontTab', patch);
				saveAppValues();

			},
			'/change-font': async ({template, db}) => {
				const typedataJSON = await Typefaces.getFont(template);
				const typedata = JSON.parse(typedataJSON);

				await fontInstance.loadFont( typedata.fontinfo.familyName, typedataJSON );

				localClient.dispatchAction('/create-font', fontInstance);

				localClient.dispatchAction('/load-params', typedata);
				localClient.dispatchAction('/load-glyphs', fontInstance.font.altMap);
				localClient.dispatchAction('/load-tags', typedata.fontinfo.tags);

				loadFontValues(typedata, db);
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
			},
			'/create-family': ({name, template}) => {

				if (template === undefined) {
					const patch = fontLibrary.set('errorAddFamily', 'You must choose a base template').commit();
					localServer.dispatchUpdate('/fontLibrary', patch);
					return;
				}

				if (name === undefined || name === '') {
					const patch = fontLibrary.set('errorAddFamily', 'You must choose a name for your family').commit();
					localServer.dispatchUpdate('/fontLibrary', patch);
					return;
				}

				const fonts = Array.from(fontLibrary.get('fonts'));
				const newFont = {
					name,
					template,
					variants: [
						{
							id: hasher.update(`REGULAR${(new Date()).getTime()}`).digest().toString(16),
							name: 'REGULAR',
							db: `${name}_regular`,
						}
					],
				};

				const already = _.find(fonts, (font) => {
					return font.name === name;
				});

				if (already) {
					const patch = fontLibrary.set('errorAddFamily', 'A Family with this name already exists').commit();
					localServer.dispatchUpdate('/fontLibrary', patch);
					return;
				}

				fonts.push(newFont);

				const patch = fontLibrary
					.set('errorAddFamily', undefined)
					.commit();
				localServer.dispatchUpdate('/fontLibrary', patch);

				setTimeout(() => {
					const patch = fontLibrary
						.set('fonts', fonts)
						.commit();
					localServer.dispatchUpdate('/fontLibrary', patch);
				}, 200);

				localClient.dispatchAction('/change-font', {
					template,
					db:newFont.variants[0].db,
				});

				const patchVariant = fontVariant
					.set('variant', newFont.variants[0])
					.set('family', {name: newFont.name, template: newFont.template}).commit();
				localServer.dispatchUpdate('/fontVariant', patchVariant);

				saveAppValues();
			},
			'/select-variant': ({variant, family}) => {
				const patchVariant = fontVariant
					.set('variant', variant)
					.set('family', {name: family.name, template: family.template}).commit();
				localServer.dispatchUpdate('/fontVariant', patchVariant);

				localClient.dispatchAction('/change-font', {
					template: family.template,
					db: variant.db,
				});
				saveAppValues();
			},
			'/create-variant': async ({name, familyName}) => {
				const family = _.find(Array.from(fontLibrary.get('fonts') || []), (font) => {
					return font.name === familyName;
				});

				const already = _.find(family.variants, (item) => {
					return item.name === name;
				});

				if (already) {
					const patch = fontLibrary.set('errorAddVariant', 'Variant with this name already exists').commit();
					localServer.dispatchUpdate('/fontLibrary', patch);
					return;
				}

				const variant = {
					id: hasher.update(`${name}${(new Date()).getTime()}`).digest().toString(16),
					name,
					db: `${familyName}_${name}`,
				};
				const thicknessTransform = [
					{ string: 'THIN', thickness: 20},
					{ string: 'LIGHT', thickness: 50},
					{ string: 'BOOK', thickness: 70},
					{ string: 'BOLD', thickness: 115},
					{ string: 'SEMI-BOLD', thickness: 100},
					{ string: 'EXTRA-BOLD', thickness: 135},
					{ string: 'BLACK', thickness: 150},
				]

				family.variants.push(variant);

				const patch = fontLibrary
					.set('fonts',fontLibrary.get('fonts'))
					.set('errorAddVariant', undefined).commit();
				localServer.dispatchUpdate('/fontLibrary',patch);

				const ref = await FontValues.get({typeface:family.variants[0].db});

				_.each(thicknessTransform, (item) => {
					if (name.indexOf(item.string) !== -1) {
						ref.values.thickness = item.thickness;
					}
				});

				if (name.indexOf('ITALIC') !== -1) {
					ref.values.slant = 10;
				}

				setTimeout(async () => {
					await FontValues.save({typeface: variant.db,values:ref.values});
					localClient.dispatchAction('/select-variant', {variant, family});
				}, 200);
			},
			'/edit-variant': ({variant, family, newName}) => {
				const found = _.find(Array.from(fontLibrary.get('fonts') || []), (item) => {
					return item.name = family.name;
				});

				const newVariant = _.find(found.variants || [], (item) => {
					return variant.id === item.id;
				});

				newVariant.name = newName;

				const patch = fontLibrary.set('fonts',fontLibrary.get('fonts')).commit();
				localServer.dispatchUpdate('/fontLibrary',patch);
				saveAppValues();
			},
			'/delete-variant': ({variant, familyName}) => {
				const family = _.find(Array.from(fontLibrary.get('fonts') || []), (item) => {
					return item.name = familyName;
				});

				_.pull(family.variants,variant);

				const patch = fontLibrary.set('fonts',fontLibrary.get('fonts')).commit();
				localServer.dispatchUpdate('/fontLibrary',patch);
				saveAppValues();

			},
			'/delete-family': ({family}) => {
				const families = Array.from(fontLibrary.get('fonts'));
				_.pull(families, family);
				const patch = fontLibrary.set('fonts', families).commit();
				localServer.dispatchUpdate('/fontLibrary',patch);
				saveAppValues();
			},
			'/clear-error-family': () => {
				const patch = fontLibrary.set('errorAddFamily',undefined).commit();
				localServer.dispatchUpdate('/fontLibrary', patch);
			},
			'/clear-error-variant': () => {
				const patch = fontLibrary.set('errorAddVariant',undefined).commit();
				localServer.dispatchUpdate('/fontLibrary', patch);
			},
			'/export-otf': ({merged}) => {
				localClient.dispatchAction('/store-panel-param',{export: true});

				const name = {
					family: `Prototypo-${panel.get('familySelected').name}`,
					style: `${panel.get('variantSelected').name.toLowerCase()}`,
				};

				fontInstance.download(() => {
					localClient.dispatchAction('/store-panel-param',{export: false, onboardstep: 'end'});
				}, name, merged);
			},
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
			const defaultValues = {
					values: {
						mode: ['glyph', 'word'],
						selected: 'A'.charCodeAt(0).toString(),
						word: 'Hello',
						text: 'World',
						pos: ['Point', 457, -364],
						familySelected: {
							template:'venus.ptf',
						},
						variantSelected: {
							db:'venus.ptf'
						}
					}
				};
			let appValues;
			try {
				appValues = await AppValues.get({typeface: 'default'});
				appValues = _.extend(defaultValues, appValues);
			}
			catch(err) {
				appValues = defaultValues;
				console.error(err);
			}

			localClient.dispatchAction('/load-app-values', appValues);

			const template = appValues.values.familySelected ? appValues.values.familySelected.template : undefined;
			const typedataJSON = await Typefaces.getFont( template || 'venus.ptf');
			const typedata = JSON.parse(typedataJSON);

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

			loadFontValues(typedata, appValues.values.variantSelected.db);
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
