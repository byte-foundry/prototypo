import React from 'react';
import ClassNames from 'classnames';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

export default class PrototypoCanvas extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	setupCanvas() {
		fontInstance.zoom = this.props.panel.zoom ? this.props.panel.zoom : 0.5;
		fontInstance.view.center = this.props.panel.pos ?
			this.props.panel.pos instanceof prototypo.paper.Point ?
				this.props.panel.pos :
				new prototypo.paper.Point(this.props.panel.pos[1],this.props.panel.pos[2]) :
			fontInstance.view.center;

		fontInstance.showNodes = this.props.panel.nodes || false;
		fontInstance.showCoords = this.props.panel.coords || false;
		fontInstance.fill = !this.props.panel.outline;
	}

	componentDidUpdate() {
		this.setupCanvas();
	}

	mouseMove(e) {
		fontInstance.moveHandler.bind(fontInstance)(e);
	}

	wheel(e) {
		fontInstance.wheelHandler.bind(fontInstance)(e);
	}

	mouseDown(e) {
		fontInstance.downHandler.bind(fontInstance)(e);
	}

	mouseUp(e) {
		fontInstance.upHandler.bind(fontInstance)(e);
		this.client.dispatchAction('/store-panel-param',{
			pos: fontInstance.view.center,
			zoom: fontInstance.zoom,
		});
	}

	componentDidMount() {
		const canvasContainer = React.findDOMNode(this.refs.canvas);
		canvasContainer.appendChild(window.canvasElement);
		canvasContainer.addEventListener('mousemove', (e) => { this.mouseMove(e) });
		canvasContainer.addEventListener('wheel', (e) => { this.wheel(e) });
		canvasContainer.addEventListener('mousedown', (e) => { this.mouseDown(e) });
		canvasContainer.addEventListener('mouseup', (e) => { this.mouseUp(e) });

		this.setupCanvas();
	}

	render() {
		const canvasClass = ClassNames({
			'is-hidden':this.props.panel.mode.indexOf('glyph') === -1,
			'prototypo-canvas-container':true,
		});

		return (
			<div ref="canvas" className={canvasClass} onDoubleClick={() => { this.props.resetView() }}></div>
		);
	}
}
