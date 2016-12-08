import React from 'react';

export default class FontInfos extends React.PureComponent {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] font infos');
		}

		return (
			<div className="font-infos">
				<h1 className="font-infos-title side-tab-h1">Font settings</h1>
			</div>
		);
	}
}
