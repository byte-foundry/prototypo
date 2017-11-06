import _uniq from 'lodash/uniq';
import React from 'react';
import Lifespan from 'lifespan';

import FontMediator from '../prototypo.js/mediator/FontMediator';

import {rawToEscapedContent} from '../helpers/input-transform.helpers.js';

import LocalClient from '../stores/local-client.stores';

export default class FontUpdater extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.fontMediatorInstance = FontMediator.instance();

		this.client.getStore('/undoableStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					values: head.toJS().d.controlsValues,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					altList: head.toJS().d.altList,
					uiText: head.toJS().d.uiText,
					uiWord: head.toJS().d.uiWord,
					glyph: head.toJS().d.glyphSelected,
					name: head.toJS().d.fontName,
					glyphs: head.toJS().d.glyphs,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});

		this.client.getStore('/fontInstanceStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					template: head.toJS().d.templateToLoad,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	componentDidUpdate() {
		if (
			this.state.template !== undefined
			&& this.state.name !== undefined
			&& this.state.uiText !== undefined
			&& this.state.uiWord !== undefined
			&& this.state.glyph !== undefined
		) {
			const subsetString = this.state.uiText + rawToEscapedContent(this.state.uiWord, this.state.glyphs);
			const subset = _uniq(subsetString.split('')).map(
				letter => letter.charCodeAt(0),
			);

			this.fontMediatorInstance.getFont(
				this.state.name,
				this.state.template,
				{...this.state.values, altList: this.state.altList},
				subset,
				this.state.glyph,
			);
		}

		return false;
	}

	render() {
		return false;
	}
}
