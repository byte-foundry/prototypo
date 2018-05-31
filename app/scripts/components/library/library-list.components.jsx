import React from 'react';
import pleaseWait from 'please-wait';

export default class LibraryList extends React.PureComponent {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="library-list">
				I'm not ready yet! (List)
			</div>
		);
	}
}
