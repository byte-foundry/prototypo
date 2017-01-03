import {hashHistory} from 'react-router';
import Lifespan from 'lifespan';
import debounce from 'lodash/debounce';

import {userStore, couponStore, prototypoStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import {loadStuff} from '../helpers/appSetup.helpers.js';
import isProduction from '../helpers/is-production.helpers';
import {AccountValues} from '../services/values.services.js';

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

	if (!fullname || !number || !expMonth || !expYear || !cvc) {
		form.errors.push('These fields are required');
		form.inError = {
			fullname: !fullname,
			number: !number,
			expMonth: !expMonth,
			expYear: !expYear,
			cvc: !cvc,
		};
		form.loading = false;
		const patch = userStore.set('addcardForm', form).commit();

		return localServer.dispatchUpdate('/userStore', patch);
	}
	return new Promise((resolve) => {
		window.Stripe.card.createToken({
			number,
			cvc,
			exp_month: expMonth,
			exp_year: expYear,
			name: fullname,
		}, (status, data) => {
			if (data.error) {
				form.errors.push(data.error.message);
				form.loading = false;
				const patch = userStore.set('addcardForm', form).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			}

			const infos = userStore.get('infos');

			HoodieApi.updateCustomer({
				business_vat_id: vat || infos.vat, // Stripe way of storing VAT
				source: data.id,
				metadata: {
					vat_number: vat || infos.vat, // Quaderno way of reading VAT
				},
			})
			.then(() => {
				infos.card = [data.card];
				infos.vat = vat || infos.vat;
				form.loading = false;
				const patch = userStore.set('infos', infos).set('addcardForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);

				resolve();
			})
			.catch((err) => {
				trackJs.track(err);
				form.errors.push(
					/Could not connect/i.test(err.message)
						? 'Our server is unavailable please try again letter'
						: err.message
				);
				form.loading = false;
				const patch = userStore.set('addcardForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);
			});
		});
	});
}

function buyCredits({card: {fullname, number, expMonth, expYear, cvc}, currency, vat}) {
	const form = userStore.get('buyCreditsForm');

	form.errors = [];
	form.inError = {};
	form.loading = true;
	const cleanPatch = userStore.set('buyCreditsForm', form).commit();

	localServer.dispatchUpdate('/userStore', cleanPatch);

	if (!fullname || !number || !expMonth || !expYear || !cvc) {
		form.errors.push('These fields are required');
		form.inError = {
			fullname: !fullname,
			number: !number,
			expMonth: !expMonth,
			expYear: !expYear,
			cvc: !cvc,
		};
		form.loading = false;
		const patch = userStore.set('buyCreditsForm', form).commit();

		localServer.dispatchUpdate('/userStore', patch);
		return Promise.reject('missing form values');
	}


	return new Promise((resolve, reject) => {
		window.Stripe.card.createToken({
			number,
			cvc,
			exp_month: expMonth,
			exp_year: expYear,
			name: fullname,
		}, async (status, data) => {
			if (data.error) {
				form.errors.push(data.error.message);
				form.loading = false;
				const patch = userStore.set('buyCreditsForm', form).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			}

			const infos = userStore.get('infos') || {};
			const item = {
				type: 'sku',
				parent: `3_credits_${currency === 'EUR' ? 'EUR' : 'USD'}`,
			};

			const vatNumber = vat || infos.vat;

			await HoodieApi.updateCustomer({
				business_vat_id: vatNumber, // Stripe way of storing VAT
				metadata: {
					// test if (EU) VAT number is valid with country code at the beginning
					country: /[A-Z]{2}/.test(vatNumber) ? vatNumber.trim().slice(0, 2) : undefined,
					vat_number: vatNumber, // Quaderno way of reading VAT
				},
			});

			HoodieApi.buyCredits({
				token: data.id,
				currency: currency === 'EUR' ? 'EUR' : 'USD',
				items: [item],
			})
			.then(({metadata: {credits}}) => {
				infos.card = [data.card];
				infos.vat = vatNumber;
				form.loading = false;
				const patch = userStore.set('infos', infos).set('buyCreditsForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);

				const creditPatch = prototypoStore.set('credits', credits).commit();

				localServer.dispatchUpdate('/prototypoStore', creditPatch);

				resolve({credits});
			})
			.catch((err) => {
				trackJs.track(err);
				form.errors.push(err.message);
				form.loading = false;
				const patch = userStore.set('buyCreditsForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);

				reject();
			});
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

function addBillingAddress({buyerName, address}) {
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

	return HoodieApi.updateCustomer({
		metadata: {
			street_line_1: address.building_number,
			street_line_2: address.street_name,
			city: address.city,
			region: address.region,
			postal_code: address.postal_code,
			country: address.country,
		}
	})
	.then(() => {
		const infos = userStore.get('infos');

		infos.address = address;
		infos.buyerName = buyerName;
		form.loading = false;
		const patch = userStore.set('infos', infos).set('billingForm', form).commit();

		return localServer.dispatchUpdate('/userStore', patch);
	})
	.catch((err) => {
		trackJs.track(err);
		form.errors.push(
			/Could not connect/i.test(err.message)
				? 'Our server is unavailable please try again letter'
				: err.message
		);
		form.loading = false;

		const patch = userStore.set('billingForm', form).commit();
		localServer.dispatchUpdate('/userStore', patch);
	});
}

const validateCoupon = debounce((options) => {
	return localClient.dispatchAction('/validate-coupon', options);
}, 500);

export default {
	'/load-customer-data': ({sources, subscriptions, metadata}) => {
		const infos = _.cloneDeep(userStore.get('infos'));

		if (sources && sources.data.length > 0) {
			infos.card = sources.data;
		}
		if (subscriptions && subscriptions.data.length > 0) {
			infos.subscriptions = subscriptions.data;
		}

		if (metadata && metadata.credits) {
			const credits = parseInt(metadata.credits, 10);
			const creditPatch = prototypoStore.set('credits', credits).commit();
			localServer.dispatchUpdate('/userStore', creditPatch);
		}

		const patch = userStore.set('infos', infos).commit();
		localServer.dispatchUpdate('/userStore', patch);
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
	'/sign-out': () => {
		const signinLocation = {
			pathname: '/signin',
		};

		HoodieApi.logout()
			.then(() => {
				hashHistory.push(signinLocation);
				window.Intercom('shutdown');
			})
			.catch((e) => {
				trackJs.track(err);
				hashHistory.push(signinLocation);
				window.Intercom('shutdown');
			});

		localClient.dispatchAction('/clean-form', 'signinForm');
		localClient.dispatchAction('/clean-form', 'signupForm');
		localClient.dispatchAction('/clean-form', 'choosePlanForm');
		localClient.dispatchAction('/clean-form', 'addcardForm');
		localClient.dispatchAction('/clean-form', 'billingForm');
		localClient.dispatchAction('/clean-form', 'confirmation');

		const patch = userStore.set('infos', {}).commit();
		localServer.dispatchUpdate('/userStore', patch);
	},
	'/sign-in': ({username, password, retry}) => {
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

		HoodieApi.login(username, password)
			.then(async () => {
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
			})
			.catch((err) => {
				if (/must sign out/i.test(err.message) && !retry) {
					HoodieApi.logout()
						.then(() => {
							localStorage.clear();
							localClient.dispatchAction('/sign-in', {username, password, retry: true});
						});
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
			});
	},
	'/sign-up': ({username, password, firstname, lastname, css, phone, skype, to, retry}) => {
		const toLocation = {
			pathname: to || '/dashboard',
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

		HoodieApi.signUp(username, password)
			.then(({response}) => {

				window.Intercom('boot', {
					app_id: isProduction() ? 'mnph1bst' : 'desv6ocn',
					email: username,
					name: firstname + curedLastname,
					occupation: css.value,
					phone: phone,
					skype: skype,
					ABtest: Math.floor(Math.random() * 100),
					widget: {
						activator: '#intercom-button',
					},
				});
				trackJs.addMetadata('username', username);

				return HoodieApi.createCustomer({
					email: username,
					'buyer_email': firstname + curedLastname,
					hoodieId: response.roles[0],
				});
			})
			.then(async (customer) => {
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
			})
			.catch((err) => {
				if (/must sign out/i.test(err.message) && !retry) {
					HoodieApi.logout()
						.then(() => {
							localStorage.clear();
							localClient.dispatchAction('/sign-up', {username, password, firstname, lastname, to, retry: true});
						});
				}
				else {
					trackJs.track(err);
					form.errors.push(err.message);
					form.loading = false;
					const patch = userStore.set('signupForm', form).commit();

					return localServer.dispatchUpdate('/userStore', patch);
				}
			});
	},
	'/choose-plan': ({plan, coupon}) => {
		const form = userStore.get('choosePlanForm');

		delete form.error;

		if (plan) {
			form.selected = plan;
		}

		if (coupon !== undefined) {
			form.couponValue = coupon;
		}

		if (form.selected && form.couponValue) {
			delete form.validCoupon;
			delete form.couponError;
			validateCoupon({
				plan: form.selected,
				coupon: form.couponValue,
			});
		}

		const patch = userStore.set('choosePlanForm', form).commit();

		window.Intercom('trackEvent', `chosePlan${plan}`);

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
		catch(err) {
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
		catch({message}) {
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
	'/add-card': (options) => {
		const toPath = {
			pathname: options.pathQuery.path || '/account/profile',
			query: options.pathQuery.query,
		};

		addCard(options)
		.then(() => {
			hashHistory.push(toPath);
		});
	},
	'/add-billing-address': (options) => {
		const toPath = {
			pathname: options.pathQuery.path || '/account/profile',
			query: options.pathQuery.query,
		};

		addBillingAddress(options)
		.then(() => {
			hashHistory.push(toPath);
		});
	},
	'/add-card-and-billing': (options) => {
		const toPath = {
			pathname: '/account/create/confirmation',
		};

		addCard(options)
		.then(() => {
			return addBillingAddress(options);
		})
		.then(() => {
			fbq('track', 'AddPaymentInfo');
			window.Intercom('trackEvent', 'addedCardAndAdress');
			hashHistory.push(toPath);
		});
	},
	'/confirm-buy': ({plan, currency}) => {
		const form = userStore.get('confirmation');

		form.errors = [];
		form.inError = {};
		form.loading = true;
		const cleanPatch = userStore.set('confirmation', form).commit();

		localServer.dispatchUpdate('/userStore', cleanPatch);
		HoodieApi.updateSubscription({
			plan: `${plan}_${currency}_taxfree`,
			coupon: userStore.get('infos').couponValue,
		}).then(async (data) => {
			const infos = _.cloneDeep(userStore.get('infos'));

			form.loading = false;
			infos.plan = data.plan.id;
			const patch = userStore
				.set('infos', infos)
				.set('confirmation', form)
				.commit();

			ga('ecommerce:addTransaction', {
				'id': data.id,
				'affiliation': 'Prototypo',
				'revenue': data.plan.id.indexOf('monthly') === -1 ? '144' : '15',
			});

			ga('ecommerce:addItem', {
				'id': data.id + data.plan.id,
				'name': data.plan.id,    // Product name. Required.
				'price': data.plan.id.indexOf('monthly') === -1 ? '144' : '15',
			});

			ga('ecommerce:send');
			fbq('track', 'CompleteRegistration');

			await loadStuff();

			HoodieApi.instance.plan = infos.plan;

			hashHistory.push({
				pathname: '/account/success',
			});

			localServer.dispatchUpdate('/userStore', patch);

			const customer = await HoodieApi.getCustomerInfo();

			localClient.dispatchAction('/load-customer-data', customer);
		}).catch((err) => {
			trackJs.track(err);

			if ((/no such coupon/i).test(err.message)) {
				form.errors.push('This coupon appears to no longer be valid, please contact us.');
			}
			if (/no attached payment source/i.test(err.message)) {
				form.errors.push('Payment details appear to be invalid, please contact us.');
			}
			else {
				form.errors.push('Unexpected error, please contact us.');
				form.errors.push(err.message);
			}

			form.loading = false;
			const patch = userStore
				.set('confirmation', form)
				.commit();

			localServer.dispatchUpdate('/userStore', patch);
		});
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

		const infos = _.cloneDeep(userStore.get('infos'));
		_.assign(infos.accountValues, data);
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
	'/change-password': ({password, newPassword, confirm}) => {
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

		HoodieApi.changePassword(password, newPassword)
			.then(() => {
				changePasswordForm.loading = false;
				changePasswordForm.success = true;
				const patch = userStore.set('changePasswordForm', changePasswordForm).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			})
			.catch((err) => {
				trackJs.track(err);
				changePasswordForm.loading = false;
				changePasswordForm.errors.push(err.message);
				const patch = userStore.set('changePasswordForm', changePasswordForm).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			});
	},
	'/buy-credits': async (options) => {
		const data = await buyCredits(options);

		localClient.dispatchAction('/store-value', {
			buyCreditsNewCreditAmount: data.credits,
			uiAskSubscribeFamily: false,
			uiAskSubscribeVariant: false,
		});

		window.Intercom('update', {
			'export_credits': data.credits,
		});

		const transacId = HoodieApi.instance.email + (new Date).getTime();

		ga('ecommerce:addTransaction', {
			'id': transacId,
			'affiliation': 'Prototypo',
			'revenue': 9,
		});

		ga('ecommerce:addItem', {
			'id': `transacId ${credits}`,                     // Transaction ID. Required.
			'name': 'credits',    // Product name. Required.
			'price': 9,
		});

		ga('ecommerce:send');
		fbq('track', 'CompleteRegistration');
	},
	'/spend-credits': async (options) => {
		const {credits} = await spendCredits(options);

		localClient.dispatchAction('/store-value', {spendCreditsNewCreditAmount: credits});
		window.Intercom('update', {
			'export_credits': credits,
		});
	},
};
