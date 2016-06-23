import React from 'react';
import Lifespan from 'lifespan';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import LocalClient from '../stores/local-client.stores.jsx';

import GlyphPanel from './glyph-panel.components.jsx';
import PrototypoPanel from './prototypo-panel.components.jsx';
import FontControls from './font-controls.components.jsx';
import LoadingOverlay from './shared/loading-overlay.components.jsx';
import IndivSidebar from './indivMode/indiv-sidebar.components.jsx';

export default class Workboard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		const prototypoStore = this.client.fetch('/prototypoStore');

		this.setState({
			fontName: prototypoStore.get('fontName'),
			glyphs: prototypoStore.get('fontGlyphs'),
		});

		this.client.getStore('/prototypoStore', this.lifespan)
			.onUpdate(({head}) => {
				this.setState({
					fontName: head.toJS().fontName,
					glyphs: head.toJS().fontGlyphs,
					fontLoading: head.toJS().uiFontLoading,
					indivMode: head.toJS().indivMode,
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
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] Workboard');
		}

		const loadingOverlay = this.state.fontLoading
			? <LoadingOverlay />
			: false;

		let sideBar = false;

		if (this.state.indivMode) {
			sideBar = <IndivSidebar />;
		}
		else {
			sideBar = <FontControls />;
		}

		return (
			<div id="workboard">
				<ReactCSSTransitionGroup transitionName="loading-overlay" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{loadingOverlay}
				</ReactCSSTransitionGroup>
				{sideBar}
				<PrototypoPanel fontName={this.state.fontName} glyphs={this.state.glyphs}/>
				<GlyphPanel />
			</div>
		);
	}
}
