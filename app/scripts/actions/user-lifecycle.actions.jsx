import {hashHistory} from 'react-router';
import Lifespan from 'lifespan';
import debounce from 'lodash/debounce';

import {userStore, prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import {loadStuff} from '../helpers/appSetup.helpers.js';
import isProduction from '../helpers/is-production.helpers';
import getCurrency from '../helpers/currency.helpers.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localServer = LocalServer.instance;

	localClient = LocalClient.instance();
	localClient.lifespan = new Lifespan();
});

function addCard({card: {fullname, number, expMonth, expYear, cvc}, vat}) {
	const form = userStore.get('addcardForm');

	form.errors = [];
	form.inError = {};
	form.loading = true;
	const cleanPatch = userStore.set('addcardForm', form).commit();

	localServer.dispatchUpdate('/userStore', cleanPatch);
	return new Promise((resolve, reject) => {
		window.Stripe.card.createToken(
			{
				number,
				cvc,
				exp_month: expMonth,
				exp_year: expYear,
				name: fullname,
			},
			async (status, data) => {
				if (data.error) {
					form.loading = false;
					form.errors.push(data.error.message);
					const patch = userStore.set('addcardForm', form).commit();

					localServer.dispatchUpdate('/userStore', patch);
					reject(data.error.message);
				}

				// TODO : GraphQL request to get the VAT

				try {
					const response = await HoodieApi.updateCustomer({
						business_vat_id: vat, // Stripe way of storing VAT
						source: data.id,
						metadata: {
							vat_number: vat, // Quaderno way of reading VAT
						},
					});

					/* DEPRECATED Backward compatibility, should be removed when every component uses the cards property in userStore */
					let patch = userStore.set('cards', response.sources.data).commit();

					localServer.dispatchUpdate('/userStore', patch);

					form.loading = false;
					patch = userStore.set('addcardForm', form).commit();
					localServer.dispatchUpdate('/userStore', patch);

					resolve(data.card);
				}
				catch (err) {
					form.loading = false;
					form.errors.push(err);
					const patch = userStore.set('addcardForm', form).commit();

					localServer.dispatchUpdate('/userStore', patch);
					reject(err);
				}
			},
		);
	});
}

/**
 *	Spend credits via hoodie api
 *	@param {object} options - the options of the transaction
 *	@param {number} options.amout - amount of credits to be spent
 *	@returns {promise} promise containing response from hoodie credits spending or an error
 */
function spendCredits({amount}) {
	return new Promise(async (resolve, reject) => {
		if (parseInt(amount) > 0) {
			const {
				metadata: {credits},
			} = await HoodieApi.spendCredits({amount});

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
			.set('hasBeenSubscribing', metadata.hasBeenSubscribing || false)
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
			.set('hasBeenSubscribing', undefined)
			.commit();

		localServer.dispatchUpdate('/userStore', userPatch);
	},
	'/sign-up': async ({
		username,
		password,
		firstname,
		lastname,
		css = {},
		phone,
		skype,
		to = '/library/home',
		oldQuery = {},
	}) => {
		const toLocation = {
			pathname: to,
			query: oldQuery,
		};
		const form = userStore.get('signupForm');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('signupForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		// Check each input for error
		if (!username || !password || !firstname) {
			form.inError = {
				username: !username,
				password: !password,
				firstname: !firstname,
			};
			form.errors.push('Fields with a * are required');
			form.loading = false;
			const patch = userStore.set('signupForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}
		if (!/\S+?@\S+?\.\S+?/.test(username)) {
			form.inError = {
				username: true,
			};
			form.errors.push('Your email is invalid');
		}

		if (password.length < 8) {
			// password is not long enough
			form.inError = {
				password: true,
			};
			form.errors.push('Your password must be at least 8 character long');
		}

		if (form.errors.length > 0) {
			form.loading = false;
			const patch = userStore.set('signupForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		const curedLastname = lastname ? ` ${lastname}` : '';

		try {
			await HoodieApi.signUp(username.toLowerCase(), password, firstname, {
				lastName: lastname,
				occupation: css.value,
				phone,
				skype,
			});

			HoodieApi.setup();

			window.Intercom('boot', {
				app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
				email: username,
				name: firstname + curedLastname,
				occupation: css.value,
				phone: phone || undefined, // avoid empty string being recorded into Intercom
				skype,
				ABtest: Math.floor(Math.random() * 100),
				widget: {
					activator: '#intercom-button',
				},
			});

			form.errors = [];
			form.inError = {};
			form.loading = false;
			const endPatch = userStore.set('signupForm', form).commit();

			HoodieApi.instance.email = username;
			fbq('track', 'Lead');
			localServer.dispatchUpdate('/userStore', endPatch);

			if (
				toLocation.pathname === '/dashboard'
				|| toLocation.pathname === '/library/home'
			) {
				await loadStuff();
				hashHistory.push(toLocation);
			}
			else {
				hashHistory.push(toLocation);
			}
		}
		catch (err) {
			trackJs.track(err);
			form.errors.push(err.message);
			form.loading = false;
			const patch = userStore.set('signupForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}
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
	'/add-card': async (options) => {
		const toPath = {
			pathname: options.pathQuery.path || '/account/profile',
			query: options.pathQuery.query,
		};

		await addCard(options);
		hashHistory.push(toPath);
	},
	'/confirm-buy': async ({plan, card, pathname, quantity}) => {
		const form = userStore.get('confirmation');

		const hasBeenSubscribing = userStore.get('hasBeenSubscribing');
		const coupon = userStore.get('choosePlanForm').couponValue;
		const validCoupon = userStore.get('choosePlanForm').validCoupon || {};
		const {fullname, number, expMonth, expYear, cvc} = card || {};

		form.errors = [];
		form.loading = true;
		const cleanPatch = userStore.set('confirmation', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		const cards = userStore.get('cards');
		let cardCountry = cards[0] ? cards[0].country : undefined;

		if (
			!cardCountry
			&& !validCoupon.shouldSkipCard
			&& (!fullname || !number || !expMonth || !expYear || !cvc)
		) {
			const requiredFields = [fullname, number, expMonth, expYear, cvc];
			const errorText
				= requiredFields.reduce((sum, field) => sum + !!field).length > 1
					? 'These fields are'
					: 'This field is';

			form.errors.push(`${errorText} required`);
			form.loading = false;
			const patch = userStore.set('confirmation', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		try {
			if (card && !validCoupon.shouldSkipCard) {
				const cardCreated = await addCard({card});

				cardCountry = cardCreated.country;
			}

			const currency = getCurrency(cardCountry);
			const data = await HoodieApi.updateSubscription({
				plan: `${plan}_${currency}_taxfree`,
				coupon,
				quantity,
			});

			form.loading = false;

			const patch = userStore
				.set('confirmation', form)
				.set('hasBeenSubscribing', 'true')
				.commit();

			const transacId = `${plan}_${data.id}`;

			ga('ecommerce:addTransaction', {
				id: transacId,
				affiliation: 'Prototypo',
				revenue: data.plan.amount / 100,
				currency,
			});

			ga('ecommerce:addItem', {
				id: transacId,
				name: data.plan.id,
				sku: `${plan}_${currency}_taxfree`,
				category: 'Subscriptions',
				price: data.plan.amount / 100,
			});

			ga('ecommerce:send');
			fbq('track', 'CompleteRegistration');

			await loadStuff();

			hashHistory.push({
				pathname: pathname || '/account/success',
			});

			localServer.dispatchUpdate('/userStore', patch);

			const customer = await HoodieApi.getCustomerInfo();

			localClient.dispatchAction('/load-customer-data', customer);
		}
		catch (err) {
			trackJs.track(err);

			if (/no such coupon/i.test(err.message)) {
				form.errors.push(
					'This coupon appears to no longer be valid, please contact us.',
				);
			}
			if (typeof err === 'string') {
				form.errors.push(err);
			}
			if (/no attached payment source/i.test(err.message)) {
				form.errors.push(
					'Payment details appear to be invalid, please contact us.',
				);
			}
			else {
				form.errors.push(
					"Unexpected error, please contact us at support@prototypo.io if you don't know how to solve it",
				);
				form.errors.push(err.message);
			}

			form.loading = false;
			const patch = userStore.set('confirmation', form).commit();

			localServer.dispatchUpdate('/userStore', patch);
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
