import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class HandlegripText extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		const letterComponents = _.map(this.props.text, (letter, index) => {
			return <HandlegripLetter letter={letter} key={index} />;
		});

		return (
			<div
				className="prototypo-word-string"
				spellCheck="false"
				style={this.props.style}
			>
				{letterComponents}
			</div>
		);
	}
}

class HandlegripLetter extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		return (
			<span class="letter-wrap">
				<span class="handlegrip-left">
					<span class="handlegrip-border"></span>
					50
				</span>
				<span class="letter-wrap-letter">
					{this.props.letter}
				</span>
				<span class="handlegrip-right">
					<span class="handlegrip-border"></span>
					50
				</span>
				450
			</span>
		);
	}
}
