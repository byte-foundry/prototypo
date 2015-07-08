import {Server} from 'nexus-flux/src/adapters/Local';

export default class LocalServer {
	constructor(stores) {
		if (!LocalServer.instance) {
			LocalServer.instance = new Server(stores);
		}
		else if (stores) {
			throw new Error('You cannot create a LocalServer twice');
		}
	}

	get instance() {
		return LocalServer.instance;
	}
}
