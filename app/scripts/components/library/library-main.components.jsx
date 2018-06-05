import React from 'react';
import pleaseWait from 'please-wait';

import {LibrarySidebarLeft, LibrarySidebarRight} from './library-sidebars.components';

export default class LibraryMain extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			activeFilters: {},
		}
		this.setActiveFilters = this.setActiveFilters.bind(this);
	}
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	setActiveFilters(filters) {
		this.setState({activeFilters: filters});
	}

	render() {
		return (
			<div className="library-main">
				<LibrarySidebarLeft/>
				{React.cloneElement(this.props.children, { libraryFilters: this.state.activeFilters })}
				<LibrarySidebarRight setActiveFilters={this.setActiveFilters}/>
			</div>
		);
	}
}
