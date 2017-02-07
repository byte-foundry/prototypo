import React from 'react';
import {Link} from 'react-router';
import TutorialContent from 'tutorial-content';
import ReactMarkdown from 'react-markdown';
import {findDOMNode} from 'react-dom';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

export default class AcademyCourse extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
		this.courseSlug = this.props.params.courseSlug;
		this.tutorials = new TutorialContent();
		this.headerRenderer = this.headerRenderer.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.bindData = this.bindData.bind(this);
		this.isPartRead = this.isPartRead.bind(this);
		this.areAllPartsRead = this.areAllPartsRead.bind(this);
		this.createCourseProgress = this.createCourseProgress.bind(this);
		this.getNextCourse = this.getNextCourse.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();

		this.client.getStore('/userStore', this.lifespan)
			.onUpdate((head) => {
				this.setState({
					academyProgress: head.toJS().d.infos.academyProgress || {},
				});
			});
	}

	componentDidMount() {
		this.bindData();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.params.courseSlug !== this.props.params.courseSlug) {
			window.removeEventListener('scroll', this.handleScroll.bind(this), true);
			this.courseSlug = this.props.params.courseSlug;
			this.bindData();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll.bind(this), true);
		this.lifespan.release();
	}

	getCoreProps(props) {
		return {
			'key': props.nodeKey,
			'data-sourcepos': props['data-sourcepos'],
		};
	}

	reduceChildren(children, child) {
		const lastIndex = children.length - 1;

		if (typeof child === 'string' && typeof children[lastIndex] === 'string') {
			children[lastIndex] += child;
		}
		else {
			children.push(child);
		}
		return children;
	}

	createElement(tagName, props, children) {
		const nodeChildren = Array.isArray(children) && children.reduce(this.reduceChildren, []);
		const args = [tagName, props].concat(nodeChildren || children);

		return React.createElement(...args);
	}

	bindData() {
		findDOMNode(this).scrollIntoView();
		const course = this.tutorials.content.find((tutorial) => {
			return tutorial.slug === this.courseSlug;
		});
		const parts = course.content.split("## ");
		const headers = [];
		let basics = {};

		basics = {
			elem: findDOMNode(this.refs.academyCourseBasics),
			content: findDOMNode(this.refs.academyCourseContent),
			offset: findDOMNode(this.refs.academyCourseBasics).getBoundingClientRect().top,
		};

		parts.map((part, index) => {
			if (index !== 0) {
				headers.push({
					elem: findDOMNode(this.refs[`part${index + 1}`]).querySelector('.title'),
					offset: findDOMNode(this.refs[`part${index + 1}`]).querySelector('.title').getBoundingClientRect().top,
					content: findDOMNode(this.refs[`part${index + 1}`]).querySelector('.title').textContent,
				});
			}
		});
		this.setState({...this.state, headers, basics});

		if (!this.state.academyProgress || !(this.state.academyProgress[this.courseSlug])) {
			this.createCourseProgress();
		}
		window.addEventListener('scroll', this.handleScroll.bind(this), true);
	}

	handleScroll(event) {
		this.state.headers.map((header) => {
			event.target.scrollTop - 200 >= header.offset ? header.elem.classList.add('fixed')
                              : header.elem.classList.remove('fixed');
		});
		if (event.target.scrollTop - 200 >= this.state.basics.offset) {
			this.state.basics.elem.style.left = `${this.refs.academyCourseContent.getBoundingClientRect().right}px`;
			this.state.basics.elem.classList.add('fixed');
			this.state.basics.content.style.marginRight = '200px';
		}
		else {
			this.state.basics.elem.classList.remove('fixed');
			this.state.basics.content.style.marginRight = 'inherit';
		}
	}

	headerRenderer(props) {
		if (props.level === 2) {
			const levelTwoProps = {
				'key': props.nodeKey,
				'data-sourcepos': props['data-sourcepos'],
			};

			return(
					<div className="title" {...levelTwoProps}>
						<input type="checkbox"
							id={`${this.courseSlug}-${props.children}`}
							name={`${this.courseSlug}-${props.children}`}
							checked={this.isPartRead(props.children)}
							key={`${this.courseSlug}-${props.children}`}
							onChange={() => {this.markAsRead(props.children);}}
							/>
						<label htmlFor={`${this.courseSlug}-${props.children}`}><span></span>{props.children}</label>
					</div>
			);
		}
		else {
			return(
				this.createElement(`h${props.level}`, this.getCoreProps(props), props.children)
			);
		}
	}

	createCourseProgress() {
		const academyProgress = this.state.academyProgress || {};

		this.tutorials.content.map((tutorial) => {
			const parts = [];

			tutorial.content.split("## ").map((value, index) => {
				if (index !== 0) {
					parts.push({
						name: value.split(/\r\n|\r|\n/g)[0],
						completed: false,
					});
				}
			});
			this.client.dispatchAction(
				'/create-course-progress',
				{
					slug: tutorial.slug,
					name: tutorial.title,
					parts,
				}
			);
			academyProgress[tutorial.slug] = {
				parts,
				rewarded: false,
				name: tutorial.title,
			};
		});
		this.setState({academyProgress});
	}

	markAsRead(part) {
		if (!this.isPartRead(part)) {
			this.client.dispatchAction('/mark-part-as-read', {course: this.courseSlug, part: part[0]});
		}
	}

	isPartRead(part) {
		let coursePart = {};

		if (this.state.academyProgress
		&& this.state.academyProgress[this.courseSlug]) {
			coursePart = this.state.academyProgress[this.courseSlug].parts.find((elem) => {
				return elem.name === part[0];
			});
		}
		return coursePart.completed;
	}

	areAllPartsRead() {
		if (!this.state.academyProgress) {
			return false;
		}

		const partsDone = this.state.academyProgress[this.courseSlug].parts.find((part) => {
			return part.completed === true;
		}) || 0;

		return (
			partsDone === this.state.academyProgress[this.courseSlug].parts.length
		);
	}

	getNextCourse() {
		return this.tutorials.content[this.tutorials.content.findIndex((tutorial) => {
			return tutorial.slug === this.courseSlug;
		}) + 1];
	}

	render() {
		const renderers = {
			Heading: this.headerRenderer,
		};
		const course = this.tutorials.content.find((tutorial) => {
			return tutorial.slug === this.courseSlug;
		});
		const parts = course.content.split("## ");

		parts.map((part, index) => {
			if (index !== 0) {
				parts[index] = `## ${part}`;
			}
		});

		const basics = course.basics.length > 0 ? (
			<div>
				<h3>Basics</h3>
				{course.basics.map((basic) => {
					return (
						<Link className="academy-sidebar-menu-item" to={`/academy/course/${basic.slug}`} > {basic.title} </Link>
					);
				})}
			</div>
		) : null;

		return(
			<div key={this.courseName} className="academy-base academy-course" ref="academyCoursePage">
				<div className="academy-course-courselist">
					<h3>Course List</h3>
					{
						this.tutorials.content.map((tutorial) => {
							return (
								<Link className={`academy-sidebar-menu-item ${tutorial.slug === this.courseSlug ? 'is-active' : ''}`}
									to={`/academy/course/${tutorial.slug}`} > {tutorial.title} </Link>
							);
						})
					}
				</div>
				<div className="academy-course-main">
					<div className="academy-course-main-content" ref="academyCourseContent">
						{parts.map((part, index) => {
							return (
									<ReactMarkdown source={part} renderers={renderers} ref={`part${index + 1}`}/>
							);
						})}
						{
							this.areAllPartsRead() && this.getNextCourse()
							? (
								<div>Good Job, you ve read everything here!
								<br/>
								The next course is : {this.getNextCourse().title}.
								<div className="academy-button academy-validation-button"><Link to={`/academy/course/${this.getNextCourse().slug}`} > Check it out ! </Link></div>
								</div>
							)
							: false
						}
						{
							this.areAllPartsRead() && !this.getNextCourse()
							? (
								<div>Good Job, you ve read everything here!
								<br/>
								We don t have any more course to offer, stay tuned for more!
								</div>
							)
							: false
						}
					</div>
					<div className="academy-course-main-basics" ref="academyCourseBasics">
						{basics}
					</div>
				</div>

			</div>
		);
	}
}
