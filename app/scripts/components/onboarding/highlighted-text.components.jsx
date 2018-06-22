import React from 'react';

function HighlightedText({letters, alternateText}) {
	const charactersArr = alternateText
		? alternateText.split('')
		: 'Hamburgefonstiv'.split('');

	return (
		<p>
			{charactersArr.map((char, index) => (
				<span
					key={char + index}
					className={letters.includes(char) ? 'highlighted' : ''}
				>
					{char}
				</span>
			))}
		</p>
	);
}

export default HighlightedText;
