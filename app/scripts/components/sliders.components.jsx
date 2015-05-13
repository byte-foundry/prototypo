import React from 'react';
import ClassNames from 'classnames';
import Lifespan from 'lifespan';
import LocalClient from '../stores/local-client.stores.jsx';
import {registerToUndoStack} from '../helpers/undo-stack.helpers.js';
import DOM from '../helpers/dom.helpers.js';

export class Sliders extends React.Component {

	render() {
		const sliders = _.map(this.props.params, (param,i) => {
			const value = this.props.values ? this.props.values[param.name] : undefined;
			return (
				<Slider param={param} key={param.name+i} value={value}/>
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

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	resetValue() {
		this.client.dispatchAction('/change-param',{value:this.props.param.init,name:this.props.param.name,force:true});
	}

	render() {
		const value = this.props.value || this.props.param.init;
		return (
			<div className="slider">
				<label className="slider-title">{this.props.param.label}</label>
				<div className="slider-reset" onClick={() => {this.resetValue()}}>reset</div>
				<SliderTextController value={value} name={this.props.param.name} label={this.props.param.label}/>
				<SliderController value={value}
					name={this.props.param.name}
					label={this.props.param.label}
					min={this.props.param.min}
					max={this.props.param.max}
					minAdvised={this.props.param.minAdvised}
					maxAdvised={this.props.param.maxAdvised}/>
			</div>
		)
	}
}

export class SliderController extends React.Component {

	componentDidMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
		const slider = React.findDOMNode(this.refs.slider);
		this.sliderWidth = slider.offsetWidth;
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleDown(e) {
		this.tracking = true;
		this.currentX = e.pageX

		e.stopPropagation();
	}

	handleUp(e) {
		if (this.tracking) {

			this.tracking = false;
			this.client.dispatchAction('/change-param',{value:this.props.value,name:this.props.name,label:this.props.label,force:true});

			e.stopPropagation();

		}
	}

	handleMove(e) {
		if (this.tracking) {
			const newX = e.pageX || e.screenX;
			const variation = (newX - this.currentX) / this.sliderWidth * (this.props.max - this.props.min);
			let newValue = this.props.value + variation;

			newValue = Math.min(Math.max(newValue,this.props.min),this.props.max);

			this.client.dispatchAction('/change-param',{value:newValue,name:this.props.name});
			this.currentX = newX;
		}
	}

	handleClick(e) {
		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(React.findDOMNode(this.refs.slider));
		let newValue = ( ( newX - offsetLeft ) / this.sliderWidth * (this.props.max - this.props.min)) + this.props.min;

		newValue = Math.min(Math.max(newValue,this.props.min),this.props.max);

		this.client.dispatchAction('/change-param',{value:newValue,name:this.props.name,label:this.props.label,force:true});
		this.currentX = newX;

	}

	render() {
		const translateX = (this.props.max - this.props.value) / (this.props.max - this.props.min) * 92.0;
		const transform = {
			transform: `translateX(-${translateX}%)`
		};

		const classes = ClassNames({
			'slider-controller-bg':true,
			'is-not-advised':this.props.value < this.props.minAdvised || this.props.value > this.props.maxAdvised,
		});

		return (
			<div className="slider-controller" ref="slider"
				onMouseUp={(e) => { this.handleUp(e) }}
				onMouseMove={(e) => { this.handleMove(e) }}
				onMouseLeave={(e) => { this.handleUp(e) }}
				onClick={(e) => { this.handleClick(e) }} >
				<div className={classes} style={transform}>
					<div
						className="slider-controller-handle"
						ref="handle"
						onMouseDown={(e) => { this.handleDown(e) }}
						></div>
				</div>
			</div>
		)
	}
}

export class SliderTextController extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = new LocalClient().instance;
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	render() {
		return (
			<input
				className="slider-text-controller"
				type="number"
				value={this.props.value}
				onChange={(e) => {
					this.client.dispatchAction(
						'/change-param',
						{
							name:this.props.name,
							value:e.target.value,
							label:this.props.label,
							force:true,
						});
				}}
			/>
		)
	}
}
