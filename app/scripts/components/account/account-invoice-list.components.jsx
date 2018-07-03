import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores';

import WaitForLoad from '../wait-for-load.components';
import Price from '../shared/price.components';
import Dashboard from './account-dashboard.components';

export default class AccountInvoiceList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			invoices: [],
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.setState({loading: true});

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					loading: !head.toJS().d.invoices,
					invoices: head.toJS().d.invoices || [],
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.dispatchAction('/load-customer-invoices');
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const {loading, invoices} = this.state;

		const invoicesRows
			= invoices.length > 0 ? (
				invoices.map(invoice => (
					<InvoiceLink invoice={invoice} key={invoice.id} />
				))
			) : (
				<p>You have no invoices for the moment.</p>
			);

		return (
			<Dashboard title="My billing history">
				<div className="account-base account-billing-history">
					<WaitForLoad loading={loading}>
						<h1>Your invoices</h1>
						<ul className="list">{invoicesRows}</ul>
					</WaitForLoad>
				</div>
			</Dashboard>
		);
	}
}

class InvoiceLink extends React.Component {
	render() {
		const {
			created_at,
			currency,
			permalink,
			number,
			secure_id,
			total_cents,
		} = this.props.invoice;

		return (
			<li className="list-item">
				<span className="list-item-date">
					{new Intl.DateTimeFormat('en-US').format(new Date(created_at * 1000))}
				</span>
				<span className="list-item-text">
					{number} - {secure_id}
				</span>
				<span className="list-item-text">
					<Price amount={total_cents / 100} currency={currency} />
				</span>
				<a className="list-item-download" target="_blank" href={permalink}>
					Download
				</a>
			</li>
		);
	}
}
