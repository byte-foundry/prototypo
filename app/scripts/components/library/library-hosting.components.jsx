import React from 'react';
import {Link} from 'react-router';
import {LibrarySidebarRight} from './library-sidebars.components';
import LibraryButton from './library-button.components';

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
						{(!this.props.hostedDomains
							|| this.props.hostedDomains.length === 0) && (
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
										<Link to="/library/hosting/create">
											Start using my fonts on the web
										</Link>
									</p>
								</div>
							</div>
						)}
						<div className="library-hosting-list">
							{this.props.hostedDomains
								&& this.props.hostedDomains.map(hostedDomain => (
									<div className="library-hosting-website">
										<p className="library-hosting-website-name">
											{hostedDomain.domain}
											<div
												className="button-edit"
												onClick={() => {
													this.props.router.push(
														`/library/hosting/${hostedDomain.id}/edit`,
													);
												}}
											>
												Edit
											</div>
										</p>
										<div className="library-hosting-website-infos">
											<span>
												{hostedDomain.hostedVariants.length} hosted fonts
											</span>
											<span>
												Last update:{' '}
												{new Intl.DateTimeFormat('en-US').format(
													new Date(hostedDomain.updatedAt),
												)}
											</span>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
				<LibrarySidebarRight>
					<LibraryButton
						name="Add a website"
						bold
						full
						onClick={() => {
							this.props.router.push('/library/hosting/create');
						}}
					/>
				</LibrarySidebarRight>
			</div>
		);
	}
}
