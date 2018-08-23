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

const STRIPE_PUBLISHABLE_KEY = 'test_key';

jest.mock('../../../services/hoodie.services');

import HoodieApi from '../../../services/hoodie.services';
import '../../../../../__mocks__/stripeMock';

global.Intercom = jest.fn();
global.trackJs = {track: jest.fn()};

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
						initialEntries={['/account/subscribe?plan=personal_monthly']}
						initialIndex={0}
					>
						<Switch>
							<Route
								path="/account/subscribe"
								render={() => (
									<Elements locale="en">
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
							<Route path="/account/success" render={() => <p>Success</p>} />
						</Switch>
					</MemoryRouter>
				</StripeProvider>
			</MockedProvider>,
		);

		fireEvent.click(getByText(content => content.startsWith('Subscribe')));

		await waitForElement(() =>
			getByText(content => content.startsWith('Success')),
		);
	});

	it('should send a subscribe request with a new card', async () => {
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

		const {getByText, getByTestId} = render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<StripeProvider apiKey={STRIPE_PUBLISHABLE_KEY}>
					<MemoryRouter
						initialEntries={['/account/subscribe?plan=personal_monthly']}
						initialIndex={0}
					>
						<Switch>
							<Route
								path="/account/subscribe"
								render={() => (
									<Elements locale="en">
										<SubscriptionCardAndValidation plan="personal_monthly" />
									</Elements>
								)}
							/>
							<Route path="/account/success" render={() => <p>Success</p>} />
						</Switch>
					</MemoryRouter>
				</StripeProvider>
			</MockedProvider>,
		);

		const form = getByTestId('subscribe-form');
		const {createToken} = global.Stripe();

		// JSDOM hasn't implemented correctly the submit event propagation
		// so we submit manually instead of clicking the button
		fireEvent.submit(form, {
			target: {fullname: {value: ''}},
		});

		await waitForElement(() => getByText('name is incomplete', {exact: false}));

		// Stripe is managing the card number
		createToken.mockReturnValue({
			error: {message: 'card number is incomplete.'},
		});

		fireEvent.submit(form, {
			target: {fullname: {value: 'My name is Jeff'}},
		});

		await waitForElement(() =>
			getByText('card number is incomplete', {exact: false}),
		);

		expect(createToken).toHaveBeenCalled();

		createToken.mockReturnValue({
			token: {
				id: 'token_id',
				card: {country: 'US'},
			},
		});
		fireEvent.submit(form, {
			target: {fullname: {value: 'My name is Jeff'}},
		});

		await waitForElement(() => getByText('Success', {exact: false}));

		expect(global.Stripe().createToken).toHaveBeenCalled();
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
						initialEntries={['/account/subscribe?plan=personal_monthly']}
						initialIndex={0}
					>
						<Switch>
							<Route
								path="/account/subscribe"
								render={() => (
									<Elements locale="en">
										<SubscriptionCardAndValidation
											onChangePlan={jest.fn()}
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
							<Route path="/account/success" render={() => <p>Success</p>} />
						</Switch>
					</MemoryRouter>
				</StripeProvider>
			</MockedProvider>
		);

		const {getByText, getByPlaceholderText, rerender} = render(getComponent());

		fireEvent.click(
			getByText(content => content.startsWith('I have a coupon')),
		);

		const couponInput = await waitForElement(() =>
			getByPlaceholderText('COUPON'),
		);

		// typing the coupon value inside the input
		fireEvent.change(couponInput, {target: {value: 'BADCOUPON'}});

		HoodieApi.validateCoupon.mockImplementation(() => {
			const error = new Error('No such coupon: BADCOUPON');

			error.type = 'StripeInvalidRequestError';

			return Promise.reject(error);
		});

		// /!\ usually a bad practice, we should test the main component instead
		//     in the future ;)
		rerender(getComponent({coupon: 'BADCOUPON'}));

		// coupon is wrong
		await waitForElement(() =>
			getByText(content => content.includes('not a valid coupon')),
		);

		// typing the coupon value inside the input
		fireEvent.change(couponInput, {target: {value: 'COUPON'}});
		HoodieApi.validateCoupon.mockReturnValue({
			label: 'Coupon ok',
			percent_off: 10,
		});

		// /!\ usually a bad practice, we should test the main component instead
		//     in the future ;)
		rerender(getComponent({coupon: 'COUPON'}));

		// coupon has been validated
		await waitForElement(() =>
			getByText(content => content.startsWith('(ノ✿◕ᗜ◕)ノ━☆ﾟ.*･｡ﾟ')),
		);

		fireEvent.click(getByText(content => content.startsWith('Subscribe')));

		await waitForElement(() =>
			getByText(content => content.startsWith('Success')),
		);
	});
});
