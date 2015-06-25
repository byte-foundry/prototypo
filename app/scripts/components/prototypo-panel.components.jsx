import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import PrototypoText from './prototypo-text.components.jsx';
import PrototypoCanvas from './prototypo-canvas.components.jsx';
import PrototypoWord from './prototypo-word.components.jsx';


export default class PrototypoPanel extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			contextMenuPos:{x:0,y:0},
			showContextMenu:false,
			glyph:{},
			panel: {
				mode:['text'],
			},
		};
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/panel',this.lifespan)
			.onUpdate(({head}) => {
				this.setState({panel:head.toJS()});
			})
			.onDelete(() => {
				this.setState({panel:undefined});
			});

		this.client.getStore('/glyphs',this.lifespan)
			.onUpdate(({head}) => {
				this.setState({glyph:head.toJS()});
			})
			.onDelete(() => {
				this.setState({glyph:undefined});
			});
	}

	resetView() {
		this.client.dispatchAction('/store-panel-param', {
			pos:new prototypo.paper.Point(0,0),
			zoom:0.5,
		})
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	changeMode(e, mode) {
		this.client.dispatchAction('/store-panel-param',{
			mode:mode
		});
		e.stopPropagation();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] prototypopanel');
			//console.trace();
		}

		let textAndGlyph;
		let word;

		textAndGlyph = [<PrototypoCanvas panel={this.state.panel} glyph={this.state.glyph} reset={() => { this.resetView() }}/>];
		const hasGlyph = this.state.panel.mode.indexOf('glyph') != -1;
		const hasText = this.state.panel.mode.indexOf('text') != -1;

		if (hasText) {
			textAndGlyph.push(<PrototypoText fontName={this.props.fontName} panel={this.state.panel} field="text"/>);
		}
		else if (hasGlyph && this.state.panel.shadow) {
			textAndGlyph.push(<div className="shadow-of-the-colossus">{String.fromCharCode(this.state.glyph.selected)}</div>)
		}

		if (this.state.panel.mode.indexOf('word') != -1) {
			word = <PrototypoWord fontName={this.props.fontName} panel={this.state.panel} field="word"/>;
		}

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
				{up}
				{down}
			</div>
		)
	}
}
