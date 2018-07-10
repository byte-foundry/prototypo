import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

class TopBarAcademyCourseDetails extends React.PureComponent {
	render() {
		const {course, clearText, setText} = this.props;

		return course.parts.map(part => (
			<Link key={part.name} to={`/academy/course/${course.slug}/${part.name}`}>
				<span
					onMouseEnter={() => setText(`${course.name} - ${part.name}`)}
					onMouseLeave={clearText}
					className={`top-bar-menu-item-academy-part ${
						part.completed ? 'completed' : ''
					}`}
				/>
			</Link>
		));
	}
}

TopBarAcademyCourseDetails.defaultProps = {
	clearText: () => {},
	setText: () => {},
};

TopBarAcademyCourseDetails.propTypes = {
	course: PropTypes.shape({
		slug: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		parts: PropTypes.array.isRequired,
	}).isRequired,
	clearText: PropTypes.func,
	setText: PropTypes.func,
};

export default TopBarAcademyCourseDetails;
