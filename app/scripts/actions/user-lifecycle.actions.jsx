import {hashHistory} from 'react-router';
import Lifespan from 'lifespan';
import debounce from 'lodash/debounce';

import {userStore, prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import {loadStuff} from '../helpers/appSetup.helpers.js';
import isProduction from '../helpers/is-production.helpers';
import {AccountValues} from '../services/values.services.js';
import getCurrency from '../helpers/currency.helpers.js';

let localServer;
let localClient;

window.addEventListener('fluxServer.setup', async () => {
	localServer = LocalServer.instance;

	localClient = LocalClient.instance();
	localClient.lifespan = new Lifespan();

	localClient.getStore('/userStore', localClient.lifespan)
		.onUpdate(({head}) => {
			saveAccountValues(head.toJS().infos);
		})
		.onDelete(() => {
			return;
		});
});

function saveAccountValues(values) {
	if (values !== undefined && values.accountValues !== undefined) {
		AccountValues.save({typeface: 'default', values});
	}
}

function addCard({card: {fullname, number, expMonth, expYear, cvc}, vat}) {
	const form = userStore.get('addcardForm');
	form.errors = [];
	form.inError = {};
	form.loading = true;
	const cleanPatch = userStore.set('addcardForm', form).commit();
	localServer.dispatchUpdate('/userStore', cleanPatch);
	return new Promise((resolve, reject) => {
		window.Stripe.card.createToken({
			number,
			cvc,
			exp_month: expMonth,
			exp_year: expYear,
			name: fullname,
		}, async (status, data) => {
			if (data.error) {
				form.loading = false;
				form.errors.push(data.error.message);
				const patch = userStore.set('addcardForm', form).commit();
				localServer.dispatchUpdate('/userStore', patch);
				reject(data.error.message);
			}

			const infos = userStore.get('infos');

			try {
				const response = await HoodieApi.updateCustomer({
					business_vat_id: vat || infos.vat, // Stripe way of storing VAT
					source: data.id,
					metadata: {
						vat_number: vat || infos.vat, // Quaderno way of reading VAT
					},
				});

				/* DEPRECATED Backward compatibility, should be removed when every component uses the cards property in userStore */
				infos.vat = vat || infos.vat;
				let patch = userStore.set('infos', infos).set('cards', response.sources.data).commit();

				localServer.dispatchUpdate('/userStore', patch);

				form.loading = false;
				patch = userStore.set('addcardForm', form).commit();
				localServer.dispatchUpdate('/userStore', patch);

				resolve(data.card);
			}
			catch (err) {
				console.log(err);
				form.loading = false;
				form.errors.push(err);
				const patch = userStore.set('addcardForm', form).commit();
				localServer.dispatchUpdate('/userStore', patch);
				reject(err);
			}
		});
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
			const {metadata: {credits}} = await HoodieApi.spendCredits({amount});

			const patch = prototypoStore.set('credits', credits).commit();

			localServer.dispatchUpdate('/prototypoStore', patch);

			return resolve({credits});
		}
		reject();
	});
}

async function addBillingAddress({buyerName, address, vat}) {
	const form = userStore.get('billingForm');

	form.errors = [];
	form.inError = {};
	form.loading = true;
	const cleanPatch = userStore.set('billingForm', form).commit();

	localServer.dispatchUpdate('/userStore', cleanPatch);

	if (!buyerName || !address.building_number || !address.street_name || !address.city || !address.postal_code || !address.country) {
		form.errors.push('These fields are required');
		form.inError = {
			buyerName: !buyerName,
			buildingNumber: !address.building_number,
			streetName: !address.street_name,
			city: !address.city,
			postalCode: !address.postal_code,
			country: !address.country,
		};
		form.loading = false;
		const patch = userStore.set('billingForm', form).commit();

		localServer.dispatchUpdate('/userStore', patch);
		return Promise.reject();
	}

	try {
		await HoodieApi.updateCustomer({
			business_vat_id: vat || infos.vat, // Stripe way of storing VAT
			metadata: {
				street_line_1: address.building_number,
				street_line_2: address.street_name,
				city: address.city,
				region: address.region,
				postal_code: address.postal_code,
				country: address.country,
				vat_number: vat || infos.vat, // Quaderno way of reading VAT
			},
		});
		const infos = userStore.get('infos');

		infos.address = address;
		infos.vat = vat;
		infos.buyerName = buyerName;
		form.loading = false;
		const patch = userStore.set('infos', infos).set('billingForm', form).commit();

		localServer.dispatchUpdate('/userStore', patch);
	}
	catch (err) {
		trackJs.track(err);
		form.errors.push(
			/Could not connect/i.test(err.message)
				? 'Our server is unavailable please try again letter'
				: err.message
		);
		form.loading = false;

		const patch = userStore.set('billingForm', form).commit();

		localServer.dispatchUpdate('/userStore', patch);
	}
}

const validateCoupon = debounce((options) => {
	return localClient.dispatchAction('/validate-coupon', options);
}, 500);

export default {
	'/load-customer-data': ({sources, subscriptions, metadata}) => {
		const subscriptionPatch = userStore.set('subscription', subscriptions.data[0]).commit();
		const cardsPatch = userStore.set('cards', sources.data).commit();
		const creditsPatch = prototypoStore.set('credits', parseInt(metadata.credits, 10) || 0).commit();

		localServer.dispatchUpdate('/userStore', subscriptionPatch);
		localServer.dispatchUpdate('/userStore', cardsPatch);
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
	'/sign-out': async () => {
		const signinLocation = {
			pathname: '/signin',
		};

		try {
			await HoodieApi.logout();
			hashHistory.push(signinLocation);
			window.Intercom('shutdown');
		}
		catch (err) {
			trackJs.track(err);
			hashHistory.push(signinLocation);
			window.Intercom('shutdown');
		}

		localClient.dispatchAction('/clean-form', 'signinForm');
		localClient.dispatchAction('/clean-form', 'signupForm');
		localClient.dispatchAction('/clean-form', 'choosePlanForm');
		localClient.dispatchAction('/clean-form', 'addcardForm');
		localClient.dispatchAction('/clean-form', 'billingForm');
		localClient.dispatchAction('/clean-form', 'confirmation');

		const patch = userStore.set('infos', {}).commit();

		localServer.dispatchUpdate('/userStore', patch);
	},
	'/sign-in': async ({username, password, retry}) => {
		const dashboardLocation = {
			pathname: '/dashboard',
		};
		const form = userStore.get('signinForm');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('signinForm', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		if (!username || !password) {
			form.inError = {
				username: !username,
				password: !password,
			};
			form.errors.push('Fields with a * are required');
			form.loading = false;
			const patch = userStore.set('signinForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		try {
			await HoodieApi.login(username, password);
			await loadStuff();

			hashHistory.push(dashboardLocation);
			window.Intercom('boot', {
				app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
				email: username,
				widget: {
					activator: '#intercom-button',
				},
			});
			trackJs.addMetadata('username', username);

			form.errors = [];
			form.inError = {};
			form.loading = false;
			const endPatch = userStore.set('signinForm', form).commit();

			localServer.dispatchUpdate('/userStore', endPatch);
		}
		catch (err) {
			if (/must sign out/i.test(err.message) && !retry) {
				await HoodieApi.logout();
				localStorage.clear();
				window.Intercom('shutdown');
				localClient.dispatchAction('/sign-in', {username, password, retry: true});
			}
			else {
				trackJs.track(err);
				form.errors.push(
					/incorrect/i.test(err.message)
						? 'Incorrect email or password'
						: 'An unexpected error occured, please contact contact@prototypo.io and mention your current email'
				);
				form.loading = false;
				const patch = userStore.set('signinForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);
			}
		}
	},
	'/sign-up': async ({username, password, firstname, lastname, css, phone, skype, to = '/dashboard', retry, oldQuery = {}}) => {
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

		//Check each input for error
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
			//password is not long enough
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
			const {response} = await HoodieApi.signUp(username.toLowerCase(), password);

			window.Intercom('boot', {
				app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
				email: username,
				name: firstname + curedLastname,
				occupation: css.value,
				phone,
				skype,
				ABtest: Math.floor(Math.random() * 100),
				widget: {
					activator: '#intercom-button',
				},
			});
			trackJs.addMetadata('username', username);

			const customer = await HoodieApi.createCustomer({
				email: username,
				'buyer_email': firstname + curedLastname,
				hoodieId: response.roles[0],
			});
			const accountValues = {username, firstname, lastname: curedLastname, buyerName: firstname + curedLastname, css, phone, skype};
			const patch = userStore.set('infos', {accountValues}).commit();

			await AccountValues.save({typeface: 'default', values: {accountValues}});
			localServer.dispatchUpdate('/userStore', patch);

			form.errors = [];
			form.inError = {};
			form.loading = false;
			const endPatch = userStore.set('signupForm', form).commit();

			HoodieApi.instance.customerId = customer.id;
			HoodieApi.instance.plan = 'free_none';
			HoodieApi.instance.email = username;
			fbq('track', 'Lead');
			localServer.dispatchUpdate('/userStore', endPatch);

			if (toLocation.pathname === '/dashboard') {
				await loadStuff(accountValues);
				hashHistory.push(toLocation);
			}
			else {
				hashHistory.push(toLocation);
			}
		}
		catch (err) {
			if (/must sign out/i.test(err.message) && !retry) {
				await HoodieApi.logout();
				localStorage.clear();
				window.Intercom('shutdown');
				localClient.dispatchAction('/sign-up', {username, password, firstname, lastname, to, retry: true});
			}
			else {
				trackJs.track(err);
				form.errors.push(err.message);
				form.loading = false;
				const patch = userStore.set('signupForm', form).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			}
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
	'/confirm-plan': ({plan, pathQuery = {pathname: '/account/create/add-card'}}) => {
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

		const infos = userStore.get('infos');

		infos.plan = plan;
		form.loading = false;
		const patch = userStore.set('infos', infos).set('choosePlanForm', form).commit();

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
	'/add-billing-address': async (options) => {
		const toPath = {
			pathname: options.pathQuery.path || '/account/profile',
			query: options.pathQuery.query,
		};

		await addBillingAddress(options);
		hashHistory.push(toPath);
	},
	'/add-card-and-billing': async (options) => {
		const toPath = {
			pathname: '/account/create/confirmation',
		};

		await addCard(options);
		await addBillingAddress(options);
		fbq('track', 'AddPaymentInfo');
		window.Intercom('trackEvent', 'addedCardAndAdress');
		hashHistory.push(toPath);
	},
	'/confirm-buy': async ({plan, card, pathname}) => {
		const form = userStore.get('confirmation');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('confirmation', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		const cards = userStore.get('cards');
		let cardCountry = cards[0] ? cards[0].country : undefined;

		if (!cardCountry && (!card.fullname || !card.number || !card.expMonth || !card.expYear || !card.cvc)) {
			form.inError = {
				fullname: !card.fullname,
				number: !card.number,
				expMonth: !card.expMonth,
				expYear: !card.expYear,
				cvc: !card.cvc,
			};
			form.errors.push(`${
				_.filter(Object.keys(form.inError),
					(item) => {
						return form.inError[item];
					}).length > 1
						? 'These fields are'
						: 'This field is'
			} required`);
			form.loading = false;
			const patch = userStore.set('confirmation', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		try {
			if (card) {
				const cardCreated = await addCard({card});

				cardCountry = cardCreated.country;
			}

			const currency = getCurrency(cardCountry);
			let coupon = userStore.get('choosePlanForm').couponValue;
			if (coupon && coupon.includes('base_coupon')) {
				coupon = `base_coupon_${currency}`;
			}
			const data = await HoodieApi.updateSubscription({
				plan: `${plan}_${currency}_taxfree`,
				coupon,
			});
			const infos = {...userStore.get('infos')};

			form.loading = false;
			infos.plan = data.plan.id;

			const patch = userStore
				.set('infos', infos)
				.set('confirmation', form)
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

			HoodieApi.instance.plan = infos.plan;

			hashHistory.push({
				pathname: pathname ? pathname : '/account/success',
			});

			localServer.dispatchUpdate('/userStore', patch);

			const customer = await HoodieApi.getCustomerInfo();

			localClient.dispatchAction('/load-customer-data', customer);
		}
		catch (err) {
			trackJs.track(err);

			if ((/no such coupon/i).test(err.message)) {
				form.errors.push('This coupon appears to no longer be valid, please contact us.');
			}
			if (/no attached payment source/i.test(err.message)) {
				form.errors.push('Payment details appear to be invalid, please contact us.');
			}
			else {
				form.errors.push('Unexpected error, please contact us at contact@prototypo.io');
				form.errors.push(err.message);
			}

			form.loading = false;
			const patch = userStore
				.set('confirmation', form)
				.commit();

			localServer.dispatchUpdate('/userStore', patch);
		}
	},
	'/change-account-info': (data) => {
		const form = userStore.get('profileForm');

		form.errors = [];
		delete form.success;
		if (!data.firstname) {
			form.errors.push('First name is required.');
			const erroredPatch = userStore.set('profileForm', form).commit();

			localServer.dispatchUpdate('/userStore', erroredPatch);
			return;
		}
		form.success = true;
		const formPatch = userStore.set('profileForm', form).commit();

		localServer.dispatchUpdate('/userStore', formPatch);

		const infos = {...userStore.get('infos'), ...data};

		const patch = userStore.set('infos', infos).commit();

		const lastname = data.lastname
			? ` ${data.lastname}`
			: '';

		window.Intercom('update', {
			name: `${data.firstname}${lastname}`,
			twitter: data.twitter,
			website: data.website,
			occupation: data.css.value,
			phone: data.phone,
			skype: data.skype,
		});

		localServer.dispatchUpdate('/userStore', patch);
	},
	'/change-password': async ({password, newPassword, confirm}) => {
		const changePasswordForm = userStore.get('changePasswordForm');

		changePasswordForm.errors = [];
		changePasswordForm.inError = {};
		changePasswordForm.loading = true;
		const cleanPatch = userStore.set('changePasswordForm', changePasswordForm).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);

		if (!password || !newPassword || !confirm) {
			changePasswordForm.inError = {
				password: !password,
				newPassword: !newPassword,
				confirm: !confirm,
			};
			changePasswordForm.errors.push('Fields with a * are required');
			changePasswordForm.loading = false;
			const patch = userStore.set('changePasswordForm', changePasswordForm).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		if (newPassword !== confirm) {
			changePasswordForm.errors.push('The confirmation does not match your new password');
			changePasswordForm.loading = false;
			const patch = userStore.set('changePasswordForm', changePasswordForm).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		try {
			await HoodieApi.changePassword(password, newPassword);
			changePasswordForm.loading = false;
			changePasswordForm.success = true;
			const patch = userStore.set('changePasswordForm', changePasswordForm).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}
		catch (err) {
			trackJs.track(err);
			changePasswordForm.loading = false;
			changePasswordForm.errors.push(err.message);
			const patch = userStore.set('changePasswordForm', changePasswordForm).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}
	},
	'/spend-credits': async (options) => {
		const {credits} = await spendCredits(options);

		localClient.dispatchAction('/store-value', {spendCreditsNewCreditAmount: credits});
		window.Intercom('update', {
			'export_credits': credits,
		});
	},
};
