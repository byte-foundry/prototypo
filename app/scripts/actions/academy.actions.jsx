import {prototypoStore, userStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/mark-part-as-read': ({course, part}) => {
		let _infos = _.cloneDeep(userStore.get('infos'));
		const academyProgress = _infos.academyProgress || {};

		academyProgress[course] ? academyProgress[course].parts.push(part) : academyProgress[course] = {
			parts: [part],
			partCount: 1,
			rewarded: false,
		};
		_infos = {
			..._infos,
			academyProgress,
		};
		const patch = userStore.set('infos', _infos).commit();

		localServer.dispatchUpdate('/userStore', patch);
		//saveAppValues(appValuesLoaded);
	},
	'/create-course-progress': ({course, partCount}) => {
		let _infos = _.cloneDeep(userStore.get('infos'));
		const academyProgress = _infos.academyProgress || {};

		if (!academyProgress[course]) {
			academyProgress[course] = {
				parts: [],
				partCount,
				rewarded: false,
			};
		}
		_infos = {
			..._infos,
			academyProgress,
		};
		console.log(academyProgress);
		const patch = userStore.set('infos', _infos).commit();

		localServer.dispatchUpdate('/userStore', patch);
		//saveAppValues(appValuesLoaded);
	},
	//debugging purposes only, to be removed ASAP
	'/remove-all-progress': () => {
		let _infos = _.cloneDeep(userStore.get('infos'));
		const academyProgress = {};

		_infos = {
			..._infos,
			academyProgress,
		};

		const patch = userStore.set('infos', _infos).commit();

		localServer.dispatchUpdate('/userStore', patch);
		//saveAppValues(appValuesLoaded);
	},
};
