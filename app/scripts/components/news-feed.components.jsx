import React from 'react';
import {Commits} from '../services/commits.services.js';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import CommitsList from './commits-list.components.jsx';
import ReactGeminiScrollbar from 'react-gemini-scrollbar';

export default class NewsFeed extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// latestCommit: {},
			commits: []
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		const lastcommitsJSON = await Commits.getCommits('prototypo');
		const lastcommits = JSON.parse(lastcommitsJSON);

		console.log(lastcommits);

		this.setState({
			commits: lastcommits
		});

		// this.client.getStore('/commits', this.lifespan)
		// 	.onUpdate(() => {
		// 		this.setState({
		// 			commits: lastcommits
		// 		});
		// 	})
		// 	.onDelete(() => {
		// 		this.setState(undefined);
		// 	});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {

		const displayCommits = _.map(this.state.commits, (commit) => {

			var commitMessage = commit.commit.message.split(/(\r?\n|\r)/g),
				commitTitle = commitMessage[0],
				tmp = commitMessage.slice(1).filter(Boolean);

				// console.log(commitContent);

				var commitContent = [];

				for (var key in tmp) {
					if (tmp.hasOwnProperty(key)) {
						tmp[key].length > 1 ? commitContent.push(tmp[key]) : '';
					}
				}

			return <CommitsList title={commitTitle} content={commitContent} date={commit.commit.author.date} url={commit.html_url}/>
		});

		return (
			<div className="news-feed has-news">
				<h1 className="news-feed-title side-tab-h1">News feed and updates</h1>
				<ul className="news-feed-list">
					{displayCommits}
				</ul>
			</div>

		)
	}
}
