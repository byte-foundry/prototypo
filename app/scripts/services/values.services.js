import PouchDB from 'pouchdb';
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
					const values = await client.fetch('/debugStore');
					
					if (values.values[prefix][typeface]) {
						resolve(values.values[prefix][typeface]);
					}
					else {
						reject();
					}
				});
			}
		},
		save(params) {
			if (location.hash.indexOf('#/replay') === -1) {
				return HoodieApi.instance.updateOrAdd(`${prefix}values/${params.typeface}`,{
						values: params.values
				});
			}
			return true;
		},
		clear() {
			return HoodieApi.instance.removeAll(`${prefix}values`);
		},
		deleteDb(params) {
			return HoodieApi.instance.remove(`${prefix}values/${params.typeface}`);
		}
	}
}

export default {
	AppValues: values('newapp'),
	FontValues: values('newfont'),
	FontInfoValues: values('fontinfos'),
}
