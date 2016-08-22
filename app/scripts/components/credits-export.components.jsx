import React from 'react';
import {Link} from 'react-router';
import Lifespan from 'lifespan';
import vatrates from 'vatrates';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

import Button from './shared/button.components.jsx';
import Modal from './shared/modal.components.jsx';
import AddCard from './shared/add-card.components.jsx';
import FormError from './shared/form-error.components.jsx';

export default class CreditsExport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: [],
			inError: {},
			country: undefined,
			currency: undefined,
			buyCreditsNewCreditAmount: undefined,
		};

		// function binding
		this.handleSubmit = this.handleSubmit.bind(this);
		this.exit = this.exit.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					loading: head.toJS().buyCreditsForm.loading,
					errors: head.toJS().buyCreditsForm.errors,
					inError: head.toJS().buyCreditsForm.inError,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					buyCreditsNewCreditAmount: head.toJS().buyCreditsNewCreditAmount,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentDidMount() {
		// format : freegeoip.net/{format}/{IP_or_hostname}
		const url = '//freegeoip.net/json/';

		fetch(url)
			.then((response) => {
				if (response) {
					return response.json();
				}
			})
			.then((response) => {
				if (response.country_code in vatrates) {
					this.setState({
						currency: 'EUR',
					});
				}
				else {
					this.setState({
						currency: 'DOL',
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clean-form', 'buyCreditsForm');
		this.client.dispatchAction('/store-value', {buyCreditsNewCreditAmount: undefined});
		this.lifespan.release();
	}

	handleSubmit(e) {
		e.preventDefault();
		e.stopPropagation();
		this.client.dispatchAction('/buy-credits', {
			card: this.refs.card.data(),
			currency: this.state.currency,
		});
	}

	exit() {
		this.client.dispatchAction('/store-value', {openBuyCreditsModal: false});
		window.Intercom('trackEvent', 'closeOpenBuyCreditsModal');
		Log.ui('BuyCredits.close');
	}

	render() {
		const errors = this.state.errors.map((error, index) => {
			return <FormError key={index} errorText={error} />;
		});
		const newCredits = this.state.buyCreditsNewCreditAmount;
		const currency = this.state.currency === 'EUR' ? '€' : '$';

		const buyCreditsForm = newCredits
			? (
				<div className="credits-obtained">
					<div>
						<p>
							You now have {newCredits} credits
						</p>
					</div>
					<div>
						<Button click={this.exit} label="Great let me export now!">
						</Button>
					</div>
				</div>
			) : (
				<form className="sign-in-form" onSubmit={this.handleSubmit}>
					<AddCard ref="card" inError={this.state.inError}/>
					{errors}
					<div className="add-family-form-buttons">
						<Button click={this.exit} label="Cancel" neutral={true}/>
						<Button click={this.handleSubmit} label={`Buy 5 credits for 5 ${currency}`} loading={this.state.loading}/>
					</div>
				</form>
			);

		return (
			<Modal propName={this.props.propName}>
				<div className="modal-container-title account-header">Buy export credits</div>
				<div className="credits modal-container-content">
					{buyCreditsForm}
				</div>
			</Modal>
		);
	}
}
