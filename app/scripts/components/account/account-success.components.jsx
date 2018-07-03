import React from 'react';
import {Link} from 'react-router-dom';

import Dashboard from './account-dashboard.components';

export default class AccountSuccess extends React.Component {
	render() {
		return (
			<Dashboard title="Congratulations!">
				<div className="account-success account-base">
					<h1>Hooray! You're officially a Prototypo user!</h1>
					<img src="https://media.giphy.com/media/11YAyUOnpiv6tq/giphy.gif" />
					<p>You will receive an email to notify you of this accomplishment!</p>
					<p>
						It's time for you now to{' '}
						<Link className="account-link" to="/dashboard">
							go to the app
						</Link>{' '}
						and make you own fonts. We love to have a lot of feedbacks from our
						users. Feel free to contact us or share with us your production on{' '}
						<a
							className="account-link"
							href="https://www.twitter.com/prototypoApp"
						>
							Twitter
						</a>{' '}
						or{' '}
						<a
							className="account-link"
							href="https://www.facebook.com/prototypoApp"
						>
							Facebook
						</a>.
					</p>
					<p>
						One more thing: If you are (or represent) a company and you need an
						invoice for your purchase, please go to{' '}
						<Link className="account-link" to="details/billing-address">
							your account settings
						</Link>{' '}
						and fill in your VAT number.
					</p>
					<p>
						Have fun,<br />The Prototypo team.
					</p>
				</div>
			</Dashboard>
		);
	}
}
