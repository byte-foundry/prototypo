import _mapValues from 'lodash/mapValues';
import React from 'react';
import classNames from 'classnames';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Dropzone from 'react-dropzone';

import LocalClient from '../stores/local-client.stores';
import Log from '../services/log.services';
import {mapGlyphForApp} from '../helpers/font.helpers';
import HoodieApi from '../services/hoodie.services';

import {ContextualMenuItem} from './viewPanels/contextual-menu.components';
import ViewPanelsMenu from './viewPanels/view-panels-menu.components';
import ViewAlert from './shared/view-alert.components';
import CloseButton from './close-button.components';
import CanvasGlyphInput from './canvas-glyph-input.components';
import AlternateMenu from './alternate-menu.components';
import CanvasBar from './canvasTools/canvas-bar.components';
import GlyphCanvas from './glyph-canvas.components';
import {toileType} from '../toile/toile';
import CanvasShadow from './canvasTools/canvas-shadow.components';
import EditNodeProperties from './edit-node-properties.components';

export default class PrototypoCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			prototypoTextPanelClosed: undefined,
			glyphPanelOpened: undefined,
			uiText: '',
			uiWord: '',
			uiRuler: true,
			shadowFile: '',
			glyphViewMatrix: {},
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(
			this,
		);
		this.handleContextMenu = this.handleContextMenu.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.handleLeaveAndClick = this.handleLeaveAndClick.bind(this);
		this.reset = this.reset.bind(this);
		this.resetGlyph = this.resetGlyph.bind(this);
		this.resetPoints = this.resetPoints.bind(this);
		this.toggleCoords = this.toggleCoords.bind(this);
		this.toggleDependencies = this.toggleDependencies.bind(this);
		this.toggleNodes = this.toggleNodes.bind(this);
		this.toggleOutline = this.toggleOutline.bind(this);
		this.toggleRuler = this.toggleRuler.bind(this);
		this.changeComponent = this.changeComponent.bind(this);
		this.wheel = this.wheel.bind(this);
		this.acceptShortcut = this.acceptShortcut.bind(this);
		this.rejectShortcut = this.rejectShortcut.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
		this.setGlyphs = this.setGlyphs.bind(this);
		this.changeManualNode = this.changeManualNode.bind(this);
		this.resetManualNode = this.resetManualNode.bind(this);
		this.startLoad = this.startLoad.bind(this);
		this.endLoad = this.endLoad.bind(this);
		this.preExport = this.preExport.bind(this);
		this.afterExport = this.afterExport.bind(this);
		this.preExportGlyphr = this.preExportGlyphr.bind(this);
		this.afterExportGlyphr = this.afterExportGlyphr.bind(this);
		this.restrictedRangeEnter = this.restrictedRangeEnter.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.deleteShadow = this.deleteShadow.bind(this);
		this.handleSelectedItems = this.handleSelectedItems.bind(this);
		this.handleUpdateGlyph = this.handleUpdateGlyph.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/prototypoStore', this.lifespan)
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
					credits: head.toJS().d.credits,
					glyphOutsideView: head.toJS().d.glyphOutsideView,
					glyphViewMatrix: head.toJS().d.glyphViewMatrix,
					globalMode: head.toJS().d.globalMode,
				});
				this.isFree
					= HoodieApi.instance && HoodieApi.instance.plan.indexOf('free_') !== -1;
				this.isFreeWithCredits
					= head.toJS().d.credits && head.toJS().d.credits > 0 && this.isFree;
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState(head.toJS().d);
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/undoableStore', this.lifespan)
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

	setGlyphs(glyphs) {
		this.client.dispatchAction(
			'/load-glyphs',
			_mapValues(glyphs, mapGlyphForApp),
		);
	}

	handleContextMenu(e) {
		e.preventDefault();

		this.toggleContextMenu();
	}

	toggleContextMenu() {
		this.setState({
			showContextMenu: !this.state.showContextMenu,
		});

		Log.ui('PrototypoCanvas.showContextMenu');
	}

	// This is not the best solution we have
	// but it works if the mouse moves quickly away.
	handleLeaveAndClick(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.pageX;
		const y = e.pageY;

		if (
			this.state.showContextMenu
			&& !(
				rect.left <= x
				&& x <= rect.left + rect.width
				&& rect.top <= y
				&& y <= rect.top + rect.height
			)
		) {
			this.setState({
				showContextMenu: false,
			});
		}

		// Need to resume selection on leave
		document.removeEventListener('selectstart', this.preventSelection);
	}

	handleShortcut(e) {
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
				this.client.dispatchAction('/store-value', {
					uiNodes: false,
					uiOutline: false,
				});
				this.reset();
			}
		}

		const unicodes = Object.keys(this.state.glyphs);
		const currentUnicode = unicodes.indexOf(this.props.glyphSelected);
		// enter move mode: space

		if (e.keyCode === 32) {
			e.preventDefault();
			e.stopPropagation();
			if (
				this.state.oldCanvasMode === undefined
				|| this.state.oldCanvasMode === 'move'
				|| this.state.oldCanvasMode === 'shadow'
			) {
				this.client.dispatchAction('/toggle-canvas-mode', {canvasMode: 'move'});
			}
		}

		// enter shadow mode: s
		if (e.keyCode === 83) {
			e.preventDefault();
			e.stopPropagation();
			if (
				this.state.oldCanvasMode === undefined
				|| this.state.oldCanvasMode === 'shadow'
				|| this.state.oldCanvasMode === 'move '
			) {
				this.client.dispatchAction('/toggle-canvas-mode', {
					canvasMode: 'shadow',
				});
			}
		}

		// navigate in glyph list: left
		if (e.keyCode === 37) {
			if (currentUnicode - 1 >= 1) {
				this.client.dispatchAction('/select-glyph', {
					unicode: unicodes[currentUnicode - 1],
				});
			}
		}
		// navigate in glyph list: right
		if (e.keyCode === 39) {
			if (currentUnicode + 1 <= unicodes.length - 1) {
				this.client.dispatchAction('/select-glyph', {
					unicode: unicodes[currentUnicode + 1],
				});
			}
		}
		// TODO: it only works when glyph list displays all glyphs
		// navigate in glyph list: up
		if (e.keyCode === 38) {
			if (currentUnicode - 4 >= 1) {
				this.client.dispatchAction('/select-glyph', {
					unicode: unicodes[currentUnicode - 4],
				});
			}
		}
		// navigate in glyph list: down
		if (e.keyCode === 40) {
			if (currentUnicode + 4 <= unicodes.length - 1) {
				this.client.dispatchAction('/select-glyph', {
					unicode: unicodes[currentUnicode + 4],
				});
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
		let glyph;

		if (
			this.state.values.altList
			&& this.state.values.altList[this.props.glyphSelected]
		) {
			glyphName = this.state.values.altList[this.props.glyphSelected];

			glyph = this.state.glyphs[this.props.glyphSelected].find(
				glyphItem => glyphItem.name === glyphName,
			);
		}
		else {
			glyph = this.state.glyphs[this.props.glyphSelected][0];
		}

		const glyphToReset = glyph.base || glyph.name;

		this.client.dispatchAction('/reset-glyph-manually', {
			glyphName: glyphToReset,
		});
	}

	resetPoints() {
		let glyphName = '';
		let glyph;

		if (
			this.state.values.altList
			&& this.state.values.altList[this.props.glyphSelected]
		) {
			glyphName = this.state.values.altList[this.props.glyphSelected];

			glyph = this.state.glyphs[this.props.glyphSelected].find(
				glyphItem => glyphItem.name === glyphName,
			);
		}
		else {
			glyph = this.state.glyphs[this.props.glyphSelected][0];
		}

		const glyphToReset = glyph.base || glyph.name;

		this.client.dispatchAction('/reset-glyph-points-manually', {
			glyphName: glyphToReset,
			unicode: glyph.unicode,
			points: this.state.selectedItems,
			globalMode: this.state.globalMode,
		});
	}

	wheel(zoom, center) {
		this.client.dispatchAction('/store-value', {
			uiZoom: zoom,
			uiPos: center,
		});
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
		this.handleZoomCb = (e) => {
			this.handleShortcut(e);
		};
		this.finishZoomCb = (e) => {
			this.finishShortcut(e);
		};
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
		const isFreeWithoutCreditsInManualEditing
			= this.isFree
			&& !this.isFreeWithCredits
			&& this.state.canvasMode === 'select-points';
		const isFreeWithoutCreditsInComponentEditing
			= this.isFree
			&& !this.isFreeWithCredits
			&& this.state.canvasMode === 'components';

		if (isFreeWithoutCreditsInComponentEditing) {
			this.client.dispatchAction('/store-value', {
				openRestrictedFeature: true,
				restrictedFeatureHovered: 'componentEditing',
			});
		}

		if (isFreeWithoutCreditsInManualEditing) {
			this.client.dispatchAction('/store-value', {
				openRestrictedFeature: true,
				restrictedFeatureHovered: 'manualEditing',
			});
		}
	}

	toggleNodes() {
		this.client.dispatchAction('/store-value', {uiNodes: !this.props.uiNodes});
	}

	toggleOutline() {
		this.client.dispatchAction('/store-value', {
			uiOutline: !this.props.uiOutline,
		});
	}

	toggleRuler() {
		this.client.dispatchAction('/store-value', {uiRuler: !this.props.uiRuler});
	}

	toggleCoords() {
		this.client.dispatchAction('/store-value', {
			uiCoords: !this.props.uiCoords,
			uiNodes: this.props.uiCoords ? this.props.uiNodes : true,
		});
	}

	toggleDependencies() {
		this.client.dispatchAction('/store-value', {
			uiDependencies: !this.props.uiDependencies,
		});
	}

	mouseUp(zoom, center) {
		this.client.dispatchAction('/store-value', {
			uiPos: center,
			uiZoom: zoom,
		});
		document.removeEventListener('selectstart', this.preventSelection);
	}

	mouseDown() {
		document.addEventListener('selectstart', this.preventSelection);
	}

	preventSelection(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	changeComponent(object) {
		// if (!this.isFree || this.isFreeWithCredits) {
		this.client.dispatchAction('/change-component', object);
		// }
	}

	changeManualNode(params) {
		// if (!this.isFree || this.isFreeWithCredits) {
		this.client.dispatchAction('/change-glyph-node-manually', params);
		// }
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

	isManualEdited() {
		if (
			this.state.values
			&& this.props.glyphSelected
			&& this.state.glyphs
			&& this.state.glyphs[this.props.glyphSelected]
			&& this.state.values.manualChanges
		) {
			let manualChangesGlyph;

			if (
				this.state.values.altList
				&& this.state.values.altList[this.props.glyphSelected]
			) {
				manualChangesGlyph = this.state.values.manualChanges[
					this.state.values.altList[this.props.glyphSelected]
				];
			}
			else {
				manualChangesGlyph = this.state.values.manualChanges[
					this.state.glyphs[this.props.glyphSelected][0].name
				];
			}
			return (
				manualChangesGlyph
				&& Object.keys(manualChangesGlyph.cursors).filter(
					key => manualChangesGlyph.cursors[key] !== undefined,
				).length > 0
			);
		}

		return false;
	}

	onDrop(accepted, rejected) {
		if (accepted.length > 0 && rejected.length === 0) {
			const reader = new FileReader();

			reader.addEventListener(
				'load',
				() => {
					this.setState({
						shadowFile: {
							elem: reader.result,
							type: accepted[0].type === '' ? 'font' : 'image',
						},
					});
				},
				false,
			);
			accepted[0].type === ''
				? reader.readAsArrayBuffer(accepted[0])
				: reader.readAsDataURL(accepted[0]);
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

	handleSelectedItems(selectedItems) {
		const storedItems = selectedItems.map(item => ({
			type: item.type,
			id: item.id,
			data: {
				parentId: item.data.parentId,
				modifAddress: item.data.modifAddress,
				componentName: item.data.componentName,
			},
		}));

		this.setState({selectedItems});

		this.client.dispatchAction('/store-value', {
			selectedItems: storedItems,
		});
	}

	handleUpdateGlyph(glyph) {
		console.log('update glyph', glyph);
		this.setState({updatedGlyph: glyph});
	}

	render() {
		const {selectedItems, updatedGlyph} = this.state;
		const {uiRuler, uiOutline} = this.props;

		/* eslint-disable max-len */
		// const isFreeWithoutCreditsInManualEditing = this.isFree && !this.isFreeWithCredits && this.state.canvasMode === 'select-points';
		// const isFreeWithoutCreditsInComponentEditing = this.isFree && !this.isFreeWithCredits && this.state.canvasMode === 'components';
		/* eslint-enable max-len */

		const canvasClass = classNames({
			'is-hidden': this.props.uiMode.indexOf('glyph') === -1,
			'prototypo-canvas': true,
			// 'is-blocked': isFreeWithoutCreditsInManualEditing,
		});

		const textPanelClosed = !this.state.prototypoTextPanelOpened;
		const isShifted = textPanelClosed && this.state.glyphPanelOpened;

		const actionBarClassNames = classNames({
			'action-bar': true,
			'is-shifted': isShifted,
		});

		const menu = [
			<ContextualMenuItem
				key="ruler"
				active={uiRuler}
				onClick={this.toggleRuler}
			>
				{uiRuler ? 'Hide' : 'Show'} ruler
			</ContextualMenuItem>,
			<ContextualMenuItem
				key="outline"
				active={uiOutline}
				onClick={this.toggleOutline}
			>
				{uiOutline ? 'Hide' : 'Show'} outline
			</ContextualMenuItem>,
			<ContextualMenuItem key="reset" onClick={this.reset}>
				Reset view
			</ContextualMenuItem>,
		];

		/* eslint-disable max-len */
		// const demoOverlay = (isFreeWithoutCreditsInManualEditing || isFreeWithoutCreditsInComponentEditing) ? (
		// 	<div className="canvas-demo-overlay" onClick={this.restrictedRangeEnter}/>
		// ) : false;
		// const demoOverlay = false;
		/* eslint-enable max-len */

		const alternateMenu
			= this.props.glyphs
			&& this.props.glyphs[this.props.glyphSelected]
			&& this.props.glyphs[this.props.glyphSelected].length > 1 ? (
					<AlternateMenu
						alternates={this.props.glyphs[this.props.glyphSelected]}
						unicode={this.props.glyphSelected}
					/>
				) : (
					false
				);

		const outsideAlert = (
			<ViewAlert
				inside={this.state.glyphOutsideView}
				text="The glyph is outside the view ! Try double clicking in the view to bring it back."
			/>
		);
		let shadowDropzone = false;

		if (this.state.canvasMode === 'shadow' && this.state.shadowFile === '') {
			shadowDropzone = (
				<div className="prototypo-canvas-shadow-dropzone">
					<Dropzone
						className="prototypo-canvas-shadow-dropzone-content"
						accept=".ttf, .otf"
						multiple={false}
						onDrop={this.onDrop}
						rejectClassName="rejected"
					>
						Drop a font here, or click to select files to upload.
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
						width={this.container.clientWidth}
						height={this.container.clientHeight}
						canvasMode={this.state.canvasMode}
						glyphSelected={this.state.glyphs[this.props.glyphSelected][0]}
						glyphViewMatrix={this.state.glyphViewMatrix}
					/>
				</div>
			);
		}

		const inputNodeItems = selectedItems && selectedItems.filter(item => item.type < 7);

		const shadowButton
			= this.state.canvasMode === 'shadow' ? (
				<div className="prototypo-canvas-reset-buttons is-on-canvas">
					<button
						className="prototypo-canvas-reset-button"
						onClick={this.deleteShadow}
					>
						Remove shadow
					</button>
				</div>
			) : (
				false
			);

		return (
			<div
				style={this.props.style}
				className={canvasClass}
				onClick={this.handleLeaveAndClick}
				onMouseLeave={this.handleLeaveAndClick}
				onContextMenu={this.handleContextMenu}
				ref={(item) => {
					this.container = item;
				}}
			>
				<CanvasBar />
				<div
					className={`prototypo-canvas-reset-buttons ${
						this.state.canvasMode === 'select-points' ? 'is-on-canvas' : ''
					}`}
				>
					<button
						className={`prototypo-canvas-reset-button ${
							this.isManualEdited() ? '' : 'disabled'
						}`}
						onClick={this.resetGlyph}
						disabled={!this.isManualEdited()}
					>
						Reset glyph
					</button>
					<button
						className={`prototypo-canvas-reset-button ${
							this.state.selectedItems && this.state.selectedItems.length > 0
								? ''
								: 'disabled'
						}`}
						onClick={this.resetPoints}
						disabled={
							!(this.state.selectedItems && this.state.selectedItems.length)
						}
					>
						Reset{' '}
						{this.state.selectedItems
						&& this.state.selectedItems.length > 0
						&& this.state.selectedItems[0].type === toileType.SPACING_HANDLE
							? 'spacing'
							: 'point'}
					</button>
				</div>
				{shadowButton}
				{shadowDropzone}
				{shadowFile}
				<GlyphCanvas
					dependencies={this.props.uiDependencies}
					glyphOutsideView={this.state.glyphOutsideView}
					onSelectedItems={this.handleSelectedItems}
					onUpdateGlyph={this.handleUpdateGlyph}
				/>
				{inputNodeItems
					&& inputNodeItems.length === 1 && (
					<EditNodeProperties
						glyph={updatedGlyph}
						selectedItem={inputNodeItems[0]}
					/>
				)}
				<div className={actionBarClassNames}>
					<CloseButton
						click={() => {
							this.props.close('glyph');
						}}
					/>
				</div>
				{outsideAlert}
				<ViewPanelsMenu
					show={this.state.showContextMenu}
					shifted={isShifted}
					textPanelClosed={textPanelClosed}
					toggle={this.toggleContextMenu}
					intercomShift={this.props.viewPanelRightMove}
					upper
					left
				>
					{menu}
				</ViewPanelsMenu>
				<div className="canvas-menu">
					<CanvasGlyphInput />
					{alternateMenu}
				</div>
			</div>
		);
	}
}
