import gql from 'graphql-tag';
import React from 'react';

import Price from '../shared/price.components';

export default class InvoiceLink extends React.Component {
	render() {
		const {
			created_at: createdAt,
			currency,
			permalink,
			number,
			secure_id: secureId,
			total_cents: totalCents,
		} = this.props.invoice;

		return (
			<li className="list-item">
				<span className="list-item-date">
					{new Intl.DateTimeFormat('en-US').format(new Date(createdAt * 1000))}
				</span>
				<span className="list-item-text">
					{number} - {secureId}
				</span>
				<span className="list-item-text">
					<Price amount={totalCents / 100} currency={currency} />
				</span>
				<a
					className="list-item-download"
					target="_blank"
					rel="noopener noreferrer"
					href={permalink}
				>
					Download
				</a>
			</li>
		);
	}
}

InvoiceLink.fragments = {
	entry: gql`
		fragment InvoiceLink on StripeQuadernoInvoice {
			id
			created_at
			currency
			permalink
			number
			secure_id
			total_cents
		}
	`,
};
