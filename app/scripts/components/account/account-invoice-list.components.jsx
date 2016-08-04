import React from 'react';
import moment from 'moment';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores.jsx';

export default class AccountInvoiceList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					charges: head.toJS().infos.charges,
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
		const invoices = this.state.charges ? _.map(this.state.charges, (invoice) => {
			return <InvoiceLink invoice={invoice} key={invoice.id}/>;
		}) : false;

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
		return (
			<li className="list-item">
				<span className="list-item-date">{moment.unix(this.props.invoice.created).format('L')}</span>
				<span className="list-item-text">{this.props.invoice.invoice}</span>
				<a className="list-item-download" target="_blank" href={`https://invoicestaxamo.s3.amazonaws.com/${this.props.invoice.metadata.taxamo_key}/invoice.html`}>Download</a>
			</li>
		);
	}
}
