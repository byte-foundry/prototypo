import React from 'react';
import Lifespan from 'lifespan';
import pleaseWait from 'please-wait';

import LocalClient from '../stores/local-client.stores';
import GlyphCanvas from '../components/glyph-canvas.components';
import CanvasBar from '../components/canvasTools/canvas-bar.components';

export default class GlyphTester extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		pleaseWait.instance.finish();
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.client.dispatchAction('/select-glyph', {
			unicode: `${this.props.params.unicode}`,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (
			<div style={{height: '100%'}}>
				<CanvasBar />
				<GlyphCanvas />
			</div>
		);
	}
}
