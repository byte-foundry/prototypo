/* global _ */
import React from 'react';
import Lifespan from 'lifespan';

import FontMediator from '../prototypo.js/mediator/FontMediator';

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

	render() {
		if (
			this.state.template !== undefined
			&& this.state.name !== undefined
			&& this.state.uiText !== undefined
			&& this.state.uiWord !== undefined
			&& this.state.glyph !== undefined
		) {
			const subsetString = this.state.uiText + this.state.uiWord;
			const subset = _.map(
				_.uniq(subsetString.split('')),
				(letter) => {
					return letter.charCodeAt(0);
				},
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
}
