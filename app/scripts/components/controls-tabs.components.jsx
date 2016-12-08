import React from 'react';
import classNames from 'classnames';
import ScrollArea from 'react-scrollbar';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

export class ControlsTabs extends React.PureComponent {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] controls tabs');
		}

		const headers = _.map(this.props.children, ({props: {iconId, name}}) => {
			return (
				<ControlsTabHeader iconId={iconId} tab={this.props.tab} name={name} key={`${name}ControlsHeader`}/>
			);
		});

		const tab = _.map(this.props.children, (child) => {
			if (child.props.name === this.props.tab) {
				return child;
			}
		});

		return (
			<div className="controls-tabs">
				<ul className="controls-tabs-headers">
					{headers}
				</ul>
				<div className="controls-tabs-sliders">
					<ScrollArea horizontal={false}>
						<div className="controls-tabs-container" id="parameters">
							{tab}
						</div>
					</ScrollArea>
				</div>
			</div>
		);
	}
}

class ControlsTabHeader extends React.PureComponent {

	constructor(props) {
		super(props);
		this.changeTab = this.changeTab.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	changeTab() {
		this.client.dispatchAction('/change-tab-font', {name: this.props.name});
		Log.ui('ControlsTabs.changeTab', this.props.name);
	}

	render() {
		const classes = classNames({
			'controls-tabs-icon': true,
			'is-active': this.props.tab === this.props.name,
		});

		return (
			<li className={classes}
				id={this.props.iconId}
				onClick={this.changeTab}>
				<div className="controls-tabs-icon-legend is-legend-active">{this.props.name}</div>
			</li>
		)
	}
}

export class ControlsTab extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] controls tab');
		}

		return (
			<div className="controls-tab" key={`${this.props.name}ControlsTab`}>
				{this.props.children}
			</div>
		);
	}

}
