import React from 'react';
import Lifespan from 'lifespan';
import vatrates from 'vatrates';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

import Button from './shared/button.components.jsx';
import Modal from './shared/modal.components.jsx';
import AddCard from './shared/add-card.components.jsx';
import InputWithLabel from './shared/input-with-label.components';
import FormError from './shared/form-error.components.jsx';

export default class CreditsExport extends React.PureComponent {
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
			.onUpdate((head) => {
				this.setState({
					loading: head.toJS().d.buyCreditsForm.loading,
					errors: head.toJS().d.buyCreditsForm.errors,
					inError: head.toJS().d.buyCreditsForm.inError,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					buyCreditsNewCreditAmount: head.toJS().d.buyCreditsNewCreditAmount,
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
				this.setState({
					currency: response.country_code in vatrates ? 'EUR' : 'DOL',
				});
			})
			.catch(() => {
				this.setState({
					currency: 'DOL',
				});
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
		if (!this.state.loading) {
			this.client.dispatchAction('/buy-credits', {
				card: this.refs.card.data(),
				vat: this.refs.vat.inputValue,
				currency: this.state.currency,
			});
		}
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
					<InputWithLabel ref="vat" label="VAT number" info="(only necessary if you pay with a company card)"/>
					{errors}
					<div className="action-form-buttons">
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
