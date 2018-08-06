import Lifespan from 'lifespan';

import hashHistory from '../services/history.services';
import {userStore, prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import getCurrency from '../helpers/currency.helpers.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localServer = LocalServer.instance;

	localClient = LocalClient.instance();
	localClient.lifespan = new Lifespan();
});

/**
 *	Spend credits via hoodie api
 *	@param {object} options - the options of the transaction
 *	@param {number} options.amout - amount of credits to be spent
 *	@returns {promise} promise containing response from hoodie credits spending or an error
 */
function spendCredits({amount}) {
	return new Promise(async (resolve, reject) => {
		if (parseInt(amount) > 0) {
			const {metadata: {credits}} = await HoodieApi.spendCredits({amount});

			const patch = prototypoStore.set('credits', credits).commit();

			localServer.dispatchUpdate('/prototypoStore', patch);

			return resolve({credits});
		}
		reject();
	});
}

const validateCoupon = debounce(
	options => localClient.dispatchAction('/validate-coupon', options),
	500,
);

export default {
	'/load-customer-data': ({sources, subscriptions, metadata}) => {
		const userPatch = userStore
			.set('subscription', subscriptions.data[0])
			.set('cards', sources.data)
			.commit();

		const creditsPatch = prototypoStore
			.set('credits', parseInt(metadata.credits, 10) || 0)
			.commit();

		localServer.dispatchUpdate('/userStore', userPatch);
		localServer.dispatchUpdate('/prototypoStore', creditsPatch);
	},
	'/load-customer-invoices': async () => {
		const invoices = await HoodieApi.getInvoiceList();

		localClient.dispatchAction('/set-customer-invoices', invoices);
	},
	'/set-customer-invoices': (invoices) => {
		const patch = userStore.set('invoices', invoices).commit();

		localServer.dispatchUpdate('/userStore', patch);
	},
	'/clean-form': (formName) => {
		const form = userStore.get(formName);

		form.errors = [];
		form.inError = {};
		form.loading = false;
		form.success = undefined;

		const patch = userStore.set(formName, form).commit();

		localServer.dispatchUpdate('/userStore', patch);
	},
	'/clean-data': () => {
		const prototypatch = prototypoStore.set('credits', 0).commit();

		localServer.dispatchUpdate('/prototypoStore', prototypatch);

		const userPatch = userStore
			.set('subscription', undefined)
			.set('cards', undefined)
			.commit();

		localServer.dispatchUpdate('/userStore', userPatch);
	},
	'/choose-plan': ({plan, coupon}) => {
		const form = userStore.get('choosePlanForm');

		delete form.error;
		delete form.validCoupon;
		delete form.couponError;

		if (plan) {
			form.selected = plan;
			window.Intercom('trackEvent', `chosePlan${plan}`);
		}

		if (coupon !== undefined) {
			form.couponValue = coupon;
		}

		if (form.selected && form.couponValue !== undefined) {
			delete form.validCoupon;
			delete form.couponError;
			validateCoupon({
				plan: form.selected,
				coupon: form.couponValue,
			});
		}

		const patch = userStore.set('choosePlanForm', form).commit();

		return localServer.dispatchUpdate('/userStore', patch);
	},
	'/validate-coupon': async ({plan, coupon}) => {
		const form = userStore.get('choosePlanForm');

		try {
			form.validCoupon = await HoodieApi.validateCoupon({
				coupon,
				plan,
			});
		}
		catch (err) {
			form.couponError = err.message;
		}

		const patch = userStore.set('choosePlanForm', form).commit();

		return localServer.dispatchUpdate('/userStore', patch);
	},
	'/confirm-plan': ({
		plan,
		pathQuery = {pathname: '/account/create/add-card'},
	}) => {
		const form = userStore.get('choosePlanForm');

		form.error = undefined;
		form.loading = true;
		const cleanPatch = userStore.set('choosePlanForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		try {
			if (!plan) {
				throw new Error('You must select a plan');
			}

			if (form.couponValue && !form.validCoupon) {
				throw new Error(form.couponError || 'Coupon code is invalid');
			}
		}
		catch ({message}) {
			form.loading = false;
			form.error = message;
			const patch = userStore.set('choosePlanForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		form.loading = false;
		const patch = userStore.set('choosePlanForm', form).commit();

		localServer.dispatchUpdate('/userStore', patch);

		if (form.validCoupon && form.validCoupon.shouldSkipCard) {
			hashHistory.push({
				pathname: '/account/create/confirmation',
			});
		}
		else {
			hashHistory.push(pathQuery);
		}
	},
	'/spend-credits': async (options) => {
		const {credits} = await spendCredits(options);

		localClient.dispatchAction('/store-value', {
			spendCreditsNewCreditAmount: credits,
		});
		window.Intercom('update', {
			export_credits: credits,
		});
	},
};
