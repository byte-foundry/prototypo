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
			credits: undefined,
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					plan: head.toJS().d.infos.subscriptions,
					card: head.toJS().d.infos.card,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					credits: head.toJS().d.credits,
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
			<div>
				<h3 className="account-dashboard-container-small-title">
					You don't have a card right now.
				</h3>
				<p>
					<Link className="account-link" to="/account/details/add-card">Add a card</Link> before subscribing.
				</p>
			</div>
		);
		const currency = this.state.card && this.state.card[0] ? getCurrency(this.state.card[0].country) : undefined;
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
			return (
				<div>
					<DisplayWithLabel label="Your card" key={card.id}>
						<div className="account-subscription-card">
							<div className="account-subscription-card-number">**** **** **** {card.last4}</div>
							<div className="account-subscription-card-expiry">will expire on {card.exp_month}/{card.exp_year}</div>
						</div>
					</DisplayWithLabel>
				</div>
			);
		}) : noCard;

		const successCard = this.props.location.query.newCard
			? <FormSuccess successText="You've successfully changed card"/>
			: false;

		const noPlan = (
			<div>
				<h3 className="account-dashboard-container-small-title">
					You do not have a plan for the moment.
				</h3>
				<p>
					<img style={{width: '100%'}} src="assets/images/go-pro.gif" />
				</p>
				<p>
					Subscribe to our <Link className="account-link" to="account/create/choose-a-plan">pro plan</Link> to benefit of the full power of Prototypo without restrictions or buy <Link className="account-link" to="dashboard?buy_credits=true">some credits</Link> to export and use your fonts everywhere!
				</p>
				{credits}
			</div>
		);

		const planInfos = {
			'free_monthly': {
				name: 'Free subscription',
				price: 0.00,
			},
			'personal_monthly': {
				name: 'Professional monthly subscription',
				price: 15.00,
			},
			'personal_annual_99': {
				name: 'Professional annual subscription',
				price: 144.00,
			},
		};

		const plan = _.find(planInfos, (planInfo, key) => {
			return this.state.plan && this.state.plan[0].plan.id.indexOf(key) !== -1;
		});

		const credits = (
			<div>
				<div className="display-credits">
					<DisplayWithLabel label="Your export credits">
						{this.state.credits ? this.state.credits : '0' }
					</DisplayWithLabel>
				</div>
			</div>
		);

		const content = this.state.plan
			? (
				<div className="account-base account-subscription">
					<div>
						<DisplayWithLabel label="Your plan">
							{plan.name}
						</DisplayWithLabel>
					</div>
					<p>
						Your subscription will automatically renew on <span className="account-emphase">{periodEnd}</span> and you will be charged <span className="account-emphase">{`${currencySymbol.before}${plan.price.toFixed(2)}${currencySymbol.after}`}</span>
					</p>
					{cardDetail}
					{successCard}
					{credits}
				</div>
			)
			: noPlan;

		return (
			<div className="account-dashboard-container-main">
				{content}
			</div>
		);
	}
}
