export function formatPrice(amount, currency) {
	return `${currency === 'USD' ? '$' : ''}${amount}${currency === 'EUR' ? ' €' : ''}`;
}
