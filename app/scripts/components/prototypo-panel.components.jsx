import React from 'react';
import PrototypoText from './prototypo-text.components.jsx';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

export default class PrototypoPanel extends React.Component {

	componentWillMount() {
		this.client = LocalClient.instance;
		this.lifespan = new Lifespan();

		this.client.getStore('/panel',this.lifespan)
			.onUpdate(({head}) => {
				this.setState(head.toJS());
			})
			.onDelete(() => {
				this.setState(undefined);
			})
	}

	setupCanvas() {
		const canvasContainer = React.findDOMNode(this.refs.canvas);

		if (canvasContainer) {
			canvasContainer.appendChild(window.canvasElement);
			const canvasEl = React.findDOMNode(this.refs.canvas);
			canvasEl.addEventListener('mousemove', fontInstance.moveHandler.bind(fontInstance));
			canvasEl.addEventListener('wheel',fontInstance.wheelHandler.bind(fontInstance));
			canvasEl.addEventListener('mousedown',fontInstance.downHandler.bind(fontInstance));
			canvasEl.addEventListener('mouseup',fontInstance.upHandler.bind(fontInstance));
			fontInstance.zoom = this.state.zoom ? this.state.zoom : 0.5;
			fontInstance.view.center = this.state.pos ? this.state.pos : fontInstance.view.center;
		}
	}

	componentDidUpdate() {
		this.setupCanvas();
	}

	componentDidMount() {
		this.setupCanvas();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeMode(mode) {
		this.client.dispatchAction('/change-panel-mode', {mode});
		if (mode !== 'glyph') {
			this.client.dispatchAction('/store-panel-pos', {pos:fontInstance.view.center});
			this.client.dispatchAction('/store-panel-zoom', {zoom:fontInstance.zoom});
		}
	}

	render() {
		let view;

		if (!this.state || this.state.mode === 'text') {
			view = <PrototypoText fontName={this.props.fontName}/>;
		}
		else if (this.state.mode === 'glyph') {
			view = <div ref="canvas" className="prototypo-canvas-container"></div>;
		}

		let contextualButtons;
		if (this.state && this.state.mode === 'glyph') {
			contextualButtons = [
				<div className="prototypo-panel-buttons-list-button" onClick={() => { fontInstance.fill = !fontInstance.fill; }}>
					Outline
				</div>,
				<div className="prototypo-panel-buttons-list-button" onClick={() => { fontInstance.showNodes = !fontInstance.showNodes; }}>
					Show nodes
				</div>,
				<div className="prototypo-panel-buttons-list-button" onClick={() => { fontInstance.showCoords = !fontInstance.showCoords; }}>
					Show coord
				</div>,
			]
		}

		return (
			<div id="prototypopanel">
				{view}
				<div className="prototypo-panel-buttons-list">
					<div className="prototypo-panel-buttons-list-button" onClick={() => { this.changeMode('text')}}>
						Text view
					</div>
					<div className="prototypo-panel-buttons-list-button" onClick={() => { this.changeMode('glyph')}}>
						Glyph view
					</div>
					<div className="prototypo-panel-buttons-list-button" onClick={() => { this.changeMode('half')}}>
						Half and Half
					</div>
					{contextualButtons}
				</div>
			</div>
		)
	}
}
