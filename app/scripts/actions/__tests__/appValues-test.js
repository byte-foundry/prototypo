jest.autoMockOff();
window.Hoodie = jest.genMockFunction();
window._ = require('lodash');
const Remutable = require('remutable').default;

const prototypoStore = new Remutable({});
const userStore = new Remutable({});
const stores = {
	default: {
		'/prototypoStore': prototypoStore,
		'/userStore': userStore,
	},
	prototypoStore,
	userStore,
};

jest.setMock('scripts/stores/creation.stores.jsx', stores);
const LocalServer = require('scripts/stores/local-server.stores.jsx').default;
const LocalClient = require('scripts/stores/local-client.stores.jsx').default;
const actions = require('scripts/actions/appValues.actions.jsx').default;
const setupFluxActionTest = require('prototypo-flux-testing');

describe('appValues', () => {
	setupFluxActionTest(actions, LocalServer, LocalClient, stores);
	const appValues = require('scripts/helpers/loadValues.helpers.js')
		.valuesToLoad;
	const localClient = LocalClient.instance();
	const localServer = LocalServer.instance;

	beforeEach(() => {
		localServer.dispatchUpdate = jest.fn();
		stores.prototypoStore.commit = jest.fn();
		stores.prototypoStore.set = jest.fn();
		stores.userStore.commit = jest.fn();
		stores.userStore.set = jest.fn(() => stores.userStore);
	});

	it('should load values properly', () => {
		localClient.dispatchAction('/load-app-values', {values: {}});
		expect(stores.prototypoStore.commit.mock.calls.length).toBe(1);
		expect(stores.prototypoStore.set.mock.calls.length).toBe(appValues.length);
		_.each(appValues, (value, i) => {
			expect(stores.prototypoStore.set.mock.calls[i][0]).toBe(value.local);
		});
		expect(localServer.dispatchUpdate.mock.calls[0][0]).toBe('/prototypoStore');
	});
});
