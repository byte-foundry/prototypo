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

		this.setState({
			commits: JSON.parse(lastcommitsJSON)
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

	componentDidMount() {
		
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {

		const displayCommits = _.map(this.state.commits, (commit) => {

			let commitMessage = commit.commit.message.split(/\x0A/);
			let commitTitle = commitMessage[0];
			let commitContent = commitMessage.slice(1).filter(Boolean);

			return <CommitsList title={commitTitle} content={commitContent} date={commit.commit.author.date} url={commit.html_url}/>
		});

		return (

			<div className="news-feed has-news">
				<h1 className="news-feed-title side-tab-h1">News feed and updates</h1>

				<ReactGeminiScrollbar autoshow={true}>

				<ul className="news-feed-list">
					<div className="news-feed-header">
						<p>
							Here are listed the last modifications in Prototypo.
						</p>
					</div>
					{displayCommits}
				</ul>
				</ReactGeminiScrollbar>
			</div>
		)
	}
}
