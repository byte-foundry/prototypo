import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import ClassNames from 'classnames';

export default class GlyphTagList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
		}
	}

	render() {

		const classes = ClassNames({
			'glyph-tag-list': true,
			'is-active': this.state.show,
		});

		const pinned = _.map(this.props.pinned, (pin) => {
			return <GlyphPinnedTag tag={pin} selected={this.props.selected} key={`pin${pin}`}/>
		})

		return (
			<div className={classes} onClick={() => {
				this.setState({
					show:!this.state.show,
				})
			}}>
				<div className="glyph-tag-list-selected">
					Filter by {this.props.selected}
					<span className="glyph-tag-list-selected-icon"></span>
				</div>
				<ul className="glyph-tag-list-dropdown">
					{_.map(this.props.tags, (tag) => {
						return (
							<li
								key={tag}
								className="glyph-tag-list-dropdown-item">
								<GlyphTag
									tag={tag}
									selected={this.props.selected}
									pinned={this.props.pinned}/>
							</li>
						)
					})}
				</ul>
				{pinned}
			</div>
		)
	}
}

class GlyphPinnedTag extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectTag(tag,e) {
		e.stopPropagation();
		this.client.dispatchAction('/select-tag',tag);
	}

	removeFromPinned(tag,e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned',tag);
	}

	render() {

		const itemClasses = ClassNames({
			'glyph-tag': true,
			'is-active': this.props.selected === this.props.tag,
		});

		return (
			<div className={itemClasses} onClick={(e) => { this.selectTag(this.props.tag, e) }}>
				<div className="glyph-tag-name">
					{this.props.tag}
				</div>
				<div className="glyph-tag-button is-pinned" onClick={(e) => { this.removeFromPinned(this.props.tag,e) }}>
					<div className="glyph-tag-button-icon">
						&nbsp;
					</div>
				</div>
			</div>
		)
	}
}

class GlyphTag extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectTag(tag) {
		this.client.dispatchAction('/select-tag',tag);
	}

	addToPinned(tag,e) {
		e.stopPropagation();
		this.client.dispatchAction('/toggle-pinned',tag);
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
