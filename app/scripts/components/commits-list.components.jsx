import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import ClassNames from 'classnames';
import moment from 'moment/min/moment-with-locales.min';

export default class CommitsList extends React.Component {
	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient.instance();

		var locale = window.navigator.userLanguage || window.navigator.language;
		moment.locale(locale)
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {

		const classes = ClassNames({
			// 'font-selector': true,
			// 'is-selected': this.props.selectedRepo === this.props.font.repo,
		});

		var results = this.props.content;

		return (
			<li className="news-feed-article">
				<h2 className="news-feed-article-title">
					<div>
						<a href={`${this.props.url}`} title="See the commit on Git Hub" target="_blank">
							{`${this.props.title}`}
						</a>
					</div>
				</h2>
				<p className="news-feed-article-date">
					{`${moment(this.props.date).format('L')}`}
				</p>
				<div className="news-feed-article-content">
					{results.map(function(result) {
						return <p key={result.id}>{result}</p>;
					})}
				</div>
			</li>
		)
	}
}
