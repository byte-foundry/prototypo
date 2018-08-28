import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {MemoryRouter, Switch, Route} from 'react-router-dom';
import {
	render,
	fireEvent,
	cleanup,
	waitForElement,
} from 'react-testing-library';

import Signin, {
	LOGGED_IN_USER,
	AUTHENTICATE_EMAIL_USER,
} from '../signin.components';

import '../../../../__mocks__/storageMock';

jest.mock('../../services/hoodie.services');
jest.mock('../../components/oauth-buttons.components');

global.Intercom = jest.fn();
global.trackJs = {track: jest.fn(), addMetadata: jest.fn()};

afterEach(cleanup);

describe('Signin', () => {
	it('should signin when everything is ok', async () => {
		const mocks = [
			{
				request: {query: LOGGED_IN_USER},
				result: {
					data: {
						user: null,
					},
				},
			},
			{
				request: {
					query: AUTHENTICATE_EMAIL_USER,
					variables: {
						email: 'test@test.test',
						password: 'wrong',
					},
				},
				result: {
					errors: [
						{
							functionError: 'Invalid Credentials',
							code: 5001,
						},
					],
				},
			},
			{
				request: {
					query: AUTHENTICATE_EMAIL_USER,
					variables: {
						email: 'test@test.test',
						password: 'password',
					},
				},
				result: {
					data: {
						auth: {
							token: 'authentication_token',
						},
					},
				},
			},
			{
				request: {query: LOGGED_IN_USER},
				result: {
					data: {
						user: {
							id: 'myid',
						},
					},
				},
			},
		];

		const {getByText, getByTestId, getByLabelText} = render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<MemoryRouter initialEntries={['/signin']} initialIndex={0}>
					<Switch>
						<Route path="/signin" component={Signin} />
						<Route path="/library" render={() => <p>Library</p>} />
					</Switch>
				</MemoryRouter>
			</MockedProvider>,
		);

		// waiting for the loading to finish
		const form = await waitForElement(() => getByTestId('sign-in-form'));

		// Trying to log without entering credentials
		fireEvent.submit(form);

		await waitForElement(() => getByText('Fields with a * are required'));

		fireEvent.change(getByLabelText('Email', {exact: false}), {
			target: {value: 'test@test.test'},
		});
		fireEvent.change(getByLabelText('Password', {exact: false}), {
			target: {value: 'wrong'},
		});
		// Until event submission is supported by JSDOM
		fireEvent.submit(form, {
			target: {
				email: {value: 'test@test.test'},
				password: {value: 'password'},
			},
		});

		await waitForElement(() => getByText('Invalid Credentials'));

		fireEvent.change(getByLabelText('Email', {exact: false}), {
			target: {value: 'test@test.test'},
		});
		fireEvent.change(getByLabelText('Password', {exact: false}), {
			target: {value: 'password'},
		});
		// Until event submission is supported by JSDOM
		fireEvent.submit(form, {
			target: {email: 'test@test.test', password: 'password'},
		});

		await waitForElement(() => getByText('Library'));
	});
});
