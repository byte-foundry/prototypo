import React from 'react';
import pleaseWait from 'please-wait';
import Lifespan from 'lifespan';

import FontPrecursor from '../prototypo.js/precursor/FontPrecursor.js';

import LocalClient from '../stores/local-client.stores.jsx';

export default class TestFont extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		pleaseWait.instance.finish();
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState(head.toJS().d);
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					values: head.toJS().d.controlsValues,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUpdate(nextProps, nextState) {
		if (nextState.typedata && nextState.typedata !== this.state.typedata) {
			this.font = new FontPrecursor(nextState.typedata);
		}
		if (this.font && nextState.values !== this.state.values) {
			const glyphs = this.font.constructFont(nextState.values);
			draw(glyphs.A);
		}
	}

	render() {
		return (
			<div>
				<h1>This is a test</h1>
				<canvas id="hello"></canvas>
			</div>
		);
	}
}
