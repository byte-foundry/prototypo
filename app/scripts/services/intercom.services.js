import HoodieApi from './hoodie.services.js';

import LocalClient from '../stores/local-client.stores.jsx';

export default class IntercomRest {
	static getTags() {
		const appId = 'mnph1bst';
		const readOnlyApi = 'ro-47b77aa6e0506ac7bdaf1d51794e28e9d6f545df';
		fetch(`https://${appId}:${readOnlyApi}@api.intercom.io/users?email${HoodieApi.instance.email}`,
			  {
				  headers: {
					  'Accept': 'application/json',
				  }
			})
		.then((data) => {
				const client = LocalClient.instance();
				client.dispatchAction('/load-intercom-info',data);
			});
	}
}
