import React from 'react';
import {Commits} from '../services/commits.services.js';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import LocalServer from '../stores/local-server.stores.jsx';
import CommitsList from './commits-list.components.jsx';

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
			return <CommitsList title={commit.commit.message} date={commit.commit.author.date}/>
		});
		
		return (
			<div className="news-feed has-news">

				<h1 className="news-feed-title side-tab-h1">News feed and updates</h1>
				<ul>
					{displayCommits}
				</ul>

			</div>

		)
	}
}
