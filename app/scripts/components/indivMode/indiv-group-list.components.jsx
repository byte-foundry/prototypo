import React from 'react';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';

import LocalClient from '~/stores/local-client.stores.jsx';

import Button from '../shared/button.components.jsx';

export default class IndivGroupList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			groups: [],
		};
		this.create = this.create.bind(this);
		this.selectGroup = this.selectGroup.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					groups: head.toJS().indivGroups,
					selected: head.toJS().indivCurrentGroup,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	create() {
		this.client.dispatchAction('/create-mode-param-group');
	}

	selectGroup(group) {
		this.client.dispatchAction('/edit-mode-param-group', {group});
	}

	render() {
		const groups = _.map(this.state.groups, (group) => {
			return (
				<IndivGroup
					key={group.name}
					name={group.name}
					glyphs={group.glyphs}
					select={this.selectGroup}
					selected={this.state.selected && group.name === this.state.selected.name}/>
			);
		});

		const noGroupMessage = this.state.groups.length === 0
			? <div className="indiv-group-list-message">No groups for the moment.<br/>Create your first one!</div>
			: (
				<div className="indiv-group-list-message">
					<Button dark={true} click={this.create} label="Create a new group"/>
				</div>
			);

		return (
			<div className="indiv-group-list">
				<div className="indiv-group-list-title">Your groups of individualization</div>
				{noGroupMessage}
				{groups}
			</div>
		);
	}
}

class IndivGroup extends React.Component {
	constructor(props) {
		super(props);
		this.select = this.select.bind(this);
	}

	select() {
		this.props.select({
			name: this.props.name,
			glyphs: this.props.glyphs,
		});
	}

	render() {
		const classes = ClassNames({
			'indiv-group': true,
			'is-active': this.props.selected,
		});
		const chars = _.map(this.props.glyphs, (glyph) => {
			return String.fromCharCode(glyph);
		});

		return (
			<div className={classes} onClick={this.select}>
				<div className="indiv-group-title">
					{this.props.name}
				</div>
				<div className="indiv-group-infos">
					<span className="indiv-group-infos-glyphs-number">{this.props.glyphs.length} GLYPHS</span> &mdash; <span className="indiv-group-infos-glyphs-list">{chars.join('')}</span>
				</div>
			</div>
		);
	}
}
