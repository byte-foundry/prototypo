import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';
import ReactMarkdown from 'react-markdown';

class AcademyCourseCard extends React.PureComponent {
	render() {
		const {
			tutorial,
			reading,
			done,
			numberOfCompletedParts,
			className,
		} = this.props;
		const classes = classNames({
			currentlyreading: reading,
			done,
			className,
		});

		return (
			<div className={classes}>
				<Link to={`/academy/course/${tutorial.slug}`}>
					<div className="academy-course-list-elem-header">
						<img
							className="header-image"
							src={tutorial.headerImage}
							alt={`${tutorial.title} header`}
						/>{' '}
						<Link
							className={`academy-startcourse ${
								reading ? 'currentlyreading' : ''
							}`}
							to={`/academy/course/${tutorial.slug}`}
						>
							{reading ? 'Currently reading' : 'Start course'}
						</Link>{' '}
					</div>
					<div className="academy-course-list-elem-content">
						<h2>{tutorial.title}</h2>
						<ReactMarkdown source={tutorial.header} />
					</div>
					<div className="academy-course-list-elem-footer">
						{tutorial.partCount || done ? (
							<div className={`academy-part-count ${done ? 'done' : ''}`}>
								<div className="academy-part-count-progress-wrapper">
									<span
										className="academy-part-count-progress-wrapper-progress"
										style={{
											width: `${
												done
													? 100
													: numberOfCompletedParts / tutorial.partCount * 100
											}%`,
										}}
									/>
								</div>
								<span className="academy-part-count-text">
									{done
										? 'COMPLETE'
										: `${numberOfCompletedParts} of ${tutorial.partCount}`}
								</span>
							</div>
						) : (
							false
						)}
						<div className="academy-readingtime">
							<img src="assets/images/icon-clock.svg" alt="readingTime icon" />{' '}
							<span>{tutorial.readingTime} min</span>
						</div>
						<div className="academy-coursetype">
							<img
								src={`assets/images/academy/icon-course-${
									tutorial.isVideo ? 'video' : 'text'
								}.svg`}
								alt="courseType icon"
							/>
						</div>
					</div>
				</Link>
			</div>
		);
	}
}

AcademyCourseCard.defaultProps = {
	reading: false,
	done: false,
	numberOfCompletedParts: 0,
};

AcademyCourseCard.propTypes = {
	tutorial: PropTypes.shape({
		slug: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		header: PropTypes.string.isRequired,
		headerImage: PropTypes.string.isRequired,
		readingTime: PropTypes.number.isRequired,
		partCount: PropTypes.number.isRequired,
		isVideo: PropTypes.bool,
	}),
	reading: PropTypes.bool,
	done: PropTypes.bool,
	numberOfCompletedParts: PropTypes.number,
};

export default AcademyCourseCard;
