import {Patch} from 'remutable';

const registerToUndoStack = function(remut, storeName, client, lifespan) {
	client.getStore('/eventBackLog', lifespan)
		.onUpdate(({head}) => {
			const jsHead = head.toJS();
			let patch;
			let backLog;
			if (jsHead.from > jsHead.to) {
				backLog = jsHead.eventList[jsHead.from];
				patch = Patch.revert(Patch.fromJSON(backLog.patch));
			}
			else if (jsHead.from < jsHead.to) {
				backLog = jsHead.eventList[jsHead.to];
				patch = Patch.fromJSON(backLog.patch);
			}
			if (backLog && backLog.store === storeName) {
				remut.apply(patch);
			}
		})
		.onDelete(() => {});
}

export default {
	registerToUndoStack,
}
