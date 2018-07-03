import React from 'react';
import {Route, Redirect, Switch} from 'react-router-dom';

import Home from './account-home.components';
import Success from './account-success.components';
import Profile from './account-profile-panel.components';
import ChangePassword from './account-change-password.components';
import BillingAddress from './account-billing-address.components';
import AddCard from './account-add-card.components';
import ChangePlan from './account-change-plan.components';
import Subscription from './subscription.components';
import AccountSubscription from './account-subscription.components';
import ConfirmPlan from './account-confirm-plan.components';
import Organization from './account-organization.components';
import InvoiceList from './account-invoice-list.components';
import PrototypoLibrary from './account-prototypo-library.components';

export default class Account extends React.Component {
	render() {
		return (
			<div className="account-app">
				<Switch>
					<Route path="/account/subscribe" component={Subscription} exact />
					<Route path="/account" component={Home} exact />
					<Route path="/account/billing" component={InvoiceList} exact />
					<Route path="/account/success" component={Success} exact />
					<Route path="/account/profile" component={Profile} exact />
					<Route
						path="/account/profile/change-password"
						component={ChangePassword}
						exact
					/>
					<Route
						path="/account/details"
						component={AccountSubscription}
						exact
					/>
					<Route
						path="/account/details/billing-address"
						component={BillingAddress}
						exact
					/>
					<Route path="/account/details/add-card" component={AddCard} exact />
					<Route
						path="/account/details/change-plan"
						component={ChangePlan}
						exact
					/>
					<Route
						path="/account/details/confirm-plan"
						component={ConfirmPlan}
						exact
					/>
					<Route path="/account/organization" component={Organization} exact />
					<Route
						path="/account/prototypo-library"
						component={PrototypoLibrary}
						exact
					/>
					<Redirect from="*" to="/account" />
				</Switch>
			</div>
		);
	}
}
