import React from 'react';
import pleaseWait from 'please-wait';

export default class NotABrowser extends React.Component {
	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] NotABrowser');
		}
		pleaseWait.instance.finish();
		return (
			<div id="notloggedin">
				<div className="sign-in">
					<h1 className="sign-in-h1">
						Prototypo uses features that are not yet available in Safari and IE
					</h1>
					If you want to use Prototypo, you will have to install Chrome
					(recommended), Firefox or Opera.
					<div className="not-a-browser-logos">
						<a
							className="not-a-browser-logos-link"
							href="https://www.google.fr/chrome/browser/desktop/index.html"
						>
							<img src="assets/images/chrome.svg" />
							<label>Recommended</label>
						</a>
						<a
							className="not-a-browser-logos-link"
							href="https://www.mozilla.org/fr/firefox/new/"
						>
							<img src="assets/images/firefox.svg" />
						</a>
						<a
							className="not-a-browser-logos-link"
							href="http://www.opera.com/download/guide/"
						>
							<img src="assets/images/opera.svg" />
						</a>
					</div>
				</div>
			</div>
		);
	}
}
