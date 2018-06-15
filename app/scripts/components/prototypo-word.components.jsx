import _debounce from 'lodash/debounce';
import _reduce from 'lodash/reduce';
import _find from 'lodash/find';
import React from 'react';
import ReactDOM from 'react-dom';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import classNames from 'classnames';
import {diffChars} from 'diff';
import {prototypoStore} from '../stores/creation.stores.jsx';

import {
	contentToArray,
	arrayToRawContent,
	rawToEscapedContent,
} from '../helpers/input-transform.helpers.js';

import {ContextualMenuItem} from './viewPanels/contextual-menu.components.jsx';
import ViewPanelsMenu from './viewPanels/view-panels-menu.components.jsx';
import CloseButton from './close-button.components.jsx';
import PrototypoWordInput from './views/prototypo-word-input.components.jsx';
import HandlegripText from './handlegrip/handlegrip-text.components.jsx';

export default class PrototypoWord extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			showContextMenu: false,
			glyphPanelOpened: undefined,
			uiSpacingMode: undefined,
			uiWordString: undefined,
			uiWordSelection: 0,
		};

		// function bindings
		this.setupText = _debounce(this.setupText.bind(this), 500, {leading: true});
		this.saveText = this.saveText.bind(this);
		this.handleEscapedInput = this.handleEscapedInput.bind(this);
		this.handleContextMenu = this.handleContextMenu.bind(this);
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

		this.setState({
			glyphPanelOpened: prototypoStore.get('uiMode').indexOf('list') !== -1,
			canvasPanelOpened: prototypoStore.get('uiMode').indexOf('glyph') !== -1,
			textPanelOpened: prototypoStore.get('uiMode').indexOf('text') !== -1,
			glyphs: prototypoStore.get('glyphs'),
			uiSpacingMode: prototypoStore.get('uiSpacingMode'),
			uiWordString: prototypoStore.get('uiWordString'),
			uiWordSelection: prototypoStore.get('uiWordSelection') || 0,
		});

		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					glyphPanelOpened: head.toJS().d.uiMode.indexOf('list') !== -1,
					canvasPanelOpened: head.toJS().d.uiMode.indexOf('glyph') !== -1,
					textPanelOpened: head.toJS().d.uiMode.indexOf('text') !== -1,
					glyphs: head.toJS().d.glyphs,
					uiSpacingMode: head.toJS().d.uiSpacingMode,
					uiWordString: head.toJS().d.uiWordString,
					uiWordSelection: head.toJS().d.uiWordSelection || 0,
					uiWordFontSize: head.toJS().d.uiWordFontSize,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				const values = head.toJS().d.controlsValues;

				this.setState({
					totalHeight:
						values.xHeight
						+ Math.max(values.capDelta, values.ascender)
						- values.descender,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client
			.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					font: window.fontResult,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	setupText() {
		const content = this.props[this.props.field];
		const transformedContent = rawToEscapedContent(content, this.state.glyphs);
		const newString
			= transformedContent && transformedContent.length > 0
				? transformedContent
				: '';

		if (newString !== this.state.uiWordString) {
			this.client.dispatchAction('/store-value', {
				uiWordString: newString,
			});
		}
	}

	saveText(text) {
		this.client.dispatchAction('/store-text', {
			value: text,
			propName: this.props.field,
		});
	}

	componentDidUpdate() {
		this.setupText();
		const raf
			= window.requestAnimationFrame || window.webkitRequestAnimationFrame;

		if (!this.alreadyRafed) {
			this.alreadyRafed = raf(() => {
				if (this.state.font) {
					const {clientWidth, clientHeight} = ReactDOM.findDOMNode(this);
					const advanceWidthSum = _reduce(
						rawToEscapedContent(
							this.state.uiWordString || '',
							this.state.glyphs,
						).split(''),
						(sum, glyph) =>
							sum
							+ (
								_find(
									this.state.font.glyphs,
									glyphItem => glyphItem.unicode === glyph.charCodeAt(0),
								) || {advanceWidth: 500}
							).advanceWidth,
						0,
					);
					const widthSize = 100 * clientWidth / (0.1 * advanceWidthSum) * 0.95;
					const heightSize
						= 100 * clientHeight / (0.1 * this.state.totalHeight) * 0.8;
					const rightSize = Math.min(widthSize, heightSize);

					this.client.dispatchAction('/store-value', {
						uiWordFontSize: rightSize,
					});
				}
				else {
					this.client.dispatchAction('/store-value', {
						uiWordFontSize: 100,
					});
				}
				this.alreadyRafed = undefined;
			});
		}
	}

	componentDidMount() {
		this.setupText();
		const raf
			= window.requestAnimationFrame || window.webkitRequestAnimationFrame;

		raf(() => {
			if (this.state.glyphProperties) {
				const {clientWidth, clientHeight} = ReactDOM.findDOMNode(this);
				const advanceWidthSum = _reduce(
					rawToEscapedContent(
						this.state.uiWordString || '',
						this.state.glyphs,
					).split(''),
					(sum, glyph) =>
						sum + this.state.glyphProperties[glyph.charCodeAt(0)].advanceWidth,
					0,
				);
				const widthSize = 100 * clientWidth / (0.1 * advanceWidthSum);
				const heightSize = 100 * clientHeight / (0.1 * this.state.totalHeight);
				const rightSize = Math.min(widthSize, heightSize);

				this.client.dispatchAction('/store-value', {
					uiWordFontSize: rightSize * 0.9,
				});
			}
		});
	}

	componentWillUnmount() {
		const cancelRaf
			= window.cancelAnimationFrame || window.mozCancelAnimationFrame;

		cancelRaf(this.alreadyRafed);
		this.handleEscapedInput();
		this.lifespan.release();
	}

	handleEscapedInput() {
		const textDiv = this.refs.text;

		if (textDiv && textDiv.textContent !== undefined) {
			const newText = this.applyDiff(
				contentToArray(this.props[this.props.field]), // array to update
				rawToEscapedContent(this.props[this.props.field], this.state.glyphs), // text in memory
				textDiv.textContent, // text updated with user input
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
					...value.split('').map(letter => (letter === '/' ? '//' : letter)),
					...buffer.slice(currentIndex),
				];
			}

			currentIndex += count;
		});

		return buffer.join('');
	}

	handleContextMenu(e) {
		e.preventDefault();

		this.toggleContextMenu();
	}

	toggleContextMenu() {
		this.setState({
			showContextMenu: !this.state.showContextMenu,
		});
	}

	hideContextMenu(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.pageX;
		const y = e.pageY;

		if (
			this.state.showContextMenu
			&& !(
				rect.left <= x
				&& x <= rect.left + rect.width
				&& rect.top <= y
				&& y <= rect.top + rect.height
			)
		) {
			this.setState({
				showContextMenu: false,
			});
		}
	}

	changeTextFontSize(uiWordFontSize) {
		this.client.dispatchAction('/store-value', {uiWordFontSize});
	}

	invertedView() {
		this.client.dispatchAction('/store-value', {
			uiInvertedWordView: !this.props.uiInvertedWordView,
		});
	}

	toggleSpacingMode() {
		this.client.dispatchAction('/store-value', {
			uiSpacingMode: !this.state.uiSpacingMode,
		});
	}

	toggleColors() {
		this.client.dispatchAction('/store-value', {
			uiInvertedWordColors: !this.props.uiInvertedWordColors,
		});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] PrototypoWord');
		}
		const style = {
			fontFamily: `'${this.props.fontName || 'theyaintus'}', sans-serif`,
			fontSize: this.state.uiWordFontSize || '98px',
		};

		const stringClasses = classNames('prototypo-word-string', {
			negative: this.props.uiInvertedWordColors,
			inverted: this.props.uiInvertedWordView,
			indiv: this.state.indivCurrentGroup,
		});

		const actionBar = classNames({
			'action-bar': true,
			'is-shifted': this.state.glyphPanelOpened,
		});

		const whiteBlackSwitchText = this.props.uiInvertedWordColors
			? 'black on white'
			: 'white on black';

		return (
			<div
				className="prototypo-word"
				onClick={this.hideContextMenu}
				onMouseLeave={this.hideContextMenu}
				onContextMenu={this.handleContextMenu}
			>
				<div className="prototypo-word-scrollbar-wrapper">
					<HandlegripText
						ref="text"
						style={style}
						className={stringClasses}
						text={this.state.uiWordString || ''}
						selectedLetter={this.state.uiWordSelection}
						min={0}
						max={1000}
					/>
					<ViewPanelsMenu
						show={this.state.showContextMenu}
						shifted={this.state.glyphPanelOpened}
						toggle={this.toggleContextMenu}
						intercomShift={this.props.viewPanelRightMove}
						upper
						left
						onMouseEnter={() => {
							this.setState({hoveringContextMenu: true});
						}}
						onMouseLeave={() => {
							this.setState({hoveringContextMenu: false});
						}}
					>
						<ContextualMenuItem
							active={this.props.uiInvertedWordView}
							onClick={this.invertedView}
						>
							Inverted view
						</ContextualMenuItem>
						<ContextualMenuItem
							active={this.props.uiInvertedWordColors}
							onClick={this.toggleColors}
						>
							Switch to {whiteBlackSwitchText}
						</ContextualMenuItem>
					</ViewPanelsMenu>
					<div className={actionBar}>
						<CloseButton
							click={() => {
								this.props.close('word');
							}}
						/>
					</div>
				</div>
				<PrototypoWordInput
					onTypedText={(rawText) => {
						this.saveText(rawText);
					}}
					value={arrayToRawContent(
						contentToArray(this.props[this.props.field]),
					)}
				/>
			</div>
		);
	}
}
