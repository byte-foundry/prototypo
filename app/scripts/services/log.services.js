// log things using google analytics events
function Log(category, action, label) {
	if (!window.ga) {
		return;
	}

	window.ga('send', 'event', category, action, label);
}

Log.ui = function (action, label) {
	Log('ui', action, label);
};

export default Log;
