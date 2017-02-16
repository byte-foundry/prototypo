import React from 'react';
import {Link, browserHistory} from 'react-router';
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
			headers: [],
			scrollPercent: 0,
		};
		this.tutorials = new TutorialContent();
		this.headerRenderer = this.headerRenderer.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.bindData = this.bindData.bind(this);
		this.scrollToPart = this.scrollToPart.bind(this);
		this.isPartRead = this.isPartRead.bind(this);
		this.isCourseDone = this.isCourseDone.bind(this);
		this.areAllPartsRead = this.areAllPartsRead.bind(this);
		this.createCourseProgress = this.createCourseProgress.bind(this);
		this.getNextCourse = this.getNextCourse.bind(this);
		this.recalculateOffsets = this.recalculateOffsets.bind(this);
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
				headers: [],
				scrollPercent: 0,
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

		if (!course) {
			//invalid courseSlug supplied, redirect.
			browserHistory.push('/#/academy/home');
			return false;
		}
		const parts = course.content.split("## ");
		const headers = [];
		let sidebar = {};
		let courseList = {};

		this.courseSidebarDom.classList.remove('fixed');
		sidebar = {
			elem: this.courseSidebarDom,
			content: this.courseContentDom,
			offset: this.courseSidebarDom.getBoundingClientRect().top,
		};
		this.courseListDom.classList.remove('fixed');
		courseList = {
			elem: this.courseListDom,
			content: this.courseListDom,
			offset: this.courseListDom.getBoundingClientRect().top,
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
		this.setState({...this.state, headers, sidebar, course, courseList, stickedIndex: -1});

		if (!this.state.academyProgress || !(this.state.academyProgress[this.courseSlug])) {
			this.createCourseProgress();
		}
		this.client.dispatchAction('/set-course-currently-reading', this.courseSlug);
		window.addEventListener('scroll', this.handleScroll, true);

		if (this.props.params.partName) {
			this.scrollToPart(this.props.params.partName, headers);
		}
	}

	recalculateOffsets() {
		const parts = this.state.course.content.split("## ");

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
		this.setState({parts});
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
		this.setState({
			headers,
			stickedIndex,
			scrollPercent: event.target.scrollTop / (document.getElementsByClassName('academy-course-main')[0].offsetHeight - 700) * 100,
		});
		//Sidebar sticky handling
		if (event.target.scrollTop >= this.state.sidebar.offset) {
			this.state.sidebar.elem.style.left = `${this.courseContentDom.getBoundingClientRect().right}px`;
			this.state.sidebar.elem.classList.add('fixed');
		}
		else {
			this.state.sidebar.elem.classList.remove('fixed');
		}
		//Courselist sticky handling
		if (event.target.scrollTop >= this.state.courseList.offset) {
			this.state.courseList.elem.style.left = this.state.courseList.elem.getBoundingClientRect().left;
			this.state.courseList.elem.classList.add('fixed');
			this.courseContentDom.style.marginLeft = '170px';
		}
		else {
			this.state.courseList.elem.classList.remove('fixed');
			this.courseContentDom.style.marginLeft = 'inherit';
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
						<input type="checkbox" className="title-checkbox"
							id={`${this.courseSlug}-${props.children}`}
							name={`${this.courseSlug}-${props.children}`}
							checked={this.isPartRead(props.children[0])}
							key={`${this.courseSlug}-${props.children}`}
							onChange={() => {this.markAsRead(props.children[0]);}}
							/>
						<label htmlFor={`${this.courseSlug}-${props.children}`}><span/>{props.children}</label>
					</div>
			);
		}
		return(
			this.createElement(`h${props.level}`, this.getCoreProps(props), props.children)
		);
	}

	createCourseProgress() {
		const academyProgress = this.state.academyProgress || {};
		const course = this.tutorials.content.find((tutorial) => {
			return tutorial.slug === this.courseSlug;
		});

		if (!course) {
			//invalid courseSlug supplied, redirect.
			browserHistory.push('/#/academy/home');
			return false;
		}

		const parts = course.content.split("## ").slice(1).map((value) => {
			return {
				name: value.split(/\r\n|\r|\n/g)[0],
				completed: false,
			};
		});

		this.client.dispatchAction(
			'/create-course-progress',
			{
				slug: course.slug,
				name: course.title,
				parts,
			}
		);
		academyProgress[course.slug] = {
			parts,
			rewarded: false,
			name: course.title,
		};
		this.setState({academyProgress});
	}

	scrollToPart(partName, headers) {
		const coursePart = headers.find((elem) => {
			return elem.content === partName;
		});

		if (coursePart) {
			coursePart.elem.scrollIntoView();
		}
	}

	markAsRead(part) {
		this.client.dispatchAction('/mark-part-as-read', {course: this.courseSlug, part});
		this.recalculateOffsets();
	}

	isPartRead(part) {
		if (this.state.academyProgress && this.state.academyProgress[this.courseSlug]) {
			const coursePart = this.state.academyProgress[this.courseSlug].parts.find((elem) => {
				return elem.name === part;
			});

			return coursePart.completed;
		}
		return false;
	}

	isCourseDone(slug) {
		if (this.state.academyProgress && this.state.academyProgress[slug]) {
			const partsDone = this.state.academyProgress[slug].parts.filter((part) => {
				return part.completed === true;
			});

			return partsDone ? partsDone.length === this.state.academyProgress[slug].parts.length : false;
		}
		return false;
	}

	areAllPartsRead() {
		if (!this.state.academyProgress || !this.state.academyProgress[this.courseSlug]) {
			return false;
		}

		const partsDone = this.state.academyProgress[this.courseSlug].parts.filter((part) => {
			return part.completed === true;
		}).length || 0;

		return partsDone === this.state.academyProgress[this.courseSlug].parts.length;
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

		if (!course) {
			//invalid courseSlug supplied, redirect.
			browserHistory.push('/#/academy/home');
			return false;
		}
		const parts = course.content.split("## ");
		const partsName = parts.map((part) => {
			return part.split(/\r\n|\r|\n/g)[0];
		});

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
				<progress
					value={this.state.scrollPercent}
					max="100"
					></progress>
				{basics}
				<h3>Parts</h3>
				{this.state.headers.map((header) => {
					return (
						<span
							className={`academy-sidebar-menu-item ${header.active ? 'is-active' : ''}`}
							onClick={() => {header.elem.scrollIntoView();}}>
							<span className={`academy-sidebar-menu-item-checkmark ${this.isPartRead(header.content) ? 'active' : ''}`}/>
							<span>{header.content}</span>
						</span>
					);
				})}
			</div>
		);

		return(
			<div key={this.courseName} className="academy-base academy-course">
				<div className="academy-course-courselist" ref={(courseListDom) => { this.courseListDom = courseListDom; }}>
					<Link className="academy-sidebar-menu-item"
						to={`/academy/home`} >
						<span className="academy-sidebar-menu-item-home-icon"/>
						Home
					</Link>
					{
						this.tutorials.content.map((tutorial) => {
							return (
								<Link className={`academy-sidebar-menu-item ${tutorial.slug === this.courseSlug ? 'is-active' : ''}`}
									to={`/academy/course/${tutorial.slug}`} >
									<span className={`academy-sidebar-menu-item-checkmark ${this.isCourseDone(tutorial.slug) ? 'is-done' : ''} ${tutorial.slug === this.courseSlug ? 'is-active' : ''}`}/>
									{tutorial.title}
								</Link>
							);
						})
					}
				</div>
				<div className="academy-course-main">
					<div className="academy-course-main-content" ref={(courseContentDom) => { this.courseContentDom = courseContentDom; }}>
						{parts.map((part, index) => {
							return (
									<div className="academy-course-main-content-part clearfix">
										<ReactMarkdown source={part} renderers={renderers} ref={`${this.courseSlug}-part${index + 1}`}/>
											{index === 0
												? (<div>
													{this.state.course
														? (<div className="academy-course-main-content-part-readingtime">
															<img src="assets/images/icon-clock.svg" alt="readingTime icon"/> <span>{this.state.course.readingTime} min</span>
														</div>)
													: false}
												</div>)
												: (this.isPartRead(partsName[index])
													? false
													: (<div className="part-progress-complete-button" onClick={() => {this.markAsRead(partsName[index]);}}>
													{index === parts.length - 1
													? 'I finished the last part!'
													: 'I finished! On to the next part'}
												</div>)
											)}
									</div>
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
					<div className="academy-course-main-sidebar" ref={(courseSidebarDom) => { this.courseSidebarDom = courseSidebarDom; }}>
						{sidebar}
					</div>
				</div>

			</div>
		);
	}
}
