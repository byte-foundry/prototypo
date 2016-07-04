import Remutable from 'remutable';

const debugStore = new Remutable({
	events: [],
	values: {},
});

const eventBackLog = new Remutable({
	from: 0,
	eventList: [ ],
});

const fontTab = new Remutable({});

const fontControls = new Remutable({
	values: {},
});

const fontParameters = new Remutable({});

const sideBarTab = new Remutable({});

const fontStore = new Remutable({});

const tagStore = new Remutable({
	selected: 'all',
	pinned: [],
});

const glyphs = new Remutable({
	selected: 'A',
});

const templateList = new Remutable({
	list: [
		{
			sample: 'elzevir-preview.svg',
			name: 'Prototypo Elzevir',
			familyName: 'Prototypo Elzevir',
			templateName: 'elzevir.ptf',
		},
		{
			sample: 'venus-preview.svg',
			name: 'Prototypo Grotesk',
			familyName: 'Prototypo Grotesk',
			templateName: 'venus.ptf',
		},
		{
			sample: 'john-fell-preview.svg',
			name: 'Prototypo Fell',
			familyName: 'Prototypo Fell',
			templateName: 'john-fell.ptf',
		},
	],
});

const planStore = new Remutable({
	personal_monthly: {
		id: 'personal_monthly',
		name: 'Monthly billing',
		amount: '15',
		USD: '$15.00',
		EUR: '15.00€',
		period: 'month',
		info: 'Without commitment!',
	},
	personal_annual_99: {
		id: 'personal_annual_99',
		name: 'Annual billing',
		amount: '99',
		period: 'year',
		USD: '$99.00',
		EUR: '99.00€',
		info: '5 months free compared to monthly billing!',
	},
});

const couponStore = new Remutable({
	'58e088c97aa400b0498fa3d11640ada8': '5$ off your first month!'
});

const fontLibrary = new Remutable({
	fonts: [],
});

const fontVariant = new Remutable({
});

const fontInfos = new Remutable({
	altList: {},
});

const panel = new Remutable({
	mode: [],
	textFontSize: 2.1,
	wordFontSize: 4.5,
});

const commits = new Remutable({
});

const exportStore = new Remutable({
	export: false,
	errorExport: false,
	exportedVariant: 0,
});

const individualizeStore = new Remutable({
	selected: [],
	tagSelected: 'all',
});

const intercomStore = new Remutable({
	tags: [],
});

const searchStore = new Remutable({
	savedSearch: [],
});

const logStore = new Remutable({
	patchArray: [],
});

const glyphSelect = new Remutable({
	focused: false,
});

const userStore = new Remutable({
	infos: {
	},
	signupForm: {
		errors: [],
		inError: {},
	},
	signinForm: {
		errors: [],
		inError: {},
	},
	choosePlanForm: {
	},
	addcardForm: {
		errors: [],
		inError: {},
	},
	billingForm: {
		errors: [],
		inError: {},
	},
	confirmation: {
		errors: [],
	},
	changePasswordForm: {
		errors: [],
		inError: {},
	},
});

const stores = {
	'/debugStore': debugStore,
	'/eventBackLog': eventBackLog,
	'/fontTab': fontTab,
	'/fontControls': fontControls,
	'/fontParameters': fontParameters,
	'/sideBarTab': sideBarTab,
	'/fontStore': fontStore,
	'/tagStore': tagStore,
	'/glyphs': glyphs,
	'/templateList': templateList,
	'/fontLibrary': fontLibrary,
	'/fontVariant': fontVariant,
	'/fontInfos': fontInfos,
	'/panel': panel,
	'/commits': commits,
	'/exportStore': exportStore,
	'/individualizeStore': individualizeStore,
	'/intercomStore': intercomStore,
	'/searchStore': searchStore,
	'/userStore': userStore,
	'/glyphSelect': glyphSelect,
	'/planStore': planStore,
	/* #if debug */
	logStore,
	/* #end */
};

export default stores;
export {
	debugStore,
	eventBackLog,
	fontTab,
	fontControls,
	fontParameters,
	sideBarTab,
	fontStore,
	tagStore,
	glyphs,
	templateList,
	fontLibrary,
	fontVariant,
	fontInfos,
	panel,
	commits,
	exportStore,
	individualizeStore,
	intercomStore,
	searchStore,
	userStore,
	glyphSelect,
	planStore,
	couponStore,
	/* #if debug */
	logStore,
	/* #end */
};
