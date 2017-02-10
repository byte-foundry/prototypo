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
		this.state = {
			stickedIndex: -1,
		};
		this.tutorials = new TutorialContent();
		this.headerRenderer = this.headerRenderer.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.bindData = this.bindData.bind(this);
		this.scrollToPart = this.scrollToPart.bind(this);
		this.isPartRead = this.isPartRead.bind(this);
		this.areAllPartsRead = this.areAllPartsRead.bind(this);
		this.createCourseProgress = this.createCourseProgress.bind(this);
		this.getNextCourse = this.getNextCourse.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
		this.courseSlug = this.props.params.courseSlug;
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

	componentWillReceiveProps(newProps) {
		if (newProps.params.courseSlug !== this.courseSlug) {
			window.removeEventListener('scroll', this.handleScroll, true);
			this.courseSlug = newProps.params.courseSlug;
			this.state = {
				stickedIndex: -1,
			};
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.params.courseSlug !== this.props.params.courseSlug) {
			this.bindData();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll, true);
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
		document.getElementsByClassName('academy-app')[0].scrollTop = 0;
		const course = this.tutorials.content.find((tutorial) => {
			return tutorial.slug === this.courseSlug;
		});
		const parts = course.content.split("## ");
		const headers = [];
		let sidebar = {};

		findDOMNode(this.refs.academyCourseSidebar).classList.remove('fixed');
		sidebar = {
			elem: findDOMNode(this.refs.academyCourseSidebar),
			content: findDOMNode(this.refs.academyCourseContent),
			offset: findDOMNode(this.refs.academyCourseSidebar).getBoundingClientRect().top,
		};

		parts.map((part, index) => {
			if (index !== 0) {
				findDOMNode(this.refs[`${this.courseSlug}-part${index + 1}`]).querySelector('.title').classList.remove('fixed');
				headers.push({
					elem: findDOMNode(this.refs[`${this.courseSlug}-part${index + 1}`]).querySelector('.title'),
					offset: findDOMNode(this.refs[`${this.courseSlug}-part${index + 1}`]).querySelector('.title').getBoundingClientRect().top,
					content: findDOMNode(this.refs[`${this.courseSlug}-part${index + 1}`]).querySelector('.title').textContent,
					active: false,
				});
			}
		});
		this.setState({...this.state, headers, sidebar, stickedIndex: -1});

		if (!this.state.academyProgress || !(this.state.academyProgress[this.courseSlug])) {
			this.createCourseProgress();
		}
		window.addEventListener('scroll', this.handleScroll, true);

		if (this.props.params.partName) {
			this.scrollToPart(this.props.params.partName, headers);
		}
	}

	handleScroll(event) {
		const headers = [...this.state.headers];
		let stickedIndex = this.state.stickedIndex;

		//Headers sticky handling
		headers.map((header, index) => {
			header.elem.classList.remove('fixed');
			header.active = false;
			if (event.target.scrollTop >= header.offset) {
				stickedIndex = index;
			}
		});
		if (stickedIndex === 0 && event.target.scrollTop <= headers[0].offset) {
			stickedIndex = -1;
		}
		if (headers[stickedIndex]) {
			headers[stickedIndex].elem.classList.add('fixed');
			headers[stickedIndex].active = true;
		}
		this.setState({headers, stickedIndex});
		//Sidebar sticky handling
		if (event.target.scrollTop >= this.state.sidebar.offset) {
			this.state.sidebar.elem.style.left = `${this.refs.academyCourseContent.getBoundingClientRect().right}px`;
			this.state.sidebar.elem.classList.add('fixed');
			this.state.sidebar.content.style.marginRight = '200px';
		}
		else {
			this.state.sidebar.elem.classList.remove('fixed');
			this.state.sidebar.content.style.marginRight = 'inherit';
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

		this.state.headers && this.state.headers.map((header) => {
			const parts = [];

			parts.push({
				name: header.content,
				completed: false,
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

	scrollToPart(partName, headers) {
		const coursePart =	headers.find((elem) => {
			return elem.content === partName;
		});

		if (coursePart) {
			coursePart.elem.scrollIntoView();
		}
	}

	markAsRead(part) {
		this.client.dispatchAction('/mark-part-as-read', {course: this.courseSlug, part: part[0]});
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
		if (!this.state.academyProgress || !this.state.academyProgress[this.courseSlug]) {
			return false;
		}

		const partsDone = this.state.academyProgress[this.courseSlug].parts.filter((part) => {
			return part.completed === true;
		}).length || 0;

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

		const sidebar = (
			<div>
				{basics}
				<h3>Parts</h3>
				{this.state.headers ? this.state.headers.map((header) => {
					return (
						<span
							className={`academy-sidebar-menu-item ${header.active ? 'is-active' : ''}`}
							onClick={() => {header.elem.scrollIntoView();}}>
							{header.content}
						</span>
					);
				}) : false}
			</div>
		);

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
									<ReactMarkdown source={part} renderers={renderers} ref={`${this.courseSlug}-part${index + 1}`}/>
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
					<div className="academy-course-main-sidebar" ref="academyCourseSidebar">
						{sidebar}
					</div>
				</div>

			</div>
		);
	}
}
