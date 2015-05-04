import {Patch} from 'remutable';

const registerToUndoStack = function(remut, storeName, client, lifespan) {
	client.getStore('/eventBackLog', lifespan)
		.onUpdate(({head}) => {
			const jsHead = head.toJS();
			const backLog = jsHead.eventList[jsHead.from];
			if (backLog.store === storeName) {
				const patch = Patch.fromJSON(backLog.patch);
				if (jsHead.from > jsHead.to) {
					remut.apply(Patch.revert(patch));
				}
				else if (jsHead.from < jsHead.to) {
					remut.apply(patch);
				}
			}
		})
		.onDelete(() => {});
}

export default {
	registerToUndoStack,
}
