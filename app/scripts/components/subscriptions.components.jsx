import React from 'react';
import Lifespan from 'lifespan';
import Remutable from 'remutable';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import RemoteClient from 'nexus-flux-socket.io/client';
import {Subscribe} from 'nexus-flux/dist/Server.Event';
import {SubscriptionService} from '../services/subscriptions.services.js';
import HoodieApi from '../services/hoodie.services.js';
import uuid from 'node-uuid';

import SubscriptionWidget from './subscription-widget.components.jsx';
import SubscriptionPurchase from './subscription-purchase.components.jsx';
import CardsWidget from './cards-widget.components.jsx';

export default class Subscriptions extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			cards:{},
			subscriptions:{},
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();

	}

	async addSubscriptions(plan) {
		const newSubscriptions = await SubscriptionService.buySubscription(plan);
		this.client.dispatchAction('/add-subscription',newSubscriptions);
	}

	async deleteSubscriptions(subId) {
		await SubscriptionService.removeSubscription(subId);
		this.client.dispatchAction('/remove-subscription',subId);
	}

	async addCards(token) {
		const card = await SubscriptionService.addCards(token);
		this.client.dispatchAction('/add-card',{token, card});
	}

	async removeCards(token) {
		await SubscriptionService.removeCards(token);
		this.client.dispatchAction('/remove-card',token);
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	connect() {
		const storeId = this.storeId = `/stripe${uuid.v4()}`;
		HoodieApi.startTask('stripe','create-store',{storeId})
			.then(() => {
				const client = this.client = new RemoteClient('http://localhost:43430');
				const storeName = `${storeId}$$${HoodieApi.instance.hoodieId}`;
				const interval = setInterval(async () => {
					try {
						const store = await client.fetch(storeName);
						clearInterval(interval);

						client.getStore(storeName,this.lifespan)
							.onUpdate(({head}) => {
								this.setState(head.toJS());
							})
							.onDelete(() => {
								this.setState(undefined);
							});
					}
					catch (error) {
						if (error.status !== 404) {
							clearInterval(interval);
							console.log(`Don't go here please`);
						}
					}
				},200);
			})
			.catch(() => {
				console.log('Albany we have a problem !')
			});
	}

	addCard() {
		const cardNumber = React.findDOMNode(this.refs.cardNumber);
		const year = React.findDOMNode(this.refs.year);
		const month = React.findDOMNode(this.refs.month);
		const cvc = React.findDOMNode(this.refs.cvc);
		const client = this.client;
		const data = {
			path:this.storeId,
			hoodieId: HoodieApi.instance.hoodieId,
			email:HoodieApi.instance.email,
		}

		Stripe.card.createToken({
			number: cardNumber.value,
			cvc: cvc.value,
			exp_month: month.value,
			exp_year: year.value,
		}, (status, response) => {
			data.token = response.id;
			client.dispatchAction('/add-customer',data);
		})
	}

	render() {
		let content;
		if (this.subscriptions) {
			content = _.map(this.subscriptions, (sub) => {
				<SubscriptionWidget subscription={this.subscriptions} />
			});
		}
		else {
			content = <SubscriptionPurchase />
		}
		return (
			<div>
				<button onClick={() => { SubscriptionService.mySubscription()}}>Create remote store</button>
				<button onClick={() => {this.connect()}}>Connect to link</button>
				<input ref="cardNumber" type="text"/>
				<input ref="cvc" type="text"/>
				<input ref="month" type="text"/>
				<input ref="year" type="text"/>
				<button onClick={() => {this.addCard()}}>Create Card</button>
			</div>
		)
	}
}
