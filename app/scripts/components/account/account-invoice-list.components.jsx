import gql from 'graphql-tag';
import React from 'react';
import {Query} from 'react-apollo';

import WaitForLoad from '../wait-for-load.components';
import Dashboard from './account-dashboard.components';
import InvoiceLink from './invoice-link.components';

const GET_INVOICES = gql`
	query getInvoices {
		user {
			id
			invoices @client {
				id
				created_at
				currency
				permalink
				number
				secure_id
				total_cents
			}
		}
	}
`;

export default class AccountInvoiceList extends React.Component {
	render() {
		const invoicesRows = (
			<Query query={GET_INVOICES}>
				{({data, loading}) => {
					if (loading) return <WaitForLoad loading />;

					if (!data.user.invoices.length) {
						return <p>You have no invoices for the moment.</p>;
					}

					return data.user.invoices.map(invoice => (
						<InvoiceLink invoice={invoice} key={invoice.id} />
					));
				}}
			</Query>
		);

		return (
			<Dashboard title="My billing history">
				<div className="account-base account-billing-history">
					<h1>Your invoices</h1>
					<ul className="list">{invoicesRows}</ul>
				</div>
			</Dashboard>
		);
	}
}
