import gql from 'graphql-tag';
import React from 'react';
import {Mutation} from 'react-apollo';

import LoadingButton from '../shared/loading-button.components';
import WaitForLoad from '../wait-for-load.components';
import Invoice from './upcoming-invoice.components';
import HoodieApi from '../../services/hoodie.services';

const UPDATE_SUBCRIPTION = gql`
	mutation updateSubscription($id: ID!, $newPlan: String, $quantity: Int) {
		updateSubscription(id: $id, plan: $newPlan, quantity: $newQuantity)
			@client {
			id
			current_period_end
			cancel_at_period_end
			trial_end
			quantity
			plan {
				id
				name
				currency
			}
		}
	}
`;

class ConfirmPlanForm extends React.Component {
	state = {
		upcomingInvoice: null,
		loadingInvoice: true,
	};

	componentDidMount() {
		this.loadUpcomingInvoice();
	}

	async componentDidUpdate(prevProps) {
		if (
			this.props.newPlan !== prevProps.newPlan
			|| this.props.newQuantity !== prevProps.newQuantity
		) {
			this.loadUpcomingInvoice();
		}
	}

	loadUpcomingInvoice = async () => {
		this.setState({loadingInvoice: true});

		const upcomingInvoice = await HoodieApi.getUpcomingInvoice({
			subscription_plan: this.props.newPlan,
			subscription_quantity: this.props.newQuantity,
		});

		this.setState({loadingInvoice: false, upcomingInvoice});
	}

	render() {
		const {
			subscriptionId,
			newPlan,
			newQuantity,
			onUpdateSubscription,
			loading,
		} = this.props;
		const {upcomingInvoice, loadingInvoice} = this.state;

		if (loading || loadingInvoice) return <WaitForLoad loading />;

		return (
			<React.Fragment>
				<Invoice {...upcomingInvoice} />
				<Mutation mutation={UPDATE_SUBCRIPTION}>
					{(updateSubscription, {loading: updateLoading}) => (
						<LoadingButton
							loading={updateLoading}
							style={{float: 'right'}}
							onClick={async () => {
								const response = await updateSubscription({
									variables: {
										id: subscriptionId,
										newPlan,
										newQuantity,
									},
								});

								onUpdateSubscription(response.data.updateSubscription);
							}}
						>
							Confirm change
						</LoadingButton>
					)}
				</Mutation>
			</React.Fragment>
		);
	}
}

export default ConfirmPlanForm;
