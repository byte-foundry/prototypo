import React from 'react';
import {withRouter} from 'react-router-dom';
import {injectStripe} from 'react-stripe-elements';
import debounce from 'lodash/debounce';

import {
	monthlyConst,
	annualConst,
	teamMonthlyConst,
	teamAnnualConst,
} from '../../data/plans.data';

import HoodieApi from '../../services/hoodie.services';

import FakeCard from '../shared/fake-card.components';
import AddCard from '../shared/add-card.components';
import InputNumber from '../shared/input-number.components';
import InputWithLabel from '../shared/input-with-label.components';
import Price from '../shared/price.components';
import FormError from '../shared/form-error.components';
import Button from '../shared/new-button.components';
import LoadingButton from '../shared/loading-button.components';
import getCurrency from '../../helpers/currency.helpers';
import WaitForLoad from '../wait-for-load.components';

class SubscriptionCardAndValidation extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			showCoupon: !!props.coupon,
			couponValue: props.coupon,
			couponError: null,
			inError: {},
			errors: [],
			hasBeenSubscribing: false,
			firstTimeCheck: false,
		};

		this.changeCard = this.changeCard.bind(this);
		this.handleChangeQuantity = this.handleChangeQuantity.bind(this);
		this.keepCard = this.keepCard.bind(this);
		this.addCoupon = this.addCoupon.bind(this);
		this.handleCouponChange = this.handleCouponChange.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.checkPlan = this.checkPlan.bind(this);
	}

	componentWillMount() {
		this.checkPlan(this.props.plan, this.props.quantity, this.props.coupon);
	}

	componentWillReceiveProps({plan, quantity, coupon}) {
		this.checkPlan(plan, quantity, coupon);
	}

	choosePlan = ({plan, coupon}) => {
		if (plan) {
			this.setState({plan});
			window.Intercom('trackEvent', `chosePlan${plan}`);
		}

		this.setState({couponValue: coupon});

		if (plan) {
			this.validateCoupon({
				plan,
				coupon,
			});
		}
	};

	validateCoupon = debounce(async ({plan, coupon}) => {
		try {
			this.setState({validCoupon: null, couponError: null});

			if (!coupon) {
				this.props.onSelectCoupon(null);
				return;
			}

			const validCoupon = await HoodieApi.validateCoupon({
				coupon,
				plan,
			});

			this.setState({validCoupon});
			this.props.onSelectCoupon(validCoupon);
		}
		catch (err) {
			this.setState({couponError: err.message});
			this.props.onSelectCoupon(null);
		}
	}, 500);

	checkPlan(plan, quantity, coupon) {
		if (this.props.coupon !== coupon || !this.state.firstTimeCheck) {
			this.choosePlan({
				plan,
				quantity,
				coupon,
			});
			this.setState({firstTimeCheck: true});
		}

		if (!coupon || coupon === '') {
			this.setState({couponValue: undefined});
		}

		// remove the coupon field when changing plan
		if (this.props.plan !== plan) {
			this.setState({validCoupon: null, showCoupon: false});
		}

		const newPlan = {};

		if (plan.startsWith('team') && Number.isNaN(parseInt(quantity, 10))) {
			newPlan.quantity = 1;
		}

		if (
			plan !== 'personal_monthly'
			&& plan !== 'personal_annual_99'
			&& plan !== 'team_monthly'
			&& plan !== 'team_annual'
		) {
			newPlan.plan = plan.startsWith('team')
				? 'team_annual'
				: 'personal_annual_99';
		}

		if (newPlan.quantity || newPlan.plan) {
			this.props.onChangePlan({
				...newPlan,
				coupon,
			});
		}
	}

	changeCard() {
		this.setState({changeCard: true});
	}

	keepCard() {
		this.setState({changeCard: false});
	}

	addCoupon() {
		this.setState({showCoupon: true});
	}

	addCard = async (options) => {
		this.setState({loadingAddCard: true});

		const {token} = await this.props.stripe.createToken(options);

		// This bit of code is there to analyze the need of 3D secure
		// among our users and to know if the failing payment is due
		// to their card requiring it.
		// We shall fully move to Sources later.
		try {
			// eslint-disable-next-line no-shadow
			const {source} = await this.props.stripe.createSource({
				type: 'card',
				owner: options,
			});

			window.Intercom('update', {
				'3d-secure': source.card.three_d_secure,
			});
		}
		catch (err) {
			window.trackJs.track(err);
		}

		try {
			await HoodieApi.updateCustomer({
				source: token.id,
			});

			this.setState({loadingAddCard: false});

			return token.card;
		}
		catch (err) {
			this.setState({loadingAddCard: false, errors: [err.message]});
			return err;
		}
	};

	async subscribe(e) {
		e.preventDefault();

		const {plan, quantity, cards, history} = this.props;
		const {couponValue} = this.state;

		this.setState({loading: true});

		let source;

		if (cards.length > 0) {
			source = cards[0];
		}
		else {
			const fullname = e.target.fullname.value;

			source = await this.addCard({name: fullname});
		}

		const currency = getCurrency(source.country);

		const data = await HoodieApi.updateSubscription({
			plan: `${plan}_${currency}_taxfree`,
			coupon: couponValue,
			quantity: (plan.startsWith('team') && quantity) || undefined,
		});

		this.setState({loading: false});

		history.replace('/account/success');

		// TMP
		const customer = await HoodieApi.getCustomerInfo();

		this.client.dispatchAction('/load-customer-data', customer);
		// TMP
	}

	handleChangeQuantity(value) {
		this.props.onChangePlan({
			quantity: parseInt(value, 10),
			plan: this.props.plan,
			coupon: this.props.coupon || undefined,
		});
	}

	handleCouponChange(e) {
		this.props.onChangePlan({
			coupon: e.target.value,
			plan: this.props.plan,
			quantity: this.props.quantity,
		});
	}

	render() {
		const {
			showCoupon,
			couponValue,
			validCoupon,
			couponError,
			loading,
			loadingAddCard,
		} = this.state;
		const {country, plan, cards, quantity} = this.props;

		let percentPrice = 1;

		if (this.state.validCoupon && this.state.validCoupon.percent_off) {
			percentPrice = (100 - this.state.validCoupon.percent_off) / 100;
		}

		if (!plan) {
			return null;
		}

		const plans = {
			personal_monthly: {
				blurb:
					percentPrice === 1 ? (
						<div>
							By clicking on the subscribe button below you agree to be charged{' '}
							<strong>
								<Price
									amount={monthlyConst.price * percentPrice}
									country={country}
								/>
							</strong>{' '}
							every month until you cancel your subscription to Prototypo. You
							also agree to respect Prototypo's{' '}
							<a
								className="account-link"
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					) : (
						<div>
							By clicking on the subscribe button below you agree to be charged{' '}
							<strong>
								<Price
									amount={monthlyConst.price * percentPrice}
									country={country}
								/>
							</strong>{' '}
							for the first month of your Prototypo subscription. You'll also
							agree to be charged{' '}
							<strong>
								<Price amount={monthlyConst.price} country={country} />
							</strong>{' '}
							every month after that first until you cancel your subscription to
							Prototypo. You also agree to respect Prototypo's{' '}
							<a
								className="account-link"
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					),
			},
			personal_annual_99: {
				blurb:
					percentPrice === 1 ? (
						<div>
							By clicking on the subscribe button below you agree to pay{' '}
							<strong>
								<Price
									amount={annualConst.annualPrice * percentPrice}
									country={country}
								/>
							</strong>{' '}
							once and subscribe to Prototypo for a full year. You also agree to
							be charged every year of this amount until you cancel your
							subscription to Prototypo. You also agree to respect Prototypo's{' '}
							<a
								className="account-link"
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					) : (
						<div>
							By clicking on the subscribe button below you agree to pay{' '}
							<strong>
								<Price
									amount={annualConst.annualPrice * percentPrice}
									country={country}
								/>
							</strong>{' '}
							once and subscribe to Prototypo for a full year. You'll also agree
							to be charged{' '}
							<strong>
								<Price amount={annualConst.annualPrice} country={country} />
							</strong>{' '}
							every year after that first until you cancel your subscription to
							Prototypo. You also agree to respect Prototypo's{' '}
							<a
								className="account-link"
								target="_blank"
								rel="noopener noreferrer"
								href="https://prototypo.io/cgu/"
							>
								EULA
							</a>.
						</div>
					),
			},
			team_monthly: {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay{' '}
						<strong>
							<Price
								amount={teamMonthlyConst.monthlyPrice * quantity * percentPrice}
								country={country}
							/>
						</strong>{' '}
						once and be subscribed to Prototypo. You also agree to be charged
						every month of this amount until you cancel your subscription to
						Prototypo. You also agree to respect Prototypo's{' '}
						<a
							className="account-link"
							target="_blank"
							rel="noopener noreferrer"
							href="https://prototypo.io/cgu/"
						>
							EULA
						</a>.
					</div>
				),
			},
			team_annual: {
				blurb: (
					<div>
						By clicking on the subscribe button below you agree to pay{' '}
						<strong>
							<Price
								amount={teamAnnualConst.annualPrice * quantity * percentPrice}
								country={country}
							/>
						</strong>{' '}
						once and subscribe to Prototypo for a full year. You also agree to
						be charged every year of this amount until you cancel your
						subscription to Prototypo. You also agree to respect Prototypo's{' '}
						<a
							className="account-link"
							target="_blank"
							rel="noopener noreferrer"
							href="https://prototypo.io/cgu/"
						>
							EULA
						</a>.
					</div>
				),
			},
		};

		if (!plans[plan]) {
			return null;
		}

		const card
			= cards.length > 0 && !this.state.changeCard ? (
				<React.Fragment>
					<FakeCard card={cards[0]} />
					<div className="subscription-card-and-validation-buttons">
						{!showCoupon && (
							<Button
								className="subscription-card-and-validation-switch"
								onClick={this.addCoupon}
								link
							>
								I have a coupon
							</Button>
						)}
						<Button
							className="subscription-card-and-validation-switch is-right"
							onClick={this.changeCard}
							link
						>
							Change my card
						</Button>
					</div>
				</React.Fragment>
			) : (
				<React.Fragment>
					<AddCard
						inError={this.state.inError}
						ref={(item) => {
							this.card = item;
						}}
						className={`${
							this.state.validCoupon && this.state.validCoupon.shouldSkipCard
								? 'disabled'
								: ''
						}`}
					/>
					{(!showCoupon || cards.length > 0) && (
						<div className="columns subscription-card-and-validation-buttons">
							{!showCoupon && (
								<Button
									className="subscription-card-and-validation-switch"
									onClick={this.addCoupon}
									link
								>
									I have a coupon
								</Button>
							)}
							{cards.length > 0 && (
								<Button
									className="subscription-card-and-validation-switch is-right"
									onClick={this.keepCard}
									link
								>
									Keep my card
								</Button>
							)}
						</div>
					)}
				</React.Fragment>
			);
		const coupon = showCoupon && (
			<React.Fragment>
				<InputWithLabel
					ref={(item) => {
						this.coupon = item;
					}}
					label="Coupon code"
					error={false}
					onChange={this.handleCouponChange}
				/>
				{validCoupon && (
					<div className="subscription-card-and-validation-valid-coupon">
						(ノ✿◕ᗜ◕)ノ━☆ﾟ.*･｡ﾟ {this.state.validCoupon.label}
					</div>
				)}
				{couponError && (
					<div className="subscription-card-and-validation-error-coupon">
						ʕ ಡ╭╮ಡ ʔ This is not a valid coupon
					</div>
				)}
			</React.Fragment>
		);

		const errors = this.state.errors.map((error, index) => (
			<FormError key={index} errorText={error} />
		));

		const {blurb} = plans[plan];

		return (
			<div className="subscription-card-and-validation normal">
				<form onSubmit={this.subscribe}>
					{plan.startsWith('team') && (
						<div className="input-with-label">
							<label className="input-with-label-label" htmlFor="quantity">
								Quantity:
							</label>
							<InputNumber
								className="pricing-item-subtitle-price-info team"
								min={1}
								max={100}
								value={quantity}
								controls
								onChange={this.handleChangeQuantity}
							/>
						</div>
					)}
					<WaitForLoad loading={loadingAddCard}>{card}</WaitForLoad>
					{coupon}
					<div className="subscription-card-and-validation-legal">{blurb}</div>
					{errors}
					<LoadingButton
						type="submit"
						size="big"
						fluid
						outline
						loading={loading}
						disabled={couponValue && !validCoupon}
					>
						Subscribe to prototypo
					</LoadingButton>
				</form>
			</div>
		);
	}
}

SubscriptionCardAndValidation.defaultProps = {
	onSelectCoupon: () => {},
};

export default injectStripe(
	withRouter(SubscriptionCardAndValidation),
);
