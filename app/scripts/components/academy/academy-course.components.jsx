import React from 'react';
import {Link, browserHistory} from 'react-router';
import TutorialContent from 'tutorial-content';
import ReactMarkdown from 'react-markdown';
import {findDOMNode} from 'react-dom';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';
import InlineSVG from 'svg-inline-react';
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
		this.imgRenderer = this.imgRenderer.bind(this);
		this.linkRenderer = this.linkRenderer.bind(this);
		this.htmlRenderer = this.htmlRenderer.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.bindData = this.bindData.bind(this);
		this.scrollToPart = this.scrollToPart.bind(this);
		this.isPartRead = this.isPartRead.bind(this);
		this.isCourseDone = this.isCourseDone.bind(this);
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
		window.Intercom('trackEvent', `openedAcademyCourse-${this.courseSlug}`);
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
		const parts = course.content.split(/[^\#]#{2} +/g);
		const headers = [];
		let sidebar = {};

		this.courseSidebarDom.classList.remove('fixed');
		sidebar = {
			elem: this.courseSidebarDom,
			content: this.courseContentDom,
			offset: this.courseSidebarDom.getBoundingClientRect().top,
			width: this.courseSidebarDom.offsetWidth,
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
		if (parts.length === 1) {
			this.client.dispatchAction('/mark-part-as-read', {course: this.courseSlug});
		}
		this.setState({...this.state, headers, sidebar, course});

		if (!this.state.academyProgress || !(this.state.academyProgress[this.courseSlug])) {
			this.createCourseProgress();
		}
		this.client.dispatchAction('/set-course-currently-reading', this.courseSlug);
		window.addEventListener('scroll', this.handleScroll, true);

		if (this.props.params.partName) {
			this.scrollToPart(this.props.params.partName, headers);
		}
	}


	handleScroll(event) {
		const headers = [...this.state.headers];
		let stickedIndex = this.state.stickedIndex;

		//Headers handling
		headers.map((header, index) => {
			header.active = false;
			if (event.target.scrollTop >= header.offset) {
				stickedIndex = index;
			}
		});
		if (stickedIndex === 0 && event.target.scrollTop <= headers[0].offset) {
			stickedIndex = -1;
		}
		if (headers[stickedIndex]) {
			headers[stickedIndex].active = true;
		}
		this.setState({
			headers,
			stickedIndex,
			scrollPercent: Math.round(event.target.scrollTop / (document.getElementsByClassName('academy-course-main')[0].offsetHeight - 850) * 100),
		});

		//Logo sticky handling
		if (event.target.scrollTop >= this.state.sidebar.offset - 130) {
			document.getElementsByClassName('academy-dashboard-icon')[0].classList.add('fixed');
			document.getElementsByClassName('academy-dashboard-icon')[0].style.left = `${this.courseContentDom.getBoundingClientRect().left - 75}px`;
		}
		else {
			document.getElementsByClassName('academy-dashboard-icon')[0].classList.remove('fixed');
			document.getElementsByClassName('academy-dashboard-icon')[0].style.left = `inherit`;
		}

		//Sidebar sticky handling
		if (event.target.scrollTop >= this.state.sidebar.offset) {
			this.state.sidebar.elem.classList.add('fixed');
			document.getElementsByClassName('academy-dashboard-icon')[0].classList.add('fixed');
			document.getElementsByClassName('academy-dashboard-icon')[0].style.left = `${this.courseContentDom.getBoundingClientRect().left - 75}px`;
			this.state.sidebar.elem.style.left = `${this.courseContentDom.getBoundingClientRect().right + 20}px`;
		}
		else {
			this.state.sidebar.elem.classList.remove('fixed');
			this.state.sidebar.elem.style.left = `inherit`;
		}
	}

	headerRenderer(props) {
		if (props.level === 2 && props.children.length > 0) {
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

	imgRenderer(props) {
		const {src, alt} = props;
		const urlRegexp = /([a-z]+\:\/+)([^\/\s]*)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/ig;

		if (!src.match(urlRegexp) && this.state.course) {
			return(
				<img src={`assets/images/academy/courses/${this.state.course.title}/${src}`} alt={alt} />
			);
		}
		return(
			<img src={src} alt={alt} />
		);
	}

	linkRenderer(props) {
		const {href, children} = props;

		if (href.includes('/academy')) {
			return(
				<Link to={href}>{children}</Link>
			);
		}
		return(
			<a target="_blank" href={href} className="out">{children}</a>
		);
	}

	htmlRenderer(props) {
		let literal = props.literal;

		if (literal.includes('<video') && this.state.course) {
			const getAttributes = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
			const urlRegexp = /([a-z]+\:\/+)([^\/\s]*)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/ig;
			let regexResult;
			let returnstring = '<video ';

			while ((regexResult = getAttributes.exec(props.literal)) !== null) {
				if (regexResult[1] === 'src') {
					if (regexResult[2].match(urlRegexp)) {
						returnstring = `${returnstring} ${regexResult[0]}`;
					}
					else {
						returnstring = `${returnstring} ${regexResult[1]}="assets/images/academy/courses/${this.state.course.title}/${regexResult[2]}"`;
					}
				}
				else {
					returnstring = `${returnstring} ${regexResult[0]}`;
				}
			}
			literal = `${returnstring}>`;
		}
		const nodeProps = props.escapeHtml ? {} : {dangerouslySetInnerHTML: {__html: literal}};
		const children = props.escapeHtml ? [props.literal] : null;

		if (props.escapeHtml || !props.skipHtml) {
			return this.createElement(props.isBlock ? 'div' : 'span', nodeProps, children);
		}
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

		const parts = course.content.split(/[^\#]#{2} +/g).slice(1).map((value) => {
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
		return this.state.academyProgress[this.courseSlug].completed;
	}

	getNextCourse() {
		return this.tutorials.content[this.tutorials.content.findIndex((tutorial) => {
			return tutorial.slug === this.courseSlug;
		}) + 1];
	}

	render() {
		const renderers = {
			Heading: this.headerRenderer,
			Image: this.imgRenderer,
			Link: this.linkRenderer,
			HtmlInline: this.htmlRenderer,
		};
		const course = this.tutorials.content.find((tutorial) => {
			return tutorial.slug === this.courseSlug;
		});

		if (!course) {
			//invalid courseSlug supplied, redirect.
			browserHistory.push('/#/academy/home');
			return false;
		}
		const parts = course.content.split(/[^\#]#{2} +/g);
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
		const partsDisplay = this.state.headers.length > 0 ? (
			<div>
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
		) : null;
		const sidebar = (
			<div className="academy-course-main-sidebar" ref={(courseSidebarDom) => { this.courseSidebarDom = courseSidebarDom; }}>
				<progress
					value={this.state.scrollPercent}
					max="100"
					></progress>
				{basics}
				{partsDisplay}
        <h3>Other courses</h3>
          <div className="academy-course-courselist" ref={(courseListDom) => { this.courseListDom = courseListDom; }}>
            <Link className="academy-sidebar-menu-item"
              to={`/academy/home`} >
              <span className="academy-sidebar-menu-item-home-icon"/>
              Academy homepage
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
			</div>
		);

		let finish = false;
		if (this.areAllPartsRead() && this.state.headers) {
			finish = (
				<div className="academy-course-finish">
					<InlineSVG className="academy-course-finish-icon" element="div" src={require('!svg-inline!../../../images/academy/cup.svg')} />
					<div className="academy-course-finish-text">
						{this.getNextCourse() ? (
							<p>Good Job, you have learned {course.objective}<br/>
								Do you want to learn {this.getNextCourse().objective}? <br/>
							Check out our next course: {this.getNextCourse().title}.
							</p>
						) : (
							<p>	Good Job, you have learned {course.objective}<br/>
								We do not have anything else to teach you yet. Stay tuned for more!
							</p>
						)}
					</div>
					<div className="academy-course-finish-validation">
						<div className="academy-button">
							{this.getNextCourse() ? (
								<Link to={`/academy/course/${this.getNextCourse().slug}`}>
									Sure !
								</Link>
							) : (
								<Link to={`/academy/home`}>
									Go back to the homepage
								</Link>
							)}

						</div>
					</div>
				</div>
			);
		}

		return(
			<div key={this.courseName} className={`academy-base academy-course ${course.isVideo ? 'is-video' : ''}`}>
				<div className="academy-course-main">
					<div className="academy-course-main-content" ref={(courseContentDom) => { this.courseContentDom = courseContentDom; }}>
						{parts.map((part, index) => {
							return (
									<div className="academy-course-main-content-part clearfix">
										<ReactMarkdown source={part} renderers={renderers} ref={`${this.courseSlug}-part${index + 1}`}/>
											{index === 0
												? (<div>
												</div>)
												: (<div className={`part-progress-complete-button ${this.isPartRead(partsName[index]) ? 'finished' : ''}`} onClick={() => { return this.isPartRead(partsName[index]) ? false : this.markAsRead(partsName[index]);}}>
													{this.isPartRead(partsName[index])
														? 'Part finished'
														: (index === parts.length - 1
															? 'I finished the last part!'
															: 'I finished! On to the next part')
													}
												</div>)
											}
									</div>
							);
						})}
					</div>
					{sidebar}
				</div>
				{finish}
			</div>
		);
	}
}
