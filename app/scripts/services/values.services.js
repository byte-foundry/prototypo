import PouchDB from 'pouchdb';
import HoodieApi from './hoodie.services.js';


function values(prefix) {
	return {
		get(params) {
			return HoodieApi.instance.find(`${prefix}values/${params.typeface}`);
		},
		save(params) {
			if (location.href !== '#/replay') {
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
