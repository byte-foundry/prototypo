import _uniq from 'lodash/uniq';
import React from 'react';
import Lifespan from 'lifespan';
import {graphql, gql, compose} from 'react-apollo';

import FontMediator from '../prototypo.js/mediator/FontMediator';

import {rawToEscapedContent} from '../helpers/input-transform.helpers';

import LocalClient from '../stores/local-client.stores';

class FontUpdater extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.fontMediatorInstance = FontMediator.instance();
		this.fontMediatorInstance.setupInfo({
			email: this.props.email,
		});

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
					family: head.toJS().d.family,
					variant: head.toJS().d.variant,
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
					changingFont: head.toJS().d.changingFont,
					template: head.toJS().d.templateToLoad,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	componentDidUpdate() {
		if (
			this.state.template !== undefined
			&& this.state.name !== undefined
			&& this.state.uiText !== undefined
			&& this.state.uiWord !== undefined
			&& this.state.glyph !== undefined
			&& !this.state.changingFont
		) {
			const subsetString = this.state.uiText
				+ rawToEscapedContent(this.state.uiWord, this.state.glyphs);
			const subset = _uniq(subsetString.split('')).map(letter => letter.charCodeAt(0));

			this.fontMediatorInstance.getFont(
				this.state.name,
				this.state.template,
				{...this.state.values},
				subset,
				this.state.glyph,
			);
		}

		this.fontMediatorInstance.setupInfo({
			family: this.state.family,
			style: this.state.variant,
			template: this.state.template,
		});

		return false;
	}

	componentWillUnmount() {
		this.lifespan.release();
	}


	render() {
		return false;
	}
}

const userProfileQuery = gql`
	query getUserProfile {
		user {
			email
		}
	}
`;

export default compose(graphql(userProfileQuery, {
	props: ({data}) => {
		if (data.loading) {
			return {loading: true};
		}

		return data.user;
	},
}))(FontUpdater);
