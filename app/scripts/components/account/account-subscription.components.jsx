import React from 'react';
import Lifespan from 'lifespan';
import moment from 'moment';
import {Link} from 'react-router';

import LocalClient from '../../stores/local-client.stores.jsx';

import getCurrency from '../../helpers/currency.helpers.js';

import DisplayWithLabel from '../shared/display-with-label.components.jsx';
import FormSuccess from '../shared/form-success.components.jsx';

export default class AccountSubscription extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			card: [],
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					plan: head.toJS().infos.subscriptions,
					card: head.toJS().infos.card,
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
		const noCard = (
			<h3>
				You don't have a card right now. <Link className="account-link" to="/account/details/add-card">Add a card</Link> before subscribing.
			</h3>
		);
		const currency = this.state.card[0] ? getCurrency(this.state.card[0].country) : undefined;
		const currencySymbol = currency === 'USD'
			? {
				before: '$',
				after: '',
			}
			: {
				before: '',
				after: '€',
			};
		const periodEnd = this.state.plan ? moment.unix(this.state.plan[0].current_period_end).format('L') : '';
		const cardDetail = this.state.card ? this.state.card.map((card) => {
			const cardDom = (
				<div className="account-subscription-card">
					<div className="account-subscription-card-number">**** **** **** {card.last4}</div>
					<div className="account-subscription-card-expiry">will expire on {card.exp_month}/{card.exp_year}</div>
				</div>
			);

			return <DisplayWithLabel label="Your card" data={cardDom} key={card.id}/>;
		}) : noCard;

		const successCard = this.props.location.query.newCard
			? <FormSuccess successText="You've successfully changed card"/>
			: false;

		const noPlan = (
			<h3>
				You do not have a plan. Subscribe to our pro plan to benefit of the full power of Prototypo
			</h3>
		);

		const plan = this.state.plan && this.state.plan[0].plan.id.indexOf('personal') === -1
			? 'Free subscription'
			: this.state.plan && this.state.plan[0].plan.id.indexOf('annual') === -1
				? 'Professional monthly subscription'
				: 'Professional annual subscription';

		const content = this.state.plan
			? (
				<div className="account-base account-subscription">
					<DisplayWithLabel label="Your plan" data={plan}/>
					<p>
						Your subscription will automatically renew on <span className="account-emphase">{periodEnd}</span> and you will be charged <span className="account-emphase">{`${currencySymbol.before}15${currencySymbol.after}`}</span>
					</p>
					{cardDetail}
					{successCard}
				</div>
			)
			: noPlan;

		return content;
	}
}
