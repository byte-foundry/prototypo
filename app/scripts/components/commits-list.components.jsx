import React from 'react';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import ClassNames from 'classnames';
import moment from 'moment/min/moment-with-locales';

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
			"news-feed-article-header-repo": true,
			"is-font": this.props.repo != 'prototypo',
		});

		var results = this.props.content;

		return (
			<li className="news-feed-article">
				<div className="news-feed-article-header">
					<span className={classes}>
						{`${this.props.repo}`}
					</span>
					<span className="news-feed-article-header-date">
						{`${moment(this.props.date).format('L')}`}
					</span>
				</div>
				<h2 className="news-feed-article-title">
					<div>
						<a href={`${this.props.url}`} title="See the commit on Git Hub" target="_blank">
							{`${this.props.title}`}
						</a>
					</div>
				</h2>
				<div className="news-feed-article-content">
					{this.props.content.map(function(line, i) {
						return <p key={ i }>{ line }</p>;
					})}
				</div>
			</li>
		)
	}
}
