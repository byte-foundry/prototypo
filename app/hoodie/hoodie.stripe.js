function stripeAPI(hoodie) {
	hoodie.stripe = {
		apiUrl: '/_plugins/stripe-subscriptions/_api',
		customers: {
			create: requester('customers.create'),
			update: requester('customers.update'),
			retrieve: requester('customers.retrieve'),
			// updateSubscription is mostly an alias to update, but only this
			// method can be used to cancel a subscription
			updateSubscription: requester('customers.updateSubscription'),
		},
		credits: {
			buy: requester('credits.buy'),
			spend: requester('credits.spend'),
		},
		invoices: {
			retrieveUpcoming: requester('invoices.retrieveUpcoming'),
		},
	};

	function requester(method) {
		return (...args) => {
			return hoodie.request('post', hoodie.stripe.apiUrl, {
					contentType: 'application/json',
					dataType: 'json',
					xhrFields: {
						withCredentials: false,
					},
					data: JSON.stringify({
						method,
						args,
					}),
				});
		};
	}

	return hoodie.stripe;
}

if (typeof Hoodie !== 'undefined') {
	Hoodie.extend(stripeAPI);
}
else if (typeof global !== 'undefined') {
	module.exports = global.Hoodie.extend(stripeAPI);
}
