import React from 'react';
import InputWithLabel from './input-with-label.components.jsx';

export default class AddCard extends React.Component {
	render() {
		return (
			<div className="add-card">
				<InputWithLabel label="" required={true} placeholder="Month"/>
				<InputWithLabel label="Card number" required={true} placeholder="1111222233334444"/>
				<div className="columns">
					<div className="third-column">
						<InputWithLabel label="Expiration date" required={true} placeholder="Month"/>
					</div>
					<div className="third-column">
						<InputWithLabel label="&nbsp;" required={false} placeholder="Year"/>
					</div>
					<div className="third-column">
						<InputWithLabel label="CVC" required={true} placeholder="123"/>
					</div>
				</div>
			</div>
		);
	}
}
