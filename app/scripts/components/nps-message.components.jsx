import React from 'react';

export default class NpsMessage extends React.Component {
	render() {
		return (
			<div className="nps-message">
				<div className="nps-message-content">
					<h1 className="nps-message-content-title">
						You've been subscribed to Prototypo for some time, and we'd like to
						get your feedback !
					</h1>
					<p className="nps-message-content-question">
						How likely are you to recommend Prototypo to a friend or colleague ?
					</p>
					<ul className="nps-message-content-list">
						<li className="nps-message-content-list-item">1</li>
						<li className="nps-message-content-list-item">2</li>
						<li className="nps-message-content-list-item">3</li>
						<li className="nps-message-content-list-item">4</li>
						<li className="nps-message-content-list-item">5</li>
						<li className="nps-message-content-list-item">6</li>
						<li className="nps-message-content-list-item">7</li>
						<li className="nps-message-content-list-item">8</li>
						<li className="nps-message-content-list-item">9</li>
						<li className="nps-message-content-list-item">10</li>
					</ul>
					<p className="nps-message-content-question">
						What is the most important reason for your score ?
					</p>
					<textarea className="nps-message-content-text" />
					<div className="nps-message-content-btns">
						<button className="nps-message-content-btns-btn">
							Send my feedback
						</button>
						<button className="nps-message-content-btns-btn nps-message-content-btns-cancel">
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	}
}
