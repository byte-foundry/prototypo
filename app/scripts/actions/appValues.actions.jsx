import {prototypoStore, userStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import {saveAppValues, valuesToLoad} from '../helpers/loadValues.helpers.js';
import {Commits} from '../services/commits.services.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', () => {
	localClient = LocalClient.instance();
	localServer = LocalServer.instance;
});

export default {
	'/load-app-values': ({values}) => {
		//TODO(franz): merge all the patch
		values.selected = values.selected || 'A'.charCodeAt(0);
		values.tab = values.tab || 'Func';
		values.pinned = values.pinned || [];
		values.tagSelected = values.tagSelected || 'all';
		values.library = values.library || [];
		values.mode = values.mode || ['glyph'];
		values.wordFontSize = values.wordFontSize || 1;
		values.textFontSize = values.textFontSize || 1;

		_.forEach(valuesToLoad, (ref) => {
			prototypoStore.set(ref.local, values[ref.remote]);
		});

		const patch = prototypoStore.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);

		const valuesLoadedEvent = new Event('appValues.loaded');

		window.dispatchEvent(valuesLoadedEvent);
	},
	'/load-commits': async () => {

		const repos = ['prototypo', 'john-fell.ptf', 'venus.ptf', 'elzevir.ptf'];

		try {
			const lastcommitsJSON = await Promise.all(repos.map((repo) => {
				return Commits.getCommits(repo);
			}));

			localClient.dispatchAction('/load-commits-post', lastcommitsJSON);
		}
		catch (err) {
			const patch = prototypoStore.set('error', 'Cannot get commit').commit();

			localServer.dispatchUpdate('/prototypoStore', patch);
		}
	},
	'/load-commits-post': (lastcommitsJSON) => {
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
		const patch = prototypoStore.set('commitsList', lastCommits).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
	'/view-commit': ({latest}) => {
		const patch = prototypoStore.set('latestCommit', latest).commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
		saveAppValues(appValuesLoaded);
	},
	'/load-account-values': (values) => {
		const patch = userStore.set('infos', values.values || {}).commit();

		localServer.dispatchUpdate('/userStore', patch);
	},
};
