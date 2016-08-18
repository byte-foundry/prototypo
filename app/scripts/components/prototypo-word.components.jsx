import React from 'react';
import ReactDOM from 'react-dom';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classNames from 'classnames';
import {diffChars} from 'diff';

import {contentToArray, arrayToRawContent, rawToEscapedContent} from '../helpers/input-transform.helpers.js';
import DOM from '../helpers/dom.helpers.js';

import {ContextualMenuItem} from './viewPanels/contextual-menu.components.jsx';
import ViewPanelsMenu from './viewPanels/view-panels-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import PrototypoWordInput from './views/prototypo-word-input.components.jsx';
import HandlegripText from './handlegrip-text.components.jsx';

export default class PrototypoWord extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos: {x: 0, y: 0},
			showContextMenu: false,
			glyphPanelOpened: undefined,
			uiSpacingMode: undefined,
			uiWordString: undefined,
			letterSpacingLeft: undefined,
			letterSpacingRight: undefined,
		};
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.setupText = this.setupText.bind(this);
		this.saveText = this.saveText.bind(this);
		this.handleEscapedInput = this.handleEscapedInput.bind(this);
		this.toggleContextMenu = this.toggleContextMenu.bind(this);
		this.hideContextMenu = this.hideContextMenu.bind(this);
		this.changeTextFontSize = this.changeTextFontSize.bind(this);
		this.toggleColors = this.toggleColors.bind(this);
		this.invertedView = this.invertedView.bind(this);
		this.toggleSpacingMode = this.toggleSpacingMode.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					glyphPanelOpened: head.toJS().uiMode.indexOf('list') !== -1,
					glyphs: head.toJS().glyphs,
					uiSpacingMode: head.toJS().uiSpacingMode,
					uiWordString: head.toJS().uiWordString,
					letterSpacingLeft: head.toJS().letterSpacingLeft,
					letterSpacingRight: head.toJS().letterSpacingRight,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

			fontInstance.on('worker.fontLoaded', () => {
				if (this.refs.text) {
					const transformedContent = this.refs.text.textContent;

					const style = this.refs.text.style;

					this.client.dispatchAction('/store-value', {
						uiWordFontSize: DOM.getProperFontSize(transformedContent, style, this.refs.text.clientWidth),
					});
				}
			});
	}

	setupText() {
		const content = this.props[this.props.field];
		const transformedContent = rawToEscapedContent(content, this.state.glyphs);

		const newString = transformedContent && transformedContent.length > 0 ? transformedContent : '';

		if (this.refs.text) {
			const refDOMElement = ReactDOM.findDOMNode(this.refs.text);
			const style = refDOMElement.style;

			this.client.dispatchAction('/store-value', {
				uiWordFontSize: DOM.getProperFontSize(
					transformedContent,
					style,
					refDOMElement.clientWidth
				),
			});

			this.refs.text.textContent = newString;
		}


		this.client.dispatchAction('/store-value', {
			uiWordString: newString,
		});
	}

	saveText(text) {
		this.client.dispatchAction('/store-text', {value: text, propName: this.props.field});
	}

	componentDidUpdate() {
		this.setupText();
	}

	componentDidMount() {
		this.setupText();
	}

	componentWillUnmount() {
		this.handleEscapedInput();
		this.lifespan.release();
	}

	handleEscapedInput() {
		const textDiv = this.refs.text;

		if (textDiv && textDiv.textContent !== undefined) {
			const newText = this.applyDiff(
				contentToArray(this.props[this.props.field]), // array to update
				rawToEscapedContent(this.props[this.props.field], this.state.glyphs), // text in memory
				textDiv.textContent // text updated with user input
			);

			this.saveText(newText);
		}
	}

	applyDiff(textArray, oldText, newText) {
		if (newText === '') {
			return newText;
		}

		let currentIndex = 0;
		let buffer = textArray;
		const diffList = diffChars(oldText, newText);

		diffList.forEach(({added, removed, count, value}) => {
			if (removed) {
				buffer = [
					...buffer.slice(0, currentIndex),
					...buffer.slice(currentIndex + count),
				];
				return;
			}

			if (added) {
				buffer = [
					...buffer.slice(0, currentIndex),
					...value.split('').map((letter) => {
						return letter === '/' ? '//' : letter;
					}),
					...buffer.slice(currentIndex),
				];
			}

			currentIndex += count;
		});

		return buffer.join('');
	}

	toggleContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu: !this.state.showContextMenu,
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

	invertedView(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {uiInvertedWordView: !this.props.uiInvertedWordView});
	}

	toggleSpacingMode(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {
			uiSpacingMode: !this.state.uiSpacingMode,
		});
	}

	toggleColors(e) {
		e.stopPropagation();
		this.client.dispatchAction('/store-value', {uiInvertedWordColors: !this.props.uiInvertedWordColors});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoWord');
		}
		const style = {
			'fontFamily': `'${this.props.fontName || 'theyaintus'}', sans-serif`,
			'fontSize': this.props.uiWordFontSize || '98px',
			'color': this.props.uiInvertedWordColors ? '#fefefe' : '#232323',
			'backgroundColor': this.props.uiInvertedWordColors ? '#232323' : '#fefefe',
			'transform': this.props.uiInvertedWordView ? 'scaleY(-1)' : 'scaleY(1)',
		};

		const actionBar = classNames({
			'action-bar': true,
			'is-shifted': this.state.glyphPanelOpened,
		});

		const whiteBlackSwitchText = this.props.uiInvertedWordColors ? 'black on white' : 'white on black';
		const whiteBlackSwitchLabel = `Switch to ${whiteBlackSwitchText}`;

		const menu = [
			<ContextualMenuItem
				text="Inverted view"
				key="view"
				active={this.props.uiInvertedWordView}
				click={this.invertedView}/>,
			<ContextualMenuItem
				text={whiteBlackSwitchLabel}
				key="colors"
				active={this.props.uiInvertedWordColors}
				click={this.toggleColors}/>,
			<ContextualMenuItem
				text="Spacing mode"
				key="spacingmode"
				active={this.state.uiSpacingMode}
				click={this.toggleSpacingMode}/>,
		];

		const wordContainer = this.state.uiSpacingMode
			? (
				<HandlegripText
					ref="text"
					style={style}
					text={this.state.uiWordString}
					min={0}
					max={100}
				/>
			)
			: (
				<div
					contentEditable="true"
					ref="text"
					className="prototypo-word-string"
					spellCheck="false"
					style={style}
					onInput={this.handleEscapedInput}
				></div>
			);

		return (
			<div
				className="prototypo-word"
				onClick={this.hideContextMenu}
				onMouseLeave={this.hideContextMenu}>
				<div className="prototypo-word-scrollbar-wrapper">
					<ReactGeminiScrollbar>
						{wordContainer}
					</ReactGeminiScrollbar>
					<ViewPanelsMenu
						show={this.state.showContextMenu}
						shifted={this.state.glyphPanelOpened}
						toggle={this.toggleContextMenu}>
						{menu}
					</ViewPanelsMenu>
					<div className={actionBar}>
						<CloseButton click={() => { this.props.close('word'); }}/>
					</div>
				</div>
				<PrototypoWordInput onTypedText={(rawText) => {this.saveText(rawText);}} value={arrayToRawContent(contentToArray(this.props[this.props.field]))} />
			</div>
		);
	}
}
