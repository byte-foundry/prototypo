import React from 'react';

import LocalClient from '~/stores/local-client.stores.jsx';

import Button from '../shared/button.components.jsx';

export default class Collection extends React.Component {
	componentWillMount() {
		this.client = LocalClient.instance();
	}

	returnToDashboard() {
		this.client.dispatchAction('/store-panel-param', {showCollection: false});
	}

	render() {
		return (
			<div className="collection">
				<div className="collection-container">
					<div className="account-dashboard-icon"/>
					<div className="account-dashboard-home-icon" onClick={this.returnToDashboard.bind(this)}/>
					<div className="account-header">
						<h1 className="account-title">My collection</h1>
					</div>
					<div>
						<FamilyList/>
					</div>
				</div>
			</div>
		);
	}
}


class FamilyList extends React.Component {
	render() {
		return (
				<div className="family-list">
					<Button label="Create a new family"/>
				</div>
		)
	}
}
