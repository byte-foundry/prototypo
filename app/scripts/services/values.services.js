/* #if offline */
import HoodieApi from '../services/fake-hoodie.services.js';
/* #end*/
/* #if prod,debug */
import HoodieApi from '../services/hoodie.services.js';
/* #end*/

import LocalClient from '../stores/local-client.stores.jsx';


function values(prefix) {
	return {
		get(params) {
			return HoodieApi.instance.store.find(`${prefix}values`, `${params.typeface}`)
				.then((data) => {
					if (LocalClient.serverInstance) {
						const client = LocalClient.instance();

						client.dispatchAction('/store-in-debug-font', {prefix, typeface: params.typeface, data});
					}
					return data;
				});
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
