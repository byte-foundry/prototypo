import React from 'react';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores';

export default class LibrarySearch extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillMount() {
		this.client = LocalClient.instance();
	}

	render() {
		return (
			<div className="library-search">
				<input
					type="text"
					placeholder="Search"
					value={this.state.search}
					onChange={(e) => {
						this.setState({
							search: e.target.value,
						});
						this.client.dispatchAction('/store-value', {
							librarySearchString: e.target.value,
						});
					}}
				/>
			</div>
		);
	}
}
