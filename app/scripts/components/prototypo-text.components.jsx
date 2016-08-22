import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {ContextualMenuItem} from './viewPanels/contextual-menu.components.jsx';
import ViewPanelsMenu from './viewPanels/view-panels-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import ZoomButtons from './zoom-buttons.components.jsx';
import ClassNames from 'classnames';

export default class PrototypoText extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos: {x: 0, y: 0},
			showContextMenu: false,
			glyphPanelOpened: undefined,
		};

		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
		this.saveText = this.saveText.bind(this);
		this.handleInputText = this.handleInputText.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.toggleInsertMenu = this.toggleInsertMenu.bind(this);
		this.hideContextMenu = this.hideContextMenu.bind(this);
		this.changeTextFontSize = this.changeTextFontSize.bind(this);
		this.setTextToQuickBrownFox = this.setTextToQuickBrownFox.bind(this);
		this.setTextToFameuxWhisky = this.setTextToFameuxWhisky.bind(this);
		this.setTextToAlphabet = this.setTextToAlphabet.bind(this);
		this.setTextToLorem = this.setTextToLorem.bind(this);
		this.close = this.close.bind(this);
		this.invertedView = this.invertedView.bind(this);
		this.toggleColors = this.toggleColors.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					glyphPanelOpened: head.toJS().uiMode.indexOf('list') !== -1,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	saveText(text) {
		this.client.dispatchAction('/store-text', {value: text, propName: this.props.field});
	}

	handleInputText(e) {
		this.saveText(e.target.text);
	}

	toggleContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu: !this.state.showContextMenu,
			showInsertMenu: false,
		});
	}

	toggleInsertMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showInsertMenu: !this.state.showInsertMenu,
			showContextMenu: false,
		});
	}

	hideContextMenu() {
		if (this.state.showContextMenu || this.state.showInsertMenu) {
			this.setState({
				showContextMenu: false,
				showInsertMenu: false,
			});
		}
	}

	changeTextFontSize(uiTextFontSize) {
		this.client.dispatchAction('/store-value', {uiTextFontSize});
	}

	setTextToQuickBrownFox() {
		this.saveText('The quick brown fox jumps over a lazy dog');
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	setTextToFameuxWhisky() {
		this.saveText('Buvez de ce whisky que le patron juge fameux');
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	setTextToAlphabet() {
		this.saveText(`!"#$;'()*+,-./0123456789:;;=;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]_abcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöøùúûüÿĀāĂăĆĈĊċČčĎďĒēĔĕĖėĚěĜĞğĠġĤĨĩĪīĬĭİıĴĹĽľŃŇňŌōŎŏŔŘřŚŜŞşŠšŤťŨũŪūŬŭŮůŴŶŸŹŻżŽžǫȦẀẂẄẼỲ‘’“”…‹›{|};€¡¢«»ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ`);
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	setTextToLorem() {
		this.saveText(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae scelerisque urna, eget consequat lectus. Pellentesque lacus magna, tincidunt quis libero non, pellentesque sagittis libero. Nam vitae ante eu lectus sodales sagittis. Duis eget mauris aliquet, gravida quam id, sodales sem. Etiam aliquam mi nec aliquam tincidunt. Nullam mollis mi nec mi luctus faucibus. Fusce cursus massa eget dui accumsan rhoncus. Quisque consectetur libero augue, eget dictum lacus pretium ac. Praesent scelerisque ipsum at aliquam tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed porta risus at aliquam venenatis.\r\n

								 Morbi faucibus mauris mi, sit amet laoreet sapien dapibus tristique. Suspendisse vitae molestie quam, ut cursus justo. Aenean sodales mauris vitae libero venenatis sollicitudin. Aenean condimentum nisl nec rhoncus elementum. Sed est ipsum, aliquam quis justo id, ornare tincidunt massa. Donec sit amet finibus sem. Sed euismod ex sed lorem hendrerit placerat. Praesent congue congue ultrices. Nam maximus metus rhoncus ligula porta sagittis. Maecenas pharetra placerat eleifend.\r\n

									 Cras eget dictum tortor. Etiam non auctor justo, vitae suscipit dolor. Maecenas vulputate fermentum ullamcorper. Etiam congue nec magna sed accumsan. Aliquam erat volutpat. Proin ut sapien auctor, congue tortor et, tempor dolor. Phasellus semper ut magna nec vehicula. Phasellus ut pretium metus. Aliquam eu consectetur est, mattis laoreet massa. Nullam eu scelerisque lacus. Pellentesque imperdiet metus at malesuada accumsan. Duis rhoncus, neque sed luctus faucibus, risus mi auctor purus, sed sagittis dolor leo quis quam.`);
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	invertedView(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {uiInvertedTextView: !this.props.uiInvertedTextView});
	}

	toggleColors(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {uiInvertedTextColors: !this.props.uiInvertedTextColors});
	}

	close() {
		this.props.close('text');
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
			'fontWeight': 400,
		};

		const actionBar = ClassNames({
			'action-bar': true,
			'is-shifted': this.state.glyphPanelOpened,
		});

		const pangramMenu = [
			<ContextualMenuItem
				text="Quick fox..."
				key="fox"
				click={this.setTextToQuickBrownFox}/>,
			<ContextualMenuItem
				text="Fameux whisky..."
				key="whisky"
				click={this.setTextToFameuxWhisky}/>,
			<ContextualMenuItem
				text="Latin glyph set"
				key="alphabet"
				click={this.setTextToAlphabet}/>,
			<ContextualMenuItem
				text="Lorem ipsum"
				key="lorem"
				click={this.setTextToLorem}/>,
			];

		const menu = [
			<ContextualMenuItem
				text="Inverted view"
				key="view"
				active={this.props.uiInvertedTextView}
				click={this.invertedView}/>,
			<ContextualMenuItem
				text={`Switch to ${this.props.uiInvertedTextColors ? 'black on white' : 'white on black'}`}
				key="colors"
				active={this.props.uiInvertedTextColors}
				click={this.toggleColors}/>,
			];

		const nl2br = (str = '') => { return str.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2'); };

		const htmlContent = nl2br(this.props[this.props.field]);

		return (
			<div
				className="prototypo-text"
				onClick={this.hideContextMenu}
				onMouseLeave={this.hideContextMenu}>
				<ReactGeminiScrollbar>
					<ContentEditable
						ref="text"
						className="prototypo-text-string"
						spellCheck="false"
						style={style}
						onChange={this.handleInputText}
						html={htmlContent}
					/>
				</ReactGeminiScrollbar>
				<ViewPanelsMenu
					shifted={this.state.glyphPanelOpened}
					show={this.state.showContextMenu}
					toggle={this.toggleContextMenu}>
					{menu}
				</ViewPanelsMenu>
				<ViewPanelsMenu
					alignLeft={true}
					text="Insert"
					show={this.state.showInsertMenu}
					toggle={this.toggleInsertMenu}>
					{pangramMenu}
				</ViewPanelsMenu>
				<div className={actionBar}>
					<CloseButton click={this.close}/>
					<ZoomButtons
						plus={() => { this.changeTextFontSize(this.props.uiTextFontSize + 0.3); }}
						minus={() => { this.changeTextFontSize(this.props.uiTextFontSize - 0.3); }}
					/>
				</div>
			</div>
		);
	}
}

class ContentEditable extends React.Component {
	constructor() {
		super();

		this.state = {text: ''};

		this.emitChange = this.emitChange.bind(this);
	}

	render() {
		const {children, html, tagName, ...props} = this.props;

		return React.createElement(
			tagName || 'div',
			{
				...props,
				ref: (e) => { this.htmlEl = e; },
				onInput: this.emitChange,
				onBlur: this.props.onBlur || this.emitChange,
				contentEditable: !this.props.disabled,
				dangerouslySetInnerHTML: {__html: html},
			},
			children
		);
	}

	shouldComponentUpdate(nextProps, nextState) {
		// We need not rerender if the change of props simply reflects the user's
		// edits. Rerendering in this case would make the cursor/caret jump.
		return (
			// Rerender if there is no element yet... (somehow?)
			!this.htmlEl
			// ...or if html really changed... (programmatically, not by user edit)
			|| (nextState.text !== this.htmlEl.innerText
			&& nextState.text !== this.state.text)
			// ...or if editing is enabled or disabled.
			|| this.props.disabled !== nextProps.disabled
		);
	}

	componentDidUpdate() {
		if (this.htmlEl && this.state.text !== this.htmlEl.innerText) {
			// Perhaps React (whose VDOM gets outdated because we often prevent
			// rerendering) did not update the DOM. So we update it manually now.
			this.htmlEl.innerText = this.props.html;
		}
	}

	emitChange(evt) {
		if (!this.htmlEl) return;
		var text = this.htmlEl.innerText;
		if (this.props.onChange && text !== this.lastText) {
			evt.target = {value: this.htmlEl.innerHTML, text: this.htmlEl.innerText};
			this.setState({text});
			this.props.onChange(evt);
		}
		this.lastText = text;
	}
}
