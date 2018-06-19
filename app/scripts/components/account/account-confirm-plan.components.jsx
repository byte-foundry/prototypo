import React from 'react';
import Lifespan from 'lifespan';
import moment from 'moment';

import LocalClient from '../../stores/local-client.stores.jsx';
import getCurrency from '../../helpers/currency.helpers.js';

import HoodieApi from '../../services/hoodie.services.js';
import Button from '../shared/new-button.components';
import WaitForLoad from '../wait-for-load.components';

import * as Plans from '../../data/plans.data';

export default class AccountConfirmPlan extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
		};

		this.confirmPlanChange = this.confirmPlanChange.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				if (this.props.location.query.plan) {
					const planBase = this.props.location.query.plan;
					const currency = getCurrency(head.toJS().d.cards[0].country);
					const planId = `${planBase}_${currency}_taxfree`;

					this.setState({
						loading: !this.state.invoice, // if invoice already here, don't show we're reloading it
						confirmationLoading: head.toJS().d.confirmation.loading,
						plan: planBase,
						currency,
					});

					HoodieApi.getUpcomingInvoice({
						subscription_plan: planId,
						subscription_quantity: this.props.location.query.quantity,
					}).then((data) => {
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
		const {location} = this.props;
		const {plan, currency} = this.state;

		window.Intercom('trackEvent', 'change-plan-confirm', {
			plan,
		});

		this.client.dispatchAction('/confirm-buy', {
			plan,
			currency,
			quantity: parseInt(location.query.quantity, 10) || undefined,
			pathname: '/account/details',
		});
	}

	render() {
		const {invoice, loading, confirmationLoading} = this.state;

		return (
			<div className="account-base account-confirm-plan">
				<h1 className="subscription-title">This is what you will be charged</h1>
				<WaitForLoad loaded={!loading}>
					{invoice && <Invoice {...invoice} />}
					<Button style={{float: 'right'}} onClick={this.confirmPlanChange}>
						<WaitForLoad loading={confirmationLoading} secColor>
							Confirm change
						</WaitForLoad>
					</Button>
				</WaitForLoad>
			</div>
		);
	}
}

class Invoice extends React.Component {
	render() {
		const {currency, lines} = this.props;

		const currencySymbol
			= currency === 'USD'
				? {
					before: '$',
					after: '',
				}
				: {
					before: '',
					after: '€',
				};

		const total = lines.data.reduce((sum, line) => sum + line.amount, 0);
		const invoiceLines = lines.data.map(line => <InvoiceLine line={line} symbol={currencySymbol} />);

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
						<td className="invoice-total-amount">
							{currencySymbol.before
								+ (total / 100).toFixed(2)
								+ currencySymbol.after}
						</td>
					</tr>
				</tbody>
			</table>
		);
	}
}

class InvoiceLine extends React.Component {
	render() {
		const {line} = this.props;
		let desc = this.props.line.description;

		if (line.plan && !desc) {
			const plan = Object.values(Plans).filter(({prefix}) =>
				line.plan.id.includes(prefix),
			)[0];
			const planName = (plan && plan.description) || 'Unknown plan';

			const startDate = moment.unix(this.props.line.period.start).format('L');
			const endDate = moment.unix(this.props.line.period.end).format('L');

			const quantityDesc = line.quantity > 1 ? `${line.quantity} x ` : '';

			desc = `${quantityDesc}${planName} from ${startDate} to ${endDate}`;
		}

		return (
			<tr className="invoice-line">
				<td>{desc}</td>
				<td>
					{this.props.symbol.before
						+ (this.props.line.amount / 100).toFixed(2)
						+ this.props.symbol.after}
				</td>
			</tr>
		);
	}
}
