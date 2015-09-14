import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import ClassNames from 'classnames';
import Log from '../services/log.services.js';


export default class GlyphButton extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	toggleLockList() {
		this.client.dispatchAction('/toggle-lock-list', {});
		Log.ui('GlyphButton.toggleLockList');
	}

	selectTag(tag) {
		this.client.dispatchAction('/select-tag',tag);
	}

	addToPinned(tag,e) {
		e.stopPropagation();
		this.client.dispatchAction('/add-pinned',tag);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] glyph button');
		}

		let pinned = [];

		_.forEach(this.props.pinned, (tag) => {

			const tagClasses = ClassNames({
				'glyph-btn-list-btn-label': true,
				'glyph-btn-list-btn-tags': true,
				'is-active': this.props.selected === tag,
			});

			pinned.push(
				<div className="glyph-btn-list-btn clearfix"
					key={`button${tag}`}
					onClick={() => {
						this.selectTag(tag);
					}}>
					<label className={tagClasses}>
						{tag}
					</label>
					<div className="glyph-btn-list-btn-tag-wrapper">
						<div className="glyph-btn-list-btn-tag-wrapper-close"
							onClick={(e) => { this.addToPinned(tag,e) }}>
							×
						</div>
					</div>
				</div>
			);
		})

		const lockClasses = ClassNames({
			'glyph-btn-list-btn-lock':true,
			'is-locked': this.props.locked,
		});

		return (
			<div className="glyph-btn-list">
				<div className="glyph-btn-list-btn clearfix">
					<label className="glyph-btn-list-btn-label">
						Glyph list
					</label>
					<div className="glyph-btn-list-btn-wrapper" onClick={() => { this.toggleLockList() }}>
						<div className={lockClasses}>
						</div>
					</div>
				</div>
				{pinned}
			</div>
		)
	}
}
