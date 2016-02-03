import {fontParameters} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';

const localServer = LocalServer.instance;

export default {
	'/load-params': ({controls, presets}) => {
		const patch = fontParameters
			.set('parameters', controls)
			.set('presets', presets)
			.commit();

		localServer.dispatchUpdate('/fontParameters', patch);
	},
};
