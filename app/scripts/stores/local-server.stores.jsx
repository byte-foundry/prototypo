import {Server} from 'nexus-flux';

export default class LocalServer {
	constructor(stores, logStore) {
		if (!LocalServer.instance) {
			LocalServer.instance = new Server(stores, logStore);
		}
		else if (stores) {
			throw new Error('You cannot create a LocalServer twice');
		}
	}

	get instance() {
		return LocalServer.instance;
	}
}
