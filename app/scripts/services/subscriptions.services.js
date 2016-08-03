/* #if offline */
import HoodieApi from './fake-hoodie.services.js';
/* #end*/
/* #if prod,debug */
import HoodieApi from './hoodie.services.js';
/* #end*/

class SubscriptionService {
	static myCards() {
		return HoodieApi.startTask('cards.get');
	}

	static addCards(token) {
		return HoodieApi.startTask('cards.add',
			{
				token,
			});
	}

	static removeCards(token) {
		return HoodieApi.startTask('cards.remove',
			{
				token,
			});
	}

	static mySubscription() {
		return HoodieApi.startTask('stripe', 'subscriptions.list');
	}

	static buySubscription(plan) {
		return HoodieApi.startTask('stripe:add',
			{
				plan,
			});
	}

	static deleteSubscription(subscriptionId) {
		return HoodieApi.startTask('subscription.remove',
			{
				subscriptionId,
			});
	}
}

export {
	SubscriptionService,
};
