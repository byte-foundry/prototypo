import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';
import PureRenderMixin from 'react-addons-pure-render-mixin';

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
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.saveTextDebounced = _.debounce((text, prop) => {
			this.client.dispatchAction('/store-text', {value: text, propName: prop});
		}, 500);
	}

	setupText() {
		const content = this.props[this.props.field];

		this.refs.text.textContent = content && content.length > 0 ? content : 'abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n,;.:-!?\‘\’\“\”\'\"\«\»()[]\n0123456789\n+&\/\náàâäéèêëíìîïóòôöúùûü\nÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜ\n\nᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀsᴛᴜᴠᴡʏᴢ';
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

	saveText() {
		const textDiv = this.refs.text;

		if (textDiv && textDiv.textContent) {
			this.saveTextDebounced(textDiv.textContent, this.props.field);
		}
	}

	showContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		const contextMenuPos = {x: e.nativeEvent.offsetX};

		if (this.props.uiInvertedWordView) {
			contextMenuPos.y = this.refs.text.clientHeight - e.nativeEvent.offsetY - e.target.parentElement.scrollTop;
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

	changeTextFontSize(uiWordFontSize) {
		this.client.dispatchAction('/store-value', {uiWordFontSize});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoWord');
		}
		const style = {
			'fontFamily': `'${this.props.fontName || 'theyaintus'}', sans-serif`,
			'fontSize': `${this.props.uiWordFontSize || 1}em`,
			'color': this.props.uiInvertedWordColors ? '#fefefe' : '#232323',
			'backgroundColor': this.props.uiInvertedWordColors ? '#232323' : '#fefefe',
			'transform': this.props.uiInvertedWordView ? 'scaleY(-1)' : 'scaleY(1)',
		};

		const menu = [
			<ContextualMenuItem
				text="Inverted view"
				key="colors"
				click={() => { this.client.dispatchAction('/store-value', {uiInvertedWordView: !this.props.uiInvertedWordView}); }}/>,
			<ContextualMenuItem
				key="view"
				text="Toggle colors"
				click={() => { this.client.dispatchAction('/store-value', {uiInvertedWordColors: !this.props.uiInvertedWordColors}); }}/>,
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
						plus={() => { this.changeTextFontSize(this.props.uiWordFontSize + 0.3); }}
						minus={() => { this.changeTextFontSize(this.props.uiWordFontSize - 0.3); }}
					/>
				</div>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		);
	}
}
