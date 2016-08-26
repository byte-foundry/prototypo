jest.autoMockOff();
window.Hoodie = jest.genMockFunction();
window._ = require('lodash');
var Remutable = require('remutable').default;
var prototypoStore = new Remutable({});
var userStore = new Remutable({});
var stores = {
	default: {
		'/prototypoStore': prototypoStore,
		'/userStore': userStore,
	},
	prototypoStore,
	userStore,
};
jest.setMock('scripts/stores/creation.stores.jsx', stores)
var LocalServer = require('scripts/stores/local-server.stores.jsx').default;
var LocalClient = require('scripts/stores/local-client.stores.jsx').default;
var actions = require('scripts/actions/appValues.actions.jsx').default;
var setupFluxActionTest = require('prototypo-flux-testing');

describe('appValues', function() {

	setupFluxActionTest(actions, LocalServer, LocalClient, stores);
	var appValues = require('scripts/helpers/loadValues.helpers.js').valuesToLoad;
	var localClient = LocalClient.instance();
	var localServer = LocalServer.instance;

	beforeEach(() => {
		localServer.dispatchUpdate = jest.fn();
		stores.prototypoStore.commit = jest.fn();
		stores.prototypoStore.set = jest.fn();
		stores.userStore.commit = jest.fn();
		stores.userStore.set = jest.fn(() => {
			return stores.userStore;
		});
	});

	it('should load values properly', function() {
		localClient.dispatchAction('/load-app-values', {values: {}});
		expect(stores.prototypoStore.commit.mock.calls.length).toBe(1);
		expect(stores.prototypoStore.set.mock.calls.length).toBe(appValues.length);
		_.each(appValues, (value, i) => {
			expect(stores.prototypoStore.set.mock.calls[i][0]).toBe(value.local);
		});
		expect(localServer.dispatchUpdate.mock.calls[0][0]).toBe('/prototypoStore');
	});

	it('should load account values properly', function() {
		var values = {
			values: {
				'first': 'exactly',
			}
		};
		localClient.dispatchAction('/load-account-values', values);

		expect(stores.userStore.commit.mock.calls.length).toBe(1);
		expect(stores.userStore.set.mock.calls.length).toBe(1);
		expect(stores.userStore.set.mock.calls[0][0]).toBe('infos');
		expect(stores.userStore.set.mock.calls[0][1]).toBe(values.values);
		expect(localServer.dispatchUpdate.mock.calls[0][0]).toBe('/userStore');
	});

	it('should load an empty object account values', function() {
		localClient.dispatchAction('/load-account-values', {values: undefined});
		expect(stores.userStore.set.mock.calls.length).toBe(1);
		expect(stores.userStore.set.mock.calls[0][1]).toEqual({});
	});
});
