import React from 'react';
import pleaseWait from 'please-wait';

export class LibrarySidebarLeft extends React.PureComponent {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="library-sidebar-left">
				SidebarLeft
			</div>
		);
	}
}

export class LibrarySidebarRight extends React.PureComponent {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="library-sidebar-right">
				SidebarRight
			</div>
		);
	}
}
