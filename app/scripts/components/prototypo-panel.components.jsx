import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import ResizablePanels from './shared/resizable-panels.components';
import PrototypoText from './prototypo-text.components.jsx';
import PrototypoCanvas from './prototypo-canvas.components.jsx';
import PrototypoWord from './prototypo-word.components.jsx';

export default class PrototypoPanel extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			uiMode: [],
		};

		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.toggleView = this.toggleView.bind(this);
		this.resetView = this.resetView.bind(this);
		this.changePanelWidth = this.changePanelWidth.bind(this);
		this.changePanelHeight = this.changePanelHeight.bind(this);
		this.closeRestrictedFeatureOverlay = this.closeRestrictedFeatureOverlay.bind(this);
		this.openGoProModal = this.openGoProModal.bind(this);
	}

	async componentWillMount() {

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
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
					uiCoords: head.toJS().d.uiCoords,
					uiShadow: head.toJS().d.uiShadow,
					uiInvertedTextView: head.toJS().d.uiInvertedTextView,
					uiInvertedTextColors: head.toJS().d.uiInvertedTextColors,
					uiTextFontSize: head.toJS().d.uiTextFontSize,
					uiInvertedWordView: head.toJS().d.uiInvertedWordView,
					uiInvertedWordColors: head.toJS().d.uiInvertedWordColors,
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

	resetView({x, y}) {
		this.client.dispatchAction('/store-value', {
			uiPos: new prototypo.paper.Point(x, y),
			uiZoom: 0.5,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleView(name) {
		// if we are closing glyph mode, we want glyph list to be hidden
		const modes = (
			name === 'glyph' && this.state.uiMode.indexOf('glyph') !== -1
				? _.without(this.state.uiMode, 'list')
				: this.state.uiMode
		);
		const newViewMode = _.xor(modes, [name]);

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
		this.client.dispatchAction('/store-value', {openRestrictedFeature: false,
													restrictedFeatureHovered: ''});
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

		//TODO(franz): Why ?
		/*if (!this.state.panel) {
			return false;
			}*/

		const hasGlyph = this.state.uiMode.indexOf('glyph') !== -1;
		const hasText = this.state.uiMode.indexOf('text') !== -1;
		const hasWord = this.state.uiMode.indexOf('word') !== -1;

		//This is for moving the view panels away from the intercom launcher
		const textIntercomDisplacement = hasText;
		const glyphIntercomDisplacement = hasGlyph && !hasText;
		const wordIntercomDisplacement = hasWord && !hasText && !hasGlyph;

			/*if (hasGlyph && this.state.uiShadow) {
			textAndGlyph.push(<div className="shadow-of-the-colossus" key="shadow">{String.fromCharCode(this.state.glyphSelected)}</div>);
		}*/

		let featureHovered;
		switch (this.state.restrictedFeatureHovered) {
			case 'indiv':
				featureHovered = 'This is the individualization mode, an advanced feature not available to you yet.'
				break;
			case 'slider':
				featureHovered = 'The full slider range has been disabled for you beause it allows advanced modifications.'
				break;
			case 'componentEditing':
				featureHovered = 'This is the component editing view, an advanced feature not available to you yet.'
				break;
			case 'manualEditing':
				featureHovered = 'This is the manual editing view, an advanced feature not available to you yet.'
				break;
			default:
				featureHovered = 'This feature is not available to you yet.';

		}

		const svgStyles = ".st0{opacity:0.38;fill:#E9E9E9;} .st1{opacity:0.39;fill:#D2D2D1;} .st2{opacity:0.16;} .st3{fill:none;stroke:#1C2023;stroke-width:0.8694;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st4{fill:none;stroke:#1C2023;stroke-width:0.5509;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st5{fill:none;stroke:#1C2023;stroke-width:0.7343;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st6{fill:none;stroke:#1C2023;stroke-width:1.0727;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st7{fill:none;stroke:#1C2023;stroke-width:1.0982;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st8{fill:none;stroke:#1C2023;stroke-width:0.5632;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st9{fill:none;stroke:#1C2023;stroke-width:0.5596;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st10{fill:none;stroke:#1C2023;stroke-width:0.7344;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st11{fill:none;stroke:#1C2023;stroke-width:0.9131;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st12{fill:none;stroke:#4D5456;stroke-width:10;stroke-miterlimit:10;} .st13{fill:#313435;} .st14{opacity:0.1;} .st15{fill:#F4F4F4;} .st16{fill:#E8B32E;} .st17{opacity:0.54;fill:#D1991E;} .st18{fill:#2E2014;stroke:#877426;stroke-miterlimit:10;} .st19{opacity:0.37;fill:#313435;}"
		const restrictedFeatureText = this.state.openRestrictedFeature
			? (
				<div className="panel-demo-overlay" onClick={this.closeRestrictedFeatureOverlay}>
				  <div className="panel-demo-overlay-text">
					  <svg xmlns="http://www.w3.org/2000/svg" id="Calque_1" viewBox="0 0 159.2 137" onClick={this.openGoProModal}>
    					<style>
    					  {svgStyles}
    					</style>
    					<ellipse id="XMLID_46_" cx="80.3" cy="70.6" className="st0" rx="79.6" ry="67.1"/>
    					<ellipse id="XMLID_130_" cx="76.5" cy="82.5" className="st1" rx="59.3" ry="52.7"/>
    					<g id="XMLID_36_" className="st2">
    					  <path id="XMLID_38_" d="M35.64 23.55l-2.6 1.06L32 22.05l2.58-1.06z" className="st3"/>
    					  <path id="XMLID_37_" d="M38.3 22.4l1.6 1.2 1.5 1.2-1.8.8-1.8.7.3-1.9z" className="st3"/>
    					</g>
    					<g id="XMLID_63_" className="st2">
    					  <path id="XMLID_65_" d="M8.47 39.43l1.63.78-.77 1.65-1.63-.77z" className="st4"/>
    					  <path id="XMLID_64_" d="M6.8 38.7l-.1-1.3-.1-1.2 1.1.5 1.1.6-1 .7z" className="st4"/>
    					</g>
    					<g id="XMLID_43_" className="st2">
    					  <path id="XMLID_50_" d="M31.65 63.13l-.45 2.25-2.26-.45.46-2.26z" className="st5"/>
    					  <path id="XMLID_48_" d="M32.1 60.7l1.6-.5 1.5-.5-.3 1.6-.3 1.6-1.3-1.1z" className="st5"/>
    					</g>
    					<g id="XMLID_54_" className="st2">
    					  <path id="XMLID_56_" d="M8.72 90.24l-2.96-1.67 1.67-2.96 2.96 1.7z" className="st6"/>
    					  <path id="XMLID_55_" d="M11.8 92l.1 2.4v2.4l-2.1-1.2-2.1-1.2 2.1-1.2z" className="st6"/>
    					</g>
    					<g id="XMLID_45_" className="st2">
    					  <path id="XMLID_49_" d="M136.18 87.86l2.47-2.47 2.48 2.44-2.48 2.48z" className="st7"/>
    					  <path id="XMLID_47_" d="M133.6 90.4l-2.4-.6-2.3-.6 1.7-1.8 1.7-1.7.7 2.4z" className="st7"/>
    					</g>
    					<g id="XMLID_57_" className="st2">
    					  <path id="XMLID_59_" d="M157.2 51.15l-1.04-1.47 1.47-1.04 1.04 1.46z" className="st8"/>
    					  <path id="XMLID_58_" d="M158.3 52.7l-.5 1.1-.6 1.2-.7-1.1-.7-1 1.2-.1z" className="st8"/>
    					</g>
    					<g id="XMLID_39_" className="st2">
    					  <path id="XMLID_41_" d="M72.32 3.1l-1.76-.38.4-1.76 1.75.38z" className="st9"/>
    					  <path id="XMLID_40_" d="M74.2 3.5l.3 1.2.4 1.2-1.2-.2-1.2-.3.8-.9z" className="st9"/>
    					</g>
    					<g id="XMLID_42_" className="st2">
    					  <path id="XMLID_52_" d="M123.93 45.97l.3-2.28 2.27.26-.3 2.28z" className="st10"/>
    					  <path id="XMLID_51_" d="M123.6 48.4l-1.5.6-1.6.6.3-1.6.2-1.6 1.3 1z" className="st10"/>
    					</g>
    					<g id="XMLID_53_" className="st2">
    					  <path id="XMLID_61_" d="M108.86 17.86l-2.7 1.1-1.1-2.68 2.7-1.1z" className="st11"/>
    					  <path id="XMLID_60_" d="M111.7 16.7l1.6 1.2 1.7 1.3-1.9.8-1.9.8.2-2.1z" className="st11"/>
    					</g>
    					<path id="XMLID_90_" d="M57.2 84.2V41.6c0-11.8 9.5-21.3 21.3-21.3s21.3 9.5 21.3 21.3v17.1" className="st12"/>
    					<path id="XMLID_33_" d="M52.2 52.3h10v17.8h-10z" className="st13"/>
    					<path id="XMLID_15_" d="M94.8 52.3h10v6.5h-10z" className="st13"/>
    					<g id="XMLID_11_" className="st14">
    					  <path id="XMLID_20_" d="M74.5 25.4c.7 0 1.3.1 2 .1-8 1-14.3 7.9-14.3 16.2v42.6h-4V41.7c0-9 7.3-16.3 16.3-16.3z" className="st15"/>
    					  <path id="XMLID_27_" d="M76.5 15.4c.7-.1 1.3-.1 2-.1 14.5 0 26.3 11.8 26.3 26.3v22.6h-4V41.7c0-13.9-10.8-25.2-24.3-26.3z" className="st15"/>
    					</g>
    					<path id="XMLID_35_" d="M104 120.8H52.7c-3.3 0-6-2.7-6-6V73.1c0-3.3 2.7-6 6-6H104c3.3 0 6 2.7 6 6v41.7c0 3.3-2.7 6-6 6z" className="st16"/>
    					<path id="XMLID_119_" d="M52.7 120.8H104c3.3 0 6-2.7 6-6V73.1c0-1.6-.6-3-1.7-4.1l-59.7 50.2c1.1.9 2.6 1.6 4.1 1.6z" className="st17"/>
    					<path id="XMLID_66_" d="M85.4 87.6c0-3.9-3.1-7-7-7s-7 3.1-7 7c0 2.6 1.4 4.8 3.5 6.1v8.9c0 2 1.6 3.6 3.6 3.6s3.6-1.6 3.6-3.6v-8.9c1.9-1.2 3.3-3.5 3.3-6.1z" className="st18"/>
    					<path id="XMLID_120_" d="M52.7 120.8H104c3.3 0 6-2.7 6-6v-1.5c0 3.3-2.7 6-6 6H52.7c-3.3 0-6-2.7-6-6v1.5c.1 3.3 2.8 6 6 6z" className="st19"/>
    				  </svg>
				    <p>
				      {featureHovered}
				    </p>
				    <p>
				      To unlock it, you can either:
				    </p>
				    <div className="panel-demo-overlay-text-academy-cta" onClick={() => {return true;}}>Read about it on the academy</div>
				    <div className="panel-demo-overlay-text-gopro-cta" onClick={this.openGoProModal}>Upgrade to the full version</div>
				  </div>
				</div>
			)
			: false;

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
					y={this.state.wordPanelHeight}>
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
							field="uiWord"/>
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
						x={this.state.canvasPanelWidth}>
						<PrototypoCanvas
							key="canvas"
							uiZoom={this.state.uiZoom}
							uiMode={this.state.uiMode}
							uiPos={this.state.uiPos}
							uiNodes={this.state.uiNodes}
							uiOutline={this.state.uiOutline}
							uiCoords={this.state.uiCoords}
							uiShadow={this.state.uiShadow}
							glyphs={this.state.glyphs}
							glyphSelected={this.state.glyphSelected}
							reset={this.resetView}
							viewPanelRightMove={glyphIntercomDisplacement}
							close={this.toggleView}/>
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
							field="uiText"/>
					</ResizablePanels>
				</ResizablePanels>
			</div>
		);
	}
}
