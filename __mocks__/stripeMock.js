function mockStripe() {
	class Element {
		mount = jest.fn();
		update = jest.fn();
		destroy = jest.fn();
		on = jest.fn();
	}
	const elements = {
		create: jest.fn().mockImplementation(() => new Element()),
	};
	const stripe = {
		elements: jest.fn().mockReturnValue(elements),
		createToken: jest.fn(),
		createSource: jest.fn(),
	};

	function Stripe(key) {
		stripe.key = key;
		return stripe;
	}
	return {elements, stripe, Stripe};
}

global.Stripe = mockStripe().Stripe;
