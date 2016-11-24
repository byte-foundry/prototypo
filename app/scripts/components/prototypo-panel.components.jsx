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
	}

	async componentWillMount() {

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					glyphs: head.toJS().glyphs,
					glyphSelected: head.toJS().glyphSelected,
					uiMode: head.toJS().uiMode,
					uiText: head.toJS().uiText,
					uiWord: head.toJS().uiWord,
					uiZoom: head.toJS().uiZoom,
					uiPos: head.toJS().uiPos,
					uiNodes: head.toJS().uiNodes,
					uiOutline: head.toJS().uiOutline,
					uiCoords: head.toJS().uiCoords,
					uiShadow: head.toJS().uiShadow,
					uiInvertedTextView: head.toJS().uiInvertedTextView,
					uiInvertedTextColors: head.toJS().uiInvertedTextColors,
					uiTextFontSize: head.toJS().uiTextFontSize,
					uiInvertedWordView: head.toJS().uiInvertedWordView,
					uiInvertedWordColors: head.toJS().uiInvertedWordColors,
					uiWordFontSize: head.toJS().uiWordFontSize,
					editingGroup: head.toJS().indivEdit,
					indivMode: head.toJS().indivMode,
					wordPanelHeight: head.toJS().wordPanelHeight,
					canvasPanelWidth: head.toJS().canvasPanelWidth,
					indivCurrentGroup: head.toJS().indivCurrentGroup,
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

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] prototypopanel');
		}

		//TODO(franz): Why ?
		/*if (!this.state.panel) {
			return false;
			}*/

		let textAndGlyph;
		let word;

		const hasGlyph = this.state.uiMode.indexOf('glyph') !== -1;
		const hasText = this.state.uiMode.indexOf('text') !== -1;
		const hasWord = this.state.uiMode.indexOf('word') !== -1;

		//This is for moving the view panels away from the intercom launcher
		const textIntercomDisplacement = hasText;
		const glyphIntercomDisplacement = hasGlyph && !hasText;
		const wordIntercomDisplacement = hasWord && !hasText && !hasGlyph;

		textAndGlyph = [<PrototypoCanvas
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
			reset={(pos) => { this.resetView(pos); }}
			viewPanelRightMove={glyphIntercomDisplacement}
			close={(name) => { this.toggleView(name); }}/>];

		if (hasText) {
			textAndGlyph.push(<PrototypoText
				key="text"
				fontName={this.props.fontName}
				uiInvertedTextView={this.state.uiInvertedTextView}
				uiInvertedTextColors={this.state.uiInvertedTextColors}
				uiTextFontSize={this.state.uiTextFontSize}
				uiText={this.state.uiText}
				indivCurrentGroup={this.state.indivCurrentGroup}
				close={(name) => { this.toggleView(name); }}
				viewPanelRightMove={textIntercomDisplacement}
				field="uiText"/>);
		}
		else if (hasGlyph && this.state.uiShadow) {
			textAndGlyph.push(<div className="shadow-of-the-colossus" key="shadow">{String.fromCharCode(this.state.glyphSelected)}</div>);
		}

		if (hasWord) {
			word = <PrototypoWord
				key="word"
				fontName={this.props.fontName}
				uiInvertedWordView={this.state.uiInvertedWordView}
				uiInvertedWordColors={this.state.uiInvertedWordColors}
				uiWordFontSize={this.state.uiWordFontSize}
				uiWord={this.state.uiWord}
				indivCurrentGroup={this.state.indivCurrentGroup}
				close={(name) => { this.toggleView(name); }}

				viewPanelRightMove={wordIntercomDisplacement}
				field="uiWord"/>;
		}

		let down;

		if (hasGlyph && hasText) {
			down = (
				<ResizablePanels
					key="resizableText"
					defaultX={this.state.canvasPanelWidth}
					onChange={({x}) => {this.client.dispatchAction('/store-value', {canvasPanelWidth: x});}}
					property="flexBasis"
					id="prototypotextandglyph"
					direction="vertical"
				>
					{textAndGlyph}
				</ResizablePanels>
			);
		}
		else if (hasGlyph || hasText) {
			down = (
				<div id="prototypotextandglyph" key="textAndGlyph">
					{textAndGlyph}
				</div>
			);
		}

		let up;

		if (word) {
			up = (
				<div id="prototypoword" key="wordContainer">
					{word}
				</div>
			);
		}

		if (up && down) {
			return (
				<ResizablePanels
					key="everythingResize"
					defaultY={this.state.wordPanelHeight}
					onChange={({y}) => {this.client.dispatchAction('/store-value', {wordPanelHeight: y});}}
					id="prototypopanel"
					property="flexBasis"
					direction="horizontal"
				>
					{up}
					{down}
				</ResizablePanels>
			);
		}

		return (
			<div id="prototypopanel" key="justAcontainer">
				{up}
				{down}
			</div>
		);
	}
}
