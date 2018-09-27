import React from 'react';
import pleaseWait from 'please-wait';

export default class LibraryReview extends React.Component {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return <div className="library-review">I'm not ready yet!</div>;
	}
}
