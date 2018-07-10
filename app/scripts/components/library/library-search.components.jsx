import React from 'react';
import PropTypes from 'prop-types';
import Lifespan from 'lifespan';

import LocalClient from '../../stores/local-client.stores';

export default class LibrarySearch extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
		this.onChange = this.onChange.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.client
			.getStore('/prototypoStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					search: head.toJS().d.librarySearchString,
				});
			})
			.onDelete(() => {
				this.setState(undefined);
			});
	}

	onChange(e) {
		this.setState({
			search: e.target.value,
		});
		this.client.dispatchAction('/store-value', {
			search: e.target.value,
		});
	}

	render() {
		return (
			<input type="text" placeholder="Search" value={this.state.search} onChange={this.onChange}/>
		);
	}
}
