import {TABLE} from './encode.js';

export function encodeTable(tableName, fields, options) {
	const tableObj = {};
	fields.forEach((field) => {
		tableObj[field.name] = field.value;
	});

	tableObj.tableName = tableName;
	tableObj.fields = fields;

	_.forOwn(options, (value, key) => {
		if (tableObj[key] === undefined) {
			tableObj[key] = value;
		}
	});

	return TABLE(tableObj);
}
