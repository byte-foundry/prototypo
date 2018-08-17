export default {
	validateCoupon({coupon}) {
		if (coupon !== 'COUPON') {
			const error = new Error(`No such coupon: ${coupon}`);

			error.type = 'StripeInvalidRequestError';

			return Promise.reject(error);
		}

		return {
			label: 'Coupon ok',
			percent_off: 10,
		};
	},
};
