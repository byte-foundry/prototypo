import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ScrollArea from 'react-scrollbar/dist/no-css';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Editor, EditorState, ContentState, CompositeDecorator} from 'draft-js';
import escapeStringRegexp from 'escape-string-regexp';

import {ContextualMenuItem} from './viewPanels/contextual-menu.components.jsx';
import ViewPanelsMenu from './viewPanels/view-panels-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import ZoomButtons from './zoom-buttons.components.jsx';
import classNames from 'classnames';

function createIndivStrategy(regex) {
	return (contentBlock, callback) => {
		const text = contentBlock.getText();
		let matchArr = regex.exec(text);
		let start;

		while (matchArr !== null) {
			start = matchArr.index;
			callback(start, start + matchArr[0].length);
			matchArr = regex.exec(text);
		}
	};
}

const IndivSpan = ({children}) => (
	<span className="prototypo-text-editor-indiv-character">{children}</span>
);

export default class PrototypoText extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			glyphPanelOpened: undefined,
			editorState: EditorState.createEmpty(),
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(
			this,
		);
		// function bindings
		this.saveText = this.saveText.bind(this);
		this.onEditorChange = this.onEditorChange.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.toggleInsertMenu = this.toggleInsertMenu.bind(this);
		this.hideContextMenu = this.hideContextMenu.bind(this);
		this.changeTextFontSize = this.changeTextFontSize.bind(this);
		this.setTextToQuickBrownFox = this.setTextToQuickBrownFox.bind(this);
		this.setTextToFameuxWhisky = this.setTextToFameuxWhisky.bind(this);
		this.setTextToAlphabet = this.setTextToAlphabet.bind(this);
		this.setTextToLorem = this.setTextToLorem.bind(this);
		this.setTextToAllGlyphs = this.setTextToAllGlyphs.bind(this);
		this.close = this.close.bind(this);
		this.invertedView = this.invertedView.bind(this);
		this.toggleColors = this.toggleColors.bind(this);
		this.updateIndivGroupDecorator = this.updateIndivGroupDecorator.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					glyphPanelOpened: head.toJS().d.uiMode.indexOf('list') !== -1,
					glyphs: head.toJS().d.glyphs,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	componentWillReceiveProps(nextProps) {
		if (
			!this.state.editorState.getCurrentContent().getPlainText()
			&& nextProps[nextProps.field]
		) {
			this.setText(nextProps[nextProps.field]);
		}
		this.updateIndivGroupDecorator(nextProps.indivCurrentGroup);
	}

	updateIndivGroupDecorator(nextIndivGroup) {
		const {editorState} = this.state;

		if (nextIndivGroup && nextIndivGroup !== this.props.indivCurrentGroup) {
			let decorator = null;

			if (nextIndivGroup.glyphs) {
				const glyphsString = nextIndivGroup.glyphs
					.map(unicode => String.fromCharCode(unicode))
					.join('');

				decorator = new CompositeDecorator([
					{
						strategy: createIndivStrategy(
							new RegExp(`[${escapeStringRegexp(glyphsString)}]+`, 'g'),
						),
						component: IndivSpan,
					},
				]);
			}

			this.setState({editorState: EditorState.set(editorState, {decorator})});
		}
	}

	setText(text) {
		this.setState({
			editorState: EditorState.push(
				this.state.editorState,
				ContentState.createFromText(text),
				'change-block-data',
			),
		});
		this.saveText(text);
	}

	saveText(text) {
		this.client.dispatchAction('/store-text', {
			value: text,
			propName: this.props.field,
		});
	}

	onEditorChange(editorState) {
		this.setState({editorState});
		this.saveText(editorState.getCurrentContent().getPlainText());
	}

	toggleContextMenu() {
		this.setState({
			showContextMenu: !this.state.showContextMenu,
			showInsertMenu: false,
		});
	}

	toggleInsertMenu() {
		this.setState({
			showInsertMenu: !this.state.showInsertMenu,
			showContextMenu: false,
		});
	}

	hideContextMenu(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.pageX;
		const y = e.pageY;

		if (
			(this.state.showContextMenu || this.state.showInsertMenu)
			&& !(
				rect.left <= x
				&& x <= rect.left + rect.width
				&& rect.top <= y
				&& y <= rect.top + rect.height
			)
		) {
			this.setState({
				showContextMenu: false,
				showInsertMenu: false,
			});
		}
	}

	changeTextFontSize(uiTextFontSizeToClamp) {
		const uiTextFontSize = Math.max(0.7, uiTextFontSizeToClamp);

		this.client.dispatchAction('/store-value', {uiTextFontSize});
	}

	setTextToQuickBrownFox() {
		this.setText('The quick brown fox jumps over a lazy dog');
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	setTextToFameuxWhisky() {
		this.setText('Buvez de ce whisky que le patron juge fameux');
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	setTextToAlphabet() {
		// this.setText(`!"#$;'()*+,-./0123456789:;;=;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]_abcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöøùúûüÿĀāĂăĆĈĊċČčĎďĒēĔĕĖėĚěĜĞğĠġĤĨĩĪīĬĭİıĴĹĽľŃŇňŌōŎŏŔŘřŚŜŞşŠšŤťŨũŪūŬŭŮůŴŶŸŹŻżŽžǫȦẀẂẄẼỲ‘’“”…‹›{|};€¡¢«»ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ`);
		this.setText(
			'0123456789 abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ',
		);
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	setTextToAllGlyphs() {
		this.setText(
			Object.keys(this.state.glyphs).filter(
				key => this.state.glyphs[key][0].unicode !== undefined,
			).map(e => String.fromCharCode(e)).join('')
		);
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	setTextToLorem() {
		this
			.setText(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae scelerisque urna, eget consequat lectus. Pellentesque lacus magna, tincidunt quis libero non, pellentesque sagittis libero. Nam vitae ante eu lectus sodales sagittis. Duis eget mauris aliquet, gravida quam id, sodales sem. Etiam aliquam mi nec aliquam tincidunt. Nullam mollis mi nec mi luctus faucibus. Fusce cursus massa eget dui accumsan rhoncus. Quisque consectetur libero augue, eget dictum lacus pretium ac. Praesent scelerisque ipsum at aliquam tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed porta risus at aliquam venenatis.

Morbi faucibus mauris mi, sit amet laoreet sapien dapibus tristique. Suspendisse vitae molestie quam, ut cursus justo. Aenean sodales mauris vitae libero venenatis sollicitudin. Aenean condimentum nisl nec rhoncus elementum. Sed est ipsum, aliquam quis justo id, ornare tincidunt massa. Donec sit amet finibus sem. Sed euismod ex sed lorem hendrerit placerat. Praesent congue congue ultrices. Nam maximus metus rhoncus ligula porta sagittis. Maecenas pharetra placerat eleifend.

Cras eget dictum tortor. Etiam non auctor justo, vitae suscipit dolor. Maecenas vulputate fermentum ullamcorper. Etiam congue nec magna sed accumsan. Aliquam erat volutpat. Proin ut sapien auctor, congue tortor et, tempor dolor. Phasellus semper ut magna nec vehicula. Phasellus ut pretium metus. Aliquam eu consectetur est, mattis laoreet massa. Nullam eu scelerisque lacus. Pellentesque imperdiet metus at malesuada accumsan. Duis rhoncus, neque sed luctus faucibus, risus mi auctor purus, sed sagittis dolor leo quis quam.`);
		this.setState({
			showContextMenu: false,
			showInsertMenu: false,
		});
	}

	invertedView() {
		this.client.dispatchAction('/store-value', {
			uiInvertedTextView: !this.props.uiInvertedTextView,
		});
	}

	toggleColors() {
		this.client.dispatchAction('/store-value', {
			uiInvertedTextColors: !this.props.uiInvertedTextColors,
		});
	}

	close() {
		this.props.close('text');
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoText');
		}
		const panelStyle = {
			backgroundColor: this.props.uiInvertedTextColors ? '#232323' : '#fefefe',
		};
		const contentStyle = {
			fontFamily: `'${
				this.state.editorState.getCurrentContent().getPlainText().length > 0
					? this.props.fontName || 'theyaintus'
					: 'Fira Sans'
			}', sans-serif`,
			fontSize: `${this.props.uiTextFontSize || 1}em`,
		};
		const editorClassNames = classNames('prototypo-text-editor', {
			negative: this.props.uiInvertedTextColors,
			inverted: this.props.uiInvertedTextView,
			indiv: this.props.indivCurrentGroup,
		});
		const actionBar = classNames({
			'action-bar': true,
			'is-shifted': this.state.glyphPanelOpened,
		});

		return (
			<div
				style={this.props.style}
				className="prototypo-text"
				onClick={this.hideContextMenu}
				onMouseLeave={this.hideContextMenu}
			>
				<ScrollArea horizontal={false} style={panelStyle}>
					<div className={editorClassNames} style={contentStyle}>
						<Editor
							editorState={this.state.editorState}
							onChange={this.onEditorChange}
							placeholder="Write some text here..."
							ref="editor"
						/>
					</div>
				</ScrollArea>
				<ViewPanelsMenu
					shifted={this.state.glyphPanelOpened}
					show={this.state.showContextMenu}
					toggle={this.toggleContextMenu}
					intercomShift={this.props.viewPanelRightMove}
					upper
					left
				>
					<ContextualMenuItem
						active={this.props.uiInvertedTextView}
						onClick={this.invertedView}
					>
						Inverted view
					</ContextualMenuItem>
					<ContextualMenuItem
						active={this.props.uiInvertedTextColors}
						onClick={this.toggleColors}
					>
						Switch to{' '}
						{this.props.uiInvertedTextColors
							? 'black on white'
							: 'white on black'}
					</ContextualMenuItem>
				</ViewPanelsMenu>
				<ViewPanelsMenu
					text="Insert"
					show={this.state.showInsertMenu}
					toggle={this.toggleInsertMenu}
					alignLeft
					upper
				>
					<ContextualMenuItem onClick={this.setTextToQuickBrownFox}>
						Quick fox...
					</ContextualMenuItem>
					<ContextualMenuItem onClick={this.setTextToFameuxWhisky}>
						Fameux whisky...
					</ContextualMenuItem>
					<ContextualMenuItem onClick={this.setTextToAlphabet}>
						Basic latin alphabet
					</ContextualMenuItem>
					<ContextualMenuItem onClick={this.setTextToLorem}>
						Lorem ipsum
					</ContextualMenuItem>
					<ContextualMenuItem onClick={this.setTextToAllGlyphs}>
						All glyphs
					</ContextualMenuItem>
				</ViewPanelsMenu>
				<div className={actionBar}>
					<CloseButton click={this.close} />
					<ZoomButtons
						plus={() => {
							this.changeTextFontSize(this.props.uiTextFontSize + 0.3);
						}}
						minus={() => {
							this.changeTextFontSize(this.props.uiTextFontSize - 0.3);
						}}
					/>
				</div>
			</div>
		);
	}
}
