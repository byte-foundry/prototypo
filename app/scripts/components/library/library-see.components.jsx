import React from 'react';
import pleaseWait from 'please-wait';

export default class LibrarySee extends React.PureComponent {
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="library-see">
				I'm not ready yet!
			</div>
		);
	}
}
