import React from 'react';
import Client from 'nexus-flux-socket.io/src/client';
import Lifespan from 'lifespan';
import HoodieApi from '../services/hoodie.services.js';

export default class RemoteClient {
	static createClient(name, address) {
		if (!RemoteClient.clients) {
			RemoteClient.clients = {};
		}

		RemoteClient.clients[name] = new Client(address);
	}

	static initRemoteStore(type, storeId, name) {
		if (!RemoteClient.storesList) {
			RemoteClient.storesList = {};
		}

		RemoteClient.storesList[name] = storeId;
		return HoodieApi.startTask(type, 'create-store', {storeId});
	}
}
