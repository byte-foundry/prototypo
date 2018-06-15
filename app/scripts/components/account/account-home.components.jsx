import React from 'react';
import {Link} from 'react-router';

import youtube from '../../../images/academy/icon-course-video.svg';
import cup from '../../../images/academy/cup.svg';

class AccountHome extends React.Component {
	openIntercom(e) {
		e.preventDefault();
		Intercom('showNewMessage');
	}

	render() {
		return (
			<div className="account-base account-home">
				<p>
					Welcome to your Prototypo account dashboard. You'll find all the
					necessary info to manage your subscription and billing here.
				</p>
				<h2>Resources</h2>
				<div className="account-home-resources">
					<div className="account-home-resources-item">
						<Link to="/academy" className="account-home-resources-item-box">
							<h3 className="account-home-resources-item-tile">Academy</h3>
							<img width="200" src={cup} alt="Academy" />
							<p>Learn everything you need to master Prototypo</p>
						</Link>
					</div>
					<div className="account-home-resources-item">
						<a
							className="account-home-resources-item-box"
							href="https://www.youtube.com/channel/UCmBqMb0koPoquJiSUykdOTw"
							target="_blank"
							rel="noopener noreferrer"
						>
							<h3 className="account-home-resources-item-tile">
								Youtube channel
							</h3>
							<img width="200" src={youtube} alt="YouTube" />
							<p>
								You will find tutorials and other interesting videos on our
								Youtube channel!
							</p>
						</a>
					</div>
					<div className="account-home-resources-item account-home-resources-item--help">
						<a
							href="mailto:support@prototypo.io?subject=Need help/infos"
							className="account-home-resources-item-box"
							onClick={this.openIntercom}
							title="If this link doesn't work, you may need to turn off your privacy blocker"
						>
							<h3 className="account-home-resources-item-tile">
								Need help or infos?
							</h3>
							<p>If there's anything you need, you can contact us!</p>
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default AccountHome;
