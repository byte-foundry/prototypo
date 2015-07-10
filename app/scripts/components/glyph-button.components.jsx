import React from 'react';
import Remutable from 'remutable';
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

	selectTag(tag) {
		this.client.dispatchAction('/select-tag',tag);
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

		const tagClasses = ClassNames({
			"glyph-btn-list-btn":true,
			"glyph-btn-list-dropup":true,
			"is-active":this.state.tagList,
		});

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
				<div className={tagClasses}
					onMouseLeave={() => {
						this.setState({
							tagList:false,
						})
					}}
				>
					<ul className="glyph-btn-list-dropup-list">
						{_.map(this.props.tags, (tag) => {
							return (
								<li className="glyph-btn-list-dropup-list-item" onClick={() => {
									this.selectTag(tag);
									this.setState({
										tagList:false,
									});
								}}>
									<div className="glyph-btn-list-dropup-list-item-text">
										{tag}
									</div>
									<div className="glyph-btn-list-dropup-list-item-icon" onClick={(e) => { this.addToPinned(tag, e) }}>
									+
									</div>
								</li>
							)
						})}
					</ul>
					<label className="glyph-btn-list-btn-label" onClick={() => { this.setState({tagList:!this.state.tagList}) }}>
						{this.props.selected}
					</label>
				</div>
			</div>
		)
	}
}
