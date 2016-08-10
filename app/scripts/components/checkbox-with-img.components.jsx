import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classNames from 'classnames';

export default class CheckBoxWithImg extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	componentWillMount() {
		this.setState({});
	}

	changeHover(hovered) {
		this.setState({
			hovered,
		});
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] checkBoxWithImg');
		}

		let checkbox;

		const classes = classNames({
			'checkbox-with-img': true,
			'checkbox-hover': this.state.hovered,
			'': this.props.checked && !this.state.hovered,
			'checkbox-checked': !this.props.checked && !this.state.hovered,
		});

		if (this.state.hovered) {
			checkbox = <img src="assets/images/checkbox-hover.svg"/>;
		}
		else if (this.props.checked) {
			checkbox = <img src="assets/images/checkbox-checked.svg"/>;
		}
		else {
			checkbox = <img src="assets/images/checkbox.svg"/>;
		}

		return (
			<div
				onMouseEnter={() => {this.changeHover(true);}}
				onMouseLeave={() => {this.changeHover(false);}}
				className={classes}>
				{checkbox}
			</div>
		);
	}
}
