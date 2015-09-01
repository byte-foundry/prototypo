import React from 'react';
import Classnames from 'classnames';

export default class WaitForLoad extends React.Component {
	render() {
		let content;
		if (this.props.loaded) {
			content = this.props.children;
		}
		else {
			const rectClass = Classnames({
				'sk-spinner': true,
				'sk-spinner-wave': true,
				'sk-secondary-color': this.props.secColor,
			});
			content = (
				<div className="wait-for-load">
					<div className={rectClass}>
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
