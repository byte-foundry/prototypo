import React from 'react';

export default class PrototypoWordInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			focus: false,
		};
	}

	componentWillReceiveProps({value}) {
		if(!this.state.focus && this.props.value !== value) {
			this.refs.input.value = value;
		}
	}

	render() {
		const {onTypedText, value} = this.props;

		return (
			<input
				ref="input"
				className="prototypo-word-input"
				autoCorrect="off"
				spellCheck="false"
				type="text"
				onChange={(e) => {onTypedText(e.target.value);}}
				onFocus={() => {this.setState({focus: true});}}
				onBlur={() => {this.setState({focus: false});}}
				defaultValue={value}
			/>
		);
	}
}
