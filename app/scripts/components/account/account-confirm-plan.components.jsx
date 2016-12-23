import React from 'react';
import Lifespan from 'lifespan';
import moment from 'moment';

import LocalClient from '../../stores/local-client.stores.jsx';
import getCurrency from '../../helpers/currency.helpers.js';

import HoodieApi from '../../services/hoodie.services.js';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';
import WaitForLoad from '../wait-for-load.components';

export default class AccountConfirmPlan extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.confirmPlanChange = this.confirmPlanChange.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				if (head.toJS().d.infos.plan) {
					const planBase = head.toJS().d.infos.plan;
					const currency = getCurrency(head.toJS().d.infos.card[0].country);
					const planId = `${planBase}_${currency}_taxfree`;

					this.setState({
						loading: !this.state.invoice, // if invoice already here, don't show we're reloading it
						confirmationLoading: head.toJS().d.confirmation.loading,
						plan: planBase,
						currency,
					});

					HoodieApi.getUpcomingInvoice({
						'subscription_plan': planId,
					})
					.then((data) => {
						this.setState({
							invoice: data,
							loading: false,
						});
					});
				}
			})
			.onDelete(() => {
				this.setState(undefined);
			});

	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	confirmPlanChange() {
		this.client.dispatchAction('/confirm-buy', {
			plan: this.state.plan,
			currency: this.state.currency,
		});
	}

	render() {
		const invoice = this.state.invoice && <Invoice invoice={this.state.invoice}/>;

		return (
			<div className="account-base account-confirm-plan">
				<h1 className="subscription-title">This is what you will be charged</h1>
				<WaitForLoad loaded={!this.state.loading}>
					{invoice}
				</WaitForLoad>
				<AccountValidationButton loading={this.state.confirmationLoading} label="Confirm plan change" click={this.confirmPlanChange}/>
			</div>
		);
	}
}

class Invoice extends React.Component {
	render() {
		const {currency, lines} = this.props.invoice;

		const currencySymbol = currency === 'USD'
			? {
				before: '$',
				after: '',
			}
			: {
				before: '',
				after: '€',
			};

		const total = lines.data.reduce((sum, line) => {
			return sum + line.amount;
		}, 0);
		const invoiceLines = lines.data.map((line) => {
			return <InvoiceLine line={line} symbol={currencySymbol}/>;
		});

		return (
			<table className="invoice">
				<thead>
					<tr>
						<th className="invoice-big-head">Description</th>
						<th>Amount</th>
					</tr>
				</thead>
				<tbody>
					{invoiceLines}
					<tr className="invoice-total">
						<td className="invoice-total-label">Total</td>
						<td className="invoice-total-amount">{currencySymbol.before + ((total / 100).toFixed(2)) + currencySymbol.after}</td>
					</tr>
				</tbody>
			</table>
		);
	}
}

class InvoiceLine extends React.Component {
	render() {
		let desc = this.props.line.description;

		if (this.props.line.plan && !desc) {
			desc = this.props.line.plan.id.indexOf('personal_monthly_') === -1
				? 'Professional annual subscription'
				: 'Professional monthly subscription';

			const startDate = moment.unix(this.props.line.period.start).format('L');
			const endDate = moment.unix(this.props.line.period.end).format('L');

			desc += ` from ${startDate} to ${endDate}`;
		}
		return (
			<tr className="invoice-line">
				<td>{desc}</td>
				<td>{ this.props.symbol.before + (this.props.line.amount / 100).toFixed(2) + this.props.symbol.after}</td>
			</tr>
		);
	}
}
