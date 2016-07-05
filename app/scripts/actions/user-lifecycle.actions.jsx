import {hashHistory} from 'react-router';
import Lifespan from 'lifespan';
import md5 from 'md5';

import {userStore, couponStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';
import {loadStuff} from '../helpers/appSetup.helpers.js';
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
	return new Promise((resolve, reject) => {
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
				source: data.id,
				buyer_credit_card_prefix: number.substr(0, 9),
				buyer_tax_number: vat || infos.vat,
			})
			.then(() => {

				infos.card = [data.card];
				infos.vat = vat || infos.vat;
				form.loading = false;
				const patch = userStore.set('infos', infos).set('addcardForm', form).commit();

				localServer.dispatchUpdate('/userSotre', patch);

				resolve();
			})
			.catch((err) => {
				form.errors.push(err.message);
				form.loading = false;
				const patch = userStore.set('addcardForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);
			});
		});
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
		invoice_address: address,
		buyer_name: buyerName,
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
		form.errors.push(err.message);
		form.loading = false;

		const patch = userStore.set('billingForm', form).commit();
		localServer.dispatchUpdate('/userStore', patch);
	});
}

export default {
	'/load-customer-data': ({sources, subscriptions, charges}) => {
		const infos = _.cloneDeep(userStore.get('infos'));

		if (sources && sources.data.length > 0) {
			infos.card = sources.data;
		}
		if (subscriptions && subscriptions.data.length > 0) {
			infos.subscriptions = subscriptions.data;
		}
		if (charges && charges.data.length > 0) {
			infos.charges = charges.data;
		}

		const patch = userStore.set('infos', infos).commit();
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
			.catch(() => {
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
	'/sign-in': ({username, password}) => {
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
					app_id: 'mnph1bst',
					email: username,
					widget: {
						activator: '#intercom-button',
					},
				});

				form.errors = [];
				form.inError = {};
				form.loading = false;
				const endPatch = userStore.set('signinForm', form).commit();

				localServer.dispatchUpdate('/userStore', endPatch);
			})
			.catch((err) => {
				form.errors.push(
					/incorrect/i.test(err.message)
						? 'Incorrect email or password'
						: 'An unexpected error occured, please contact contact@prototypo.io and mention your current email'
				);
				form.loading = false;
				const patch = userStore.set('signinForm', form).commit();

				localServer.dispatchUpdate('/userStore', patch);
			});
	},
	'/sign-up': ({username, password, firstname, lastname, to}) => {
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
			.then(() => {

				window.Intercom('boot', {
					app_id: 'mnph1bst',
					email: username,
					name: firstname + curedLastname,
					widget: {
						activator: '#intercom-button',
					},
				});


				return HoodieApi.createCustomer({
					email: username,
					'buyer_email': firstname + curedLastname,
				});
			})
			.then(async (data) => {
				console.log(data);
				const accountValues = {username, firstname, lastname: curedLastname, buyerName: firstname + curedLastname};
				const patch = userStore.set('infos', {accountValues}).commit();

				localServer.dispatchUpdate('/userStore', patch);
				if (toLocation.pathname === '/dashboard') {
					await loadStuff(accountValues);
				}

				form.errors = [];
				form.inError = {};
				form.loading = false;
				const endPatch = userStore.set('signupForm', form).commit();

				HoodieApi.instance.plan = 'free_none';
				HoodieApi.instance.email = username;
				hashHistory.push(toLocation);
				return localServer.dispatchUpdate('/userStore', endPatch);
			})
			.catch((err) => {
				form.errors.push(err.message);
				form.loading = false;
				const patch = userStore.set('signupForm', form).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			});
	},
	'/choose-plan': ({plan, coupon}) => {
		const form = userStore.get('choosePlanForm');

		form.error = undefined;
		if (plan) {
			form.selected = plan;
		}

		if (coupon !== undefined) {
			form.couponValue = coupon;
		}

		if (form.selected && form.couponValue) {
			const hash = md5(`${form.couponValue}.${form.selected}`);

			form.isCouponValid = couponStore.get(hash) || false;
		}
		else {
			delete form.isCouponValid;
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

		if (!plan) {
			form.error = 'You must select a plan';
			form.loading = false;
			const patch = userStore.set('choosePlanForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		if (form.isCouponValid === false) {
			form.error = 'Coupon code is invalid';
			form.loading = false;
			const patch = userStore.set('choosePlanForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		const infos = userStore.get('infos');

		infos.plan = plan;
		infos.isCouponValid = form.isCouponValid;
		infos.couponValue = form.isCouponValid && form.couponValue;
		form.loading = false;
		const patch = userStore.set('infos', infos).set('choosePlanForm', form).commit();

		localServer.dispatchUpdate('/userStore', patch);

		hashHistory.push(pathQuery);
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
			return addBillingAddress(options)
		})
		.then(() => {
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
			coupon: userStore.get('infos').coupon,
		}).then(async (data) => {
			const infos = _.cloneDeep(userStore.get('infos'));

			infos.plan = `${plan}_${currency}_taxfree`;
			const patch = userStore
				.set('infos', infos)
				.commit();

			const customer = await HoodieApi.getCustomerInfo();

			ga('ecommerce:addTransaction', {
				'id': customer.metadata.taxamo_transaction_key,
				'affiliation': 'Prototypo',
				'revenue': data.plan.indexOf('monthly') === -1 ? '144' : '15',
			});

			ga('ecommerce:addItem', {
				'id': customer.metadata.taxamo_transaction_key + data.plan,                     // Transaction ID. Required.
				'name': data.plan,    // Product name. Required.
				'price': data.plan.indexOf('monthly') === -1 ? '144' : '15',
			});

			ga('ecommerce:send');

			await loadStuff();

			HoodieApi.instance.plan = infos.plan;

			hashHistory.push({
				pathname: '/account/success',
			});

			localServer.dispatchUpdate('/userStore', patch);
			HoodieApi.getCustomerInfo()
			.then((customer) => {
				localClient.dispatchAction('/load-customer-data', customer);
			});
		}).catch((err) => {

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
			occupation: data.css,
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
				changePasswordForm.loading = false;
				changePasswordForm.errors.push(err.message);
				const patch = userStore.set('changePasswordForm', changePasswordForm).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			});
	},
};
