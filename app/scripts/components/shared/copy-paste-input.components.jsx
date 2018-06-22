import React from 'react';
import PropTypes from 'prop-types';

import Button from './new-button.components';
import InputWithLabel from './input-with-label.components';

export default class CopyPasteInput extends React.PureComponent {
	constructor(props) {
		super(props);
		this.copyToClipboard = this.copyToClipboard.bind(this);
		this.state = {
			message: 'Copy to clipboard',
		};
	}

	copyToClipboard() {
		this.input.select();
		try {
			document.execCommand('copy');
			this.setState({
				message: 'Copied to clipboard',
			});
		}
		catch (err) {
			this.setState({
				message: "Can't copy :(",
			});
		}
	}

	render() {
		const {content} = this.props;

		return (
			<div className="copy-paste-input">
				<div className="columns">
					<div className="two-third-column">
						<InputWithLabel
							inputValue={content}
							size="small"
							inputRef={(input) => {
								this.input = input;
							}}
						/>
					</div>
					<div className="third-column">
						<Button size="small" onClick={this.copyToClipboard}>
							{this.state.message}
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

CopyPasteInput.propTypes = {
	content: PropTypes.string,
};
