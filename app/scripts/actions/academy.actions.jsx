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

		const readPart = academyProgress[course].parts.find((elem) => {
			return elem.name === part;
		});

		readPart.completed = true;

		academyProgress.lastCourse = course;
		_infos = {
			..._infos,
			academyProgress,
		};
		const patch = userStore.set('infos', _infos).commit();

		localServer.dispatchUpdate('/userStore', patch);
		//saveAppValues(appValuesLoaded);
	},
	'/create-course-progress': ({slug, name, parts}) => {
		let _infos = _.cloneDeep(userStore.get('infos'));
		const academyProgress = _infos.academyProgress || {};

		if (!academyProgress[slug]) {
			academyProgress[slug] = {
				parts,
				rewarded: false,
				name,
				slug,
			};
		}
		_infos = {
			..._infos,
			academyProgress,
		};
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
