import React from 'react';
import Lifespan from 'lifespan';
import moment from 'moment';

import LocalClient from '../../stores/local-client.stores.jsx';
import getCurrency from '../../helpers/currency.helpers.js';

import HoodieApi from '../../services/hoodie.services.js';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

export default class AccountConfirmPlan extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
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

					HoodieApi.getUpcomingInvoice({
						'subscription_plan': planId,
					})
					.then((data) => {
						this.setState({
							plan: planBase,
							currency,
							invoice: data,
							loading: head.toJS().d.confirmation.loading,
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
		const invoice = this.state.invoice
			? <Invoice invoice={this.state.invoice}/>
			: false;

		return (
			<div className="account-base account-confirm-plan">
				<h1 className="subscription-title">This is what you will be charged</h1>
				{invoice}
				<AccountValidationButton label="Confirm plan change" click={() => {this.confirmPlanChange();}}/>
			</div>
		);
	}
}

class Invoice extends React.Component {
	render() {

		const currencySymbol = this.props.invoice.currency === 'usd'
			? {
				before: '$',
				after: '',
			}
			: {
				before: '',
				after: '€',
			};
		const total = _.reduce(this.props.invoice.lines.data, (sum, line) => {
			return sum + line.amount;
		}, 0);
		const lines = _.map(this.props.invoice.lines.data, (line) => {
			return <InvoiceLine line={line} symbol={currencySymbol}/>;
		});

		return (
			<table className="invoice">
				<thead>
					<tr>
						<th className="invoice-big-head">description</th>
						<th>amount</th>
					</tr>
				</thead>
				<tbody>
					{lines}
					<tr className="invoice-total">
						<td className="invoice-total-label">total</td>
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
