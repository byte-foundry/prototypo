import PropTypes from 'prop-types';
import React from 'react';
import {gql, graphql, compose} from 'react-apollo';
import {Link, withRouter} from 'react-router-dom';

class AcademyDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.setCourseCurrentlyReading = this.setCourseCurrentlyReading.bind(this);
		this.saveCourseProgress = this.saveCourseProgress.bind(this);
	}

	setCourseCurrentlyReading(course) {
		this.props.saveAcademyProgress({
			...this.props.academyProgress,
			lastCourse: course,
		});
	}

	async saveCourseProgress(courseProgress) {
		const progress = courseProgress;
		let {lastCourse} = this.props.academyProgress;

		if (
			courseProgress.parts.every(p => p.completed)
			&& !courseProgress.completed
		) {
			lastCourse = null;
			progress.completed = true;
			window.Intercom('trackEvent', 'finished-academy-course', {
				name: progress.name,
			});
		}

		// When the user isn't registered, we redirect him to signin
		if (!this.props.userId) {
			// no redirect for no parts courses
			if (courseProgress.parts.length === 0) {
				return;
			}

			const query = new URLSearchParams(this.props.location.search);

			query.set('prevHash', this.props.location.pathname);

			this.props.history.push({
				pathname: '/signin',
				search: query.toString(),
			});
			return;
		}

		await this.props.saveAcademyProgress({
			...this.props.academyProgress,
			[progress.slug]: progress,
			lastCourse,
		});

		this.checkAllCourseRead();
	}

	checkAllCourseRead() {
		const {academyCompleted, academyProgress} = this.props;
		const allCoursesProgress = Object.values(academyProgress).filter(
			p => typeof p === 'object',
		);

		if (
			!academyCompleted
			&& allCoursesProgress.every(c => c && c.completed)
		) {
			window.Intercom('trackEvent', 'finishedAllCourses');
			this.props.setCompletedAcademy();
		}
	}

	render() {
		const {academyProgress, academyCompleted, isHomepage, title} = this.props;

		return (
			<div className="academy-dashboard">
				<Link to="/dashboard">
					<div className="academy-dashboard-icon" />
				</Link>
				<Link
					to={isHomepage ? '/dashboard' : '/academy'}
					className="academy-dashboard-back"
				>
					{isHomepage ? 'App' : 'Academy Homepage'}
				</Link>
				<div className="academy-header">
					<h1 className="academy-title">Academy</h1>
				</div>
				{!isHomepage && (
					<h1 className="academy-dashboard-page-title">{title}</h1>
				)}
				<div className="academy-dashboard-container">
					{React.cloneElement(this.props.children, {
						setCourseCurrentlyReading: this.setCourseCurrentlyReading,
						saveCourseProgress: this.saveCourseProgress,
						academyProgress,
						academyCompleted,
					})}
				</div>
			</div>
		);
	}
}

AcademyDashboard.defaultProps = {
	academyProgress: {},
	academyCompleted: false,
	isHomepage: false,
	title: '',
	setCompletedAcademy: () => {},
	saveAcademyProgress: () => {},
};

AcademyDashboard.propTypes = {
	academyProgress: PropTypes.shape({
		lastCourse: PropTypes.string,
	}),
	academyCompleted: PropTypes.bool,
	isHomepage: PropTypes.bool,
	title: PropTypes.string,
	setCompletedAcademy: PropTypes.func,
	saveAcademyProgress: PropTypes.func,
};

const getAcademyValuesQuery = gql`
	query getAcademyValues {
		user {
			id
			academyProgress
			academyCompleted
		}
	}
`;

const setAcademyCompletedMutation = gql`
	mutation setAcademyCompleted($userId: ID!) {
		updateUser(id: $userId, academyCompleted: true) {
			id
			academyCompleted
		}
	}
`;

const saveAcademyProgressMutation = gql`
	mutation saveAcademyProgress($userId: ID!, $values: Json!) {
		updateUser(id: $userId, academyProgress: $values) {
			id
			academyProgress
			academyCompleted
		}
	}
`;

export default compose(
	graphql(getAcademyValuesQuery, {
		props({data}) {
			if (data.loading) {
				return {loading: true};
			}

			if (!data.user) {
				return {};
			}

			return {
				userId: data.user.id,
				academyProgress: data.user.academyProgress,
				academyCompleted: data.user.academyCompleted,
			};
		},
	}),
	graphql(setAcademyCompletedMutation, {
		options: ({userId}) => ({
			skip: !userId,
		}),
		props: ({mutate, ownProps}) => ({
			setCompletedAcademy: () => mutate({variables: {userId: ownProps.userId}}),
		}),
	}),
	graphql(saveAcademyProgressMutation, {
		options: ({userId}) => ({
			skip: !userId,
		}),
		props: ({mutate, ownProps}) => ({
			saveAcademyProgress: values =>
				mutate({variables: {userId: ownProps.userId, values}}),
		}),
	}),
)(withRouter(AcademyDashboard));
