import React from 'react';
import moment from 'moment';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

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

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					invoices: head.toJS().d.invoices,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const invoices = this.state.invoices ? this.state.invoices.map((invoice) => {
			return <InvoiceLink invoice={invoice} key={invoice.id}/>;
		}) : (
			<p>
				You haven't any invoices for the moment.
			</p>
		);

		return (
			<div className="account-base">
				<h1>Your invoices</h1>
				<ul className="list">
					{invoices}
				</ul>
			</div>
		);
	}
}

class InvoiceLink extends React.Component {
	render() {
		const {created_at, currency, permalink, secure_id, total_cents} = this.props.invoice;

		return (
			<li className="list-item">
				<span className="list-item-date">{moment.unix(created_at).format('L')}</span>
				<span className="list-item-text">{secure_id}</span>
				<span className="list-item-text">{currency === 'USD' && '$'}{total_cents / 100}{currency === 'EUR' && '€'}</span>
				<a className="list-item-download" target="_blank" href={permalink}>Download</a>
			</li>
		);
	}
}
