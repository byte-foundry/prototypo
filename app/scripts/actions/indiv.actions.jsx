import {prototypoStore} from '../stores/creation.stores.jsx';
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
	return _.map(groups, (name) => {
		const glyphs = _.keys(prototypoStore.get('controlsValues').indiv_glyphs).filter((key) => {
			return prototypoStore.get('controlsValues').indiv_glyphs[key] === name;
		});

		return {name, glyphs};
	});

}

export default {
	'/toggle-individualize': () => {
		const oldValue = prototypoStore.get('indivMode');

		const groups = Object.keys(prototypoStore.get('controlsValues').indiv_group_param || {});
		const groupsAndGlyphs = getGroupsAndGlyphsFromGroups(groups);
		prototypoStore
			.set('indivMode', !oldValue)
			.set('indivCreate', false)
			.set('indivPreDelete', false)
			.set('indivEdit', false)
			.set('indivGlyphs', [])
			.set('indivCurrentGroup', undefined)
			.set('indivErrorMessage', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivGroups', groupsAndGlyphs);

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.showIndivMode');
	},
	'/add-glyph-to-indiv': ({unicode, isSelected}) => {
		const selected = prototypoStore.get('indivSelected');

		if (isSelected) {
			selected.splice(selected.indexOf(unicode), 1);
		}
		else {
			selected.push(unicode);
		}

		const patch = prototypoStore.set('indivSelected', selected).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.addGlyphToIndiv');
	},
	'/select-indiv-tag': (tag) => {
		const patch = prototypoStore.set('indivTagSelected', tag).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.selectIndivTag');
	},
	'/create-param-group': ({name, selected}) => {
		const oldValues = prototypoStore.get('controlsValues');
		const alreadyInGroup = [];

		if (!name) {
			const patchError = prototypoStore
				.set('indivErrorMessage', 'You must provide a group name')
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

		const patch = prototypoStore.set('controlsValues', oldValues).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		const endCreatePatch = prototypoStore
			.set('indivCreate', false)
			.set('indivEdit', true)
			.set('indivCurrentGroup', {name, glyphs: selected})
			.set('indivErrorMessage', undefined)
			.set('indivGlyphGrid', false)
			.set('indivGlyphs', _.keys(prototypoStore.get('controlsValues').indiv_glyphs).filter((key) => {
				return prototypoStore.get('controlsValues').indiv_glyphs[key] === name;
			}))
			.set('indivEditGroup', false)
			.set('indivErrorGlyphs', [])
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(oldValues.indiv_group_param)))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', endCreatePatch);

		const variant = prototypoStore.get('variant');

		FontValues.save({typeface: variant.db, values: oldValues});
		Log.ui('GroupParam.create');
	},
	'/cancel-indiv-mode': () => {
		const endCreatePatch = prototypoStore
			.set('indivCreate', false)
			.set('indivEdit', false)
			.set('indivMode', false)
			.set('indivPreDelete', false)
			.set('indivGlyphGrid', false)
			.set('indivCurrentGroup', undefined)
			.set('indivErrorMessage', undefined)
			.set('indivErrorEdit', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivGroups', [])
			.commit();

		localServer.dispatchUpdate('/prototypoStore', endCreatePatch);

	},
	'/edit-param-group': (state) => {
		const otherGroups = _.keys(prototypoStore.get('controlsValues').indiv_glyphs).filter((key) => {
				return !!prototypoStore.get('controlsValues').indiv_glyphs[key] && prototypoStore.get('controlsValues').indiv_glyphs[key] !== prototypoStore.get('indivCurrentGroup');
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
			.set('indivSelected', _.keys(prototypoStore.get('controlsValues').indiv_glyphs).filter((key) => {
				return prototypoStore.get('controlsValues').indiv_glyphs[key] === prototypoStore.get('indivCurrentGroup');
			}))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		Log.ui('GroupParam.startDelete');
	},
	'/delete-param-group': ({name}) => {
		const oldValues = _.cloneDeep(prototypoStore.get('controlsValues'));

		delete oldValues.indiv_group_param[name];

		Object.keys(oldValues.indiv_glyphs).forEach((key) => {
			if (oldValues.indiv_glyphs[key] === name) {
				delete oldValues.indiv_glyphs[key];
			}
		});

		const newCurrentGroup = Object.keys(oldValues.indiv_group_param).length > 0
			? Object.keys(oldValues.indiv_group_param)[0]
			: undefined;
		const endDeletePatch = prototypoStore
			.set('indivCreate', !newCurrentGroup)
			.set('indivEdit', !!newCurrentGroup)
			.set('indivPreDelete', false)
			.set('indivCurrentGroup', newCurrentGroup)
			.set('indivErrorMessage', undefined)
			.set('indivErrorEdit', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(oldValues.indiv_group_param || {})))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', endDeletePatch);

		const patch = prototypoStore.set('controlsValues', oldValues).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		const variant = prototypoStore.get('variant');

		FontValues.save({typeface: variant.db, values: oldValues});
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
	'/save-param-group': ({name}) => {
		const oldValues = _.cloneDeep(prototypoStore.get('controlsValues'));
		const glyphSelected = _.cloneDeep(prototypoStore.get('indivSelected'));
		const currentGroup = prototypoStore.get('indivCurrentGroup');

		if (!name) {
			const patchError = prototypoStore
				.set('indivErrorEdit', 'You must provide a group name')
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
		}

		if (name !== currentGroup && Object.keys(oldValues.indiv_group_param).indexOf(name) !== -1) {
			const patchError = prototypoStore
				.set('indivErrorEdit', 'You cannot change the name to an existing group name')
				.commit();

			return localServer.dispatchUpdate('/prototypoStore', patchError);
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

		const patch = prototypoStore.set('controlsValues', oldValues).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		const indivPatch = prototypoStore
			.set('indivCurrentGroup', name)
			.set('indivEditGroup', false)
			.set('indivGlyphGrid', false)
			.set('indivErrorEdit', undefined)
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(oldValues.indiv_group_param)))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', indivPatch);
		localClient.dispatchAction('/update-font', oldValues);

		const variant = prototypoStore.get('variant');

		FontValues.save({typeface: variant.db, values: oldValues});
		Log.ui('GroupParam.saveEdit');
	},
	'/create-mode-param-group': () => {
		const values = _.cloneDeep(prototypoStore.get('controlsValues'));

		const indivPatch = prototypoStore
			.set('indivMode', true)
			.set('indivCreate', true)
			.set('indivEdit', false)
			.set('indivPreDelete', false)
			.set('indivCurrentGroup', undefined)
			.set('indivErrorMessage', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivErrorEdit', undefined)
			.set('indivSelected', [])
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(values.indiv_group_param)))
			.commit();

		localServer.dispatchUpdate('/prototypoStore', indivPatch);
		Log.ui('GroupParam.switchToCreateGroupParam');
	},
	'/edit-mode-param-group': ({group}) => {
		const values = _.cloneDeep(prototypoStore.get('controlsValues'));
		const indivPatch = prototypoStore
			.set('indivMode', true)
			.set('indivCreate', false)
			.set('indivEdit', true)
			.set('indivPreDelete', false)
			.set('indivGlyphGrid', false)
			.set('indivErrorMessage', undefined)
			.set('indivErrorGlyphs', [])
			.set('indivErrorEdit', undefined)
			.set('indivGroups', getGroupsAndGlyphsFromGroups(Object.keys(values.indiv_group_param)))
			.set('indivCurrentGroup', group)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', indivPatch);
		Log.ui('GroupParam.switchToEditGroupParam');
	},
};
