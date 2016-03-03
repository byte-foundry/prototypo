import HoodieApi from './hoodie.services.js';

import LocalClient from '../stores/local-client.stores.jsx';


function values(prefix) {
	return {
		get(params) {
			if (location.hash.indexOf('#/replay') === -1) {
				return HoodieApi.instance.find(`${prefix}values/${params.typeface}`)
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
		save(params) {
			if (location.hash.indexOf('#/replay') === -1) {
				return HoodieApi.instance.updateOrAdd(`${prefix}values/${params.typeface}`, {
						values: params.values,
				});
			}
			return true;
		},
		clear() {
			return HoodieApi.instance.removeAll(`${prefix}values`);
		},
		deleteDb(params) {
			return HoodieApi.instance.remove(`${prefix}values/${params.typeface}`);
		},
	};
}

export const AppValues = values('newapp');
export const FontValues = values('newfont');
export const FontInfoValues = values('fontinfos');
