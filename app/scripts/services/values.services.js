 import PouchDB from 'pouchdb';
 import HoodieApi from './hoodie.services.js';


function values(prefix) {
	return {
		get(params) {
			return HoodieApi.instance.find(`${prefix}values/${params.typeface}`);
		},
		save(params) {
			return HoodieApi.instance.updateOrAdd(`${prefix}values/${params.typeface}`,{
					values: params.values
				});
		},
		clear() {
			return HoodieApi.instance.removeAll(`${prefix}values`);
		}
	}
}

export default {
	AppValues: values('app'),
	FontValues: values('font'),
}
