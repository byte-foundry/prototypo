import {userStore} from '../stores/creation.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import HoodieApi from '../services/hoodie.services.js';

let localServer;

window.addEventListener('fluxServer.setup', () => {
	localServer = LocalServer.instance;
});

export default {
	'/sign-up': ({username, password, firstname, lastname}) => {
		const form = userStore.get('signupForm');

		form.errors = [];
		form.inError = {};
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
			const patch = userStore.set('signupForm', form).commit();

			return localServer.dispatchUpdate('/userStore', patch);
		}

		HoodieApi.signUp(username, password)
			.then(() => {
				window.Intercom('boot', {
					app_id: 'mnph1bst',
					email: username,
					name: firstname + (lastname ? ` ${lastname}` : ''),
					widget: {
						activator: '#intercom-button',
					},
				});

				return HoodieApi.createCustomer({
					email: username,
					'buyer_email': username,
				});
			})
			.then(() => {
				form.errors = [];
				form.inError = {};
				const cleanPatch = userStore.set('signupForm', form).commit();

				localServer.dispatchUpdate('/userStore', cleanPatch);
			})
			.catch((err) => {
				form.errors.push(err.message);
				const patch = userStore.set('signupForm', form).commit();

				return localServer.dispatchUpdate('/userStore', patch);
			});
	},
};
