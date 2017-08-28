import {prototypoStore, undoableStore} from '../stores/creation.stores.jsx';
import Log from '../services/log.services.js';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {FontValues} from '../services/values.services.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

function getGroupsAndGlyphsFromGroups(groups) {
	return _.sortBy(_.map(groups, (name) => {
		const glyphs = _.keys(undoableStore.get('controlsValues').indiv_glyphs).filter((key) => {
			return undoableStore.get('controlsValues').indiv_glyphs[key] === name;
		});

		return {name, glyphs};
	}), ({name}) => {
		return name;
	});

}

function toggleGlyphSelection(isSelected, selected, unicode) {
	const prevSelected = _.cloneDeep(selected);

	if (isSelected) {
		prevSelected.splice(prevSelected.indexOf(unicode), 1);
	}
	else {
		prevSelected.push(unicode);
	}

	return prevSelected;
}

export default {
	'/load-indiv-groups': () => {
		const groups = Object.keys(undoableStore.get('controlsValues').indiv_group_param || {});
		const groupsAndGlyphs = getGroupsAndGlyphsFromGroups(groups);
		const patch = prototypoStore
			.set('indivGroups', groupsAndGlyphs).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/toggle-individualize': ({targetIndivValue}) => {
		const oldValue = prototypoStore.get('indivMode');

		const newValue = targetIndivValue !== undefined ? targetIndivValue : !oldValue;
		const groups = Object.keys(undoableStore.get('controlsValues').indiv_group_param || {});
		const groupsAndGlyphs = getGroupsAndGlyphsFromGroups(groups);

		prototypoStore
			.set('indivMode', newValue)
			.set('indivCreate', groups.length === 0 && !oldValue)
			.set('indivPreDelete', false)
			.set('indivEdit', false)
			.set('indivEditingParams', false)
			.set('indivGlyphs', [])
			.set('indivCurrentGroup', undefined)
			.set('indivErrorMessage', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivTagSelected', 'all')
			.set('indivGroups', groupsAndGlyphs);

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.showIndivMode');
	},
	'/add-glyph-to-indiv-create': ({unicode, isSelected}) => {
		const selected = prototypoStore.get('indivSelected');
		const newSelection = toggleGlyphSelection(isSelected, selected, unicode);
		const patch = prototypoStore.set('indivSelected', newSelection).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.addGlyphToIndiv');
	},
	'/add-glyph-to-indiv-edit': ({unicode, isSelected}) => {
		const groupSelected = prototypoStore.get('indivCurrentGroup');
		const newSelection = toggleGlyphSelection(isSelected, groupSelected.glyphs, unicode);
		const patch = prototypoStore.set('indivCurrentGroup', {name: groupSelected.name, glyphs: newSelection}).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.addGlyphToIndiv');
	},
	'/select-indiv-tag': (tag) => {
		const patch = prototypoStore.set('indivTagSelected', tag).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.selectIndivTag');
	},
	'/create-param-group': ({name, selected}) => {
		const oldValues = undoableStore.get('controlsValues');
		const alreadyInGroup = [];

		if (!name) {
			const patchError = prototypoStore
				.set('indivErrorMessage', 'You must provide a group name')
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
		}

		if (oldValues.indiv_group_param && Object.keys(oldValues.indiv_group_param).indexOf(name) !== -1) {
			const patchError = prototypoStore
				.set('indivErrorMessage', 'There is already a group with this name')
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
		}

		if (selected.length === 0) {
			const patchError = prototypoStore
				.set('indivErrorMessage', 'You must select at least one glyph')
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
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
			const patchError = prototypoStore
				.set('indivErrorMessage', 'Some glyphs are already in a group')
				.set('indivErrorGlyphs', alreadyInGroup)
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
		}

		if (!oldValues.indiv_group_param[name]) {
			oldValues.indiv_group_param[name] = {};
		}

		const patch = undoableStore.set('controlsValues', oldValues).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', oldValues);

		const endCreatePatch = prototypoStore
			.set('indivCreate', false)
			.set('indivEdit', false)
			.set('indivEditingParams', true)
			.set('indivSelected', [])
			.set('indivCurrentGroup', {name, glyphs: selected})
			.set('indivErrorMessage', undefined)
			.set('indivGlyphGrid', false)
			.set('indivGlyphs', _.keys(undoableStore.get('controlsValues').indiv_glyphs).filter((key) => {
				return undoableStore.get('controlsValues').indiv_glyphs[key] === name;
			}))
			.set('indivEditGroup', false)
			.set('indivErrorGlyphs', [])
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(oldValues.indiv_group_param)))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', endCreatePatch);

		const variant = prototypoStore.get('variant');

		FontValues.save({typeface: variant.db, values: oldValues, variantId: variant.id});
		Log.ui('GroupParam.create');
		window.Intercom('trackEvent', 'indivGroups');
		Log.ui(`GroupParam.create${prototypoStore.get('family').template}`);
	},
	'/cancel-indiv-mode': () => {
		const oldValues = _.cloneDeep(undoableStore.get('controlsValues'));

		const endCreatePatch = prototypoStore
			.set('indivCreate', false)
			.set('indivEdit', false)
			.set('indivEditingParams', false)
			.set('indivMode', false)
			.set('indivPreDelete', false)
			.set('indivGlyphGrid', false)
			.set('indivCurrentGroup', undefined)
			.set('indivErrorMessage', undefined)
			.set('indivErrorEdit', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivTagSelected', 'all')
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(oldValues.indiv_group_param)))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', endCreatePatch);

	},
	'/edit-param-group': (state) => {
		const otherGroups = _.keys(undoableStore.get('controlsValues').indiv_glyphs).filter((key) => {
				return !!undoableStore.get('controlsValues').indiv_glyphs[key] && undoableStore.get('controlsValues').indiv_glyphs[key] !== prototypoStore.get('indivCurrentGroup');
			});
		const patch = prototypoStore
			.set('indivEditGroup', state)
			.set('indivPreDelete', false)
			.set('indivGlyphGrid', false)
			.set('indivSelected', state ? prototypoStore.get('indivGlyphs') : [])
			.set('indivOtherGroups', otherGroups)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.startEdit');
	},
	'/pre-delete': (state) => {
		const patch = prototypoStore
			.set('indivPreDelete', state)
			.set('indivEditGroup', false)
			.set('indivGlyphGrid', false)
			.set('indivSelected', _.keys(undoableStore.get('controlsValues').indiv_glyphs).filter((key) => {
				return undoableStore.get('controlsValues').indiv_glyphs[key] === prototypoStore.get('indivCurrentGroup');
			}))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.startDelete');
	},
	'/delete-param-group': ({name}) => {
		const oldValues = _.cloneDeep(undoableStore.get('controlsValues'));

		delete oldValues.indiv_group_param[name];

		Object.keys(oldValues.indiv_glyphs).forEach((key) => {
			if (oldValues.indiv_glyphs[key] === name) {
				delete oldValues.indiv_glyphs[key];
			}
		});

		const noGroups = Object.keys(oldValues.indiv_group_param).length === 0;
		const endDeletePatch = prototypoStore
			.set('indivCreate', noGroups)
			.set('indivEdit', false)
			.set('indivPreDelete', false)
			.set('indivCurrentGroup', {})
			.set('indivSelected', [])
			.set('indivErrorMessage', undefined)
			.set('indivErrorEdit', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(oldValues.indiv_group_param || {})))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', endDeletePatch);

		const patch = undoableStore.set('controlsValues', oldValues).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', oldValues);

		const variant = prototypoStore.get('variant');

		FontValues.save({typeface: variant.db, values: oldValues, variantId: variant.id});
		localClient.dispatchAction('/update-font', oldValues);
		Log.ui('GroupParam.deleteGroup');
	},
	'/remove-glyph': ({glyph}) => {
		const glyphSelected = _.cloneDeep(prototypoStore.get('indivSelected'));

		glyphSelected.splice(glyphSelected.indexOf(glyph), 1);

		const patch = prototypoStore
			.set('indivSelected', glyphSelected)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.removeGlyph');
	},
	'/save-param-group': ({newName}) => {
		const oldValues = _.cloneDeep(undoableStore.get('controlsValues'));
		const currentGroup = prototypoStore.get('indivCurrentGroup') || {};
		const currentGroupName = currentGroup.name;
		const glyphSelected = currentGroupName
			? currentGroup.glyphs
			: _.cloneDeep(prototypoStore.get('indivSelected'));

		if (!newName) {
			const patchError = prototypoStore
				.set('indivErrorMessage', 'You must provide a group name')
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
		}

		if (newName !== currentGroupName && Object.keys(oldValues.indiv_group_param).indexOf(newName) !== -1) {
			const patchError = prototypoStore
				.set('indivErrorMessage', 'You cannot change the name to an existing group name')
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
		}

		Object.keys(oldValues.indiv_glyphs).forEach((glyph) => {
			if (oldValues.indiv_glyphs[glyph] === currentGroupName) {
				if (glyphSelected.indexOf(glyph) === -1) {
					delete oldValues.indiv_glyphs[glyph];
				}
				else {
					oldValues.indiv_glyphs[glyph] = newName;
				}
			}
		});

		glyphSelected.forEach((glyph) => {
			oldValues.indiv_glyphs[glyph] = newName;
		});

		const oldParams = _.cloneDeep(oldValues.indiv_group_param[currentGroupName]);

		delete oldValues.indiv_group_param[currentGroupName];

		oldValues.indiv_group_param[newName] = oldParams;

		const patch = undoableStore.set('controlsValues', oldValues).commit();

		localServer.dispatchUpdate('/undoableStore', patch);
		localClient.dispatchAction('/update-font', oldValues);

		const indivPatch = prototypoStore
			.set('indivCurrentGroup', {name: newName, glyphs: currentGroup.glyphs})
			.set('indivEdit', true)
			.set('indivGlyphGrid', false)
			.set('indivErrorEdit', undefined)
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(oldValues.indiv_group_param)))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', indivPatch);
		localClient.dispatchAction('/update-font', oldValues);

		const variant = prototypoStore.get('variant');

		FontValues.save({typeface: variant.db, values: oldValues, variantId: variant.id});
		Log.ui('GroupParam.saveEdit');
	},
	'/create-mode-param-group': () => {
		const values = _.cloneDeep(undoableStore.get('controlsValues'));

		const indivPatch = prototypoStore
			.set('indivMode', true)
			.set('indivCreate', true)
			.set('indivEdit', false)
			.set('indivCurrentGroup', undefined)
			.set('indivErrorMessage', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivErrorEdit', undefined)
			.set('indivTagSelected', 'all')
			.set('indivSelected', [])
			.set('indivOtherGroups', Object.keys(values.indiv_glyphs))
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(values.indiv_group_param)))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', indivPatch);
		Log.ui('GroupParam.switchToCreateGroupParam');
	},
	'/edit-mode-param-group': ({group}) => {
		const values = _.cloneDeep(undoableStore.get('controlsValues'));
		const indivPatch = prototypoStore
			.set('indivMode', true)
			.set('indivCreate', false)
			.set('indivEdit', true)
			.set('indivTagSelected', 'all')
			.set('indivPreDelete', false)
			.set('indivGlyphGrid', false)
			.set('indivErrorMessage', undefined)
			.set('indivOtherGroups', _.filter(Object.keys(values.indiv_glyphs), (key) => {
				return values.indiv_glyphs[key] !== group.name;
			}))
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(values.indiv_group_param)))
			.set('indivCurrentGroup', group)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', indivPatch);
		Log.ui('GroupParam.switchToEditGroupParam');
	},
};
