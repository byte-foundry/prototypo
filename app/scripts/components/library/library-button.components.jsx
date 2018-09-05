import React from 'react';

export default class LibraryButton extends React.Component {
	componentWillMount() {}

	render() {
		const {
			big,
			dark,
			highlight,
			floated,
			bold,
			full,
			loading,
			error,
			onClick,
			onBlur,
			name,
			...rest
		} = this.props;

		return (
			<div
				tabIndex="0"
				className={`
          library-button
          ${big ? ' button-big ' : ''}
          ${dark ? ' button-dark ' : ''}
          ${highlight ? ' button-highlight ' : ''}
          ${floated ? ' floated ' : ''}
          ${bold ? ' button-bold ' : ''}
					${full ? ' button-full ' : ''}
					${loading ? ' button-loading ' : ''}
					${error ? ' button-error ' : ''}
        `}
				onMouseDown={onClick}
				onBlur={onBlur}
				{...rest}
			>
				{loading ? (
					<div className="sk-spinner-wave">
						<div className="sk-rect1" />
						<div className="sk-rect2" />
						<div className="sk-rect3" />
						<div className="sk-rect4" />
						<div className="sk-rect5" />
					</div>
				) : (
					<span>{name}</span>
				)}
			</div>
		);
	}
}
