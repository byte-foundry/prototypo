import React from 'react';
import PropTypes from 'prop-types';

import Button from './new-button.components.jsx';
import InputWithLabel from './input-with-label.components.jsx';

export default class CopyPasteInput extends React.PureComponent {
	render() {
		const {content} = this.props;

		return (
			<div className="copy-paste-input">
				<div className="columns">
					<div className="two-third-column">
						<InputWithLabel inputValue={content} size="small"/>
					</div>
					<div className="third-column">
						<Button size="small" onClick={() => {}}>Copy to clipboard</Button>
					</div>
				</div>
			</div>
		);
	}
}

CopyPasteInput.propTypes = {
	content: PropTypes.string,
}
