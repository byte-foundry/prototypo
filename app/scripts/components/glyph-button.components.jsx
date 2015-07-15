import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import ClassNames from 'classnames';

export default class GlyphButton extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
		this.setState({
			tagList:false,
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	addToPinned(tag,e) {
		e.stopPropagation();
		this.client.dispatchAction('/add-pinned',tag);
	}

	render() {
		let pinned = [];

		_.forEach(this.props.pinned, (tag) => {
			pinned.push(
				<div className="glyph-btn-list-btn clearfix"
					onClick={() => {
						this.selectTag(tag);
						this.setState({
							tagList:false,
						});
					}}>
					<label className="glyph-btn-list-btn-label">
						{tag}
					</label>
					<div className="glyph-btn-list-btn-wrapper">
						<div className="glyph-btn-list-btn-close">
						</div>
					</div>
				</div>
			);
		})

		return (
			<div className="glyph-btn-list">
				<div className="glyph-btn-list-btn clearfix">
					<label className="glyph-btn-list-btn-label">
						Glyph list
					</label>
					<div className="glyph-btn-list-btn-wrapper">
						<div className="glyph-btn-list-btn-lock">
						</div>
					</div>
				</div>
				{pinned}
			</div>
		)
	}
}
