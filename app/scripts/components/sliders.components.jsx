import React from 'react';

export class Sliders extends React.Component {

	render() {
		const sliders = _.map(this.props.params, (param,i) => {
			return (
				<Slider title={param.title} value={param.value} key={param.title+i}/>
			);
		});

		return (
			<div className="sliders">
				{sliders}
			</div>
		)
	}
}

export class Slider extends React.Component {

	render() {
		return (
			<div className="slider">
				<label className="slider-title">{this.props.title}</label>
				<div className="slider-reset">reset</div>
				<SliderTextController value={this.props.value} />
				<SliderController value={this.props.value} />
			</div>
		)
	}
}

export class SliderController extends React.Component {

	render() {
		const transform = {
			transform: `translateX(-${this.props.value}px)`
		}
		return (
			<div className="slider-controller">
				<div className="slider-controller-bg" style={transform}>
					<div className="slider-controller-handle"></div>
				</div>
			</div>
		)
	}
}

export class SliderTextController extends React.Component {

	render() {
		return (
			<input
				className="slider-text-controller"
				type="number"
				value={this.props.value}
			/>
		)
	}
}
