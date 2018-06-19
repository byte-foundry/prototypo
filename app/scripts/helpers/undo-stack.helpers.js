import {Patch} from 'remutable';

const registerToUndoStack = function (
	remut,
	storeName,
	client,
	lifespan,
	cb = () => {},
) {
	client
		.getStore('/prototypoStore', lifespan)
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
				cb(remut.head.toJS());
			}
		})
		.onDelete(() => {});
};

// Allow to setup granularity for undo stack
class BatchUpdate {
	constructor(
		remut,
		storeName,
		propName,
		client,
		lifespan,
		labelGenerator,
		cb,
		criteria = () => false,
	) {
		registerToUndoStack(remut, storeName, client, lifespan, cb);

		this.storeName = storeName;
		this.propName = propName;
		this.client = client;
		this.criteria
			= typeof criteria === 'number'
				? (newValue, oldValue) => Math.abs(newValue - oldValue) > criteria
				: criteria;

		this.labelGenerator = labelGenerator;
	}

	update(patch, prop) {
		let newPatch = patch;

		if (this.patch) {
			newPatch = Patch.combine(this.patch, patch);
		}

		if (
			patch.mutations[this.propName].f
			&& this.criteria(
				patch.mutations[this.propName].t[prop],
				patch.mutations[this.propName].f[prop],
			)
		) {
			this.client.dispatchAction('/store-action', {
				store: this.storeName,
				newPatch,
			});
			this.patch = undefined;
		}
		else {
			this.patch = newPatch;
		}
	}

	forceUpdate(patch, prop) {
		let newPatch = patch;

		if (this.patch) {
			newPatch = Patch.combine(this.patch, patch);
		}

		this.client.dispatchAction('/store-action', {
			store: this.storeName,
			patch: newPatch,
			label: this.labelGenerator(prop),
		});
		this.patch = undefined;
	}
}

export {registerToUndoStack, BatchUpdate};
