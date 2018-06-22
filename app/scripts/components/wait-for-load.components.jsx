import React from 'react';
import classNames from 'classnames';

export default class WaitForLoad extends React.Component {
	render() {
		const {loading, loaded, children} = this.props;

		if (loading === true || loaded === false) {
			const rectClass = classNames({
				'sk-spinner': true,
				'sk-spinner-wave': true,
				'sk-secondary-color': this.props.secColor,
			});

			return (
				<div className="wait-for-load">
					<div className={rectClass}>
						<div className="sk-rect1" />
						<div className="sk-rect2" />
						<div className="sk-rect3" />
						<div className="sk-rect4" />
						<div className="sk-rect5" />
					</div>
				</div>
			);
		}

		return <div>{children}</div>;
	}
}
