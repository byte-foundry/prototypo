import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import PropTypes from 'prop-types';
import React from 'react';
import {gql, graphql, compose} from 'react-apollo';
import {Link} from 'react-router';
import TutorialContent from 'tutorial-content';

class AcademyDashboard extends React.Component {
	constructor(props) {
		super(props);

		this.tutorials = new TutorialContent();

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
		const {academyProgress, academyCompleted, routeParams, route} = this.props;

		const titles = {
			home: 'Academy',
			course: 'academy',
		};

		this.tutorials.content.forEach((tutorial) => {
			titles[tutorial.slug] = tutorial.title;
		});

		const backlinks = {
			home: '/dashboard',
			course: '/academy',
		};

		const backlinkTitle = {
			home: 'App',
			course: 'Academy homepage',
		};
		const curRoute = routeParams.courseSlug || route.name;
		const title = titles.home;
		const backlink = backlinks[this.props.route.name];

		return (
			<div className="academy-dashboard">
				<Link to={backlinks.home}>
					<div className="academy-dashboard-icon" />
				</Link>
				<Link to={backlink} className="academy-dashboard-back">
					{backlinkTitle[this.props.route.name]}
				</Link>
				<div className="academy-header">
					<h1 className="academy-title">{title}</h1>
				</div>
				{this.props.route.name === 'home' ? (
					false
				) : (
					<h1 className="academy-dashboard-page-title">{titles[curRoute]}</h1>
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
	setCompletedAcademy: () => {},
	saveAcademyProgress: () => {},
};

AcademyDashboard.propTypes = {
	academyProgress: PropTypes.shape({
		lastCourse: PropTypes.string,
	}),
	academyCompleted: PropTypes.bool,
	routeParams: PropTypes.object.isRequired,
	route: PropTypes.object.isRequired,
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
)(AcademyDashboard);
