import React from 'react';
import pleaseWait from 'please-wait';

export default class OnboardingSlider extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
		pleaseWait.instance.finish();
	}

	render() {
		return (
			<div className="onboarding-slider">
				<div className="form-group">
					<label htmlFor={`slider-${this.props.label}`}>
						{this.props.label}
					</label>
					<input
						id={`slider-${this.props.label}`}
						name={`slider-${this.props.label}`}
						type="range"
						min={this.props.min}
						max={this.props.max}
						value={this.props.value}
						step={this.props.step}
						onChange={(e) => {
							this.props.onChange({
								value: parseFloat(e.target.value),
                                name: this.props.name,
                                force: true,
							});
						}}
					/>
				</div>
			</div>
		);
	}
}
