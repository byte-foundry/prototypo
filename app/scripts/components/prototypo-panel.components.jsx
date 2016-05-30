import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import PrototypoText from './prototypo-text.components.jsx';
import PrototypoCanvas from './prototypo-canvas.components.jsx';
import PrototypoWord from './prototypo-word.components.jsx';
import CreateParamGroup from './create-param-group.components.jsx';
import EditParamGroup from './edit-param-group.components.jsx';


export default class PrototypoPanel extends React.Component {

	constructor(props) {
		super(props);

		this.state = {};

		this.availableMode = ['glyph', 'text', 'word'];
	}

	async componentWillMount() {

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/panel', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({panel: head.toJS()});
			})
			.onDelete(() => {
				this.setState({panel: undefined});
			});

		this.client.getStore('/glyphs', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({glyph: head.toJS()});
			})
			.onDelete(() => {
				this.setState({glyph: undefined});
			});

		this.client.getStore('/individualizeStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					createParamGroup: head.toJS().indivCreate,
					editingGroup: head.toJS().indivEdit,
					indivMode: head.toJS().indivMode,
				});
			})
			.onDelete(() => {
				this.setState({glyph: undefined});
			});
	}

	resetView({x, y}) {
		this.client.dispatchAction('/store-panel-param', {
			pos: new prototypo.paper.Point(x, y),
			zoom: 0.5 / window.devicePixelRatio,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleView(name) {
		const newViewMode = _.intersection(_.xor(this.state.panel.mode, [name]), this.availableMode);

		if (newViewMode.length > 0) {
			this.client.dispatchAction('/store-panel-param', {mode: newViewMode});
		}
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] prototypopanel');
		}

		if (!this.state.panel) {
			return false;
		}

		let textAndGlyph;
		let word;

		textAndGlyph = [<PrototypoCanvas
			key="canvas"
			panel={this.state.panel}
			glyph={this.state.glyph}
			reset={(pos) => { this.resetView(pos); }}
			close={(name) => { this.toggleView(name); }}/>];
		const hasGlyph = this.state.panel.mode.indexOf('glyph') !== -1;
		const hasText = this.state.panel.mode.indexOf('text') !== -1;

		if (hasText) {
			textAndGlyph.push(<PrototypoText
				key="text"
				fontName={this.props.fontName}
				panel={this.state.panel}
				close={(name) => { this.toggleView(name); }}
				field="text"/>);
		}
		else if (hasGlyph && this.state.panel.shadow) {
			textAndGlyph.push(<div className="shadow-of-the-colossus" key="shadow">{String.fromCharCode(this.state.glyph.selected)}</div>);
		}

		if (this.state.panel.mode.indexOf('word') !== -1) {
			word = <PrototypoWord
				fontName={this.props.fontName}
				panel={this.state.panel}
				close={(name) => { this.toggleView(name); }}
				field="word"/>;
		}

		const createParamGroup = this.state.createParamGroup && this.state.indivMode ? (
			<CreateParamGroup />
		) : false;

		const editParamGroup = this.state.editingGroup && this.state.indivMode ? (
			<EditParamGroup />
		) : false;

		let down;

		if (hasGlyph || hasText) {
			down = (
				<div id="prototypotextandglyph">
					{textAndGlyph}
				</div>
			);
		}

		let up;

		if (word) {
			up = (
				<div id="prototypoword">
					{word}
				</div>
			);
		}

		return (
			<div id="prototypopanel">
				{createParamGroup}
				{editParamGroup}
				{up}
				{down}
			</div>
		);
	}
}
