import React from 'react';
import Lifespan from 'lifespan';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					createParamGroup: head.toJS().d.indivCreate,
					editParamGroup: head.toJS().d.indivEdit,
					selectedGroup: head.toJS().d.indivCurrentGroup,
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
		const transitionTimeout = 300;
		const rightPanel = this.state.createParamGroup ? (
			<CreateParamGroup transitionTimeout={transitionTimeout} key="create" />
		) : this.state.editParamGroup ? (
			<CreateParamGroup
				transitionTimeout={transitionTimeout}
				key={this.state.selectedGroup.name}
				group={this.state.selectedGroup}
				editMode={true}
			/>
		) : (
			false
		);

		return (
			<div className="indiv-sidebar">
				<IndivGroupList />
				<ReactCSSTransitionGroup
					component="div"
					transitionName="indiv-sidebar-right-panel"
					transitionEnterTimeout={transitionTimeout}
					transitionLeaveTimeout={transitionTimeout}
				>
					{rightPanel}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}
