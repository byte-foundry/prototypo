import HoodieApi from './hoodie.services.js';

import LocalClient from '../stores/local-client.stores.jsx';


function values(prefix) {
	return {
		get(params) {
			if (location.hash.indexOf('#/replay') === -1) {
				return HoodieApi.instance.store.find(`${prefix}values`, `${params.typeface}`)
					.then((data) => {
						const client = LocalClient.instance();

						client.dispatchAction('/store-in-debug-font', {prefix, typeface: params.typeface, data});
						return data;
					});
			}
			else {
				return new Promise(async (resolve, reject) => {
					const client = LocalClient.instance();
					const valuesFetched = await client.fetch('/debugStore');

					if (valuesFetched.get('values')[prefix][params.typeface]) {
						setTimeout(() => {
							resolve(valuesFetched.get('values')[prefix][params.typeface]);
						}, 500);
					}
					else {
						reject();
					}
				});
			}
		},
		getWithPouch(params) {
			if (location.hash.indexOf('#/replay') === -1) {
				return HoodieApi.instance.pouch.find(`${prefix}values/${params.typeface}`);
			}
		},
		save(params) {
			if (location.hash.indexOf('#/replay') === -1 && HoodieApi.isLoggedIn()) {
				return HoodieApi.instance.store.updateOrAdd(`${prefix}values`, `${params.typeface}`, {
						values: params.values,
				});
			}
			return true;
		},
		clear() {
			return HoodieApi.instance.store.removeAll(`${prefix}values`);
		},
		deleteDb(params) {
			return HoodieApi.instance.store.remove(`${prefix}values`, `${params.typeface}`);
		},
	};
}

export const AppValues = values('newapp');
export const AccountValues = values('account');
export const FontValues = values('newfont');
export const FontInfoValues = values('fontinfos');
export const UserValues = values('userinfos');
