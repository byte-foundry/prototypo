import React from 'react';
import {Link} from 'react-router';

export default class AccountSuccess extends React.Component {
	render() {
		return (
			<div className="account-success account-base">
				<h1>Hooray! You're officially a Prototypo user!</h1>
				<img src="https://media.giphy.com/media/11YAyUOnpiv6tq/giphy.gif" />
				<p>You will soon receive a confirmation email.</p>
				<p>
					Now it's time to go to{' '}
					<Link className="account-link" to="/dashboard">
						go to the app
					</Link>{' '}
					and design your own fonts. We are eager to see what you will be able
					to do with Prototypo. Please share your creations with us on{' '}
					<a
						className="account-link"
						href="https://www.twitter.com/prototypoApp"
					>
						Twitter
					</a>{' '}
					and{' '}
					<a
						className="account-link"
						href="https://www.facebook.com/prototypoApp"
					>
						Facebook
					</a>. If you have any questions or feedback, feel free to reach out to
					us at{' '}
					<a className="account-link" href="mailto:contact@prototypo.io">
						contact@prototypo.io
					</a>.
				</p>
				<p>
					One more thing: If you are (or represent) a company and you need an
					invoice for your purchase, please go to{' '}
					<Link className="account-link" to="/account/details/billing-address">
						your account settings
					</Link>{' '}
					and fill in your VAT number.
				</p>
				<p>
					Have fun,<br />The Prototypo team.
				</p>
			</div>
		);
	}
}
