import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {MemoryRouter, Switch, Route} from 'react-router-dom';
import {Elements, StripeProvider} from 'react-stripe-elements';
import {
	render,
	fireEvent,
	cleanup,
	waitForElement,
} from 'react-testing-library';

import SubscriptionCardAndValidation, {
	CREATE_SUBSCRIPTION,
} from '../subscription-card-and-validation.components';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_PkwKlOWOqSoimNJo2vsT21sE';

jest.mock('../../../services/hoodie.services');

class Element {
	mount() {}
	update() {}
	destroy() {}
	on() {}
}

function mockStripe() {
	const elements = {
		create: () => new Element(),
	};
	const card = {};

	card.mount = () => {};
	card.on = () => {};
	card.change = () => {};
	const stripe = {
		createToken: () => {
			console.log('create token');
		},
		elements: () => elements,
	};

	function Stripe(key) {
		stripe.key = key;
		return stripe;
	}
	return {elements, card, stripe, Stripe};
}

global.Stripe = mockStripe().Stripe;
global.Intercom = () => {};

afterEach(cleanup);

describe('SubscriptionCardAndValidation', () => {
	it('should send a subscribe request for personal_monthly plan', async () => {
		const mocks = [
			{
				request: {
					query: CREATE_SUBSCRIPTION,
					variables: {
						plan: 'personal_monthly_USD_taxfree',
						coupon: undefined,
						quantity: undefined,
					},
				},
				result: {
					data: {
						createSubscription: {
							id: 'sub_test_id',
						},
					},
				},
			},
		];

		const {getByText} = render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<StripeProvider apiKey={STRIPE_PUBLISHABLE_KEY}>
					<MemoryRouter
						initialEntries={[
							'/account/subscribe?plan=personal_monthly',
						]}
						initialIndex={0}
					>
						<Switch>
							<Route
								path="/account/subscribe"
								render={() => (
									<Elements>
										<SubscriptionCardAndValidation
											plan="personal_monthly"
											cards={[
												{
													name: 'Jean Michel Avous',
													last4: '4242',
													exp_month: 12,
													exp_year: 25,
												},
											]}
										/>
									</Elements>
								)}
							/>
							<Route
								path="/account/success"
								render={() => <p>Success</p>}
							/>
						</Switch>
					</MemoryRouter>
				</StripeProvider>
			</MockedProvider>,
		);

		fireEvent.click(
			getByText(content => content.startsWith('Subscribe')),
		);

		await waitForElement(() =>
			getByText(content => content.startsWith('Success')),
		);
	});

	it('should send a subscribe request with a valid coupon', async () => {
		const mocks = [
			{
				request: {
					query: CREATE_SUBSCRIPTION,
					variables: {
						plan: 'personal_monthly_USD_taxfree',
						coupon: 'COUPON',
						quantity: undefined,
					},
				},
				result: {
					data: {
						createSubscription: {
							id: 'sub_test_id',
						},
					},
				},
			},
		];

		const getComponent = props => (
			<MockedProvider mocks={mocks} addTypename={false}>
				<StripeProvider apiKey={STRIPE_PUBLISHABLE_KEY}>
					<MemoryRouter
						initialEntries={[
							'/account/subscribe?plan=personal_monthly',
						]}
						initialIndex={0}
					>
						<Switch>
							<Route
								path="/account/subscribe"
								render={() => (
									<Elements>
										<SubscriptionCardAndValidation
											plan="personal_monthly"
											cards={[
												{
													name: 'Jean Michel Avous',
													last4: '4242',
													exp_month: 12,
													exp_year: 25,
												},
											]}
											{...props}
										/>
									</Elements>
								)}
							/>
							<Route
								path="/account/success"
								render={() => <p>Success</p>}
							/>
						</Switch>
					</MemoryRouter>
				</StripeProvider>
			</MockedProvider>
		);

		const {getByText, getByPlaceholderText, rerender} = render(
			getComponent(),
		);

		fireEvent.click(
			getByText(content => content.startsWith('I have a coupon')),
		);

		const couponInput = await waitForElement(() =>
			getByPlaceholderText('COUPON'),
		);

		// typing the coupon value inside the input
		couponInput.value = 'BADCOUPON';
		fireEvent.change(couponInput);

		// /!\ usually a bad practice, we should test the main component instead
		//     in the future ;)
		rerender(getComponent({coupon: 'BADCOUPON'}));

		// coupon is wrong
		await waitForElement(() =>
			getByText(content => content.includes('not a valid coupon')),
		);

		// typing the coupon value inside the input
		couponInput.value = 'COUPON';
		fireEvent.change(couponInput);

		// /!\ usually a bad practice, we should test the main component instead
		//     in the future ;)
		rerender(getComponent({coupon: 'COUPON'}));

		// coupon has been validated
		await waitForElement(() =>
			getByText(content => content.startsWith('(ノ✿◕ᗜ◕)ノ━☆ﾟ.*･｡ﾟ')),
		);

		fireEvent.click(
			getByText(content => content.startsWith('Subscribe')),
		);

		await waitForElement(() =>
			getByText(content => content.startsWith('Success')),
		);
	});
});
