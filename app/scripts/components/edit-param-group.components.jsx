import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

import DeleteParamGroup from './delete-param-group.components.jsx';

export default class EditParamGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/individualizeStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					currentGroup: head.toJS().currentGroup,
					groups: head.toJS().groups,
					preDelete: head.toJS().preDelete,
					glyphs: head.toJS().glyphs,
				});
			})
			.onDelete(() => {
				this.setState(undefined)
			});
	}
	
	componentWillUnmount() {
		this.lifespan.release();
	}

	selectGroup(e) {
		this.client.dispatchAction('/select-indiv-group', e.target.value);
	}

	render() {
		const options = _.map(this.state.groups, (group) => {
				return <option value={group}>{group}</option>
		});

		const deletePanel = this.state.preDelete ?
			<DeleteParamGroup glyphs={this.state.glyphs} groupName={this.state.currentGroup}/> : false;
		return (
			<div className="edit-param-group">
				Editing	
				<select onChange={(e) => { this.selectGroup(e) }} value={this.state.currentGroup} className="edit-param-group-select">
					{options}
				</select>
				<span className="edit-param-group-button" onClick={() => {this.client.dispatchAction('/pre-delete', true)}}>DELETE</span>
				<span className="edit-param-group-button">EDIT</span>
				{deletePanel}
			</div>
		)
	}
}
