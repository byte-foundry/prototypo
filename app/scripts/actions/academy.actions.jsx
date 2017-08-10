import cloneDeep from 'lodash/cloneDeep';

import {prototypoStore} from '../stores/creation.stores';
import LocalServer from '../stores/local-server.stores';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/mark-part-as-read': ({course, part}) => {
		const academyProgress = cloneDeep(prototypoStore.get('academyProgress')) || {};

		const readPart = academyProgress[course].parts.find(elem => elem.name === part);

		if (readPart) {
			readPart.completed = !readPart.completed;
		}

		const partsDone = academyProgress[course].parts.filter(elem => elem.completed === true);

		if ((partsDone && partsDone.length === academyProgress[course].parts.length) || !part) {
			academyProgress.lastCourse = undefined;
			academyProgress[course].completed = true;
			window.Intercom('trackEvent', `finishedAcademyCourse-${course}`);
		}
		else {
			academyProgress.lastCourse = course;
		}
		const patch = prototypoStore.set('academyProgress', academyProgress).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/create-course-progress': ({slug, name, parts}) => {
		const academyProgress = cloneDeep(prototypoStore.get('academyProgress')) || {};

		if (!academyProgress[slug]) {
			academyProgress[slug] = {
				parts,
				rewarded: false,
				name,
				slug,
				completed: false,
			};
		}
		const patch = prototypoStore.set('academyProgress', academyProgress).commit();

		localServer.dispatchUpdate('/userStore', patch);
	},
	'/set-course-currently-reading': (course) => {
		const academyProgress = cloneDeep(prototypoStore.get('academyProgress')) || {};

		academyProgress.lastCourse = course;
		const patch = prototypoStore.set('academyProgress', academyProgress).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/set-all-course-read': () => {
		const academyProgress = cloneDeep(prototypoStore.get('academyProgress')) || {};

		if (!academyProgress.areAllCourseRead) {
			window.Intercom('trackEvent', 'finishedAllCourses');
			academyProgress.areAllCourseRead = true;
		}
		const patch = prototypoStore.set('academyProgress', academyProgress).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
};
