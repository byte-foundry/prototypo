import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';

export default class GlyphTagList extends React.Component {
	render() {

		return (
			<ul className="glyph-tag-list">
				{_.map(this.props.tags, (tag) => {
					return (
						<li className="glyph-tag-list-item">
							<GlyphTag tag={tag}/>
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

	render() {
		<div className="glyph-tag" onClick={() => { this.seleteTag() }}>
			<div className="glyph-tag-name">
				{this.props.tag}
				</div>
			<div className="glyph-tag-button">
				+
			</div>
		</div>
	}
}
