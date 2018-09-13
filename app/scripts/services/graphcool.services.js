import {ApolloClient, createBatchingNetworkInterface} from 'react-apollo';

import isProduction from '../helpers/is-production.helpers';

const networkInterface = createBatchingNetworkInterface({
	uri: `https://api.graph.cool/simple/v1/prototypo${
		isProduction() ? '' : '-new-dev'
	}`,
	batchInterval: 10,
});

networkInterface.use([
	{
		applyBatchMiddleware(req, next) {
			if (!req.options.headers) {
				req.options.headers = {};
			}

			// get the authentication token from local storage if it exists
			if (localStorage.getItem('graphcoolToken')) {
				req.options.headers.authorization = `Bearer ${localStorage.getItem(
					'graphcoolToken',
				)}`;
			}
			next();
		},
	},
]);

const apolloClient = new ApolloClient({
	networkInterface,
	dataIdFromObject: o => o.id,
	connectToDevTools: true,
});

export const tmpUpload = async (file, name = 'font') => {
	const data = new FormData();

	data.append('filename', name);
	data.append('data', file);

	const response = await fetch(
		'https://api.graph.cool/file/v1/ciz3x8qbba0ni0192kaicafgo',
		{
			method: 'POST',
			body: data,
		},
	);

	return response.json();
};

export default apolloClient;
