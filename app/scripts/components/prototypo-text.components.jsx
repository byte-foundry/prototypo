import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {ContextualMenu, ContextualMenuItem, ContextualMenuDropDown} from './contextual-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import ZoomButtons from './zoom-buttons.components.jsx';

export default class PrototypoText extends React.Component {

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

		if (this.props.uiInvertedTextView) {
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

	changeTextFontSize(uiTextFontSize) {
		this.client.dispatchAction('/store-value', {uiTextFontSize});
	}

	setTextToQuickBrownFox() {
		this.saveTextDebounced('The quick brown fox jumps over a lazy dog', this.props.field);
	}

	setTextToFameuxWhisky() {
		this.saveTextDebounced('Buvez de ce whisky que le patron juge fameux', this.props.field);
	}

	setTextToAlphabet() {
		this.saveTextDebounced('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890', this.props.field);
	}

	setTextToLorem() {
		this.saveTextDebounced(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae scelerisque urna, eget consequat lectus. Pellentesque lacus magna, tincidunt quis libero non, pellentesque sagittis libero. Nam vitae ante eu lectus sodales sagittis. Duis eget mauris aliquet, gravida quam id, sodales sem. Etiam aliquam mi nec aliquam tincidunt. Nullam mollis mi nec mi luctus faucibus. Fusce cursus massa eget dui accumsan rhoncus. Quisque consectetur libero augue, eget dictum lacus pretium ac. Praesent scelerisque ipsum at aliquam tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed porta risus at aliquam venenatis.\r\n

							   Morbi faucibus mauris mi, sit amet laoreet sapien dapibus tristique. Suspendisse vitae molestie quam, ut cursus justo. Aenean sodales mauris vitae libero venenatis sollicitudin. Aenean condimentum nisl nec rhoncus elementum. Sed est ipsum, aliquam quis justo id, ornare tincidunt massa. Donec sit amet finibus sem. Sed euismod ex sed lorem hendrerit placerat. Praesent congue congue ultrices. Nam maximus metus rhoncus ligula porta sagittis. Maecenas pharetra placerat eleifend.\r\n

								   Cras eget dictum tortor. Etiam non auctor justo, vitae suscipit dolor. Maecenas vulputate fermentum ullamcorper. Etiam congue nec magna sed accumsan. Aliquam erat volutpat. Proin ut sapien auctor, congue tortor et, tempor dolor. Phasellus semper ut magna nec vehicula. Phasellus ut pretium metus. Aliquam eu consectetur est, mattis laoreet massa. Nullam eu scelerisque lacus. Pellentesque imperdiet metus at malesuada accumsan. Duis rhoncus, neque sed luctus faucibus, risus mi auctor purus, sed sagittis dolor leo quis quam.`, this.props.field);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoText');
		}
		const style = {
			'fontFamily': `'${this.props.fontName || 'theyaintus'}', sans-serif`,
			'fontSize': `${this.props.uiTextFontSize || 1}em`,
			'color': this.props.uiInvertedTextColors ? '#fefefe' : '#232323',
			'backgroundColor': this.props.uiInvertedTextColors ? '#232323' : '#fefefe',
			'transform': this.props.uiInvertedTextView ? 'scaleY(-1)' : 'scaleY(1)',
		};

		const pangramMenu = [
			<ContextualMenuItem
				text="Quick fox..."
				key="fox"
				click={() => { this.setTextToQuickBrownFox();}}/>,
			<ContextualMenuItem
				text="Fameux whisky..."
				key="whisky"
				click={() => { this.setTextToFameuxWhisky();}}/>,
			<ContextualMenuItem
				text="Alphabet"
				key="alphabet"
				click={() => { this.setTextToAlphabet();}}/>,
		];

		const menu = [
			<ContextualMenuItem
				text="Inverted view"
				key="colors"
				click={() => { this.client.dispatchAction('/store-value', {uiInvertedTextView: !this.props.uiInvertedTextView}); }}/>,
			<ContextualMenuItem
				text="Toggle colors"
				key="view"
				click={() => { this.client.dispatchAction('/store-value', {invertedTextColors: !this.props.uiInvertedTextColors}); }}/>,
			<ContextualMenuDropDown
				options={pangramMenu}
				text="Insert pangram"
				key="pangram" />,
			<ContextualMenuItem
				text="Insert Lorem ipsum"
				key="lorem"
				click={() => { this.setTextToLorem();}}/>,
		];

		return (
			<div
				className="prototypo-text"
				onContextMenu={(e) => { this.showContextMenu(e); }}
				onClick={() => { this.hideContextMenu(); }}
				onMouseLeave={() => { this.hideContextMenu(); }}>
				<ReactGeminiScrollbar>
					<div
						contentEditable="true"
						ref="text"
						className="prototypo-text-string"
						spellCheck="false"
						style={style}
						onInput={() => { this.saveText(); }}
						></div>
				</ReactGeminiScrollbar>
				<div className="action-bar">
					<CloseButton click={() => { this.props.close('text'); }}/>
					<ZoomButtons
						plus={() => { this.changeTextFontSize(this.props.uiTextFontSize + 0.3); }}
						minus={() => { this.changeTextFontSize(this.props.uiTextFontSize - 0.3); }}
					/>
				</div>
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		);
	}
}
