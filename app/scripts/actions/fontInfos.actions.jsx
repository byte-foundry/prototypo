import {fontInfos} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';

const localServer = LocalServer.instance;

export default {
	'/load-font-infos': ({altList}) => {
		const patch = fontInfos.set('altList', altList).commit();

		localServer.dispatchUpdate('/fontInfos', patch);
	},
};
