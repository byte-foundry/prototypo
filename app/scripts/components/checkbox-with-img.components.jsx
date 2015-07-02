import React from 'react';

export default class CheckBoxWithImg extends React.Component {
	componentWillMount() {
		this.setState({});
	}

	changeHover(hovered) {
		this.setState({
			hovered,
		})
	}

	render() {
		let checkbox;
		if (this.state.hovered) {
			checkbox = <img src="assets/images/checkbox-hover.svg"/>;
		}
		else {
			if (this.props.checked) {
				checkbox = <img src="assets/images/checkbox-checked.svg"/>;
			}
			else {
				checkbox = <img src="assets/images/checkbox.svg"/>;
			}
		}

		return (
			<div
				onMouseEnter={() => {this.changeHover(true)}}
				onMouseLeave={() => {this.changeHover(false)}}
				className="checkbox-with-img">
				{checkbox}
			</div>
		)
	}
}
