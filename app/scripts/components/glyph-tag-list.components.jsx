import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import ClassNames from 'classnames';

export default class GlyphTagList extends React.Component {
	render() {

		return (
			<ul className="glyph-tag-list">
				{_.map(this.props.tags, (tag) => {
					return (
						<li
							key={tag}
							className="glyph-tag-list-item">
							<GlyphTag
								tag={tag}
								selected={this.props.selected}
								pinned={this.props.pinned}/>
						</li>
					)
				})}
			</ul>
		)
	}
}

class GlyphTag extends React.Component {
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

		const iconClasses = ClassNames({
			'glyph-tag-button': true,
			'is-pinned': this.props.pinned && this.props.pinned.indexOf(this.props.tag) != -1,
		});

		const itemClasses = ClassNames({
			'glyph-tag': true,
			'is-active': this.props.selected === this.props.tag,
		});

		return (
			<div className={itemClasses} onClick={() => { this.selectTag(this.props.tag) }}>
				<div className="glyph-tag-name">
					{this.props.tag}
				</div>
				<div className={iconClasses} onClick={(e) => { this.addToPinned(this.props.tag,e) }}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		)
	}
}
