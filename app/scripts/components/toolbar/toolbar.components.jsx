import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '~/stores/local-client.stores.jsx';
import Log from '~/services/log.services.js';

import ArianneThread from './arianne-thread.components.jsx';
import IndividualizeButton from './individualize-button.components.jsx';

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {

		return (
			<div className="toolbar">
				<div className="toolbar-left">
					<ArianneThread />
				</div>
				<div className="toolbar-right">
					<IndividualizeButton/>
					<ViewButtons />
				</div>
			</div>
		);
	}
}

class ViewButtons extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mode: [],
		};
		this.availableMode = ['glyph', 'text', 'word', 'list'];
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		//fonction binding to avoid unnecessary re-render
		this.toggleView = this.toggleView.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					mode: head.toJS().uiMode,
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
		// if we are toggling glyph mode, we want glyph list to be hidden
		const modes = (
			name === 'glyph'
				? _.without(this.state.mode, 'list')
				: this.state.mode
		);
		const newViewMode = _.intersection(_.xor(modes, [name]), this.availableMode);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-value', {uiMode: newViewMode});
			Log.ui('Topbar.toggleView', name);
		}
	}

	render() {
		return (
			<div className="view-buttons">
				<div className="view-buttons-label">Views</div>
				<ViewButton name="glyph" state={this.state.mode.indexOf('glyph') !== -1} click={this.toggleView}/>
				<ViewButton name="word" state={this.state.mode.indexOf('word') !== -1} click={this.toggleView}/>
				<ViewButton name="text" state={this.state.mode.indexOf('text') !== -1} click={this.toggleView}/>
			</div>
		);
	}
}

class ViewButton extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const classes = Classnames({
			'view-button': true,
			'is-active': this.props.state,
		});

		return (
			<div
				className={`${classes} view-button-${this.props.name}`}
				onClick={() => {this.props.click(this.props.name);}}
			></div>
		);
	}
}
