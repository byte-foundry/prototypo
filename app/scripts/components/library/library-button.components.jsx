import React from 'react';

export default class LibraryButton extends React.Component {
	componentWillMount() {}

	render() {
		return (
			<div
				tabIndex="0"
				className={`
          library-button
          ${this.props.big ? ' button-big ' : ''}
          ${this.props.dark ? ' button-dark ' : ''}
          ${this.props.highlight ? ' button-highlight ' : ''}
          ${this.props.floated ? ' floated ' : ''}
          ${this.props.big ? ' button-big ' : ''}
          ${this.props.bold ? ' button-bold ' : ''}
					${this.props.full ? ' button-full ' : ''}
					${this.props.loading ? ' button-loading ' : ''}
					${this.props.error ? ' button-error ' : ''}
					${this.props.disabled ? ' button-disabled ' : ''}
        `}
				onMouseDown={this.props.onClick}
				onBlur={this.props.onBlur}
			>
				{this.props.loading ? (
					<div className="sk-spinner-wave">
						<div className="sk-rect1" />
						<div className="sk-rect2" />
						<div className="sk-rect3" />
						<div className="sk-rect4" />
						<div className="sk-rect5" />
					</div>
				) : (
					<span>{this.props.name}</span>
				)}
			</div>
		);
	}
}
