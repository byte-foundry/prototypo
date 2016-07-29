import React from 'react';
import Lifespan from 'lifespan';
import ReactTransitionGroup from 'react-addons-transition-group';

import LocalClient from '../../stores/local-client.stores.jsx';

import CreateParamGroup from './create-param-group.components.jsx';
import IndivGroupList from './indiv-group-list.components.jsx';

export default class IndivSidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					createParamGroup: head.toJS().indivCreate,
					editParamGroup: head.toJS().indivEdit,
					selectedGroup: head.toJS().indivCurrentGroup,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		const rightPanel = this.state.createParamGroup
			? <CreateParamGroup key="create"/>
			: this.state.editParamGroup
				? <CreateParamGroup key={this.state.selectedGroup.name} group={this.state.selectedGroup} editMode={true}/>
				: false;

		return (
			<div className="indiv-sidebar">
				<IndivGroupList />
				<ReactTransitionGroup
					component="div"
					transitionName="indiv-sidebar-right-panel"
					transitionEnterTimeout={300}
					transitionLeaveTimeout={300}>
					{rightPanel}
				</ReactTransitionGroup>
			</div>
		);
	}
}
