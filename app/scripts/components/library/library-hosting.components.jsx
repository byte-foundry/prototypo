import React from 'react';
import {Link} from 'react-router';
import {LibrarySidebarRight} from './library-sidebars.components';

export default class LibraryHosting extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hostedDomains: [],
		};
	}

	render() {
		return (
			<div className="library-content-wrapper">
				<div className="library-see">
					<div className="library-hosting-plan">
						Free plan: 1000 views / month / website
					</div>
					<div className="library-hosting">
						{this.state.hostedDomains.length === 0 && (
							<div>
								<div className="library-see-title">There is nothing here!</div>
								<div className="library-see-description">
									<p>
										The pro plan allows you to host your fonts and keep them
										sync from your library. Lorem ipsum dolor sit amet,
										consectetur adipiscing elit. Cum sociis natoque penatibus et
										magnis dis parturient montes, nascetur ridiculus mus.
									</p>
									<p>
										<Link to="/library/hosting/add">
											Start using my fonts on the web
										</Link>
									</p>
								</div>
							</div>
						)}
						<div className="library-hosting-list">
							{/* <div className="library-hosting-website">
								<p className="library-hosting-website-name">
									www.monsite.com
									<div
										className="button-edit"
										onClick={() => {}}
									>
										Edit
									</div>
								</p>
								<div className="library-hosting-website-infos">
									<span>5 hosted fonts</span>
									<span>Last update: 26. nov. 2017</span>
								</div>
							</div> */}
						</div>
					</div>
				</div>
				<LibrarySidebarRight>
					<div className="sidebar-action">Add website</div>
				</LibrarySidebarRight>
			</div>
		);
	}
}
