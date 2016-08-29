/* globals describe, it, expect */
import Formula from '../Formula';

const baseFormula = {
	_parameters: ['allo', 'quoi'],
	_operation: 'return allo + quoi',
	_dependencies: ['yo'],
};

const baseCursor = 'cursor';

describe('Formula', () => {
	it('should create the right Formula', () => {
		const formula = new Formula(baseFormula, baseCursor);

		expect(formula.cursor).toBe(baseCursor);
		expect(formula.getResult({allo: 1, quoi: 2})).toBe(3);
	});
});
