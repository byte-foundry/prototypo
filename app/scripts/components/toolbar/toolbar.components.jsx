import _without from 'lodash/without';
import _xor from 'lodash/xor';
import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';

import LocalClient from '../../stores/local-client.stores.jsx';
import Log from '../../services/log.services.js';

import ArianneThread from './arianne-thread.components.jsx';
import IndividualizeButton from './individualize-button.components.jsx';

export default class Toolbar extends React.PureComponent {
	render() {
		return (
			<div className="toolbar">
				<div className="toolbar-left">
					<ArianneThread />
				</div>
				<div className="toolbar-right">
					<IndividualizeButton />
					<ViewButtons />
				</div>
			</div>
		);
	}
}

class ViewButtons extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			mode: [],
		};

		this.toggleView = this.toggleView.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					mode: head.toJS().d.uiMode,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleView(name) {
		// if we are closing glyph mode, we want glyph list to be hidden
		const modes
			= name === 'glyph' && this.state.mode.indexOf('glyph') !== -1
				? _without(this.state.mode, 'list')
				: this.state.mode;
		const newViewMode = _xor(modes, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-value', {uiMode: newViewMode});
			Log.ui('Topbar.toggleView', name);
		}
	}

	render() {
		return (
			<div className="view-buttons">
				<div className="view-buttons-label">Views</div>
				<ViewButton
					name="glyph"
					state={this.state.mode.indexOf('glyph') !== -1}
					click={this.toggleView}
				/>
				<ViewButton
					name="word"
					state={this.state.mode.indexOf('word') !== -1}
					click={this.toggleView}
				/>
				<ViewButton
					name="text"
					state={this.state.mode.indexOf('text') !== -1}
					click={this.toggleView}
				/>
			</div>
		);
	}
}

class ViewButton extends React.PureComponent {
	render() {
		const classes = Classnames({
			'view-button': true,
			'is-active': this.props.state,
		});

		return (
			<div
				className={`${classes} view-button-${this.props.name}`}
				onClick={() => {
					this.props.click(this.props.name);
				}}
			/>
		);
	}
}
