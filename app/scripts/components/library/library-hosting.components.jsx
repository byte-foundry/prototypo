import React from 'react';
import pleaseWait from 'please-wait';

export default class LibraryHosting extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return <div className="library-hosting">I'm not ready yet!</div>;
	}
}
