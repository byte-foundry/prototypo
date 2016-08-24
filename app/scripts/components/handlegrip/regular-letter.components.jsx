import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LocalClient from '../../stores/local-client.stores.jsx';
import Lifespan from 'lifespan';

/**
*	Component : a regular letter
*	@extends React.Component
*/
export default class RegularLetter extends React.Component {
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

		// function bindings
		this.selectLetter = this.selectLetter.bind(this);
	}

	componentWillMount() {
		this.client = LocalClient.instance();
		this.lifespan = new Lifespan();
	}

	componentWillUnmount() {
		this.lifespan.release();
	}

	selectLetter() {
		this.client.dispatchAction('/store-value', {uiWordSelection: this.props.index});
		this.client.dispatchAction('/update-letter-spacing-value', {
			letter: this.props.letter.charCodeAt(0),
			valueList: ['advanceWidth', 'spacingLeft', 'spacingRight', 'baseSpacingLeft', 'baseSpacingRight'],
		});
	}

	render() {
		return (
			<span className="letter-wrap" onDoubleClick={this.selectLetter} dangerouslySetInnerHTML={{__html:this.props.letter.replace(/ /g, '&nbsp;')}}>
			</span>
		);
	}
}
