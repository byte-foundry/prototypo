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
		this.client = LocalClient.instance();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	resetValue() {
		this.client.dispatchAction('/change-param',{value:this.props.param.init,name:this.props.param.name,label:this.props.param.label,force:true});
	}

	shouldComponentUpdate(nextProps) {
		if (nextProps.value && this.props.value) {
			return nextProps.value !== this.props.value;
		}
		return true;
	}

	render() {
		const value = this.props.value !== undefined ? this.props.value : this.props.param.init;

		const classes = ClassNames({
			'slider': true,
			'is-disabled':this.props.param.disabled
		});

		return (
			<div className={classes}>
				<label className="slider-title">{this.props.param.label}</label>
				<div className="slider-reset" onClick={() => {this.resetValue()}}>reset</div>
				<SliderTextController value={value} name={this.props.param.name} label={this.props.param.label} disabled={this.props.param.disabled}/>
				<SliderController value={value}
					name={this.props.param.name}
					label={this.props.param.label}
					min={this.props.param.min}
					max={this.props.param.max}
					minAdvised={this.props.param.minAdvised}
					maxAdvised={this.props.param.maxAdvised}
					disabled={this.props.param.disabled}/>
			</div>
		)
	}
}

export class SliderController extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();

		document.addEventListener( 'mouseup',
			this.handleUp.bind(this) );
		window.addEventListener( 'mousemove',
			this.handleMove.bind(this) );
		document.addEventListener( 'selectstart',
			this.handleSelectstart.bind(this) );
	}

	componentDidMount() {
		const slider = React.findDOMNode(this.refs.slider);
		this.sliderWidth = slider.offsetWidth;
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	handleDown(e) {
		if (this.props.disabled) {
			return;
		}

		this.tracking = true;
		const newX = e.pageX || e.screenX;
		const {offsetLeft} = DOM.getAbsOffset(React.findDOMNode(this.refs.slider));
		let newValue = ( ( newX - offsetLeft ) / this.sliderWidth * (this.props.max - this.props.min)) + this.props.min;

		newValue = Math.min(Math.max(newValue,this.props.min),this.props.max);

		this.client.dispatchAction('/change-param',{value:newValue,name:this.props.name,label:this.props.label,force:true});
		this.currentX = newX;

		e.stopPropagation();
	}

	handleUp(e) {
		if ( !this.tracking ) {
			return;
		}

		this.tracking = false;
		this.client.dispatchAction('/change-param',{value:this.props.value,name:this.props.name,label:this.props.label,force:true});

		e.stopPropagation();
	}

	handleMove(e) {
		if ( !this.tracking ) {
			return;
		}

		const newX = e.pageX || e.screenX;
		const el = React.findDOMNode(this.refs.slider);
		const {offsetLeft} = DOM.getAbsOffset(el);

		let newValue;

		if (newX >= offsetLeft && newX <= offsetLeft + el.clientWidth) {
			const variation = (newX - this.currentX) / this.sliderWidth * (this.props.max - this.props.min);
			newValue = this.props.value + variation;

			newValue = Math.min(Math.max(newValue,this.props.min),this.props.max);
		}
		else {
			newValue = newX < offsetLeft ? this.props.min : this.props.max
		}

		this.client.dispatchAction('/change-param',{value:newValue,name:this.props.name});
		this.currentX = newX;
	}

	// This prevents preview text to be selected whil using the sliders
	handleSelectstart(e) {
		if ( this.tracking ) {
			return e.preventDefault();
		}
	}

	handleClick(e) {

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
				onMouseDown={(e) => { this.handleDown(e)}}>
				<div className={classes} style={transform}>
					<div
						className="slider-controller-handle"
						ref="handle" ></div>
				</div>
			</div>
		)
	}
}

export class SliderTextController extends React.Component {

	componentWillMount() {
		this.lifespan = new Lifespan();
		this.client = LocalClient.instance();
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
				disabled={this.props.disabled}
			/>
		)
	}
}
