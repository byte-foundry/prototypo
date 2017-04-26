/* global _, trackJs */
import XXHash from 'xxhashjs';
import slug from 'slug';
import {gql} from 'react-apollo';
import cloneDeep from 'lodash/cloneDeep';

import {userStore, prototypoStore, undoableStore, fontInstanceStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';

import {loadStuff} from '../helpers/appSetup.helpers.js';
import {copyFontValues, loadFontValues, saveAppValues} from '../helpers/loadValues.helpers.js';
import {BatchUpdate} from '../helpers/undo-stack.helpers.js';

import {Typefaces} from '../services/typefaces.services.js';
import Log from '../services/log.services.js';
import {FontValues} from '../services/values.services.js';
import apolloClient from '../services/graphcool.services';

import WorkerPool from '../worker/worker-pool.js';

import {fontToSfntTable} from '../opentype/font.js';

slug.defaults.mode = 'rfc3986';
slug.defaults.modes.rfc3986.remove = /[-_\/\\\.]/g;
let localServer;
let localClient;
let undoWatcher;

const debouncedSave = _.throttle((values, db, variantId) => {
	FontValues.save({
		values,
		variantId,
	});
}, 2000);


let oldFont;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;

	undoWatcher = new BatchUpdate(
		undoableStore,
		'/undoableStore',
		'controlsValues',
		localClient,
		localServer.lifespan,
		(name) => {
			return `${name} modification`;
		},
		(headJS) => {
			debouncedSave(headJS.controlsValues);
		}
	);
});

const hasher = XXHash(0xDEADBEEF);

export default {
	'/create-font-instance': ({typedataJSON, appValues}) => {
		const typedata = JSON.parse(typedataJSON);
		const familyName = typedata.fontinfo.familyName;
		const controls = typedata.controls;
		const presets = typedata.presets;
		const tags = typedata.fontinfo.tags;
		const db = appValues.values.variantSelected.db;

		localClient.dispatchAction('/store-value-font', {
			familyName,
			db,
			typedata,
		});

		localClient.dispatchAction('/create-font', typedata);
		localClient.dispatchAction('/load-params', {controls, presets});
		localClient.dispatchAction('/load-tags', tags);
		loadFontValues(typedata, db);
	},
	'/load-font-instance': async ({appValues}) => {
		try {
			const template = appValues.values.familySelected ? appValues.values.familySelected.template : undefined;
			const typedataJSON = await Typefaces.getFont(template || 'venus.ptf');

			localClient.dispatchAction('/create-font-instance', {
				typedataJSON,
				appValues,
			});
		}
		catch (err) {
			trackJs.track(err);
			console.log(err);
		}

	},
	'/create-font': (typedata) => {
		const fontWorkerPool = new WorkerPool();

		fontWorkerPool.eachJob({
			action: {
				type: 'createFont',
				data: typedata,
			},
			callback: () => {
				localClient.dispatchAction('/store-value-font', {
					fontWorkerPool,
				});
			},
		});

		const patch = prototypoStore
			.set('fontName', typedata.fontinfo.familyName)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/change-font-from-typedata': async ({typedataJSON, variantId}) => {
		const typedata = JSON.parse(typedataJSON);

		localClient.dispatchAction('/store-value-font', {
			familyName: typedata.fontinfo.familyName,
			typedataJSON,
		});

		localClient.dispatchAction('/create-font', typedata);

		localClient.dispatchAction('/load-params', {controls: typedata.controls, presets: typedata.presets});
		localClient.dispatchAction('/load-tags', typedata.fontinfo.tags);
		localClient.dispatchAction('/clear-undo-stack');

		loadFontValues(typedata, undefined, variantId);
	},
	'/change-font': async ({templateToLoad, db, variantId}) => {
		const typedataJSON = await Typefaces.getFont(templateToLoad);

		localClient.dispatchAction('/change-font-from-typedata', {
			typedataJSON,
			variantId,
		});
		localClient.dispatchAction('/toggle-individualize', {targetIndivValue: false});
		localClient.dispatchAction('/store-value', {uiSpacingMode: false});
	},
	'/family-created': async ({name, variants, template}) => {
		const patchVariant = prototypoStore
			.set('variant', variants[0])
			.set('family', {name, template})
			.set('uiCreatefamilySelectedTemplate', undefined)
			.set('openFamilyModal', false)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patchVariant);

		saveAppValues();

		const {data: {user}} = await apolloClient.query({
			query: gql`
				query getVariantsCount {
					user {
						id
						libraryMeta: _libraryMeta {
							count
						}
					}
				}
			`,
		});

		window.Intercom('update', {
			number_of_family: user.libraryMeta.count,
		});
	},
	'/select-variant': ({family, variant = family.variants[0]}) => {
		const patchVariant = prototypoStore
			.set('variant', {id: selectedVariant.id, name: selectedVariant.name})
			.set('family', {id: family.id, name: family.name, template: family.template}).commit();

		localServer.dispatchUpdate('/prototypoStore', patchVariant);

		localClient.dispatchAction('/change-font', {
			templateToLoad: family.template,
			variantId: selectedVariant.id,
		});
	},
	'/create-variant-from-ref': async ({ref, name, family, noSwitch}) => {
		const values = cloneDeep(ref.values);
		const thicknessTransform = [
			{string: 'Thin', thickness: 20},
			{string: 'Light', thickness: 50},
			{string: 'Book', thickness: 70},
			{string: 'Bold', thickness: 115},
			{string: 'Semi-Bold', thickness: 100},
			{string: 'Extra-Bold', thickness: 135},
			{string: 'Black', thickness: 150},
		];

		thicknessTransform.forEach((item) => {
			if (name.includes(item.string)) {
				values.thickness = item.thickness;
			}
		});

		if (name.includes('Italic')) {
			values.slant = 10;
		}

		const {data: {variant}} = await apolloClient.mutate({
			mutation: gql`
				mutation createVariant($name: String!, $familyId: ID!, $values: Json) {
					variant: createVariant(name: $name, familyId: $familyId, values: $values) {
						id
						name
					}
				}
			`,
			variables: {
				name,
				familyId: family.id,
				values,
			},
		});

		setTimeout(async () => {
			if (!noSwitch) {
				localClient.dispatchAction('/select-variant', {
					variant: {id: variant.id, name: variant.name},
					family,
				});
			}
		}, 200);

		localClient.dispatchAction('/store-value', {
			openVariantModal: false,
			openDuplicateVariantModal: false,
			errorAddVariant: undefined,
		});

		const {data: {user}} = await apolloClient.query({
			query: gql`
				query getVariantsCount {
					user {
						id
						library {
							variantsMeta: _variantsMeta {
								count
							}
						}
					}
				}
			`,
		});

		window.Intercom('update', {
			number_of_variants: user.library.reduce(
				(numberOfVariants, {variantsMeta}) => numberOfVariants + variantsMeta.count,
				0,
			),
		});
	},
	'/create-variant': async ({name, familyId, variantBaseId, noSwitch}) => {
		// if (!name || String(name).trim() === '') {
		// 	const patch = prototypoStore.set('errorAddVariant', 'Variant name cannot be empty').commit();

		// 	localServer.dispatchUpdate('/prototypoStore', patch);
		// 	return;
		// }

		// const {data: {family}} = await apolloClient.query({
		// 	fetchPolicy: 'cache-first',
		// 	query: gql`
		// 		query getFamily($id: ID!) {
		// 			family: Family(id: $id) {
		// 				id
		// 				name
		// 				template
		// 				variants {
		// 					id
		// 					name
		// 				}
		// 			}
		// 		}
		// 	`,
		// 	variables: {id: familyId},
		// });

		// const already = family.variants.find((item) => {
		// 	return item.name === name;
		// });

		// if (already) {
		// 	const patch = prototypoStore.set('errorAddVariant', 'Variant with this name already exists').commit();

		// 	localServer.dispatchUpdate('/prototypoStore', patch);
		// 	return;
		// }

		// const patch = prototypoStore.set('errorAddVariant', undefined).commit();

		// localServer.dispatchUpdate('/prototypoStore', patch);

		// if (!variantBaseId || (variantBaseId && !family.variants.some(f => f.id === variantBaseId))) {
		// 	variantBaseId = family.variants[0].id;
		// }

		// const {data: {variantBase}} = await apolloClient.query({
		// 	fetchPolicy: 'cache-first',
		// 	query: gql`
		// 		query getVariantBaseValues($id: ID!) {
		// 			variantBase: Variant(id: $id) {
		// 				id
		// 				values
		// 			}
		// 		}
		// 	`,
		// 	variables: {id: variantBaseId},
		// });

		localClient.dispatchAction('/create-variant-from-ref', {
			name,
			ref: variantBase,
			variantId: variantBase.id,
			family,
			noSwitch,
		});
	},
	'/delete-variant': ({variant}) => {
		const currentVariant = prototypoStore.get('variant');
		const currentFamily = prototypoStore.get('family');

		if (variant.id === currentVariant.id) {
			const newVariant = currentFamily.variants[0];
			const patch = prototypoStore.set('variant', newVariant).commit();

			localClient.dispatchAction('/change-font', {
				templateToLoad: currentFamily.template,
				variantId: newVariant.id,
			});
			localServer.dispatchUpdate('/prototypoStore', patch);
		}

		saveAppValues();
	},
	'/delete-family': async ({family}) => {
		const currentFamily = prototypoStore.get('family');

		if (family.name === currentFamily.name && family.template === currentFamily.template) {
			const {data: {user}} = await apolloClient.query({
				fetchPolicy: 'cache-first',
				query: gql`
					query getUserLibrary {
						user {
							id
							library {
								id
								name
								template
								variants {
									id
									name
								}
							}
						}
					}
				`,
			});

			const newFamily = user.library[0];
			const newVariant = newFamily.variants[0];

			delete newFamily.variants;

			prototypoStore.set('family', newFamily);
			prototypoStore.set('variant', newVariant);
			localClient.dispatchAction('/change-font', {
				templateToLoad: newFamily.template,
				variantId: newVariant.id,
			});

			localServer.dispatchUpdate('/prototypoStore', prototypoStore.commit());
		}

		saveAppValues();
	},
	'/clear-error-variant': () => {
		const patch = prototypoStore.set('errorAddVariant', undefined).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/select-family-collection': (family) => {
		const patch = prototypoStore
			.set('collectionSelectedFamily', family)
			.set('collectionSelectedVariant', undefined)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/select-variant-collection': (variant) => {
		const patch = prototypoStore.set('collectionSelectedVariant', variant).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/close-create-family-modal': () => {
		const patch = prototypoStore.set('openFamilyModal', false).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/close-create-variant-modal': () => {
		const patch = prototypoStore.set('openVariantModal', false).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/change-param': ({values, value, name, force, label}) => {
		const indivMode = prototypoStore.get('indivMode');
		const indivEdit = prototypoStore.get('indivEditingParams');
		const db = (prototypoStore.get('variant') || {}).db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const currentGroupName = (prototypoStore.get('indivCurrentGroup') || {}).name;
		let newParams = {...undoableStore.get('controlsValues')};

		if (indivMode && indivEdit && !values) {
			if (newParams.indiv_group_param[currentGroupName][name]) {
				newParams.indiv_group_param = {
					...newParams.indiv_group_param,
					[currentGroupName]: {
						...newParams.indiv_group_param[currentGroupName],
						[name]: {
							...newParams.indiv_group_param[currentGroupName][name],
							value,
						},
					},
				};
			}
			else {
				newParams.indiv_group_param = {
					...newParams.indiv_group_param,
					[currentGroupName]: {
						...newParams.indiv_group_param[currentGroupName],
						[name]: {
							state: 'relative',
							value,
						},
					},
				};
			}
		}
		else if (values) {
			newParams = {...newParams, ...values};
		}
		else {
			newParams[name] = value;
		}

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);

		if (force) {
			//TODO(franz): This SHOULD totally end up being in a flux store on hoodie
			undoWatcher.forceUpdate(patch, label);
			debouncedSave(newParams, db, variantId);
		}
		else {
			undoWatcher.update(patch, label);
		}

	},
	'/change-param-state': ({name, state, force, label}) => {
		const db = prototypoStore.get('variant').db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const currentGroupName = prototypoStore.get('indivCurrentGroup').name;
		const newParams = {...undoableStore.get('controlsValues')};

		newParams.indiv_group_param[currentGroupName][name] = {
			state,
			value: state === 'relative' ? 1 : 0,
		};

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);
		debouncedSave(newParams, db, variantId);

		if (force) {
			//TODO(franz): This SHOULD totally end up being in a flux store on hoodie
			undoWatcher.forceUpdate(patch, label);
		}
		else {
			undoWatcher.update(patch, label);
		}
	},
	'/change-letter-spacing': ({value, side, letter, label, force}) => {
		const db = (prototypoStore.get('variant') || {}).db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const oldValues = undoableStore.get('controlsValues');
		const newParams = {
			...oldValues,
			glyphSpecialProps: {...oldValues.glyphSpecialProps},
		};

		const unicode = letter.charCodeAt(0);

		newParams.glyphSpecialProps = newParams.glyphSpecialProps || {};
		newParams.glyphSpecialProps[unicode] = {...newParams.glyphSpecialProps[unicode]} || {};

		if (side === 'left') {
			newParams.glyphSpecialProps[unicode].spacingLeft = value;
		}
		else {
			newParams.glyphSpecialProps[unicode].spacingRight = value;
		}

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);

		debouncedSave(newParams, db, variantId);

		if (force) {
			undoWatcher.forceUpdate(patch, label);
		}
		else {
			undoWatcher.update(patch, label);
		}

	},
	'/change-glyph-node-manually': ({changes, force, label = 'glyph node manual', glyphName}) => {
		const db = (prototypoStore.get('variant') || {}).db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const oldValues = undoableStore.get('controlsValues');
		const manualChanges = _.cloneDeep(oldValues.manualChanges) || {};

		manualChanges[glyphName] = manualChanges[glyphName] || {};
		manualChanges[glyphName].cursors = manualChanges[glyphName].cursors || {};

		// adding deltas to modified cursors
		Object.keys(changes).forEach((cursorKey) => {
			const oldChanges = manualChanges[glyphName].cursors[cursorKey];

			if (typeof oldChanges === 'number') {
				changes[cursorKey] += oldChanges;
			}
			else if (typeof oldChanges === 'object') {
				Object.keys(changes[cursorKey]).forEach((key) => {
					if (oldChanges[key] !== undefined) {
						changes[cursorKey][key] += oldChanges[key];
					}
				});
				// merging objects to keep other changes
				changes[cursorKey] = {...oldChanges, ...changes[cursorKey]};
			}
		});

		const newParams = {
			...oldValues,
			manualChanges: {
				...manualChanges,
				[glyphName]: {
					...manualChanges[glyphName],
					cursors: {
						...manualChanges[glyphName].cursors,
						...changes,
					},
				},
			},
		};

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);

		debouncedSave(newParams, db, variantId);

		if (force) {
			undoWatcher.forceUpdate(patch, label);
		}
		else {
			undoWatcher.update(patch, label);
		}
	},
	'/reset-glyph-node-manually': ({contourId, nodeId, force = true, label = 'reset manual', glyphName}) => {
		const db = (prototypoStore.get('variant') || {}).db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const oldValues = undoableStore.get('controlsValues');
		const manualChanges = _.cloneDeep(oldValues.manualChanges) || {};

		manualChanges[glyphName] = manualChanges[glyphName] || {};
		manualChanges[glyphName].cursors = manualChanges[glyphName].cursors || {};

		// adding deltas to modified cursors
		Object.keys(manualChanges[glyphName].cursors).forEach((cursorKey) => {
			if (cursorKey.indexOf(`contours.${contourId}.nodes.${nodeId}`) !== -1) {
				delete manualChanges[glyphName].cursors[cursorKey];
			}
		});

		const newParams = {
			...oldValues,
			manualChanges: {
				...manualChanges,
				[glyphName]: {
					...manualChanges[glyphName],
					cursors: {
						...manualChanges[glyphName].cursors,
					},
				},
			},
		};

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);

		debouncedSave(newParams, db, variantId);

		if (force) {
			undoWatcher.forceUpdate(patch, label);
		}
		else {
			undoWatcher.update(patch, label);
		}
	},
	'/reset-glyph-manually': ({glyphName, force = true, label = 'reset manual'}) => {
		const db = (prototypoStore.get('variant') || {}).db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const oldValues = undoableStore.get('controlsValues');
		const manualChanges = _.cloneDeep(oldValues.manualChanges) || {};

		delete manualChanges[glyphName];

		const newParams = {
			...oldValues,
			manualChanges,
		};

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);

		debouncedSave(newParams, db, variantId);

		if (force) {
			undoWatcher.forceUpdate(patch, label);
		}
		else {
			undoWatcher.update(patch, label);
		}
	},

	'/reset-all-glyphs': ({force = true, label = 'reset all glyphs'}) => {
		const db = (prototypoStore.get('variant') || {}).db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const oldValues = undoableStore.get('controlsValues');
		const manualChanges = {};
		const newParams = {
			...oldValues,
			manualChanges,
		};
		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);

		debouncedSave(newParams, db, variantId);

		if (force) {
			undoWatcher.forceUpdate(patch, label);
		}
		else {
			undoWatcher.update(patch, label);
		}
	},

	'/change-component': ({glyph, id, name, label = 'change component'}) => {
		const db = (prototypoStore.get('variant') || {}).db;
		const variantId = (prototypoStore.get('variant') || {}).id;
		const oldValues = undoableStore.get('controlsValues');
		const newParams = {
			...oldValues,
			glyphComponentChoice: {...oldValues.glyphComponentChoice},
		};

		newParams.glyphComponentChoice[glyph.ot.unicode] = {
			...newParams.glyphComponentChoice[glyph.ot.unicode],
			[id]: name,
		};

		const patch = undoableStore.set('controlsValues', newParams).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', newParams);

		debouncedSave(newParams, db, variantId);

		undoWatcher.forceUpdate(patch, label);
	},
	'/set-preset': (presetName) => {
		const presets = prototypoStore.get('fontPresets');

		if (presets && presets[presetName]) {
			localClient.dispatchAction('/change-param', {
				values: presets[presetName],
				force: true,
				label: 'preset',
			});
		}
	},
	'/update-font': (params) => {
		const pool = fontInstanceStore.get('fontWorkerPool');
		const subset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const jobs = [];

		const fontPromise = _.chunk(subset.split(''), Math.ceil(subset.length / pool.workerArray.length))
			.map((subsubset) => {
				return new Promise((resolve) => {
					jobs.push({
						action: {
							type: 'constructGlyphs',
							data: {
								params,
								subset: subsubset,
							},
						},
						callback: (font) => {
							resolve(font);
						},
					});
				});
			});

		pool.doJobs(jobs);

		Promise.all(fontPromise).then((fonts) => {
			let fontResult;

			fonts.forEach(({font}) => {
				if (fontResult) {
					fontResult.glyphs = [
						...fontResult.glyphs,
						...font.glyphs,
					];
				}
				else {
					fontResult = font;
				}
			});

			const arrayBuffer = fontToSfntTable({
				...fontResult,
				fontFamily: {en: 'Prototypo web font'},
				fontSubfamily: {en: 'Regular'},
				postScriptName: {},
				unitsPerEm: 1024,
			});

			if (params.trigger) {
				 triggerDownload(arrayBuffer.buffer, 'hello');
			}

			const fontFace = new FontFace(
				'Prototypo web font',
				arrayBuffer.buffer,
			);

			if (oldFont) {
				document.fonts.delete(oldFont);
			}

			document.fonts.add(fontFace);
			oldFont = fontFace;

			localClient.dispatchAction('/font-store-value', {
				font: fontResult,
			});
		});
	},
};

var a = document.createElement('a');

var triggerDownload = function(arrayBuffer, filename ) {
	var reader = new FileReader();
	var enFamilyName = filename;

	reader.onloadend = function() {
		a.download = enFamilyName + '.otf';
		a.href = reader.result;
		a.dispatchEvent(new MouseEvent('click'));

		setTimeout(function() {
			a.href = '#';
			_URL.revokeObjectURL( reader.result );
		}, 100);
	};

	reader.readAsDataURL(new Blob(
		[ new DataView( arrayBuffer ) ],
		{ type: 'font/opentype' }
	));
};
