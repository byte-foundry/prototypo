
import React from 'react';
import pleaseWait from 'please-wait';

export default class LibraryCreate extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="library-create">
				I'm not ready yet!
			</div>
		);
	}
}
