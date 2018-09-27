import React from 'react';
import classNames from 'classnames';
import Lifespan from 'lifespan';
import Dropzone from 'react-dropzone';

import LocalClient from '../stores/local-client.stores';
import Log from '../services/log.services';

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

export default class PrototypoCanvas extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			glyphPanelOpened: undefined,
			uiText: '',
			uiWord: '',
			uiRuler: true,
			shadowFile: '',
			glyphViewMatrix: {},
			selectedItems: [],
			error: false,
			__devReloadKey: 'init',
		};

		this.handleContextMenu = this.handleContextMenu.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.handleLeaveAndClick = this.handleLeaveAndClick.bind(this);
		this.reset = this.reset.bind(this);
		this.resetGlyph = this.resetGlyph.bind(this);
		this.resetPoints = this.resetPoints.bind(this);
		this.toggleOutline = this.toggleOutline.bind(this);
		this.toggleRuler = this.toggleRuler.bind(this);
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

	componentDidMount() {
		// This enable the glyph canvas component to be hot reloaded
		// By changing the key of the component, it is recreated
		if (module.hot) {
			module.hot.accept('./glyph-canvas.components', () => {
				this.setState({__devReloadKey: Date.now(), error: false});
			});
		}
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleZoomCb);
		window.removeEventListener('keyup', this.finishZoomCb);
		this.lifespan.release();
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

	toggleOutline() {
		this.client.dispatchAction('/store-value', {
			uiOutline: !this.props.uiOutline,
		});
	}

	toggleRuler() {
		this.client.dispatchAction('/store-value', {
			uiRuler: !this.props.uiRuler,
		});
	}

	preventSelection(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	isManualEdited() {
		if (
			this.state.values
			&& this.props.glyphSelected
			&& this.state.glyphs
			&& this.state.glyphs[this.props.glyphSelected]
			&& this.state.values.postDepManualChanges
		) {
			let manualChangesGlyph;

			if (
				this.state.values.altList
				&& this.state.values.altList[this.props.glyphSelected]
			) {
				manualChangesGlyph = this.state.values.postDepManualChanges[
					this.state.values.altList[this.props.glyphSelected]
				];
			}
			else {
				manualChangesGlyph = this.state.values.postDepManualChanges[
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
		this.setState(({selectedItems, updatedGlyph = {}}) => ({
			updatedGlyph: glyph,
			// removing any selectedItems when changing glyph
			selectedItems: updatedGlyph.name === glyph.name ? selectedItems : [],
		}));
	}

	componentDidCatch(error) {
		trackJs.track(error);
		this.setState({error: true});
	}

	render() {
		const {selectedItems, updatedGlyph, error} = this.state;
		const {uiRuler, uiOutline} = this.props;

		if (error) {
			return (
				<div
					style={{
						...this.props.style,
						margin: 'auto',
						flexDirection: 'column',
						textAlign: 'center',
					}}
				>
					<p>Oops something went wrong. Try refreshing the page.</p>
				</div>
			);
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

		// Nodes are order from 0 to 7
		const inputNodeItems = selectedItems.filter(item => item.type < 7);
		const isSpacingSelected
			= selectedItems.length > 0
			&& selectedItems[0].type === toileType.SPACING_HANDLE;
		const isNodeSelected = !!inputNodeItems[0];

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
							isSpacingSelected || isNodeSelected ? '' : 'disabled'
						}`}
						onClick={this.resetPoints}
						disabled={!(isSpacingSelected || isNodeSelected)}
					>
						Reset {isSpacingSelected ? 'spacing' : 'point'}
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
					// eslint-disable-next-line no-underscore-dangle
					key={this.state.__devReloadKey}
				/>
				{inputNodeItems.length === 1 && (
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
