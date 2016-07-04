import React from 'react';
import classNames from 'classnames';
import WaitForLoad from './wait-for-load.components.jsx';
import Modal from './modal.components.jsx';
import moment from 'moment';

export default class CardsWidget extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] cards widget');
		}

		let content;

		if (this.props.cards.length === 0) {
			content = (
				<div>
					<h3 className="cards-widget-add-title">
						You currently do not have a card registered in your account
					</h3>
					<p className="cards-widget-add-intro">
						Fill your card info to register your card.
					</p>
					<CardForm errors={this.props.errors} addCard={this.props.addCard} loaded={this.props.loaded}/>
				</div>
			);
		}
		else {
			content = _.map(this.props.cards, (card) => {
				return (
				<WaitForLoad loaded={this.props.loaded}>
					<div className="cards-widget-list">
						<h1 className="cards-widget-list-title">Your cards</h1>
						<CardWidget
							card={card}
							errors={this.props.errors}
							deleteCard={this.props.deleteCard}
							changeCard={this.props.changeCard}
							loaded={this.props.loaded}/>
					</div>
				</WaitForLoad>
				);
			});
		}

		return (
			<div className="cards-widget">
				{content}
			</div>
		);
	}
}

class CardWidget extends React.Component {
	componentWillMount() {
		this.setState({
			changeCard: false,
		});
	}
	render() {
		const warning = moment(`01/${this.props.card.exp_month}/${this.props.card.exp_year}`, 'DD/MM/YYYY')
			.endOf('month').diff(moment(), 'months') < 1 ? (<div className="card-widget-info-warning">Your card expire soon you should change it</div>) : undefined;

		return (
			<div className="card-widget">
				<div className="card-widget-img">
					<img src="assets/images/super-credit-card.svg"/>
				</div>
				<div className="card-widget-info">
					<h3 className="card-widget-info-title">Your card info</h3>
					<p>**** **** **** {this.props.card.last4}</p>
					<p>expire {this.props.card.exp_month} / {this.props.card.exp_year}</p>
					<button className="card-widget-info-button" onClick={() => { this.props.deleteCard(this.props.card.id); }}>Delete card</button>
					<button className="card-widget-info-button" onClick={() => { this.setState({changeCard: true}); }}>Change card</button>
					{warning}
				</div>
				<Modal show={this.state.changeCard}>
					<h1 className="cards-widget-add-title">
						Change your payment card
					</h1>
					<CardForm
						errors={this.props.errors}
						loaded={this.props.loaded}
						changeTitle={true}
						addCard={(info) => {
						this.props.changeCard.bind(null, this.props.card.id)(info)
							.then(() => {
								this.setState({
									changeCard: false,
								});
							})
							.catch(() => { return; });
					}}/>
				</Modal>
			</div>
		);
	}
}

class CardForm extends React.Component {

	addCard() {
		const info = {
			cardNumber: this.refs.cardNumber.value,
			cvc: this.refs.cvc.value,
			month: this.refs.month.value,
			year: this.refs.year.value,
		};

		this.props.addCard(info);
	}

	render() {

		const numberClasses = classNames({
			"is-error": this.props.errors.code === 'incorrect_number' || this.props.errors.code === 'invalid_number',
			"cards-widget-add-number": true,
			"cards-widget-add-input": true,
		});
		const monthClasses = classNames({
			"is-error": this.props.errors.code === 'invalid_expiry_month',
			"cards-widget-add-month": true,
			"cards-widget-add-input": true,
		});
		const yearClasses = classNames({
			"is-error": this.props.errors.code === 'invalid_expiry_year',
			"cards-widget-add-year": true,
			"cards-widget-add-input": true,
		});
		const cvcClasses = classNames({
			"is-error": this.props.errors.code === 'invalid_cvc',
			"cards-widget-add-cvc": true,
			"cards-widget-add-input": true,
		});

		return (<div className="cards-widget-add">
				<div className="cards-widget-add-form">
					<div className="cards-widget-add-form-disclaimer">
						This is a secured form. Your informations are safe.
					</div>
					<div className="cards-widget-add-line clearfix">
						<div className="cards-widget-add-line-block">
							<label for="number">Card number</label>
							<input id="number" className={numberClasses} ref="cardNumber" placeholder="4242 4242 4242 4242" type="text"/>
						</div>
					</div>
					<div className="cards-widget-add-line clearfix">
						<div className="cards-widget-add-line-block">
							<label for="exp_month">Month</label>
							<input id="exp_month" className={monthClasses} ref="month" placeholder="12" type="text"/>
						</div>
						<div className="cards-widget-add-line-block">
							<label for="exp_year">Year</label>
							<input id="exp_year" className={yearClasses} ref="year" placeholder="2015" type="text"/>
						</div>
						<div className="cards-widget-add-line-block flex3 align-end">
							<label for="cvc">CVC</label>
							<input id="cvc" className={cvcClasses} ref="cvc" placeholder="123" type="text"/>
						</div>
					</div>
					<WaitForLoad loaded={this.props.loaded}>
						<button className="cards-widget-add-button" onClick={() => {this.addCard();}}>Add my card</button>
					</WaitForLoad>
				</div>
			</div>
		);
	}
}
