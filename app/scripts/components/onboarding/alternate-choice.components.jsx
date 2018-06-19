import PropTypes from 'prop-types';
import React from 'react';

import HighlightedText from './highlighted-text.components';

class AlternateChoice extends React.Component {
	render() {
		const {text, unicode, alternates, onSelect} = this.props;

		return (
			<div className="alternate-row">
				{alternates.map((font, index) => (
					<div
						key={font.name}
						className={`alternate-choice ${font.isSelected ? 'selected' : ''}`}
						style={{fontFamily: font.name}}
						onClick={() => onSelect(index)}
						onKeyDown={(e) => {
							// space or enter
							if (e.keyCode !== 32 && e.key !== 'Enter') {
								return;
							}

							e.preventDefault();
							onSelect(index);
						}}
						role="radio"
						aria-checked={!font.isSelected}
						tabIndex="0"
					>
						<div className="text">
							<HighlightedText
								letters={String.fromCharCode(unicode)}
								alternateText={text}
							/>
						</div>
					</div>
				))}
			</div>
		);
	}
}

AlternateChoice.propTypes = {
	text: PropTypes.string.isRequired,
	unicode: PropTypes.string.isRequired,
	alternates: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
		}),
	),
	onSelect: PropTypes.func,
};

export default AlternateChoice;
