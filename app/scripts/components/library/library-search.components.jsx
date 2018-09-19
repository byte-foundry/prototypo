import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores';

export default class LibrarySearch extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	async componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.client.getStore('/prototypoStore', this.lifespan).onUpdate((head) => {
			this.setState({
				search: head.toJS().d.librarySearchString,
			});
		});
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (
			<div className="library-search">
				<input
					type="text"
					placeholder="Search"
					value={this.state.search}
					onChange={(e) => {
						this.client.dispatchAction('/store-value', {
							librarySearchString: e.target.value,
						});
					}}
				/>
			</div>
		);
	}
}
