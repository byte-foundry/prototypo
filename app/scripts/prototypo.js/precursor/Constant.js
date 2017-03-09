export default class Constant {
	constructor(value, cursor) {
		this.cursor = cursor;
		this.value = value;
	}

	analyzeDependency() {
		return;
	}

	getResult() {
		return this.value;
	}

	getNecessaryOperation() {
		return [];
	}

	solveOperationOrder(glyph, operationOrder) {
		let result = [];

		if(operationOrder.indexOf(this.cursor) === -1) {
			result.push(this.cursor);
		}

		return result;
	}
}
