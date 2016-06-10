import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import PrototypoText from './prototypo-text.components.jsx';
import PrototypoCanvas from './prototypo-canvas.components.jsx';
import PrototypoWord from './prototypo-word.components.jsx';
import CreateParamGroup from './create-param-group.components.jsx';
import EditParamGroup from './edit-param-group.components.jsx';


export default class PrototypoPanel extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			uiMode: [],
		};

		this.availableMode = ['glyph', 'text', 'word'];
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
					createParamGroup: head.toJS().indivCreate,
					editingGroup: head.toJS().indivEdit,
					indivMode: head.toJS().indivMode,
				});
			})
			.onDelete(() => {
				this.setState({glyph: undefined});
			});
	}

	resetView({x, y}) {
		this.client.dispatchAction('/store-value', {
			uiPos: new prototypo.paper.Point(x, y),
			uiZoom: 0.5 / window.devicePixelRatio,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleView(name) {
		const newViewMode = _.intersection(_.xor(this.state.uiMode, [name]), this.availableMode);

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
			close={(name) => { this.toggleView(name); }}/>];
		const hasGlyph = this.state.uiMode.indexOf('glyph') !== -1;
		const hasText = this.state.uiMode.indexOf('text') !== -1;

		if (hasText) {
			textAndGlyph.push(<PrototypoText
				key="text"
				fontName={this.props.fontName}
				uiInvertedTextView={this.state.uiInvertedTextView}
				uiInvertedTextColors={this.state.uiInvertedTextColors}
				uiTextFontSize={this.state.uiTextFontSize}
				uiText={this.state.uiText}
				close={(name) => { this.toggleView(name); }}
				field="uiText"/>);
		}
		else if (hasGlyph && this.state.uiShadow) {
			textAndGlyph.push(<div className="shadow-of-the-colossus" key="shadow">{String.fromCharCode(this.state.glyphSelected)}</div>);
		}

		if (this.state.uiMode.indexOf('word') !== -1) {
			word = <PrototypoWord
				fontName={this.props.fontName}
				uiInvertedWordView={this.state.uiInvertedWordView}
				uiInvertedWordColors={this.state.uiInvertedWordColors}
				uiWordFontSize={this.state.uiWordFontSize}
				uiWord={this.state.uiWord}
				close={(name) => { this.toggleView(name); }}
				field="uiWord"/>;
		}

		const createParamGroup = this.state.createParamGroup && this.state.indivMode ? (
			<CreateParamGroup />
		) : false;

		const editParamGroup = this.state.editingGroup && this.state.indivMode ? (
			<EditParamGroup />
		) : false;

		let down;

		if (hasGlyph || hasText) {
			down = (
				<div id="prototypotextandglyph">
					{textAndGlyph}
				</div>
			);
		}

		let up;

		if (word) {
			up = (
				<div id="prototypoword">
					{word}
				</div>
			);
		}

		return (
			<div id="prototypopanel">
				{createParamGroup}
				{editParamGroup}
				{up}
				{down}
			</div>
		);
	}
}
