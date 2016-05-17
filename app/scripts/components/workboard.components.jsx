import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../stores/local-client.stores.jsx';

import GlyphPanel from './glyph-panel.components.jsx';
import PrototypoPanel from './prototypo-panel.components.jsx';
import FontControls from './font-controls.components.jsx';

export default class Workboard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		const fontStore = this.client.fetch('/fontStore');

		this.setState({
			fontName: fontStore.get('fontName'),
			glyphs: fontStore.get('glyphs'),
		});

		this.client.getStore('/fontStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS());
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Workboard');
		}
		return (
			<div id="workboard">
				<FontControls />
				<PrototypoPanel fontName={this.state.fontName} glyphs={this.state.glyphs}/>
				<GlyphPanel />
			</div>
		);
	}
}
