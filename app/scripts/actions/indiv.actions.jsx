import {individualizeStore, fontControls, glyphs} from '../stores/creation.stores.jsx';
import Log from './services/log.services.js';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from './helpers/loadValues.helpers.js';

const localServer = LocalServer.instance;

export default {
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
}
