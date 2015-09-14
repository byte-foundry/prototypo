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
			latestCommit: '',
			commits: []
		};
	}

	async componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		const repos = ['prototypo', 'john-fell.ptf', 'venus.ptf'];

		const lastcommitsJSON = await Promise.all(repos.map((repo) => {
			return Commits.getCommits(repo);
		}));

		this.setState({
			commits: lastcommitsJSON
				.reduce((a, b) => {
					return a.concat(JSON.parse(b));
				}, [])
				.sort((a, b) => {
					if (a.commit.author.date < b.commit.author.date) {
						return -1;
					}
					if (a.commit.author.date > b.commit.author.date) {
						return 1;
					}
					return 0;
				})
				.reverse()
		});

		this.setState({
			latestCommit: this.state.commits[0].sha
		});

	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] NewsFeed');
		}

		const displayCommits = _.map(this.state.commits, (commit) => {

			let commitRepo = commit.url.match(/(byte-foundry\/)(.*)(\/commits)/)[2];
			let commitMessage = commit.commit.message.split(/\x0A/);
			let commitTitle = commitMessage[0];
			let commitContent = commitMessage.slice(1).filter(Boolean);

			return <CommitsList repo={commitRepo} title={commitTitle} content={commitContent} date={commit.commit.author.date} url={commit.html_url}/>
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
