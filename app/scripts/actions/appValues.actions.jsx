import {glyphs, fontTab, tagStore, commits, fontLibrary, fontVariant, searchStore, panel, userStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import {saveAppValues} from '../helpers/loadValues.helpers.js';
import {Commits} from '../services/commits.services.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
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

		const valuesLoadedEvent = new Event('appValues.loaded');
		window.dispatchEvent(valuesLoadedEvent);
	},
	'/load-commits': async () => {

		const repos = ['prototypo', 'john-fell.ptf', 'venus.ptf', 'elzevir.ptf'];

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
	'/load-account-values': (values) => {
		const patch = userStore.set('infos', values.values || {}).commit();

		localServer.dispatchUpdate('/userStore', patch);
	},
};
