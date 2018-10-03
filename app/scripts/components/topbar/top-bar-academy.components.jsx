import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

import TopBarAcademyCourseDetails from './top-bar-academy-course-details.components';

class TopBarAcademy extends React.PureComponent {
	state = {
		text: '',
		iconHovered: false,
	};

	setText = (text) => {
		if (typeof text === 'string') {
			this.setState({text, iconHovered: false});
			return;
		}

		const {academyProgress: progress} = this.props;
		const course = progress.lastCourse && progress[progress.lastCourse];

		if (course) {
			this.setState({text: course.name || course, iconHovered: true});
			return;
		}

		this.setState({iconHovered: true});
	};

	clearText = () => {
		this.setState({text: '', iconHovered: false});
	};

	render() {
		const {academyProgress: progress, indiv} = this.props;
		const {iconHovered, text} = this.state;

		const color = indiv ? 'yellow' : 'green';
		const rightAcademyIcon = `assets/images/${
			iconHovered ? `graduate-cap-${color}.svg` : 'graduate-cap.svg'
		}`;

		const course = progress.lastCourse && progress[progress.lastCourse];
		const hasSelectedCourse = !!course;

		const route = hasSelectedCourse
			? `/academy/course/${course.slug}`
			: '/academy';

		const className = `top-bar-menu-item-academy-img ${
			hasSelectedCourse ? '' : 'is-alone'
		}`;

		return (
			<div className="top-bar-menu-item-academy">
				<Link to={route}>
					<img
						className={className}
						src={rightAcademyIcon}
						onMouseLeave={this.clearText}
						onMouseEnter={this.setText}
					/>
				</Link>
				{hasSelectedCourse && (
					<TopBarAcademyCourseDetails
						course={course}
						setText={this.setText}
						clearText={this.clearText}
					/>
				)}
				<span className="top-bar-menu-item-academy-text">{text}</span>
			</div>
		);
	}
}

TopBarAcademy.defaultProps = {
	academyProgress: {
		lastCourse: null,
	},
};

TopBarAcademy.propTypes = {
	academyProgress: PropTypes.shape({
		lastCourse: PropTypes.string,
	}),
};

TopBarAcademy.fragments = {
	user: gql`
		fragment AcademyUserValues on User {
			academyProgress
		}
	`,
};

export default TopBarAcademy;
