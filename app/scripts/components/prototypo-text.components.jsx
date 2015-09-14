import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';

import {ContextualMenu, ContextualMenuItem} from './contextual-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import ZoomButtons from './zoom-buttons.components.jsx';

export default class PrototypoText extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos:{x:0,y:0},
			showContextMenu:false,
		}
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.saveTextDebounced = _.debounce((text, prop) => {
			//			if (text !== this.props.panel[this.props.field]) {
				this.client.dispatchAction('/store-text',{value:text, propName:prop});
				//}
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

	shouldComponentUpdate(newProps) {
		return (
			this.props.fontName !== newProps.fontName ||
				this.props.field !== newProps.field ||
				this.props.panel.invertedTextView !== newProps.panel.invertedTextView ||
				this.props.panel.textFontSize !== newProps.panel.textFontSize ||
				this.props.panel.invertedTextColors !== newProps.panel.invertedTextColors ||
				newProps.panel[newProps.field] !== React.findDOMNode(this.refs.text).textContent
		)
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
		const contextMenuPos = {x:e.nativeEvent.offsetX};
		if (this.props.panel.invertedTextView) {
			contextMenuPos.y = React.findDOMNode(this.refs.text).clientHeight - e.nativeEvent.offsetY - e.target.parentElement.scrollTop;
		}
		else {
			contextMenuPos.y = e.nativeEvent.offsetY - e.target.parentElement.scrollTop;
		}
		this.setState({
			showContextMenu:true,
			contextMenuPos,
		});
	}

	hideContextMenu() {
		if (this.state.showContextMenu) {
			this.setState({
				showContextMenu:false,
			});
		}
	}

	changeTextFontSize(textFontSize) {
		this.client.dispatchAction('/store-panel-param', {textFontSize});
	}

	render() {
		const style = {
			'fontFamily':`'${this.props.fontName || 'theyaintus'}', sans-serif`,
			'fontSize': `${this.props.panel.textFontSize || 1}em`,
			'color': this.props.panel.invertedTextColors ? '#fefefe' : '#232323',
			'backgroundColor': !this.props.panel.invertedTextColors ? '#fefefe' : '#232323',
			'transform': this.props.panel.invertedTextView ? 'scaleY(-1)' : 'scaleY(1)',
		};

		const menu = [
			<ContextualMenuItem
				text="Inverted view"
				key="colors"
				click={() => { this.client.dispatchAction('/store-panel-param',{invertedTextView:!this.props.panel.invertedTextView}) }}/>,
			<ContextualMenuItem
				text="Toggle colors"
				key="view"
				click={() => { this.client.dispatchAction('/store-panel-param',{invertedTextColors:!this.props.panel.invertedTextColors}) }}/>,
		]

		return (
			<div
				className="prototypo-text"
				onContextMenu={(e) => { this.showContextMenu(e) }}
				onClick={() => { this.hideContextMenu() }}
				onMouseLeave={() => { this.hideContextMenu() }}>
				<ReactGeminiScrollbar>
					<div
						contentEditable="true"
						ref="text"
						className="prototypo-text-string"
						spellCheck="false"
						style={style}
						onInput={() => { this.saveText() }}
						></div>
				</ReactGeminiScrollbar>
				<div className="action-bar">
					<CloseButton click={() => { this.props.close('text') }}/>
					<ZoomButtons
						plus={() => { this.changeTextFontSize(this.props.panel.textFontSize + 0.3) }}
						minus={() => { this.changeTextFontSize(this.props.panel.textFontSize - 0.3) }}
					/>
				</div>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		)
	}
}
