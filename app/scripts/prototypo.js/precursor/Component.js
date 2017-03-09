import {constantOrFormula} from '../helpers/values.js';

export default class Component {
	constructor(source, cursor) {
		if (Array.isArray(source.base)) {
			this.base = _.map(source.base, (base) => {
				return constantOrFormula(base);
			});
		}
		else {
			this.base = [constantOrFormula(source.base)];
		}

		this.id = constantOrFormula(source.id);
		this.anchors = (source.anchor || []).map((item, i) => {
			return _.mapValues(item, (props, name) => {
				return constantOrFormula(props, `${cursor}.anchors.${i}.${name}`);
			});
		});

	}
}
