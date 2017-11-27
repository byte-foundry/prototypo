import Remutable from 'remutable';

const undoableStore = new Remutable({
	//font controls store values
	controlsValues: {},
	//end font controls store values
});

const fastStuffStore = new Remutable({
});

const fontInstanceStore = new Remutable({
});

const prototypoStore = new Remutable({

	//Store values for debug
	debugEvents: [],
	debugValues: {},
	debugDetails: undefined,
	debugShowDetails: false,
	debugIndex: 0,
	//End store values for debug

	//undoStack Store values
	undoAt: 0,
	undoEventList: [ ],
	//End undoStack store values

	//font tab store values
	fontTab: undefined,
	//End font tab store values

	//font parameters store values
	fontParameters: undefined,
	fontPresets: undefined,
	//end font parameters store values

	//fonts store values
	fontName: undefined,
	fontGlyphs: undefined,
	//end fonts store values

	//tag store values
	tagSelected: 'all',
	tagPinned: [],
	tags: undefined,
	//end tag store values

	//glyphs store values
	glyphs: {},
	glyphSelected: 'A',
	glyphLocked: false,
	//end glyphs store values

	//template list store values
	templateList: [
		{
			sample: 'spectral-preview.svg',
			sampleLarge: 'template-spectral.svg',
			name: 'Spectral',
			familyName: 'Spectral',
			templateName: 'gfnt.ptf',
			provider: 'google',
		},
		{
			sample: 'antique-sample.svg',
			sampleLarge: 'template-antique.svg',
			name: 'Prototypo Antique Gothic',
			familyName: 'Prototypo Antique Gothic',
			templateName: 'antique.ptf',
			provider: 'production',
		},
		{
			sample: 'elzevir-preview.svg',
			sampleLarge: 'template-elzevir.svg',
			name: 'Prototypo Elzevir',
			familyName: 'Prototypo Elzevir',
			templateName: 'elzevir.ptf',
			provider: 'prototypo',
		},
		{
			sample: 'venus-preview.svg',
			sampleLarge: 'template-grotesk.svg',
			name: 'Prototypo Grotesk',
			familyName: 'Prototypo Grotesk',
			templateName: 'venus.ptf',
			provider: 'prototypo',
		},
		{
			sample: 'john-fell-preview.svg',
			sampleLarge: 'template-fell.svg',
			name: 'Prototypo Fell',
			familyName: 'Prototypo Fell',
			templateName: 'john-fell.ptf',
			provider: 'prototypo',
		},
	],

	//end template list store values

	//font variant store values
	openFamilyModal: false,
	openVariantModal: false,
	familySelectedVariantCreation: false,
	changeNameFamily: false,
	variant: {},
	family: {},
	collectionSelectedFamily: undefined,
	collectionSelectedVariant: undefined,
	//end font

	//font infos store values
	altList: {},
	//end font infos store values

	//ui store values
	uiMode: [],
	uiTextFontSize: 2.1,
	uiWordFontSize: 4.5,
	uiInvertedWordColors: undefined,
	uiInvertedWordView: undefined,
	uiInvertedTextColors: undefined,
	uiInvertedTextView: undefined,
	uiOnboardstep: undefined,
	uiOnboard: undefined,
	uiList: undefined,
	uiPos: undefined,
	uiZoom: undefined,
	uiNodes: undefined,
	uiOutline: undefined,
	uiCoords: undefined,
	uiShadow: undefined,
	uiText: '',
	uiWord: '',
	uiFontLoading: false,
	uiCreatefamilySelectedTemplate: undefined,
	canvasMode: 'move',
	uiSliderTooltip: undefined,
	//end ui store values

	//commits store values
	commitsList: [],
	latestCommit: '',
	//end commits store values

	//export store values
	export: false,
	errorExport: false,
	exportedVariant: 0,
	familyExported: undefined,
	variantToExport: undefined,
	//end export store values

	//indiv store values
	indivMode: false,
	indivSelected: [],
	indivTagSelected: 'all',
	indivCreate: false,
	indivEdit: false,
	indivCurrentGroup: undefined,
	indivGroups: undefined,
	indivPreDelete: undefined,
	indivEditGroup: undefined,
	indivGlyphGrid: undefined,
	indivOtherGroups: undefined,
	indivErrorEdit: undefined,
	indivErrorMessage: undefined,
	indivErrorGlyphs: [],
	//end indiv store values

	//intercom store values
	intecomTags: undefined,
	//end intercom store values

	//search store values
	savedSearch: [],
	glyphSearch: undefined,
	pinnedSearch: undefined,
	savedSearchError: undefined,
	//end search store values

	//log store values
	/* #if debug */
	patchArray: [],
	/* #end */
	//end log store values

	//glyph select store values
	glyphFocused: false,
	//end glyph select store values

	// first time tutorial store values
	firstTimeFile: true,
	firstTimeCollection: true,
	firstTimeIndivCreate: true,
	firstTimeIndivEdit: true,
	firstTimeAcademyModal: true,
	firstTimeAcademyJoyride: true,
	// end first time tutorial store values
});

const userStore = new Remutable({
	subscription: false,
	cards: [],
	profileForm: {
		errors: [],
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
	confirmation: {
		errors: [],
	},
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
	personal_annual: {
		id: 'personal_annual',
		name: 'Annual billing',
		amount: '144',
		period: 'year',
		USD: '$144.00',
		EUR: '144.00€',
	},
});

// [item]: [cost in credits]
const creditStore = new Remutable({
	exportOtf: 1,
	exportGlyphr: 1,
});

const stores = {
	'/prototypoStore': prototypoStore,
	'/fontInstanceStore': fontInstanceStore,
	'/undoableStore': undoableStore,
	'/fastStuffStore': fastStuffStore,
	'/userStore': userStore,
	'/planStore': planStore,
	'/creditStore': creditStore,
};

export default stores;
export {
	fontInstanceStore,
	prototypoStore,
	undoableStore,
	fastStuffStore,
	userStore,
	planStore,
	creditStore,
};
