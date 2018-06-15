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
const actions = require('scripts/actions/export.actions.jsx').default;
const setupFluxActionTest = require('prototypo-flux-testing');

jest.mock('scripts/services/hoodie.services.js', () => ({}));

describe('export', () => {
	setupFluxActionTest(actions, LocalServer, LocalClient, stores);
	const appValues = require('scripts/helpers/loadValues.helpers.js')
		.valuesToLoad;
	const localClient = LocalClient.instance();
	const localServer = LocalServer.instance;

	beforeEach(() => {
		localServer.dispatchUpdate = jest.fn();
		stores.prototypoStore.commit = jest.fn();
		stores.prototypoStore.set = jest.fn(() => stores.prototypoStore);
	});

	it('should set exporting to the correct value', () => {
		localClient.dispatchAction('/exporting', {exporting: true});
		expect(stores.prototypoStore.set.mock.calls.length).toBe(2);
		expect(stores.prototypoStore.set.mock.calls[0][0]).toBe('export');
		expect(stores.prototypoStore.set.mock.calls[0][1]).toBe(true);
		expect(stores.prototypoStore.commit.mock.calls.length).toBe(1);

		localClient.dispatchAction('/exporting', {exporting: false});
		expect(stores.prototypoStore.set.mock.calls.length).toBe(4);
		expect(stores.prototypoStore.set.mock.calls[2][0]).toBe('export');
		expect(stores.prototypoStore.set.mock.calls[2][1]).toBe(false);
		expect(stores.prototypoStore.commit.mock.calls.length).toBe(2);
	});

	it('should set errorExport to the correct value', () => {
		localClient.dispatchAction('/exporting', {errorExport: {message: 'hello'}});
		expect(stores.prototypoStore.set.mock.calls.length).toBe(2);
		expect(stores.prototypoStore.set.mock.calls[1][0]).toBe('errorExport');
		expect(stores.prototypoStore.set.mock.calls[1][1].message).toBe('hello');
		expect(stores.prototypoStore.commit.mock.calls.length).toBe(1);

		localClient.dispatchAction('/exporting', {errorExport: undefined});
		expect(stores.prototypoStore.set.mock.calls.length).toBe(4);
		expect(stores.prototypoStore.set.mock.calls[3][0]).toBe('errorExport');
		expect(stores.prototypoStore.set.mock.calls[3][1]).toBe(undefined);
		expect(stores.prototypoStore.commit.mock.calls.length).toBe(2);
	});

	it('should export an otf', () => {});
});
