import React from 'react';

export default class WaitForLoad extends React.Component {
	render() {
		let content;
		if (this.props.loaded) {
			content = this.props.children;
		}
		else {
			content = (
				<div className="wait-for-load">
					<div className="sk-spinner sk-spinner-wave">
						<div className="sk-rect1"></div>
						<div className="sk-rect2"></div>
						<div className="sk-rect3"></div>
						<div className="sk-rect4"></div>
						<div className="sk-rect5"></div>
					</div>
				</div>
			)
		}
		return (
			<div>
				{content}
			</div>
		)
	}
}
