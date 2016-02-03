import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';

import {ContextualMenu, ContextualMenuItem} from './contextual-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import ZoomButtons from './zoom-buttons.components.jsx';

//Right now PrototypoWord is just like PrototypoText (except some css consideration)
//However it will change at some point
export default class PrototypoWord extends React.Component {

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

		this.saveTextDebounced = _.debounce((text, prop) => {
			this.client.dispatchAction('/store-text', {value: text, propName: prop});
		}, 500);
	}

	setupText() {
		const content = this.props.panel[this.props.field];

		React.findDOMNode(this.refs.text).textContent = content && content.length > 0 ? content : 'abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n,;.:-!?\‘\’\“\”\'\"\«\»()[]\n0123456789\n+&\/\náàâäéèêëíìîïóòôöúùûü\nÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜ\n\nᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀsᴛᴜᴠᴡʏᴢ';
		// this.saveText();
	}

	componentDidUpdate() {
		this.setupText();
	}

	componentDidMount() {
		this.setupText();
	}

	componentWillUnmount() {
		this.saveText();
		this.lifespan.release();
	}

	shouldComponentUpdate(newProps, newState) {
		return (
			this.props.fontName !== newProps.fontName
				|| this.props.field !== newProps.field
				|| this.props.panel.invertedWordView !== newProps.panel.invertedWordView
				|| this.props.panel.wordFontSize !== newProps.panel.wordFontSize
				|| this.props.panel.invertedWordColors !== newProps.panel.invertedWordColors
				|| this.props.panel.mode.length !== newProps.panel.mode.length
				|| newProps.panel[newProps.field] !== React.findDOMNode(this.refs.text).textContent
				|| this.state.showContextMenu !== newState.showContextMenu
				|| this.state.contextMenuPos !== newState.contextMenuPos
		);
	}

	saveText() {
		const textDiv = React.findDOMNode(this.refs.text);

		if (textDiv && textDiv.textContent) {
			this.saveTextDebounced(textDiv.textContent, this.props.field);
		}
	}

	showContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		const contextMenuPos = {x: e.nativeEvent.offsetX};

		if (this.props.panel.invertedWordView) {
			contextMenuPos.y = React.findDOMNode(this.refs.text).clientHeight - e.nativeEvent.offsetY - e.target.parentElement.scrollTop;
		}
		else {
			contextMenuPos.y = e.nativeEvent.offsetY - e.target.parentElement.scrollTop;
		}
		this.setState({
			showContextMenu: true,
			contextMenuPos,
		});
	}

	hideContextMenu() {
		if (this.state.showContextMenu) {
			this.setState({
				showContextMenu: false,
			});
		}
	}

	changeTextFontSize(wordFontSize) {
		this.client.dispatchAction('/store-panel-param', {wordFontSize});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoWord');
		}
		const style = {
			'fontFamily': `'${this.props.fontName || 'theyaintus'}', sans-serif`,
			'fontSize': `${this.props.panel.wordFontSize || 1}em`,
			'color': this.props.panel.invertedWordColors ? '#fefefe' : '#232323',
			'backgroundColor': this.props.panel.invertedWordColors ? '#232323' : '#fefefe',
			'transform': this.props.panel.invertedWordView ? 'scaleY(-1)' : 'scaleY(1)',
		};

		const menu = [
			<ContextualMenuItem
				text="Inverted view"
				key="colors"
				click={() => { this.client.dispatchAction('/store-panel-param', {invertedWordView: !this.props.panel.invertedWordView}); }}/>,
			<ContextualMenuItem
				key="view"
				text="Toggle colors"
				click={() => { this.client.dispatchAction('/store-panel-param', {invertedWordColors: !this.props.panel.invertedWordColors}); }}/>,
		];

		return (
			<div
				className="prototypo-word"
				onContextMenu={(e) => { this.showContextMenu(e); }}
				onClick={() => { this.hideContextMenu(); }}
				onMouseLeave={() => { this.hideContextMenu(); }}>
				<ReactGeminiScrollbar>
					<div
						contentEditable="true"
						ref="text"
						className="prototypo-word-string"
						spellCheck="false"
						style={style}
						onInput={() => { this.saveText(); }}
						></div>
				</ReactGeminiScrollbar>
				<div className="action-bar">
					<CloseButton click={() => { this.props.close('word'); }}/>
					<ZoomButtons
						plus={() => { this.changeTextFontSize(this.props.panel.wordFontSize + 0.3); }}
						minus={() => { this.changeTextFontSize(this.props.panel.wordFontSize - 0.3); }}
					/>
				</div>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		);
	}
}
