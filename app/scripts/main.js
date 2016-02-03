import pleaseWait from 'please-wait';

pleaseWait.instance = pleaseWait.pleaseWait({
	logo: '/assets/images/prototypo-loading.svg',
	// backgroundColor: '#49e4a9',
	loadingHtml: 'Hello Prototypo',
});


import React from 'react';
import Router from 'react-router';
//import uuid from 'node-uuid';
import XXHash from 'xxhashjs';
import JSZip from 'jszip';
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
import {Commits} from './services/commits.services.js';
import Log from './services/log.services.js';
import {FontValues, AppValues, FontInfoValues} from './services/values.services.js';
import LocalClient from './stores/local-client.stores.jsx';
import LocalServer from './stores/local-server.stores.jsx';
//import RemoteClient from './stores/remote-client.stores.jsx';
//import {BatchUpdate} from './helpers/undo-stack.helpers.js';

import * as Stores from './stores/creation.stores.jsx';
import {copyFontValues, loadFontValues, saveAppValues} from './helpers/loadValues.helpers.js';

const hasher = XXHash(0xDEADBEEF);
const debugServerUrl = 'http://debugloglist-p7rs57pe.cloudapp.net';

if (mobile) {
	const content = document.getElementById('content');

	React.render(<IAmMobile />, content);
}
else if (isSafari || isIE) {
	const content = document.getElementById('content');

	React.render(<NotABrowser />, content);

}
else {
	window.Stripe && window.Stripe.setPublishableKey('pk_test_bK4DfNp7MqGoNYB3MNfYqOAi');

	const stores = window.prototypoStores = Stores;

	const {
		debugStore,
		eventBackLog,
		fontTab,
		fontControls,
		fontParameters,
		sideBarTab,
		fontStore,
		tagStore,
		glyphs,
		fontLibrary,
		fontVariant,
		fontInfos,
		panel,
		commits,
		exportStore,
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

	const canvasEl = window.canvasElement = document.createElement('canvas');

	canvasEl.className = 'prototypo-canvas-container-canvas';
	canvasEl.width = 0;
	canvasEl.height = 0;


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
		_.assign(actions, {
			fontParameters,
			fontInfos,
		});

		const actions = {
			'/load-glyphs': (params) => {
				const patch = glyphs
					.set('glyphs', params)
					.commit();

				localServer.dispatchUpdate('/glyphs', patch);
			},
			'/load-tags': (params) => {
				const patch = tagStore
					.set('tags', params)
					.commit();

				localServer.dispatchUpdate('/tagStore', patch);
			},
			'/select-tag': (params) => {
				const patch = tagStore
					.set('selected', params)
					.commit();
				const patchSearch = searchStore.set('glyphSearch', undefined).commit();

				localServer.dispatchUpdate('/tagStore', patch);
				localServer.dispatchUpdate('/searchStore', patchSearch);
				saveAppValues(appValuesLoaded);
			},
			'/toggle-pinned': (params) => {
				const pinned = _.xor(tagStore.get('pinned'), [params]);
				const patch = tagStore
					.set('pinned', pinned)
					.commit();

				localServer.dispatchUpdate('/tagStore', patch);
				saveAppValues(appValuesLoaded);
			},
			'/create-font': (familyName) => {
				const patch = fontStore
					.set('fontName', familyName)
					.commit();

				localServer.dispatchUpdate('/fontStore', patch);
			},
			'/update-font': (params) => {
				// we need a non-empty params object
				if (!params || !Object.keys(params).length) {
					return;
				}

				fontInstance.update(params);
			},
			'/go-back': () => {
				const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');
				const event = eventBackLog.get('eventList')[eventIndex];

				if (eventIndex > 1) {

					const revert = Patch.revert(Patch.fromJSON(event.patch));

					localServer.dispatchUpdate('/eventBackLog',
						eventBackLog.set('from', eventIndex)
							.set('to', eventIndex - 1).commit());
					localServer.dispatchUpdate(event.store, revert);

				}
			},
			'/go-forward': () => {

				const eventIndex = eventBackLog.get('to');

				if (eventIndex) {
					const event = eventBackLog.get('eventList')[eventIndex + 1];

					if (event) {

						localServer.dispatchUpdate('/eventBackLog',
							eventBackLog.set('from', eventIndex)
								.set('to', eventIndex + 1).commit());
						localServer.dispatchUpdate(event.store, Patch.fromJSON(event.patch));

					}
				}

			},
			'/store-action': ({store, patch, label}) => {

				const newEventList = Array.from(eventBackLog.get('eventList'));
				const eventIndex = eventBackLog.get('to') || eventBackLog.get('from');

				if (newEventList.length - 1 > eventIndex) {

					newEventList.splice(eventIndex + 1, newEventList.length);

				}

				newEventList.push(
					{
						patch: patch.toJSON && patch.toJSON() || patch,
						store,
						label,
					});
				const eventPatch = eventBackLog.set('eventList', newEventList)
					.set('to', undefined)
					.set('from', newEventList.length - 1).commit();

				localServer.dispatchUpdate('/eventBackLog', eventPatch);
			},
			'/select-glyph': ({unicode}) => {
					const patch = glyphs.set('selected', unicode).commit();
					const newViewMode = _.union(panel.get('mode'), ['glyph']);

					localServer.dispatchUpdate('/glyphs', patch);

					fontInstance.displayChar(String.fromCharCode(unicode));

					if (newViewMode.length > 0) {
						const patchPanel = panel.set('mode', newViewMode).commit();

						localServer.dispatchUpdate('/panel', patchPanel);
					}

					saveAppValues(appValuesLoaded);
			},
			'/toggle-lock-list': () => {
				const lockState = glyphs.get('locked');
				const patch = glyphs.set('locked', !lockState).commit();

				localServer.dispatchUpdate('/glyphs', patch);
			},
			'/store-panel-param': (params) => {
				_.forEach(params, (value, name) => {
					panel.set(name, value);
				});
				const patch = panel.commit();

				localServer.dispatchUpdate('/panel', patch);
				saveAppValues(appValuesLoaded);
			},
			'/exporting': ({exporting, errorExport}) => {
				const patch = exportStore.set('export', exporting).set('errorExport', errorExport).commit();

				localServer.dispatchUpdate('/exportStore', patch);
			},
			'/store-text': ({value, propName}) => {
				const patch = panel.set(propName, value).commit();
				const subset = panel.head.toJS().text + panel.head.toJS().word;

				localServer.dispatchUpdate('/panel', patch);

				fontInstance.subset = typeof subset === 'string' ? subset : '';
				saveAppValues(appValuesLoaded);
			},
			'/change-tab-sidebar': (params) => {

				if (sideBarTab.get('tab') === 'fonts-collection'
					&& params.name !== 'font-collection'
					&& !panel.get('onboard')
					&& panel.get('onboardstep').indexOf('creatingFamily') !== -1) {

					localClient.dispatchAction('/store-panel-param', {onboardstep: 'createFamily'});

				}

				if (panel.get('onboardstep') && panel.get('onboardstep') === params.from) {
					localClient.dispatchAction('/store-panel-param', {onboardstep: params.to});
				}

				const name = params.name;
				const patch = sideBarTab.set('tab', name).commit();

				localServer.dispatchUpdate('/sideBarTab', patch);

				Log.ui('Sidebar/change-tab-sidebar', name);
			},
			'/load-app-values': ({values}) => {
				values.selected = values.selected || 'A'.charCodeAt(0);
				const patchGlyph = glyphs.set('selected', values.selected).commit();

				localServer.dispatchUpdate('/glyphs', patchGlyph);

				const patchTab = fontTab.set('tab', values.tab || 'Func').commit();

				localServer.dispatchUpdate('/fontTab', patchTab);

				const patchTag = tagStore
					.set('pinned', values.pinned || [])
					.set('selected', values.tagSelected || 'all')
					.commit();

				localServer.dispatchUpdate('/tagStore', patchTag);

				const patchCommit = commits.set('latest', values.latestCommit).commit();

				localServer.dispatchUpdate('/commits', patchCommit);

				const patchFonts = fontLibrary.set('fonts', values.library || []).commit();

				localServer.dispatchUpdate('/fontLibrary', patchFonts);

				const patchVariant = fontVariant
					.set('variant', values.variantSelected)
					.set('family', values.familySelected).commit();

				localServer.dispatchUpdate('/fontVariant', patchVariant);

				const patchSearch = searchStore
					.set('savedSearch', values.savedSearch)
					.set('pinned', values.pinnedSearch)
					.commit();

				localServer.dispatchUpdate('/searchStore', patchSearch);

				values.mode = values.mode || ['glyph'];

				_.forEach(values, (value, name) => {
					panel.set(name, value);
				});

				const patchPanel = panel.commit();

				localServer.dispatchUpdate('/panel', patchPanel);

				appValuesLoaded = true;
			},
			'/change-tab-font': ({name}) => {
				const patch = fontTab.set('tab', name).commit();

				localServer.dispatchUpdate('/fontTab', patch);
				saveAppValues(appValuesLoaded);

			},
			'/change-font': async ({template, db}) => {
				const typedataJSON = await Typefaces.getFont(template);
				const typedata = JSON.parse(typedataJSON);

				try {
					await fontInstance.loadFont(typedata.fontinfo.familyName, typedataJSON);
				}
				catch (err) {
					saveErrorLog(err);
				}

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
					console.warn(`You probably don't have internet`);
					console.log(error);
					location.href = '#/signin';
				}
			},
			'/load-commits': async () => {

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
					const patch = commits.set('list', lastCommits).commit();

					localServer.dispatchUpdate('/commits', patch);
				}
				catch (err) {
					const patch = commits.set('error', 'Cannot get commit').commit();

					localServer.dispatchUpdate('/commits', patch);
				}
			},
			'/view-commit': ({latest}) => {
				const patch = commits.set('latest', latest).commit();

				localServer.dispatchUpdate('/commits', patch);
				saveAppValues(appValuesLoaded);
			},
			'/create-family': async ({name, template, loadCurrent}) => {
				let templateToLoad = template;

				localClient.dispatchAction('/cancel-indiv-mode');
				if (loadCurrent) {
					templateToLoad = fontVariant.get('family').template;
				}

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
					templateToLoad,
					variants: [
						{
							id: hasher.update(`REGULAR${(new Date()).getTime()}`).digest().toString(16),
							name: 'REGULAR',
							db: `${name}_regular`,
						},
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
					const patchLib = fontLibrary
						.set('fonts', fonts)
						.commit();

					localServer.dispatchUpdate('/fontLibrary', patchLib);
				}, 200);

				if (loadCurrent) {
					await copyFontValues(newFont.variants[0].db);
				}

				localClient.dispatchAction('/change-font', {
					templateToLoad,
					db: newFont.variants[0].db,
				});

				const patchVariant = fontVariant
					.set('variant', newFont.variants[0])
					.set('family', {name: newFont.name, template: newFont.template}).commit();

				localServer.dispatchUpdate('/fontVariant', patchVariant);

				saveAppValues(appValuesLoaded);
			},
			'/select-variant': ({variant, family}) => {
				localClient.dispatchAction('/cancel-indiv-mode');
				const patchVariant = fontVariant
					.set('variant', variant)
					.set('family', {name: family.name, template: family.template}).commit();

				localServer.dispatchUpdate('/fontVariant', patchVariant);

				localClient.dispatchAction('/change-font', {
					template: family.template,
					db: variant.db,
				});
				saveAppValues(appValuesLoaded);
			},
			'/create-variant': async ({name, familyName}) => {
				localClient.dispatchAction('/cancel-indiv-mode');
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
					{string: 'THIN', thickness: 20},
					{string: 'LIGHT', thickness: 50},
					{string: 'BOOK', thickness: 70},
					{string: 'BOLD', thickness: 115},
					{string: 'SEMI-BOLD', thickness: 100},
					{string: 'EXTRA-BOLD', thickness: 135},
					{string: 'BLACK', thickness: 150},
				];

				family.variants.push(variant);

				const patch = fontLibrary
					.set('fonts', fontLibrary.get('fonts'))
					.set('errorAddVariant', undefined).commit();

				localServer.dispatchUpdate('/fontLibrary', patch);

				const ref = await FontValues.get({typeface: family.variants[0].db});

				_.each(thicknessTransform, (item) => {
					if (name.indexOf(item.string) !== -1) {
						ref.values.thickness = item.thickness;
					}
				});

				if (name.indexOf('ITALIC') !== -1) {
					ref.values.slant = 10;
				}

				setTimeout(async () => {
					await FontValues.save({typeface: variant.db, values: ref.values});
					localClient.dispatchAction('/select-variant', {variant, family});
				}, 200);

			},
			'/edit-variant': ({variant, family, newName}) => {
				const found = _.find(Array.from(fontLibrary.get('fonts') || []), (item) => {
					return item.name === family.name;
				});

				const newVariant = _.find(found.variants || [], (item) => {
					return variant.id === item.id;
				});

				newVariant.name = newName;

				const patch = fontLibrary.set('fonts', fontLibrary.get('fonts')).commit();

				localServer.dispatchUpdate('/fontLibrary', patch);
				saveAppValues(appValuesLoaded);
			},
			'/delete-variant': ({variant, familyName}) => {
				const family = _.find(Array.from(fontLibrary.get('fonts') || []), (item) => {
					return item.name === familyName;
				});

				_.pull(family.variants, variant);

				const patch = fontLibrary.set('fonts', fontLibrary.get('fonts')).commit();

				localServer.dispatchUpdate('/fontLibrary', patch);
				saveAppValues(appValuesLoaded);

			},
			'/delete-family': ({family}) => {
				const families = Array.from(fontLibrary.get('fonts'));

				_.remove(families, (checkee) => {
					return checkee.name === family.name && checkee.template === family.template;
				});
				const patch = fontLibrary.set('fonts', families).commit();

				localServer.dispatchUpdate('/fontLibrary', patch);

				family.variants.forEach((variant) => {
					FontValues.deleteDb({typeface: variant.db});
				});

				saveAppValues(appValuesLoaded);
			},
			'/clear-error-family': () => {
				const patch = fontLibrary.set('errorAddFamily', undefined).commit();

				localServer.dispatchUpdate('/fontLibrary', patch);
			},
			'/clear-error-variant': () => {
				const patch = fontLibrary.set('errorAddVariant', undefined).commit();

				localServer.dispatchUpdate('/fontLibrary', patch);
			},
			'/set-alternate': ({unicode, glyphName}) => {
				fontInstance.setAlternateFor(unicode, glyphName);
				const altList = fontInfos.get('altList');

				altList[unicode] = glyphName;

				const patch = fontInfos.set('altList', altList).commit();

				localServer.dispatchUpdate('/fontInfos', patch);

				FontInfoValues.save({
					typeface: fontVariant.get('variant').db || 'default',
					values: {
						altList,
					},
				});
			},
			'/export-otf': ({merged}) => {
				localClient.dispatchAction('/exporting', {exporting: true});

				const family = fontVariant.get('family').name ? fontVariant.get('family').name.replace(/\s/g, '-') : 'font';
				const style = fontVariant.get('variant').name ? fontVariant.get('variant').name.replace(/\s/g, '-') : 'regular';

				const name = {
					family: `Prototypo-${family}`,
					style: `${style.toLowerCase()}`,
				};

				const exportingError = setTimeout(() => {
					localClient.dispatchAction('/exporting', {exporting: false, errorExport: true});
				}, 10000);

				fontInstance.download(() => {
					localClient.dispatchAction('/store-panel-param', {onboardstep: 'end'});
					localClient.dispatchAction('/exporting', {exporting: false});
					window.Intercom('trackEvent', 'export-otf');
					clearTimeout(exportingError);
				}, name, merged);
			},
			'/export-family': async ({familyToExport, variants}) => {
				const variant = fontVariant.get('variant');
				const family = fontVariant.get('family');
				const zip = new JSZip();
				const a = document.createElement('a');

				const setupPatch = exportStore
					.set('familyExported', familyToExport.name)
					.set('variantToExport', variants.length)
					.commit();

				localServer.dispatchUpdate('/exportStore', setupPatch);

				fontInstance.exportingZip = true;
				fontInstance._queue = [];

				localClient.dispatchAction('/change-font', {
					template: familyToExport.template,
					db: 'default',
				});

				const values = [];

				for (let i = 0; i < variants.length; i++) {
					const currVariant = variants[i];

					values.push(FontValues.get({typeface: currVariant.db}));
				}

				const blobs = [];

				Promise.all(values).then((valueArray) => {
					_.each(valueArray, (value) => {
						const blob = fontInstance.getBlob(
							null, {
								family: familyToExport.name,
								style: currVariant.name,
							},
							false,
							value.values
						);

						blobs.push(blob);
					});
				});

				Promise.all(blobs).then((blobBuffers) => {
					_.each(blobBuffers, ({buffer, variantName}) => {
						const variantPatch = exportStore.set('exportedVariant',
							exportStore.get('exportedVariant') + 1).commit();

						localServer.dispatchUpdate('/exportStore', variantPatch);
						zip.file(`${variantName}.otf`, buffer, {binary: true});

						const reader = new FileReader();
						const _URL = window.URL || window.webkitURL;

						reader.onloadend = () => {
							a.download = `${familyToExport.name}.zip`;
							a.href = reader.result;
							a.dispatchEvent(new MouseEvent('click'));

							setTimeout(() => {
								a.href = '#';
								_URL.revokeObjectURL(reader.result);
							}, 100);

							fontInstance.exportingZip = false;

							localClient.dispatchAction('/change-font', {
								template: family.template,
								db: variant.db,
							});

							const cleanupPatch = exportStore
								.set('variantToExport', undefined)
								.set('exportedVariant', 0)
								.commit();

							localServer.dispatchUpdate('/exportStore', cleanupPatch);

							const deleteNamePatch = exportStore
								.set('familyExported', undefined)
								.commit();

							localServer.dispatchUpdate('/exportStore', deleteNamePatch);
						};

						reader.readAsDataURL(zip.generate({type: "blob"}));
					});
				});

			},
			'/toggle-individualize': () => {
				const oldValue = individualizeStore.get('indivMode');
				const currentGroup = (fontControls.get('values').indiv_glyphs || {})[glyphs.get('selected')];

				if (currentGroup && !oldValue) {
					const patchEdit = individualizeStore
						.set('indivMode', !oldValue)
						.set('indivCreate', false)
						.set('indivEdit', true)
						.set('glyphs', _.keys(fontControls.get('values').indiv_glyphs).filter((key) => {
							return fontControls.get('values').indiv_glyphs[key] === currentGroup;
						}))
						.set('currentGroup', currentGroup)
						.set('groups', Object.keys(fontControls.get('values').indiv_group_param))
						.commit();

					return localServer.dispatchUpdate('/individualizeStore', patchEdit);
				}

				individualizeStore
					.set('indivMode', !oldValue)
					.set('indivCreate', !oldValue)
					.set('preDelete', false)
					.set('indivEdit', false)
					.set('errorMessage', undefined)
					.set('errorGlyphs', [])
					.set('groups', Object.keys(fontControls.get('values').indiv_group_param || {}));

				if (!oldValue) {
					const selected = [glyphs.get('selected')];

					individualizeStore.set('selected', selected);
				}
				const patch = individualizeStore.commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.showIndivMode');
			},
			'/toggle-glyph-param-grid': () => {
				const oldValue = individualizeStore.get('glyphGrid');
				const patch = individualizeStore
					.set('glyphGrid', !oldValue)
					.commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.showGlyphGrid');
			},
			'/add-glyph-to-indiv': ({unicode, isSelected}) => {
				const selected = individualizeStore.get('selected');

				if (isSelected) {
					selected.splice(selected.indexOf(unicode), 1);
				}
				else {
					selected.push(unicode);
				}

				const patch = individualizeStore.set('selected', selected).commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.addGlyphToIndiv');
			},
			'/select-indiv-tag': (tag) => {
				const patch = individualizeStore.set('tagSelected', tag).commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.selectIndivTag');
			},
			'/create-param-group': ({name, selected}) => {
				const oldValues = fontControls.get('values');
				const alreadyInGroup = [];

				if (!name) {
					const patchError = individualizeStore
						.set('errorMessage', 'You must provide a group name')
						.commit();

					return localServer.dispatchUpdate('/individualizeStore', patchError);
				}

				if (selected.length === 0) {
					const patchError = individualizeStore
						.set('errorMessage', 'You must select at least one glyph')
						.commit();

					return localServer.dispatchUpdate('/individualizeStore', patchError);
				}

				if (!oldValues.indiv_glyphs) {
					oldValues.indiv_glyphs = {};
				}

				if (!oldValues.indiv_group_param) {
					oldValues.indiv_group_param = {};
				}

				_.each(selected, (unicode) => {
					if (oldValues.indiv_glyphs[unicode] !== undefined
						&& oldValues.indiv_glyphs[unicode] !== name) {
						alreadyInGroup.push(unicode);
					}
					oldValues.indiv_glyphs[unicode] = name;
				});

				if (alreadyInGroup.length > 0) {
					const patchError = individualizeStore
						.set('errorMessage', 'Some glyphs are already in a group')
						.set('errorGlyphs', alreadyInGroup)
						.commit();

					return localServer.dispatchUpdate('/individualizeStore', patchError);
				}

				if (!oldValues.indiv_group_param[name]) {
					oldValues.indiv_group_param[name] = {};
				}

				const patch = fontControls.set('values', oldValues).commit();

				localServer.dispatchUpdate('/fontControls', patch);

				const endCreatePatch = individualizeStore
					.set('indivCreate', false)
					.set('indivEdit', true)
					.set('currentGroup', name)
					.set('errorMessage', undefined)
					.set('glyphGrid', false)
					.set('glyphs', _.keys(fontControls.get('values').indiv_glyphs).filter((key) => {
						return fontControls.get('values').indiv_glyphs[key] === name;
					}))
					.set('editGroup', false)
					.set('errorGlyphs', [])
					.set('groups', Object.keys(oldValues.indiv_group_param))
					.commit();

				localServer.dispatchUpdate('/individualizeStore', endCreatePatch);

				const variant = fontVariant.get('variant');

				FontValues.save({typeface: variant.db, values: oldValues});
				Log.ui('GroupParam.create');
			},
			'/cancel-indiv-mode': () => {
				const endCreatePatch = individualizeStore
					.set('indivCreate', false)
					.set('indivEdit', false)
					.set('indivMode', false)
					.set('preDelete', false)
					.set('glyphGrid', false)
					.set('currentGroup', undefined)
					.set('errorMessage', undefined)
					.set('errorEdit', undefined)
					.set('errorGlyphs', [])
					.set('groups', [])
					.commit();

				localServer.dispatchUpdate('/individualizeStore', endCreatePatch);

			},
			'/select-indiv-group': (name) => {
				const patch = individualizeStore
					.set('currentGroup', name)
					.set('glyphs', _.keys(fontControls.get('values').indiv_glyphs).filter((key) => {
						return fontControls.get('values').indiv_glyphs[key] === name;
					}))
					.set('glyphGrid', false)
					.set('editGroup', false)
					.set('preDelete', false)
					.set('errorEdit', undefined)
					.commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.selectGroupParam');
			},
			'/edit-param-group': (state) => {
				const otherGroups = _.keys(fontControls.get('values').indiv_glyphs).filter((key) => {
						return !!fontControls.get('values').indiv_glyphs[key] && fontControls.get('values').indiv_glyphs[key] !== individualizeStore.get('currentGroup');
					});
				const patch = individualizeStore
					.set('editGroup', state)
					.set('preDelete', false)
					.set('glyphGrid', false)
					.set('selected', state ? individualizeStore.get('glyphs') : [])
					.set('otherGroups', otherGroups)
					.commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.startEdit');
			},
			'/pre-delete': (state) => {
				const patch = individualizeStore
					.set('preDelete', state)
					.set('editGroup', false)
					.set('glyphGrid', false)
					.set('selected', _.keys(fontControls.get('values').indiv_glyphs).filter((key) => {
						return fontControls.get('values').indiv_glyphs[key] === individualizeStore.get('currentGroup');
					}))
					.commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.startDelete');
			},
			'/delete-param-group': ({name}) => {
				const oldValues = _.cloneDeep(fontControls.get('values'));

				delete oldValues.indiv_group_param[name];

				Object.keys(oldValues.indiv_glyphs).forEach((key) => {
					if (oldValues.indiv_glyphs[key] === name) {
						delete oldValues.indiv_glyphs[key];
					}
				});

				const newCurrentGroup = Object.keys(oldValues.indiv_group_param).length > 0
					? Object.keys(oldValues.indiv_group_param)[0]
					: undefined;
				const endDeletePatch = individualizeStore
					.set('indivCreate', !newCurrentGroup)
					.set('indivEdit', !!newCurrentGroup)
					.set('preDelete', false)
					.set('currentGroup', newCurrentGroup)
					.set('errorMessage', undefined)
					.set('errorEdit', undefined)
					.set('errorGlyphs', [])
					.set('groups', Object.keys(oldValues.indiv_group_param || {}))
					.commit();

				localServer.dispatchUpdate('/individualizeStore', endDeletePatch);

				const patch = fontControls.set('values', oldValues).commit();

				localServer.dispatchUpdate('/fontControls', patch);

				const variant = fontVariant.get('variant');

				FontValues.save({typeface: variant.db, values: oldValues});
				localClient.dispatchAction('/update-font', oldValues);
				Log.ui('GroupParam.deleteGroup');
			},
			'/remove-glyph': ({glyph}) => {
				const glyphSelected = _.cloneDeep(individualizeStore.get('selected'));

				glyphSelected.splice(glyphSelected.indexOf(glyph), 1);

				const patch = individualizeStore
					.set('selected', glyphSelected)
					.commit();

				localServer.dispatchUpdate('/individualizeStore', patch);
				Log.ui('GroupParam.removeGlyph');
			},
			'/save-param-group': ({name}) => {
				const oldValues = _.cloneDeep(fontControls.get('values'));
				const glyphSelected = _.cloneDeep(individualizeStore.get('selected'));
				const currentGroup = individualizeStore.get('currentGroup');

				if (!name) {
					const patchError = individualizeStore
						.set('errorEdit', 'You must provide a group name')
						.commit();

					return localServer.dispatchUpdate('/individualizeStore', patchError);
				}

				if (name !== currentGroup && Object.keys(oldValues.indiv_group_param).indexOf(name) !== -1) {
					const patchError = individualizeStore
						.set('errorEdit', 'You cannot change the name to an existing group name')
						.commit();

					return localServer.dispatchUpdate('/individualizeStore', patchError);
				}

				Object.keys(oldValues.indiv_glyphs).forEach((glyph) => {
					if (oldValues.indiv_glyphs[glyph] === currentGroup) {
						if (glyphSelected.indexOf(glyph) === -1) {
							delete oldValues.indiv_glyphs[glyph];
						}
						else {
							oldValues.indiv_glyphs[glyph] = name;
						}
					}
				});

				glyphSelected.forEach((glyph) => {
					oldValues.indiv_glyphs[glyph] = name;
				});

				const oldParams = _.cloneDeep(oldValues.indiv_group_param[currentGroup]);

				delete oldValues.indiv_group_param[currentGroup];

				oldValues.indiv_group_param[name] = oldParams;

				const patch = fontControls.set('values', oldValues).commit();

				localServer.dispatchUpdate('/individualizeStore', patch);

				const indivPatch = individualizeStore
					.set('currentGroup', name)
					.set('editGroup', false)
					.set('glyphGrid', false)
					.set('errorEdit', undefined)
					.set('groups', Object.keys(oldValues.indiv_group_param))
					.commit();

				localServer.dispatchUpdate('/individualizeStore', indivPatch);
				localClient.dispatchAction('/update-font', oldValues);

				const variant = fontVariant.get('variant');

				FontValues.save({typeface: variant.db, values: oldValues});
				Log.ui('GroupParam.saveEdit');
			},
			'/create-mode-param-group': () => {
				const values = _.cloneDeep(fontControls.get('values'));

				const indivPatch = individualizeStore
					.set('indivMode', true)
					.set('indivCreate', true)
					.set('indivEdit', false)
					.set('preDelete', false)
					.set('glyphGrid', false)
					.set('errorMessage', undefined)
					.set('errorGlyphs', [])
					.set('errorEdit', undefined)
					.set('selected', [])
					.set('groups', Object.keys(values.indiv_group_param))
					.commit();

				localServer.dispatchUpdate('/individualizeStore', indivPatch);
				Log.ui('GroupParam.switchToCreateGroupParam');
			},
			'/edit-mode-param-group': () => {
				const values = _.cloneDeep(fontControls.get('values'));
				const groupName = Object.keys(values.indiv_group_param)[0];
				const indivPatch = individualizeStore
					.set('indivMode', true)
					.set('indivCreate', false)
					.set('indivEdit', true)
					.set('preDelete', false)
					.set('glyphGrid', false)
					.set('errorMessage', undefined)
					.set('errorGlyphs', [])
					.set('errorEdit', undefined)
					.set('groups', Object.keys(values.indiv_group_param))
					.set('currentGroup', groupName)
					.commit();

				localServer.dispatchUpdate('/individualizeStore', indivPatch);

				localClient.dispatchAction('/select-indiv-group', groupName);
				Log.ui('GroupParam.switchToEditGroupParam');
			},
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
			'/search-glyph': ({query}) => {
				const patch = searchStore.set('glyphSearch', query).commit();

				localServer.dispatchUpdate('/searchStore', patch);

				const patchTag = tagStore.set('selected', 'all').commit();

				localServer.dispatchUpdate('/tagStore', patchTag);
			},
			'/save-search-glyph': ({query}) => {
				const searchs = _.cloneDeep(searchStore.get('savedSearch'));

				if (searchs.indexOf(query) === -1) {
					searchs.push(query);
					const patch = searchStore
						.set('savedSearch', searchs)
						.set('savedSearchError', undefined)
						.commit();

					localServer.dispatchUpdate('/searchStore', patch);
				}
				else {
					const patch = searchStore.set('savedSearchError', 'This search already exists');

					localServer.dispatchUpdate('/searchStore', patch);
				}
				saveAppValues(appValuesLoaded);
			},
			'/toggle-pinned-search': ({query}) => {
				const pinned = _.xor(searchStore.get('pinned'), [query]);
				const patch = searchStore
					.set('pinned', pinned)
					.commit();

				localServer.dispatchUpdate('/searchStore', patch);
				saveAppValues(appValuesLoaded);
			},
			'/delete-search-glyph': ({query}) => {
				const searchs = _.xor(searchStore.get('savedSearch'), [query]);
				const pinned = _.xor(searchStore.get('pinned'), [query]);
				const patch = searchStore
					.set('savedSearch', searchs)
					.set('pinned', pinned)
					.commit();

				localServer.dispatchUpdate('/searchStore', patch);
				saveAppValues(appValuesLoaded);
			},
		};

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
