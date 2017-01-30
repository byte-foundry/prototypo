import vatrates from 'vatrates';

function getCurrency(country) {
	return country in vatrates ? 'EUR' : 'USD';
}

export default getCurrency;
