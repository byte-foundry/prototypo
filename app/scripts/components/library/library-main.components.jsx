import React from 'react';
import pleaseWait from 'please-wait';

import {LibrarySidebarLeft, LibrarySidebarRight} from './library-sidebars.components';

export default class LibraryMain extends React.PureComponent {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="library-main">
				<LibrarySidebarLeft/>
				{this.props.children}
				<LibrarySidebarRight/>
			</div>
		);
	}
}
