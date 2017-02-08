import React from 'react';
import Lifespan from 'lifespan';

import SelectWithLabel from '../shared/select-with-label.components.jsx';
import AccountValidationButton from '../shared/account-validation-button.components.jsx';

import LocalClient from '../../stores/local-client.stores.jsx';

import DisplayWithLabel from '../shared/display-with-label.components.jsx';

export default class AccountChangePlan extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.confirmPlan = this.confirmPlan.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					plan: head.toJS().d.infos.subscriptions,
					card: head.toJS().d.infos.card,
					loading: head.toJS().d.choosePlanForm.loading,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.client.dispatchAction('/clean-form', 'choosePlanForm');
		this.lifespan.release();
	}

	confirmPlan(e) {
		e.preventDefault();

		const plan = this.refs.select.inputValue.value;

		if (plan === 'free_monthly') {
			return this.setState({
				free: true,
			});
		}

		this.client.dispatchAction('/confirm-plan', {
			plan,
			pathQuery: {pathname: '/account/details/confirm-plan'},
		});
	}

	render() {

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
				price: 99.00,
			},
		};

		const plan = _.find(planInfos, (planInfo, key) => {
			return this.state.plan && this.state.plan[0].plan.id.indexOf(key) !== -1;
		});

		const optionPossible = [
			{value: 'free_monthly', label: 'Free plan'},
			{value: 'personal_monthly', label: 'Professional monthly subscription'},
			{value: 'personal_annual_99', label: 'Professional annual subscription'},
		];

		const options = _.reject(optionPossible, (option) => {
			return !(!this.state.plan || !this.state.plan[0].plan.id.startsWith(option.value));
		});

		return this.state.free
			? (
				<div className="account-base">
					<p className="account-change-plan-downgrade hidden">
						<span className="account-bold">To downgrade your account, shoot us an email at </span><a className="account-email" href="mailto:account@prototypo.io?subject=Cancelling my subscription&body=Hi,%0A%0A I would like to cancel my subscription to Prototypo.%0A">account@prototypo.io</a><span className="account-bold">, we will do the rest! :)</span>
						<br/><br/>Cheers,<br/> The Prototypo team
					</p>
				</div>
			)
			: (
				<form onSubmit={this.confirmPlan} className="account-base account-change-plan">
					<div>
						<DisplayWithLabel label="Your current plan">
							{ this.state.plan ? plan.name : `You do not have a plan.` }
						</DisplayWithLabel>
					</div>
					<SelectWithLabel
						clearable={false}
						searchable={false}
						ref="select"
						label="Which plan are you interested in?"
						noResultsText={"No plan with this name"}
						options={options}
					/>
					<AccountValidationButton label="Change plan" loading={this.state.loading}/>
				</form>
			);
	}
}
