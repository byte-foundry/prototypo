import {gql} from 'react-apollo';
import HoodieApi from './hoodie.services.js';

import LocalClient from '../stores/local-client.stores.jsx';

import apolloClient from './graphcool.services';

function values(prefix) {
	return {
		get(params) {
			console.log('get values', prefix, params);
			if (prefix === 'newfont' || params.variantId) {
				return apolloClient.query({
					fetchPolicy: 'network-only',
					query: gql`
						query getValues($id: ID!) {
							Variant(id: $id) {
								id
								values
							}
						}
					`,
					variables: {id: params.variantId},
				})
				.then(({data}) => {
					console.log('get values from gc', data);
					return data.Variant;
				})
				.catch(e => console.log('oops', e));
			}
			if (prefix === 'newapp') {
				apolloClient.query({
					fetchPolicy: 'cache-first',
					query: gql`
						query getUserId {
							user {
								id
								values: appValues
							}
						}
					`,
				})
				.then(({data}) => {
					console.log('get app values from gc', data);
					return data.user;
				})
				.catch(e => console.log('oops', e));
			}
			// return HoodieApi.instance.store.find(`${prefix}values`, `${params.typeface}`)
			// 	.then((data) => {
			// 		if (LocalClient.serverInstance) {
			// 			const client = LocalClient.instance();

			// 			client.dispatchAction('/store-in-debug-font', {prefix, typeface: params.typeface, data});
			// 		}
			// 		console.log('get values data', data);
			// 		return data;
			// 	});
		},
		getWithPouch(params) {
			console.log('getWithPouch values', prefix, params);
			// if (location.hash.indexOf('#/replay') === -1) {
			// 	return HoodieApi.instance.pouch.find(`${prefix}values/${params.typeface}`);
			// }
		},
		save(params) {
			console.log('save values', prefix, params);
			if (prefix === 'newfont' && params.variantId) {
				apolloClient.mutate({
					mutation: gql`
						mutation updateFontValues($id: ID!, $values: Json!) {
							updateVariant(id: $id, values: $values) {
								id
							}
						}
					`,
					variables: {
						id: params.variantId,
						values: params.values,
					},
				})
				.then(d => console.log('save font values to gc', d))
				.catch(e => console.log('oops', e))
			}
			if (prefix === 'newapp') {
				apolloClient.query({
					fetchPolicy: 'cache-first',
					query: gql`
						query getUserId {
							user {
								id
							}
						}
					`,
				}).then(({data: {user}}) => {
					apolloClient.mutate({
						mutation: gql`
							mutation updateAppValues($id: ID!, $values: Json!) {
								updateUser(id: $id, appValues: $values) {
									id
								}
							}
						`,
						variables: {
							id: user.id,
							values: params.values,
						},
					})
					.then(d => console.log('save app values to gc', d))
					.catch(e => console.log('oops', e))
				});
			}
			// if (location.hash.indexOf('#/replay') === -1 && HoodieApi.isLoggedIn()) {
			// 	return HoodieApi.instance.store.updateOrAdd(`${prefix}values`, `${params.typeface}`, {
			// 		values: params.values,
			// 	});
			// }
			return true;
		},
		deleteDb(params) {
			// console.log('deleteDb values', prefix, params);
			// return HoodieApi.instance.store.remove(`${prefix}values`, `${params.typeface}`);
		},
	};
}

export const AppValues = values('newapp');
export const FontValues = values('newfont');
