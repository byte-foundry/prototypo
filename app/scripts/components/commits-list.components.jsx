import React from 'react';
import Classnames from 'classnames';
import moment from 'moment/min/moment-with-locales';

export default class CommitsList extends React.Component {
	componentWillMount() {
		const locale = window.navigator.userLanguage || window.navigator.language;

		moment.locale(locale);
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] commits list');
		}

		const classes = Classnames({
			"news-feed-article-header-repo": true,
			"is-font": this.props.repo !== 'prototypo',
		});

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
		);
	}
}
