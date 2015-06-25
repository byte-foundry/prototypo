import React from 'react';
import ClassNames from 'classnames';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import {ContextualMenu, ContextualMenuItem} from './contextual-menu.components.jsx';

export default class PrototypoCanvas extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos:{x:0,y:0},
			showContextMenu:false,
		}
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
		fontInstance.view.center = this.props.panel.pos ?
			this.props.panel.pos instanceof prototypo.paper.Point ?
				this.props.panel.pos :
				new prototypo.paper.Point(this.props.panel.pos[1],this.props.panel.pos[2]) :
			fontInstance.view.center;

		fontInstance.showNodes = this.props.panel.nodes || false;
		fontInstance.showCoords = this.props.panel.coords || false;
		fontInstance.fill = !this.props.panel.outline;

		const canvasContainer = React.findDOMNode(this.refs.canvas);
		if (canvasContainer.clientWidth !== window.canvasElement.width ||
			canvasContainer.clientHeight !== window.canvasElement.height) {

			const oldSize = new prototypo.paper.Size(window.canvasElement.width,
				window.canvasElement.height);
			if (oldSize.width && oldSize.height) {
				const center = fontInstance.view.center.clone();
				center.y = -center.y;

				const oldDistance = fontInstance.currGlyph.getPosition().subtract(center);
				const newSize = new prototypo.paper.Size(
					canvasContainer.clientWidth,canvasContainer.clientHeight);
				const ratio = newSize.divide(oldSize);

				const newDistance = new prototypo.paper.Point(oldDistance.x * ratio.width, oldDistance.y * ratio.height);
				const newCenter = new prototypo.paper.Point(center.x * ratio.width, center.y * ratio.height);

				fontInstance.currGlyph.setPosition(newCenter.add(newDistance));
				newCenter.y = -newCenter.y;

				this.client.dispatchAction('/store-panel-param',{pos:newCenter});
			}

			window.canvasElement.width = canvasContainer.clientWidth;
			window.canvasElement.height = canvasContainer.clientHeight;
			fontInstance.view.viewSize = [canvasContainer.clientWidth,canvasContainer.clientHeight];
			fontInstance.view.update();
		}
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

	showContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu:true,
			contextMenuPos:{x:e.clientX,y:e.clientY},
		});
	}

	hideContextMenu() {
		if (this.state.showContextMenu) {
			this.setState({
				showContextMenu:false,
			});
		}
	}

	render() {
		const canvasClass = ClassNames({
			'is-hidden':this.props.panel.mode.indexOf('glyph') === -1,
			'prototypo-canvas-container':true,
		});

		const menu = [
			<ContextualMenuItem
				text={`${!fontInstance.showNodes ? 'Show' : 'Hide'} nodes`}
				click={() => { this.client.dispatchAction('/store-panel-param',{nodes:!this.props.panel.nodes}) }}/>,
			<ContextualMenuItem
				text={`${fontInstance.fill ? 'Show' : 'Hide'} outline`}
				click={() => { this.client.dispatchAction('/store-panel-param',{outline:!this.props.panel.outline}) }}/>,
			<ContextualMenuItem
				text={`${!fontInstance.showCoords ? 'Show' : 'Hide'} coords`}
				click={() => { this.client.dispatchAction('/store-panel-param',{coords:!this.props.panel.coords}) }}/>,
			<ContextualMenuItem
				text="Reset view"
				click={() => { this.props.reset() }}/>,
			<ContextualMenuItem
				text={`${this.props.panel.shadow ? 'Hide' : 'Show'} shadow`}
				click={() => { this.client.dispatchAction('/store-panel-param',{shadow:!this.props.panel.shadow}) }}/>,
		];

		return (
			<div className="prototypo-canvas"
				onContextMenu={(e) => { this.showContextMenu(e) }}
				onClick={() => { this.hideContextMenu() }}
				onMouseLeave={() => { this.hideContextMenu() }}>
				<div ref="canvas" className={canvasClass} onDoubleClick={() => { this.props.reset() }}></div>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		);
	}
}
