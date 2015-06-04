import React from 'react';
import Lifespan from 'lifespan';
import Remutable from 'remutable';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import RemoteClient from 'nexus-flux-socket.io/client';
import {Subscribe} from 'nexus-flux/dist/Server.Event';
import {SubscriptionService} from '../services/subscriptions.services.js';
 import HoodieApi from '../services/hoodie.services.js';

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
		this.client = new LocalClient().instance;
		const server = new LocalServer().instance;

		const cardStore = server.stores['/cards'] = new Remutable({});
		const subStore = server.stores['/subscriptions'] = new Remutable({});

		this.lifespan.onRelease(() => {
			server.stores['/cards'] = undefined;
			server.stores['/subscriptions'] = undefined;
		});

		this.client.getStore('/subscriptions',this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					subscriptions:head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState({
					subscriptions:undefined,
				});
			});

		this.client.getStore('/cards',this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					cards:head.toJS(),
				});
			})
			.onDelete(() => {
				this.setState({
					cards:undefined,
				});
			});

		server.on('action',({path,params}) => {
			if (path == '/load-subscriptions') {
				const patch = subStore.set('subscriptions',params).commit();
				server.dispatchUpdate('/subscriptions',patch);
			} else if (path == '/load-cards') {
				const patch = cardStore.set('cards',params).commit();
				server.dispatchUpdate('/cards',patch);
			}
		});

		const subscriptions = await SubscriptionService.mySubscription();
		const cards = await SubscriptionService.myCards();

		this.client.dispatchAction('/load-subscriptions',subscriptions);
		this.client.dispatchAction('/load-cards',cards);

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
		console.log(HoodieApi);
		HoodieApi.instance.find('stripe-channel/undefined')
			.then(function(doc) {
				const client = new RemoteClient('http://localhost:43430');

				const store = client.fetch(`${doc.path}$$${HoodieApi.instance.hoodieId}`);

				debugger;
			});
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
				<CardsWidget cards={this.state.cards} />
				<button onClick={() => { SubscriptionService.mySubscription()}}>Create remote store</button>
				<button onClick={this.connect}>Connect to link</button>
				{content}
			</div>
		)
	}
}
