import initStoryshots from '@storybook/addon-storyshots';

// This extra is needed to avoid errors due to React 16
global.window = global;
window.addEventListener = () => {};
window.requestAnimationFrame = () => {
	throw new Error('requestAnimationFrame is not supported in Node');
};

initStoryshots();
