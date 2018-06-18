import {Client} from 'nexus-flux';

export default class LocalClient {
	static setup(server) {
		if (!LocalClient.ServerInstance) {
			LocalClient.ServerInstance = server;
		}
		else if (server) {
			throw new Error(
				'You cannot instantiate the local client with a server twice',
			);
		}
	}

	static instance() {
		return new Client(LocalClient.ServerInstance);
	}
}
