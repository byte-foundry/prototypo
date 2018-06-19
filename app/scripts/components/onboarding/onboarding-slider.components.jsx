import React from 'react';

import Slider from '../slider-controller.components';

export default class OnboardingSlider extends React.PureComponent {
	render() {
		const {min, max, value, name, label, onChange} = this.props;

		return (
			<div className="normal onboarding-slider">
				<label htmlFor={`slider-${this.props.label}`}>{this.props.label}</label>
				<Slider
					className="onboarding-slider-controller"
					changeParam={infos =>
						onChange({
							value: infos.value,
							name: infos.name,
							force: true,
						})
					}
					label={label}
					min={min}
					max={max}
					realMin={min}
					realMax={max}
					maxAdvised={max}
					minAdvised={min}
					name={name}
					value={value}
				/>
			</div>
		);
	}
}
