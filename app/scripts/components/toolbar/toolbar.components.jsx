import React from 'react';
import Lifespan from 'lifespan';
import Classnames from 'classnames';

import LocalClient from '~/stores/local-client.stores.jsx';
import Log from '~/services/log.services.js';

import ArianneThread from './arianne-thread.components.jsx';
import IndividualizeButton from './individualize-button.components.jsx';

export default class Toolbar extends React.Component {

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
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/panel', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					mode: head.toJS().mode,
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
		const newViewMode = _.xor(this.state.mode, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-panel-param', {mode: newViewMode});
			Log.ui('Topbar.toggleView', name);
		}
	}

	render() {
		return (
			<div className="view-buttons">
				<ViewButton name="glyph" state={this.state.mode.indexOf('glyph') !== -1} click={this.toggleView.bind(this)}/>
				<ViewButton name="word" state={this.state.mode.indexOf('word') !== -1} click={this.toggleView.bind(this)}/>
				<ViewButton name="text" state={this.state.mode.indexOf('text') !== -1} click={this.toggleView.bind(this)}/>
			</div>
		);
	}
}

class ViewButton extends React.Component {
	render() {
		const img = `assets/images/${this.props.name + (this.props.state ? '-hover-active' : '-base')}.svg`;
		const classes = Classnames({
			'view-button': true,
			'is-active': this.props.state,
		});

		return (
			<div className={classes} onClick={() => {this.props.click(this.props.name);}}>
				<img className="view-button-img" src={img}/>
			</div>
		);
	}
}
