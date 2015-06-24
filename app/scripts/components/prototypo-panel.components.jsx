import React from 'react';
import LocalClient from '../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

import PrototypoText from './prototypo-text.components.jsx';
import PrototypoCanvas from './prototypo-canvas.components.jsx';


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
			pos:prototypo.paper.Point(0,0),
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

	showContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			showContextMenu:true,
			contextMenuPos:{x:e.clientX,y:e.clientY},
		});
	}

	hideContextMenu() {
		if (this.state.showContextMenu) {
			this.setState({
				showContextMenu:false,
			});
		}
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] prototypopanel');
			//console.trace();
		}
		let view;
		let menu;
		view = [<PrototypoCanvas panel={this.state.panel} glyph={this.state.glyph} reset={this.resetView}/>];

		if (this.state.panel.mode.indexOf('text') != -1) {
			view.push(<PrototypoText fontName={this.props.fontName}/>);
			menu = [
				<ContextualMenuItem
					text="Toggle colors"
					click={() => { this.client.dispatchAction('/store-panel-param',{invertedView:!this.state.panel.invertedView}) }}/>,
				<ContextualMenuItem
					text="Inverted view"
					click={() => { this.client.dispatchAction('/store-panel-param',{invertedColors:!this.state.panel.invertedColors}) }}/>,
			]
		}
		else {
			if (this.state.panel.shadow) {
				view.push(<div className="shadow-of-the-colossus">{String.fromCharCode(this.state.glyph.selected)}</div>)
			}
			menu = [
				<ContextualMenuItem
					text={`${!fontInstance.showNodes ? 'Show' : 'Hide'} nodes`}
					click={() => { this.client.dispatchAction('/store-panel-param',{nodes:!this.state.panel.nodes}) }}/>,
				<ContextualMenuItem
					text={`${fontInstance.fill ? 'Show' : 'Hide'} outline`}
					click={() => { this.client.dispatchAction('/store-panel-param',{outline:!this.state.panel.outline}) }}/>,
				<ContextualMenuItem
					text={`${!fontInstance.showCoords ? 'Show' : 'Hide'} coords`}
					click={() => { this.client.dispatchAction('/store-panel-param',{coords:!this.state.panel.coords}) }}/>,
				<ContextualMenuItem
					text="Reset view"
					click={() => { this.resetView() }}/>,
				<ContextualMenuItem
					text={`${this.state.shadow ? 'Hide' : 'Show'} shadow`}
					click={() => { this.client.dispatchAction('/store-panel-param',{shadow:!this.state.panel.shadow}) }}/>,
			]
		}

		return (
			<div id="prototypopanel"
				onContextMenu={(e) => {this.showContextMenu(e)}}
				onClick={() => { this.hideContextMenu() }}
				onMouseLeave={() => {this.hideContextMenu()}}>
				{view}
				<ContextualMenu show={this.state.showContextMenu} pos={this.state.contextMenuPos}>
					{menu}
				</ContextualMenu>
			</div>
		)
	}
}


class ContextualMenu extends React.Component {
	render() {
		const menuStyle = {
			top:this.props.pos.y-15,
			left:this.props.pos.x-340,
		};

		return this.props.show ? (
			<div className="contextual-menu" style={menuStyle}>
				<ul className="contextual-menu-list">
					{this.props.children}
				</ul>
			</div>
		) : false;
	}
}

class ContextualMenuItem extends React.Component {
	render() {
		return (
			<li className="contextual-menu-list-item" onClick={this.props.click}>
				{this.props.text}
			</li>
		)
	}
}
