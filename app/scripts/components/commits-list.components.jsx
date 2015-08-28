import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import ClassNames from 'classnames';

export default class CommitsList extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {

		const classes = ClassNames({
			// 'font-selector': true,
			// 'is-selected': this.props.selectedRepo === this.props.font.repo,
		});

		return (
			<li className="news-feed-article">
				<h2>
					<div>{`${this.props.title}`}</div>
				</h2>
				<p className="news-feed-date">
					{`${this.props.date}`}
				</p>
			</li>
		)
	}
}
