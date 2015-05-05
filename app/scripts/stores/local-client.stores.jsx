import {Client} from 'nexus-flux/adapters/Local';

export default class LocalClient {
	constructor(server) {
		if (!LocalClient.instance) {
			LocalClient.instance = new Client(server)
		} else if (server) {
			throw new Error('You cannot instantiate the local client with a server twice');
		}
	}

	get instance() {
		return LocalClient.instance;
	}
}
