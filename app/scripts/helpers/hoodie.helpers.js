const HOODIE = {};

HOODIE.generateId = () => {
	const length = 7;

	return `${_.map(new Array(length).fill(0), () => {
		return HOODIE.chars[Math.floor(Math.random() * HOODIE.chars.length)];
	}).join('')}`;
};

HOODIE.chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');

export default HOODIE;
