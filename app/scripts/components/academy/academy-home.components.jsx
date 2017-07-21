import React from 'react';
import {Link} from 'react-router';
import ReactMarkdown from 'react-markdown';
import TutorialContent from 'tutorial-content';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import InlineSVG from 'svg-inline-react';
import ReactMotionFlip from 'react-motion-flip';

export default class AcademyHome extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			academyProgress: {},
			tags: [],
			activeTag: 'all',
			courses: [],
		};
		this.tutorials = new TutorialContent();
		this.getPartsDone = this.getPartsDone.bind(this);
		this.isReading = this.isReading.bind(this);
		this.setActiveTag = this.setActiveTag.bind(this);
		this.areAllCourseRead = this.areAllCourseRead.bind(this);
	}
	componentWillMount() {
		let academyProgress = this.state.academyProgress || {};
		const tags = [];
		const courses = this.state.courses;

		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.client.getStore('/userStore', this.lifespan).onUpdate((head) => {
			academyProgress = head.toJS().d.infos.academyProgress || {};
			this.setState({
				academyProgress: head.toJS().d.infos.academyProgress || {},
			});
		});
		// Map through the course to :
		// Get title, header and slug
		// Get part count from progress or init the progress
		this.tutorials.content.forEach((tutorial) => {
			let parts = [];

			tutorial.tags.map((tag) => {
				if (tags.indexOf(tag) === -1) {
					tags.push(tag);
				}
			});
			if (academyProgress[tutorial.slug]) {
				parts = academyProgress[tutorial.slug].parts;
			}
			else {
				tutorial.content.split(/[^\#]#{2} +/g).forEach((value, index) => {
					if (index !== 0) {
						parts.push({
							name: value.split(/\r\n|\r|\n/g)[0],
							completed: false,
						});
					}
				});
				this.client.dispatchAction('/create-course-progress', {
					slug: tutorial.slug,
					name: tutorial.title,
					parts,
				});
				academyProgress[tutorial.slug] = {
					parts,
					name: tutorial.title,
					rewarded: false,
				};
			}
			const compare = function compare(a, b) {
				const dateA = new Date(a.date).getTime();
			    const dateB = new Date(b.date).getTime();

			    return dateA > dateB ? 1 : -1;
			};

			courses.push({
				title: tutorial.title,
				header: tutorial.header,
				slug: tutorial.slug,
				partCount: parts.length,
				readingTime: tutorial.readingTime,
				headerImage: tutorial.headerImage,
				reward: tutorial.reward,
				isVideo: tutorial.isVideo,
				date: tutorial.date,
				tags: tutorial.tags,
			});

			courses.sort(compare);
		});
		this.baseCourses = courses;
		this.setState({academyProgress, tags, courses});
		const icons = document.getElementsByClassName('academy-dashboard-icon');

		if (icons.length > 0) {
			icons[0].classList.remove('fixed');
			icons[0].style.left = 'inherit';
		}

		window.Intercom('trackEvent', 'openedAcademyHome');
	}
	getPartsDone(slug) {
		const partsDone = this.state.academyProgress[slug].parts
		.filter(part => part.completed === true);

		return partsDone ? partsDone.length : 0;
	}
	setActiveTag(tag) {
		if (tag === 'all') {
			return this.setState({activeTag: tag, courses: this.baseCourses});
		}
		const filteredCourses = this.baseCourses.filter(course => course.tags.indexOf(tag) >= 0);

		return this.setState({activeTag: tag, courses: filteredCourses});
	}
	isReading(slug) {
		return this.state.academyProgress.lastCourse === slug;
	}
	areAllCourseRead() {
		let isAllRead = true;
		Object.keys(this.state.academyProgress).forEach((key) => {
			if (!this.state.academyProgress[key].completed && key !== 'lastCourse' && key !== 'areAllCourseRead') {
				isAllRead = false;
			}
		});
		if (isAllRead && !this.state.academyProgress.areAllCourseRead) {
			this.client.dispatchAction('/set-all-course-read');
		}
		return isAllRead;
	}
	render() {
		let partsDone = false;

		// const tutorialReward = tutorial.reward
		// ? (<div className="academy-reward">
		// 	<span className="text-italic">By completing this course you {partsDone
		// === tutorial.partCount ? 'earned' : 'will earn'}:</span>
		// 	<ul>
		// 		<li>{tutorial.reward}</li>
		// 	</ul>
		// </div>) : false;
		return (
			<div className="academy-base academy-home">
				<div className="academy-home-header">
					<InlineSVG
						className="academy-home-header-icon-postit"
						element="div"
						src={require('!svg-inline-loader?classPrefix=postit-!../../../images/academy/postit.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-iphone"
						element="div"
						src={require('!svg-inline-loader?classPrefix=iphone-!../../../images/academy/iphone.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-redbook"
						element="div"
						src={require('!svg-inline-loader?classPrefix=redbook-!../../../images/academy/redbook.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-macbook"
						element="div"
						src={require('!svg-inline-loader?classPrefix=macbook-!../../../images/academy/macbook.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-pen"
						element="div"
						src={require('!svg-inline-loader?classPrefix=pen-!../../../images/academy/pen.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-coffee"
						element="div"
						src={require('!svg-inline-loader?classPrefix=coffee-!../../../images/academy/coffee.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-ruler"
						element="div"
						src={require('!svg-inline-loader?classPrefix=ruler-!../../../images/academy/ruler.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-bluebook"
						element="div"
						src={require('!svg-inline-loader?classPrefix=bluebook-!../../../images/academy/bluebook.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-paper"
						element="div"
						src={require('!svg-inline-loader?classPrefix=paper-!../../../images/academy/paper.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-loupe"
						element="div"
						src={require('!svg-inline-loader?classPrefix=loupe-!../../../images/academy/loupe.svg')}
					/>
					<InlineSVG
						className="academy-home-header-icon-blackpen"
						element="div"
						src={require('!svg-inline-loader?classPrefix=blackpen-!../../../images/academy/blackpen.svg')}
					/>
					{this.areAllCourseRead()
						? <InlineSVG
							className="academy-home-header-icon-medal"
							element="div"
							src={require('!svg-inline-loader?classPrefix=medal-!../../../images/academy/medal-home.svg')}
						/>
						: false}
				</div>
				<div className="academy-home-tags">
					<div
						key={'tag-all'}
						onClick={() => {
							this.setActiveTag('all');
						}}
						className={`academy-home-tags-tag ${this.state.activeTag === 'all' ? 'active' : ''}`}
					>
						All courses
					</div>
					{this.state.tags.map(tag => (
						<div
							key={`tag-${tag}`}
							className={`academy-home-tags-tag ${this.state.activeTag === tag ? 'active' : ''}`}
							onClick={() => {
								this.setActiveTag(tag);
							}}
						>
							{tag}
						</div>
						))}
				</div>
				<ReactMotionFlip
					className="academy-course-list"
					childClassName="academy-course-list-elem"
					springConfig={{stiffness: 220, damping: 30}}
				>
					{this.state.courses.map((tutorial) => {
						partsDone = this.getPartsDone(tutorial.slug);
						return (
							<div
								key={tutorial.title}
								className={`${this.isReading(tutorial.slug) ? 'currentlyreading' : ''} ${partsDone === tutorial.partCount ? 'done' : ''}`}
							>
								<Link to={`/academy/course/${tutorial.slug}`}>
									<div className="academy-course-list-elem-header">
										<img
											className="header-image"
											src={tutorial.headerImage}
											alt={`${tutorial.title} header`}
										/>
										<Link
											className={`academy-startcourse ${this.isReading(tutorial.slug) ? 'currentlyreading' : ''}`}
											to={`/academy/course/${tutorial.slug}`}
										>
											{' '}
											{this.isReading(tutorial.slug) ? 'Currently reading' : 'Start course'}
											{' '}
										</Link>
									</div>
									<div className="academy-course-list-elem-content">
										<h2>{tutorial.title}</h2>
										<ReactMarkdown source={tutorial.header} />
									</div>
									<div className="academy-course-list-elem-footer">
										{tutorial.partCount || (this.state.academyProgress[tutorial.slug] && this.state.academyProgress[tutorial.slug].completed)
											? <div
												className={`academy-part-count ${partsDone === tutorial.partCount ? 'done' : ''}`}
											>
												<div className="academy-part-count-progress-wrapper">
													<span
														className="academy-part-count-progress-wrapper-progress"
														style={{
															width: `${this.state.academyProgress[tutorial.slug].completed ? 100 : partsDone / tutorial.partCount * 100}%`,
														}}
													/>
												</div>
												<span className="academy-part-count-text">
													{this.state.academyProgress[tutorial.slug] && this.state.academyProgress[tutorial.slug].completed
															? 'COMPLETE'
															: `${partsDone} of ${tutorial.partCount}`}
												</span>
											</div>
											: false}
										<div className="academy-readingtime">
											<img src="assets/images/icon-clock.svg" alt="readingTime icon" />
											{' '}
											<span>{tutorial.readingTime} min</span>
										</div>
										<div className="academy-coursetype">
											<img
												src={`assets/images/academy/icon-course-${tutorial.isVideo ? 'video' : 'text'}.svg`}
												alt="courseType icon"
											/>
										</div>
									</div>
								</Link>
							</div>
						);
					})}
				</ReactMotionFlip>
			</div>
		);
	}
}
