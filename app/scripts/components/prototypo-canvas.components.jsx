import React from 'react';
import Classnames from 'classnames';
import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';
import Lifespan from 'lifespan';

import {ContextualMenu, ContextualMenuItem} from './contextual-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import CanvasGlyphInput from './canvas-glyph-input.components.jsx';
import IndividualizeButton from './individualize-button.components.jsx';
import AlternateMenu from './alternate-menu.components.jsx';

export default class PrototypoCanvas extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos: {x: 0, y: 0},
			showContextMenu: false,
		};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	setupCanvas() {
		fontInstance.zoom = this.props.panel.zoom ? this.props.panel.zoom : 0.5;
		fontInstance.view.center = this.props.panel.pos
			? this.props.panel.pos instanceof prototypo.paper.Point
				? this.props.panel.pos
				: new prototypo.paper.Point(this.props.panel.pos[1], this.props.panel.pos[2])
			: fontInstance.view.center;

		fontInstance.showNodes = this.props.panel.nodes || false;
		fontInstance.showCoords = this.props.panel.coords || false;
		fontInstance.fill = !this.props.panel.outline;

		const canvasContainer = React.findDOMNode(this.refs.canvas);

		if (canvasContainer.clientWidth
			&& canvasContainer.clientHeight
			&& (canvasContainer.clientWidth !== window.canvasElement.width
			|| canvasContainer.clientHeight !== window.canvasElement.height)) {

			const oldSize = new prototypo.paper.Size(window.canvasElement.width,
				window.canvasElement.height);

			if (oldSize.width && oldSize.height) {
				const center = fontInstance.view.center.clone();
				const glyphCenter = fontInstance.currGlyph.getPosition();

				const oldGlyphRelativePos = glyphCenter.subtract(center);
				const newSize = new prototypo.paper.Size(
					canvasContainer.clientWidth, canvasContainer.clientHeight);
				const ratio = newSize.divide(oldSize);

				const newDistance = new prototypo.paper.Point(oldGlyphRelativePos.x * ratio.width, oldGlyphRelativePos.y * ratio.height);
				const newCenterPos = glyphCenter.subtract(newDistance);

				this.client.dispatchAction('/store-panel-param', {pos: newCenterPos});
			}

			window.canvasElement.width = canvasContainer.clientWidth;
			window.canvasElement.height = canvasContainer.clientHeight;
			fontInstance.view.viewSize = [canvasContainer.clientWidth, canvasContainer.clientHeight];
			fontInstance.view.update();
		}
	}

	componentDidUpdate() {
		this.setupCanvas();
	}

	mouseMove(e) {
		fontInstance.onMove.bind(fontInstance)(e);
	}

	wheel(e) {
		fontInstance.onWheel.bind(fontInstance)(e);
		this.client.dispatchAction('/store-panel-param', {
			zoom: fontInstance.zoom,
		});
	}

	mouseDown(e) {
		fontInstance.onDown.bind(fontInstance)(e);
	}

	mouseUp(e) {
		fontInstance.onUp.bind(fontInstance)(e);
		this.client.dispatchAction('/store-panel-param', {
			pos: fontInstance.view.center,
			zoom: fontInstance.zoom,
		});
	}

	componentDidMount() {
		const canvasContainer = React.findDOMNode(this.refs.canvas);

		canvasContainer.appendChild(window.canvasElement);
		canvasContainer.addEventListener('mousemove', (e) => { this.mouseMove(e); });
		canvasContainer.addEventListener('wheel', (e) => { this.wheel(e); });
		canvasContainer.addEventListener('mousedown', (e) => { this.mouseDown(e); });
		canvasContainer.addEventListener('mouseup', (e) => { this.mouseUp(e); });

		this.setupCanvas();
	}

	showContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu: true,
			contextMenuPos: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY},
		});

		Log.ui('PrototypoCanvas.showContextMenu');
	}

	hideContextMenu() {
		if (this.state.showContextMenu) {
			this.setState({
				showContextMenu: false,
			});
		}
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoCanvas');
		}
		const canvasClass = Classnames({
			'is-hidden': this.props.panel.mode.indexOf('glyph') === -1,
			'prototypo-canvas': true,
		});

		const menu = [
			<ContextualMenuItem
				key="nodes"
				text={`${fontInstance.showNodes ? 'Hide' : 'Show'} nodes`}
				click={() => { this.client.dispatchAction('/store-panel-param', {nodes: !this.props.panel.nodes}); }}/>,
			<ContextualMenuItem
				key="outline"
				text={`${fontInstance.fill ? 'Show' : 'Hide'} outline`}
				click={() => { this.client.dispatchAction('/store-panel-param', {outline: !this.props.panel.outline}); }}/>,
			<ContextualMenuItem
				key="coords"
				text={`${fontInstance.showCoords ? 'Hide' : 'Show'} coords`}
				click={() => { this.client.dispatchAction('/store-panel-param', {coords: !this.props.panel.coords}); }}/>,
			<ContextualMenuItem
				key="reset"
				text="Reset view"
				click={() => { this.props.reset(); }}/>,
			<ContextualMenuItem
				key="shadow"
				text={`${this.props.panel.shadow ? 'Hide' : 'Show'} shadow`}
				click={() => { this.client.dispatchAction('/store-panel-param', {shadow: !this.props.panel.shadow}); }}/>,
		];

		const alternateMenu = this.props.glyph && this.props.glyph.glyphs[this.props.glyph.selected].length > 1 ? (
			<AlternateMenu alternates={this.props.glyph.glyphs[this.props.glyph.selected]} unicode={this.props.glyph.selected}/>
		) : false;

		return (
			<div
				className={canvasClass}
				onContextMenu={(e) => { this.showContextMenu(e); }}
				onClick={() => { this.hideContextMenu(); }}
				onMouseLeave={() => { this.hideContextMenu(); }}>
				<div ref="canvas" className="prototypo-canvas-container" onDoubleClick={() => { this.props.reset(); }}></div>
				<div className="action-bar">
					<CloseButton click={() => { this.props.close('glyph'); }}/>
				</div>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
				<div className="canvas-menu">
					<CanvasGlyphInput/>
					<IndividualizeButton/>
					{alternateMenu}
				</div>
			</div>
		);
	}
}
