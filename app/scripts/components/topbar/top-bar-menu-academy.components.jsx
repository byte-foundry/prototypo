import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';

class TopBarMenuAcademy extends React.PureComponent {
	render() {
		const {icon, text, course, clearText, setText} = this.props;

		return (
			<div className="top-bar-menu-item-academy">
				<Link to={`/academy/course/${course.slug}`}>
					<img
						className="top-bar-menu-item-academy-img"
						src={icon}
						onMouseLeave={() => clearText()}
						onMouseEnter={() => setText(course.name, true)}
					/>
				</Link>
				{course.parts.map(part => (
					<Link
						key={part.name}
						to={`/academy/course/${course.slug}/${part.name}`}
					>
						<span
							onMouseEnter={() => setText(`${course.name} - ${part.name}`)}
							onMouseLeave={() => clearText()}
							className={`top-bar-menu-item-academy-part ${
								part.completed ? 'completed' : ''
							}`}
						/>
					</Link>
				))}
				<span className="top-bar-menu-item-academy-text">{text}</span>
			</div>
		);
	}
}

TopBarMenuAcademy.defaultProps = {
	text: '',
	clearText: () => {},
	setText: () => {},
};

TopBarMenuAcademy.propTypes = {
	icon: PropTypes.string.isRequired,
	text: PropTypes.string,
	course: PropTypes.shape({
		slug: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		parts: PropTypes.array.isRequired,
	}).isRequired,
	clearText: PropTypes.func,
	setText: PropTypes.func,
};

export default TopBarMenuAcademy;
