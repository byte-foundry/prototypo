import Hoodie from 'hoodie';

// const hoodie = new Hoodie('https://prototypo.appback.com');

function values(prefix) {
	return {
		get(params) {
			return hoodie.store.find(prefix + 'values', params.typeface)
				.then(function(object) {
					return object.values;
				});
		},
		save(params) {
			return hoodie.store.updateOrAdd(prefix + 'values', params.typeface,{
					values: params.values
				});
		},
		clear() {
			return hoodie.store.removeAll(prefix + 'values');
		}
	}
}

export default {
	AppValues: values('app'),
	FontValues: values('font'),
}
