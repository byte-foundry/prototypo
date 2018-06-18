import _without from 'lodash/without';
import _xor from 'lodash/xor';
import React from 'react';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import InlineSVG from 'svg-inline-react';

import LocalClient from '../stores/local-client.stores';

import ResizablePanels from './shared/resizable-panels.components';
import PrototypoText from './prototypo-text.components';
import PrototypoCanvas from './prototypo-canvas.components';
import PrototypoWord from './prototypo-word.components';

export default class PrototypoPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			uiMode: [],
		};

		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(
			this,
		);
		this.toggleView = this.toggleView.bind(this);
		this.resetView = this.resetView.bind(this);
		this.changePanelWidth = this.changePanelWidth.bind(this);
		this.changePanelHeight = this.changePanelHeight.bind(this);
		this.closeRestrictedFeatureOverlay = this.closeRestrictedFeatureOverlay.bind(
			this,
		);
		this.openGoProModal = this.openGoProModal.bind(this);
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					glyphs: head.toJS().d.glyphs,
					glyphSelected: head.toJS().d.glyphSelected,
					uiMode: head.toJS().d.uiMode,
					uiText: head.toJS().d.uiText,
					uiWord: head.toJS().d.uiWord,
					uiZoom: head.toJS().d.uiZoom,
					uiPos: head.toJS().d.uiPos,
					uiNodes: head.toJS().d.uiNodes,
					uiOutline: head.toJS().d.uiOutline,
					uiRuler: head.toJS().d.uiRuler,
					uiCoords: head.toJS().d.uiCoords,
					uiShadow: head.toJS().d.uiShadow,
					uiInvertedTextView: head.toJS().d.uiInvertedTextView,
					uiInvertedTextColors: head.toJS().d.uiInvertedTextColors,
					uiTextFontSize: head.toJS().d.uiTextFontSize,
					uiInvertedWordView: head.toJS().d.uiInvertedWordView,
					uiInvertedWordColors: head.toJS().d.uiInvertedWordColors,
					uiDependencies: head.toJS().d.uiDependencies,
					editingGroup: head.toJS().d.indivEdit,
					indivMode: head.toJS().d.indivMode,
					wordPanelHeight: head.toJS().d.wordPanelHeight || 20,
					canvasPanelWidth: head.toJS().d.canvasPanelWidth || 50,
					indivCurrentGroup: head.toJS().d.indivCurrentGroup,
					openRestrictedFeature: head.toJS().d.openRestrictedFeature,
					restrictedFeatureHovered: head.toJS().d.restrictedFeatureHovered,
				});
			})
			.onDelete(() => {
				this.setState({glyph: undefined});
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	resetView({x, y, zoom = 0.5}) {
		this.client.dispatchAction('/store-value', {
			uiPos: {x, y},
			uiZoom: zoom,
		});
	}

	toggleView(name) {
		// if we are closing glyph mode, we want glyph list to be hidden
		const modes
			= name === 'glyph' && this.state.uiMode.indexOf('glyph') !== -1
				? _without(this.state.uiMode, 'list')
				: this.state.uiMode;
		const newViewMode = _xor(modes, [name]);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-value', {uiMode: newViewMode});
		}
	}

	changePanelWidth(position) {
		this.client.dispatchAction('/store-value', {canvasPanelWidth: position});
	}

	changePanelHeight(position) {
		this.client.dispatchAction('/store-value', {wordPanelHeight: position});
	}

	closeRestrictedFeatureOverlay() {
		this.client.dispatchAction('/store-value', {
			openRestrictedFeature: false,
			restrictedFeatureHovered: '',
		});
	}

	openGoProModal() {
		// TODO: Intercom tracking
		this.client.dispatchAction('/store-value', {
			openGoProModal: true,
		});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] prototypopanel');
		}

		// TODO(franz): Why ?
		/* if (!this.state.panel) {
			return false;
			} */

		const hasGlyph = this.state.uiMode.indexOf('glyph') !== -1;
		const hasText = this.state.uiMode.indexOf('text') !== -1;
		const hasWord = this.state.uiMode.indexOf('word') !== -1;

		// This is for moving the view panels away from the intercom launcher
		const textIntercomDisplacement = hasText;
		const glyphIntercomDisplacement = hasGlyph && !hasText;
		const wordIntercomDisplacement = hasWord && !hasText && !hasGlyph;

		/* if (hasGlyph && this.state.uiShadow) {
			textAndGlyph.push(<div className="shadow-of-the-colossus" key="shadow">{String.fromCharCode(this.state.glyphSelected)}</div>);
		} */

		let featureHovered;

		switch (this.state.restrictedFeatureHovered) {
		case 'indiv':
			featureHovered
					= 'This is the individualization mode, an advanced feature not available to you yet.';
			break;
		case 'slider':
			featureHovered
					= 'To unlock the full slider range on all parameters and design stronger identities with unique fonts.';
			break;
		case 'componentEditing':
			featureHovered
					= 'This is the component editing view, an advanced feature not available to you yet.';
			break;
		case 'manualEditing':
			featureHovered
					= 'This is the manual editing view, an advanced feature not available to you yet.';
			break;
		default:
			featureHovered = 'This feature is not available to you yet.';
		}

		const restrictedFeatureText = this.state.openRestrictedFeature ? (
			<div
				className="panel-demo-overlay"
				onClick={this.closeRestrictedFeatureOverlay}
			>
				<div className="panel-demo-overlay-text">
					<InlineSVG
						element="div"
						src={require('!svg-inline-loader!../../images/academy/lock.svg')}
						onClick={this.openGoProModal}
					/>
					<p>{featureHovered}</p>

					<div
						className="panel-demo-overlay-text-gopro-cta"
						onClick={this.openGoProModal}
					>
						Upgrade to the full version
					</div>
				</div>
			</div>
		) : (
			false
		);

		return (
			<div id="prototypopanel" key="justAcontainer">
				{restrictedFeatureText}
				<ResizablePanels
					key="everythingResize"
					defaultY={this.state.wordPanelHeight}
					onChange={this.changePanelHeight}
					id="prototypopanel"
					property="flexBasis"
					direction="horizontal"
					onlyOne={hasWord && !hasText && !hasGlyph}
					onlyTwo={!hasWord && (hasText || hasGlyph)}
					y={this.state.wordPanelHeight}
				>
					<div id="prototypoword" key="wordContainer">
						<PrototypoWord
							key="word"
							fontName={this.props.fontName}
							uiInvertedWordView={this.state.uiInvertedWordView}
							uiInvertedWordColors={this.state.uiInvertedWordColors}
							uiWord={this.state.uiWord || ''}
							indivCurrentGroup={this.state.indivCurrentGroup}
							close={this.toggleView}
							viewPanelRightMove={wordIntercomDisplacement}
							wordPanelHeight={this.state.wordPanelHeight}
							field="uiWord"
						/>
					</div>
					<ResizablePanels
						key="resizableText"
						defaultX={this.state.canvasPanelWidth}
						onChange={this.changePanelWidth}
						property="flexBasis"
						id="prototypotextandglyph"
						direction="vertical"
						onlyOne={hasGlyph && !hasText}
						onlyTwo={!hasGlyph && hasText}
						x={this.state.canvasPanelWidth}
					>
						<PrototypoCanvas
							key="canvas"
							uiZoom={this.state.uiZoom}
							uiMode={this.state.uiMode}
							uiPos={this.state.uiPos}
							uiNodes={this.state.uiNodes}
							uiOutline={this.state.uiOutline}
							uiRuler={this.state.uiRuler}
							uiCoords={this.state.uiCoords}
							uiDependencies={this.state.uiDependencies}
							uiShadow={this.state.uiShadow}
							glyphs={this.state.glyphs}
							glyphSelected={this.state.glyphSelected}
							reset={this.resetView}
							viewPanelRightMove={glyphIntercomDisplacement}
							close={this.toggleView}
						/>
						<PrototypoText
							key="text"
							display="block"
							fontName={this.props.fontName}
							uiInvertedTextView={this.state.uiInvertedTextView}
							uiInvertedTextColors={this.state.uiInvertedTextColors}
							uiTextFontSize={this.state.uiTextFontSize}
							uiText={this.state.uiText}
							close={this.toggleView}
							indivCurrentGroup={this.state.indivCurrentGroup}
							viewPanelRightMove={textIntercomDisplacement}
							field="uiText"
						/>
					</ResizablePanels>
				</ResizablePanels>
				<div className="shadow-of-the-colossus" key="shadow">
					{String.fromCharCode(this.state.glyphSelected)}
				</div>
			</div>
		);
	}
}
