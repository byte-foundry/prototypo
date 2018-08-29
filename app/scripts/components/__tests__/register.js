import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {MemoryRouter, Switch, Route} from 'react-router-dom';
import {
	render,
	fireEvent,
	cleanup,
	waitForElement,
} from 'react-testing-library';

import Register, {
	LOGGED_IN_USER,
	SIGN_UP_AND_LOGIN,
} from '../register.components';

import '../../../../__mocks__/storageMock';

jest.mock('../../services/hoodie.services');
jest.mock('../../components/oauth-buttons.components');

global.Intercom = jest.fn();
global.trackJs = {track: jest.fn(), addMetadata: jest.fn()};
global.fbq = jest.fn();

afterEach(cleanup);

describe('Register', () => {
	it('should be able to register with only a first name, email and password', async () => {
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
					query: SIGN_UP_AND_LOGIN,
					variables: {
						email: 'test@test.test',
						password: 'password',
						firstName: 'Jean-Michel',
					},
				},
				result: {
					data: {
						signupEmailUser: {id: 'userid'},
						auth: {token: 'token'},
					},
				},
			},
			{
				request: {query: LOGGED_IN_USER},
				result: {
					data: {
						user: {
							id: 'userid',
						},
					},
				},
			},
		];

		const {getByText, getByTestId, getByLabelText} = render(
			<MockedProvider mocks={mocks} addTypename={false}>
				<MemoryRouter initialEntries={['/register']} initialIndex={0}>
					<Switch>
						<Route path="/register" component={Register} />
						<Route path="/library" render={() => <p>Library</p>} />
					</Switch>
				</MemoryRouter>
			</MockedProvider>,
		);

		// waiting for the loading to finish
		const form = await waitForElement(() => getByTestId('register-form'));

		// Trying to register without entering credentials
		fireEvent.submit(form);

		await waitForElement(() => getByText('Fields with a * are required'));

		fireEvent.change(getByLabelText('First name', {exact: false}), {
			target: {value: 'Jean-Michel'},
		});
		fireEvent.change(getByLabelText('Email', {exact: false}), {
			target: {value: 'test@test.test'},
		});
		fireEvent.change(getByLabelText('Password', {exact: false}), {
			target: {value: 'password'},
		});
		// Until event submission is supported by JSDOM
		fireEvent.submit(form, {
			target: {
				firstname: {value: 'Jean-Michel'},
				email: {value: 'test@test.test'},
				password: {value: 'password'},
			},
		});

		await waitForElement(() => getByText('Library'));
	});
});
