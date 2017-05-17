import React from 'react';
import classNames from 'classnames';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PrototypoCanvasContainer from 'prototypo-canvas';
import HoodieApi from '~/services/hoodie.services.js';
import Dropzone from 'react-dropzone';

import LocalClient from '../stores/local-client.stores.jsx';
import Log from '../services/log.services.js';
import {rawToEscapedContent} from '../helpers/input-transform.helpers';
import {mapGlyphForApp} from '../helpers/font.helpers.js';

import {ContextualMenuItem} from './viewPanels/contextual-menu.components.jsx';
import ViewPanelsMenu from './viewPanels/view-panels-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import CanvasGlyphInput from './canvas-glyph-input.components.jsx';
import AlternateMenu from './alternate-menu.components.jsx';
import CanvasBar from './canvasTools/canvas-bar.components.jsx';
import CanvasShadow from './canvasTools/canvas-shadow.components.jsx';

export default class PrototypoCanvas extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			prototypoTextPanelClosed: undefined,
			glyphPanelOpened: undefined,
			uiText: '',
			uiWord: '',
			shadowFile: '',
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.handleLeaveAndClick = this.handleLeaveAndClick.bind(this);
		this.reset = this.reset.bind(this);
		this.resetGlyph = this.resetGlyph.bind(this);
		this.toggleCoords = this.toggleCoords.bind(this);
		this.toggleNodes = this.toggleNodes.bind(this);
		this.toggleOutline = this.toggleOutline.bind(this);
		this.setGlyphs = this.setGlyphs.bind(this);
		this.changeComponent = this.changeComponent.bind(this);
		this.wheel = this.wheel.bind(this);
		this.acceptShortcut = this.acceptShortcut.bind(this);
		this.rejectShortcut = this.rejectShortcut.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
		this.changeManualNode = this.changeManualNode.bind(this);
		this.resetManualNode = this.resetManualNode.bind(this);
		this.startLoad = this.startLoad.bind(this);
		this.endLoad = this.endLoad.bind(this);
		this.afterFontComputation = this.afterFontComputation.bind(this);
		this.preExport = this.preExport.bind(this);
		this.afterExport = this.afterExport.bind(this);
		this.preExportGlyphr = this.preExportGlyphr.bind(this);
		this.afterExportGlyphr = this.afterExportGlyphr.bind(this);
		this.restrictedRangeEnter = this.restrictedRangeEnter.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.deleteShadow = this.deleteShadow.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					prototypoTextPanelOpened: head.toJS().d.uiMode.indexOf('text') !== -1,
					glyphPanelOpened: head.toJS().d.uiMode.indexOf('list') !== -1,
					glyphs: head.toJS().d.glyphs,
					glyphFocused: head.toJS().d.glyphFocused,
					glyphSelected: head.toJS().d.glyphSelected,
					uiText: head.toJS().d.uiText || '',
					uiWord: head.toJS().d.uiWord || '',
					canvasMode: head.toJS().d.canvasMode,
					oldCanvasMode: head.toJS().d.oldCanvasMode,
					altList: head.toJS().d.altList,
					credits: head.toJS().d.credits,
				});
				this.isFree = HoodieApi.instance && HoodieApi.instance.plan.indexOf('free_') !== -1;
				this.isFreeWithCredits = (head.toJS().d.credits && head.toJS().d.credits > 0) && this.isFree;
			})
			.onDelete(() => {
				this.setState(undefined);
			});

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

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleZoomCb);
		window.removeEventListener('keyup', this.finishZoomCb);
		this.lifespan.release();
	}

	wheel(zoom, center) {
		this.client.dispatchAction('/store-value', {
			uiZoom: zoom,
			uiPos: center,
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

	mouseUp(zoom, center) {
		this.client.dispatchAction('/store-value', {
			uiPos: center,
			uiZoom: zoom,
		});
		document.removeEventListener('selectstart', this.preventSelection);
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
		//if the glyph selection is focused do nothing
		if (this.state.glyphFocused) {
			return;
		}
		// Zoom out to initial view: Z
		if (e.keyCode === 90 && !e.ctrlKey) {
			e.preventDefault();
			e.stopPropagation();
			if (!this.oldPos) {
				this.oldPos = {
					uiPos: this.props.uiPos,
					uiZoom: this.props.uiZoom,
					uiNodes: this.props.uiNodes,
					uiOutline: this.props.uiOutline,
				};
				this.client.dispatchAction('/store-value', {uiNodes: false, uiOutline: false});
				this.reset();
			}
		}

		const unicodes = Object.keys(this.state.glyphs);
		const currentUnicode = unicodes.indexOf(this.props.glyphSelected);
		// enter move mode: space
		if (e.keyCode === 32) {
			e.preventDefault();
			e.stopPropagation();
			if (this.state.oldCanvasMode === undefined || this.state.oldCanvasMode === 'move' || this.state.oldCanvasMode === 'shadow') {
				this.client.dispatchAction('/toggle-canvas-mode', {canvasMode: 'move'});
			}
		}

		// enter shadow mode: s
		if (e.keyCode === 83) {
			e.preventDefault();
			e.stopPropagation();
			if (this.state.oldCanvasMode === undefined || this.state.oldCanvasMode === 'shadow' || this.state.oldCanvasMode === 'move ') {
				this.client.dispatchAction('/toggle-canvas-mode', {canvasMode: 'shadow'});
			}
		}

		// navigate in glyph list: left
		if (e.keyCode === 37) {
			if (currentUnicode - 1 >= 1) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode - 1]});
			}
		}
		// navigate in glyph list: right
		if (e.keyCode === 39) {
			if (currentUnicode + 1 <= unicodes.length - 1) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode + 1]});
			}
		}
		// TODO: it only works when glyph list displays all glyphs
		// navigate in glyph list: up
		if (e.keyCode === 38) {
			if (currentUnicode - 4 >= 1) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode - 4]});
			}
		}
		// navigate in glyph list: down
		if (e.keyCode === 40) {
			if (currentUnicode + 4 <= unicodes.length - 1) {
				this.client.dispatchAction('/select-glyph', {unicode: unicodes[currentUnicode + 4]});
			}
		}
	}

	reset(x, y, zoom) {
		this.props.reset({
			x,
			y,
			zoom,
		});
	}

	resetGlyph() {
		let glyphName = '';

		if (this.state.altList[this.props.glyphSelected]) {
			glyphName = this.state.altList[this.props.glyphSelected];
		}
		else {
			glyphName = this.state.glyphs[this.props.glyphSelected][0].name;
		}
		this.client.dispatchAction('/reset-glyph-manually', {glyphName});
	}

	finishShortcut(e) {
		if (e.keyCode === 90) {
			e.stopPropagation();
			this.client.dispatchAction('/store-value', this.oldPos);
			this.oldPos = undefined;
		}
		if (e.keyCode === 32 || e.keyCode === 83) {
			this.client.dispatchAction('/toggle-canvas-mode');
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

	restrictedRangeEnter() {
		const isFreeWithoutCreditsInManualEditing = this.isFree && !this.isFreeWithCredits && this.state.canvasMode === 'select-points';
		const isFreeWithoutCreditsInComponentEditing = this.isFree && !this.isFreeWithCredits && this.state.canvasMode === 'components';

		if (isFreeWithoutCreditsInComponentEditing) {
			this.client.dispatchAction('/store-value', {openRestrictedFeature: true,
														restrictedFeatureHovered: 'componentEditing'});
		}

		if (isFreeWithoutCreditsInManualEditing) {
			this.client.dispatchAction('/store-value', {openRestrictedFeature: true,
														restrictedFeatureHovered: 'manualEditing'});
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
		this.client.dispatchAction('/store-value', {uiCoords: !this.props.uiCoords, uiNodes: this.props.uiCoords ? this.props.uiNodes : true});
	}

	setGlyphs(glyphs) {
		this.client.dispatchAction('/load-glyphs', _.mapValues(
			glyphs,
			mapGlyphForApp
		));
	}

	changeComponent(object) {
		//if (!this.isFree || this.isFreeWithCredits) {
			this.client.dispatchAction('/change-component', object);
		//}
	}

	changeManualNode(params) {
		//if (!this.isFree || this.isFreeWithCredits) {
			this.client.dispatchAction('/change-glyph-node-manually', params);
		//}
	}

	resetManualNode(params) {
		this.client.dispatchAction('/reset-glyph-node-manually', params);
	}

	startLoad() {
		this.client.dispatchAction('/store-value', {uiFontLoading: true});
	}

	endLoad() {

		this.client.dispatchAction('/store-value', {
			uiFontLoading: false,
		});
	}

	afterFontComputation({totalHeight, glyphProperties}) {
		this.client.dispatchAction('/store-value', {
			totalHeight,
		});

		this.client.dispatchAction('/store-value-fast', {
			glyphProperties,
		});
	}

	isManualEdited() {
		if (this.state.values
			&& this.props.glyphSelected
			&& this.state.glyphs
			&& this.state.glyphs[this.props.glyphSelected]
			&& this.state.values.manualChanges
		) {
			let manualChangesGlyph;

			if (this.state.altList[this.props.glyphSelected]) {
				manualChangesGlyph = this.state.values.manualChanges[this.state.altList[this.props.glyphSelected]];
			}
			else {
				manualChangesGlyph = this.state.values.manualChanges[this.state.glyphs[this.props.glyphSelected][0].name];
			}
			return (manualChangesGlyph && Object.keys(manualChangesGlyph.cursors).length > 0);
		}
		else {
			return false;
		}
	}

	onDrop(accepted, rejected) {
		if (accepted.length > 0 && rejected.length === 0) {
			const reader = new FileReader();
			reader.addEventListener("load", () => {
				this.setState({shadowFile: {elem: reader.result, type: accepted[0].type === '' ? 'font' : 'image'}});
			}, false);
			accepted[0].type === '' ? reader.readAsArrayBuffer(accepted[0]) : reader.readAsDataURL(accepted[0]);
		}
	}

	deleteShadow() {
		this.setState({shadowFile: ''});
	}

	preExport() {
		this.client.dispatchAction('/store-value-font', {exportPlease: false});
	}

	afterExport() {
		this.client.dispatchAction('/end-export-otf');
	}

	preExportGlyphr() {
		this.client.dispatchAction('/store-value-font', {exportGlyphrTag: false});
	}

	afterExportGlyphr() {
		this.client.dispatchAction('/end-export-glyphr');
	}


	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoCanvas');
		}

		// const isFreeWithoutCreditsInManualEditing = this.isFree && !this.isFreeWithCredits && this.state.canvasMode === 'select-points';
		// const isFreeWithoutCreditsInComponentEditing = this.isFree && !this.isFreeWithCredits && this.state.canvasMode === 'components';

		const canvasClass = classNames({
			'is-hidden': this.props.uiMode.indexOf('glyph') === -1,
			'prototypo-canvas': true,
			//'is-blocked': isFreeWithoutCreditsInManualEditing,
		});

		const textPanelClosed = !this.state.prototypoTextPanelOpened;
		const isShifted = textPanelClosed && this.state.glyphPanelOpened;

		const actionBarClassNames = classNames({
			'action-bar': true,
			'is-shifted': isShifted,
		});

		const menu = [
			<ContextualMenuItem
				key="outline"
				active={this.props.uiOutline}
				text={`${this.props.uiOutline ? 'Hide' : 'Show'} outline`}
				click={this.toggleOutline}/>,
			<ContextualMenuItem
				key="reset"
				text="Reset view"
				click={this.reset}/>,
		];

		if (this.state.canvasMode === 'select-points') {
			menu.splice(1, 0,
				<ContextualMenuItem
					key="coords"
					active={this.props.uiCoords}
					text={`${this.props.uiCoords ? 'hide' : 'show'} coords`}
					click={this.toggleCoords}/>);
		}

		// const demoOverlay = (isFreeWithoutCreditsInManualEditing || isFreeWithoutCreditsInComponentEditing) ? (
		// 	<div className="canvas-demo-overlay" onClick={this.restrictedRangeEnter}/>
		// ) : false;
		const demoOverlay = false;

		let shadowDropzone = false;

		if (this.state.canvasMode === 'shadow' && this.state.shadowFile === '') {
			shadowDropzone = (
				<div className="prototypo-canvas-shadow-dropzone">
					<Dropzone
						className="prototypo-canvas-shadow-dropzone-content"
						accept="image/jpeg, image/png, .ttf, .otf"
						multiple="false"
						onDrop={this.onDrop}
						rejectClassName="rejected"
						>
					Drop an image file or a font here, or click to select files to upload.
					</Dropzone>
				</div>
			);
		}
		let shadowFile = false;

		if (this.state.shadowFile !== '') {
			shadowFile = (
				<div>
					<CanvasShadow
						shadowFile={this.state.shadowFile}
						width={this.refs.container.clientWidth}
						height={this.refs.container.clientHeight}
						canvasMode={this.state.canvasMode}
						glyphSelected={this.state.glyphs[this.props.glyphSelected][0]}
					/>
					{this.state.canvasMode === 'shadow'
						? (
							<button
								className={`prototypo-canvas-reset-glyph-button is-on-canvas`}
								onClick={this.deleteShadow}>
								Remove shadow
							</button>
						)
						: false
					}
				</div>
			);
		}


		const alternateMenu = this.props.glyphs && this.props.glyphs[this.props.glyphSelected] && this.props.glyphs[this.props.glyphSelected].length > 1 ? (
			<AlternateMenu alternates={this.props.glyphs[this.props.glyphSelected]} unicode={this.props.glyphSelected}/>
		) : false;

		return (
			<div
				style={this.props.style}
				className={canvasClass}
				onClick={this.handleLeaveAndClick}
				ref="container"
				onMouseLeave={this.handleLeaveAndClick}>
				<CanvasBar/>
				<button
					className={`prototypo-canvas-reset-glyph-button ${this.isManualEdited() ? '' : 'disabled'} ${this.state.canvasMode === 'select-points' ? 'is-on-canvas' : ''}`}
					onClick={this.resetGlyph}
					disabled={!this.isManualEdited()}>
					Reset glyph
				</button>
				{demoOverlay}
				{shadowDropzone}
				{shadowFile}
				<PrototypoCanvasContainer
					familyName={this.state.familyName}
					json={this.state.typedataJSON}
					db={this.state.db}
					values={this.state.values}
					workerUrl={this.state.workerUrl}
					workerDeps={this.state.workerDeps}
					uiZoom={this.props.uiZoom}
					uiPos={this.props.uiPos}
					uiCoords={this.props.uiCoords}
					uiOutline={this.props.uiOutline}
					selected={String.fromCharCode(this.state.glyphSelected)}
					values={this.state.values}
					subset={this.state.uiText + rawToEscapedContent(this.state.uiWord, this.state.glyphs)}
					setGlyphs={this.setGlyphs}
					afterFontComputation={this.afterFontComputation}
					changeComponent={this.changeComponent}
					canvasMode={this.state.canvasMode}
					mouseUp={this.mouseUp}
					mouseDown={this.mouseDown}
					mouseLeave={this.rejectShortcut}
					mouseEnter={this.acceptShortcut}
					wheel={this.wheel}
					changeManualNode={this.changeManualNode}
					resetManualNode={this.resetManualNode}
					resetView={this.reset}
					exportTag={this.state.exportPlease}
					exportGlyphrTag={this.state.exportGlyphrTag}
					exportName={this.state.exportName}
					exportMerged={this.state.exportMerged}
					exportValues={this.state.exportValues}
					exportEmail={this.state.exportEmail}
					preExport={this.preExport}
					afterExport={this.afterExport}
					preExportGlyphr={this.preExportGlyphr}
					afterExportGlyphr={this.afterExportGlyphr}
					preLoad={this.startLoad}
					afterLoad={this.endLoad}
					altList={this.state.altList}
					uiMode={this.props.uiMode}
				/>
				<div className={actionBarClassNames}>
					<CloseButton click={() => { this.props.close('glyph'); }}/>
				</div>
				<ViewPanelsMenu
					show={this.state.showContextMenu}
					shifted={isShifted}
					textPanelClosed={textPanelClosed}
					toggle={this.toggleContextMenu}
					intercomShift={this.props.viewPanelRightMove}>
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
