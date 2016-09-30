import React from 'react';
import classNames from 'classnames';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';

import {ContextualMenuItem} from './viewPanels/contextual-menu.components.jsx';
import ViewPanelsMenu from './viewPanels/view-panels-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import CanvasGlyphInput from './canvas-glyph-input.components.jsx';
import AlternateMenu from './alternate-menu.components.jsx';

export default class PrototypoCanvas extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			prototypoTextPanelClosed: undefined,
			glyphPanelOpened: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.handleLeaveAndClick = this.handleLeaveAndClick.bind(this);
		this.reset = this.reset.bind(this);
		this.toggleCoords = this.toggleCoords.bind(this);
		this.toggleNodes = this.toggleNodes.bind(this);
		this.toggleOutline = this.toggleOutline.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					prototypoTextPanelOpened: head.toJS().uiMode.indexOf('text') !== -1,
					glyphPanelOpened: head.toJS().uiMode.indexOf('list') !== -1,
					glyph: head.toJS().glyphs,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		fontInstance.on('manualchange', (changes, force = false) => {
			this.client.dispatchAction('/change-glyph-node-manually', {glyphUnicode: this.props.glyphSelected, changes, force});
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	setupCanvas() {
		fontInstance.zoom = this.props.uiZoom ? this.props.uiZoom : 0.5;
		fontInstance.view.center = this.props.uiPos
			? this.props.uiPos instanceof prototypo.paper.Point
				? this.props.uiPos
				: new prototypo.paper.Point(this.props.uiPos[1], this.props.uiPos[2])
			: fontInstance.view.center;

		fontInstance.showNodes = this.props.uiNodes || false;
		fontInstance.showCoords = this.props.uiCoords || false;
		fontInstance.fill = !this.props.uiOutline;

		const canvasContainer = this.refs.canvas;

		if (canvasContainer.clientWidth
			&& canvasContainer.clientHeight
			&& (canvasContainer.clientWidth !== window.canvasElement.width
			|| canvasContainer.clientHeight !== window.canvasElement.height)) {

			const oldSize = new prototypo.paper.Size(window.canvasElement.width,
				window.canvasElement.height);

			if (oldSize.width && oldSize.height) {
				const centerClone = fontInstance.view.center.clone();
				const center = new prototypo.paper.Point(
					centerClone.x,
					-centerClone.y
				);
				const glyphCenter = fontInstance.currGlyph.getPosition();

				const oldGlyphRelativePos = glyphCenter.subtract(center);
				const newSize = new prototypo.paper.Size(
					canvasContainer.clientWidth, canvasContainer.clientHeight);
				const ratio = newSize.divide(oldSize);

				const newDistance = new prototypo.paper.Point(oldGlyphRelativePos.x * ratio.width, oldGlyphRelativePos.y * ratio.height);
				const newCenterPosNotTransformed = glyphCenter.subtract(newDistance);
				const newCenterPos = new prototypo.paper.Point(
					newCenterPosNotTransformed.x,
					-newCenterPosNotTransformed.y
				);

				this.client.dispatchAction('/store-value', {uiPos: newCenterPos});
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

	wheel(e) {
		fontInstance.onWheel.bind(fontInstance)(e);
		this.client.dispatchAction('/store-value', {
			uiZoom: fontInstance.zoom,
			uiPos: fontInstance.view.center,
		});
	}

	preventSelection(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	mouseDown() {
		document.addEventListener('selectstart', this.preventSelection);
	}

	mouseUp() {
		this.client.dispatchAction('/store-value', {
			uiPos: fontInstance.view.center,
			uiZoom: fontInstance.zoom,
		});
		document.removeEventListener('selectstart', this.preventSelection);
	}

	componentDidMount() {
		const canvasContainer = this.refs.canvas;

		canvasContainer.appendChild(window.canvasElement);
		canvasContainer.addEventListener('wheel', (e) => { this.wheel(e); });
		canvasContainer.addEventListener('mousedown', (e) => { this.mouseDown(e); });
		canvasContainer.addEventListener('mouseup', (e) => { this.mouseUp(e); });

		this.setupCanvas();
	}

	toggleContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu: !this.state.showContextMenu,
		});

		Log.ui('PrototypoCanvas.showContextMenu');
	}

	handleLeaveAndClick() {
		if (this.state.showContextMenu) {
			this.setState({
				showContextMenu: false,
			});
		}

		//Need to resume selection on leave
		document.removeEventListener('selectstart', this.preventSelection);
	}

	handleShortcut(e) {
		// Zoom out to initial view
		if (e.keyCode === 90 && !this.oldPos) {
			e.preventDefault();
			e.stopPropagation();
			this.oldPos = {
				uiPos: fontInstance.view.center,
				uiZoom: fontInstance.zoom,
				uiNodes: this.props.uiNodes,
				uiOutline: this.props.uiOutline,
			};
			this.client.dispatchAction('/store-value', {uiNodes: false, uiOutline: false});
			this.reset();
		}

		const unicodes = Object.keys(this.state.glyph);
		const currentUnicode = unicodes.indexOf( this.props.glyphSelected );

		// navigate in glyph list: left
		if (e.keyCode === 37) {
			if ( currentUnicode - 1 >= 1 ) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode - 1] });
			}
		}
		// navigate in glyph list: right
		if (e.keyCode === 39) {
			if ( currentUnicode + 1 <= unicodes.length - 1 ) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode + 1] });
			}
		}
		// TODO: it only works when glyph list displays all glyphs
		// navigate in glyph list: up
		if (e.keyCode === 38) {
			if ( currentUnicode - 4 >= 1 ) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode - 4] });
			}
		}
		// navigate in glyph list: down
		if (e.keyCode === 40) {
			if ( currentUnicode + 4 <= unicodes.length - 1 ) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode + 4] });
			}
		}
	}

	reset() {
		this.props.reset({
			x: fontInstance.currGlyph.getBounds().center.x * window.devicePixelRatio,
			y: -fontInstance.currGlyph.getBounds().center.y * window.devicePixelRatio,
		});
	}

	finishShortcut(e) {
		if (e.keyCode === 90) {
			e.stopPropagation();
			this.client.dispatchAction('/store-value', this.oldPos);
			this.oldPos = undefined;
		}
	}

	acceptShortcut() {
		this.handleZoomCb = (e) => {this.handleShortcut(e);};
		this.finishZoomCb = (e) => {this.finishShortcut(e);};
		window.addEventListener('keydown', this.handleZoomCb);
		window.addEventListener('keyup', this.finishZoomCb);
	}

	rejectShortcut() {
		window.removeEventListener('keydown', this.handleZoomCb);
		window.removeEventListener('keyup', this.finishZoomCb);
		if (this.oldPos) {
			this.client.dispatchAction('/store-value', this.oldPos);
		}
	}

	toggleNodes(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {uiNodes: !this.props.uiNodes});
	}

	toggleOutline(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {uiOutline: !this.props.uiOutline});
	}

	toggleCoords(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {uiCoords: !this.props.uiCoords, uiNodes: !this.props.uiCoords ? true : this.props.uiNodes});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoCanvas');
		}
		const canvasClass = classNames({
			'is-hidden': this.props.uiMode.indexOf('glyph') === -1,
			'prototypo-canvas': true,
		});

		const textPanelClosed = !this.state.prototypoTextPanelOpened;
		const isShifted = textPanelClosed && this.state.glyphPanelOpened;

		const actionBarClassNames = classNames({
			'action-bar': true,
			'is-shifted': isShifted,
		});

		const menu = [
			<ContextualMenuItem
				key="nodes"
				active={this.props.uiNodes}
				text={`${this.props.uiNodes ? 'Hide' : 'Show'} nodes`}
				click={this.toggleNodes}/>,
			<ContextualMenuItem
				key="outline"
				active={this.props.uiOutline}
				text={`${this.props.uiOutline ? 'Hide' : 'Show'} outline`}
				click={this.toggleOutline}/>,
			<ContextualMenuItem
				key="coords"
				active={this.props.uiCoords}
				text={`${this.props.uiCoords ? 'Hide' : 'Show'} coords`}
				click={this.toggleCoords}/>,
			<ContextualMenuItem
				key="reset"
				text="Reset view"
				click={this.reset}/>,
		];

		const alternateMenu = this.props && this.props.glyphs[this.props.glyphSelected].length > 1 ? (
			<AlternateMenu alternates={this.props.glyphs[this.props.glyphSelected]} unicode={this.props.glyphSelected}/>
		) : false;

		return (
			<div
				style={this.props.style}
				className={canvasClass}
				onClick={this.handleLeaveAndClick}
				onMouseLeave={this.handleLeaveAndClick}>
				<div ref="canvas" className="prototypo-canvas-container" onMouseLeave={() => {this.rejectShortcut();}} onMouseEnter={() => { this.acceptShortcut();}} onDoubleClick={() => { this.reset(); }}></div>
				<div className={actionBarClassNames}>
					<CloseButton click={() => { this.props.close('glyph'); }}/>
				</div>
				<ViewPanelsMenu
					show={this.state.showContextMenu}
					shifted={isShifted}
					textPanelClosed={textPanelClosed}
					toggle={this.toggleContextMenu}>
					{menu}
				</ViewPanelsMenu>
				<div className="canvas-menu">
					<CanvasGlyphInput/>
					{alternateMenu}
				</div>
			</div>
		);
	}
}
