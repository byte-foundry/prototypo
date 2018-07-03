import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {createHttpLink} from 'apollo-link-http';
import {setContext} from 'apollo-link-context';
import {onError} from 'apollo-link-error';
import {InMemoryCache} from 'apollo-cache-inmemory';

import isProduction from '../helpers/is-production.helpers';

export const ERRORS = {
	GraphQLArgumentsException: 3000,
	IdIsInvalid: 3001,
	DataItemDoesNotExist: 3002,
	IdIsMissing: 3003,
	DataItemAlreadyExists: 3004,
	ExtraArguments: 3005,
	InvalidValue: 3006,
	ValueTooLong: 3007,
	InsufficientPermissions: 3008,
	RelationAlreadyFull: 3009,
	UniqueConstraintViolation: 3010,
	NodeDoesNotExist: 3011,
	ItemAlreadyInRelation: 3012,
	NodeNotFoundError: 3013,
	InvalidConnectionArguments: 3014,
	InvalidToken: 3015,
	ProjectNotFound: 3016,
	InvalidSigninData: 3018,
	ReadonlyField: 3019,
	FieldCannotBeNull: 3020,
	CannotCreateUserWhenSignedIn: 3021,
	CannotSignInCredentialsInvalid: 3022,
	CannotSignUpUserWithCredentialsExist: 3023,
	VariablesParsingError: 3024,
	Auth0IdTokenIsInvalid: 3025,
	InvalidFirstArgument: 3026,
	InvalidLastArgument: 3027,
	InvalidSkipArgument: 3028,
	GenericServerlessFunctionError: 3031,
	RelationIsRequired: 3032,
	FilterCannotBeNullOnToManyField: 3033,
	UnhandledFunctionError: 3034,
};

const httpLink = createHttpLink({
	uri: `https://api.graph.cool/simple/v1/prototypo${
		isProduction() ? '' : '-new-dev'
	}`,
});

const withToken = setContext((_, {headers}) => {
	const token = localStorage.getItem('graphcoolToken');

	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : '',
		},
	};
});

const errorLink = onError(({graphQLErrors}) => {
	graphQLErrors.forEach((error) => {
		switch (error.code) {
		// disconnect if we know the token is invalid
		case ERRORS.InvalidToken:
			window.localStorage.removeItem('graphcoolToken');
			break;
		default:
			window.trackJs.track(error);
			break;
		}
	});
});

const cache = new InMemoryCache({
	dataIdFromObject: o => o.id,
	// addTypename: true,
	// cacheResolvers: {},
	// 	fragmentMatcher: new IntrospectionFragmentMatcher({
	// 		introspectionQueryResultData: yourData
	// 	}),
});

const apolloClient = new ApolloClient({
	link: ApolloLink.from([withToken, errorLink, httpLink]),
	cache,
	connectToDevTools: true,
	queryDeduplication: true,
});

export const tmpUpload = async (file, name = 'font') => {
	const data = new FormData();

	data.append('filename', name);
	data.append('data', file);

	const response = await fetch(
		'https://api.graph.cool/file/v1/ciz3x8qbba0ni0192kaicafgo',
		{
			method: 'POST',
			body: data,
		},
	);

	return response.json();
};

export default apolloClient;
