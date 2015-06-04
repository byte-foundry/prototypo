import React from 'react';

export default class PrototypoText extends React.Component {
	render() {
		const style = {
			'fontFamily':`${this.props.fontName || 'theyaintus'}, 'sans-serif'`,
		};

		return (
			<div className="prototypo-text">
				<textarea
					className="prototypo-text-string"
					spellCheck="false"
					style={style}
				></textarea>
			</div>
		)
	}
}
