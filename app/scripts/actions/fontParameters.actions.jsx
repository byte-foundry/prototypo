import {prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/load-params': ({controls, presets}) => {
		const patch = prototypoStore
			.set('fontParameters', controls)
			.set('fontPresets', presets)
			.commit();

		localServer.dispatchUpdate('/prototypoStore', patch);
	},
};
