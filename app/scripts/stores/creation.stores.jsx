import Remutable from 'remutable';

const undoableStore = new Remutable({
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
	undoFrom: 0,
	undoTo: 0,
	undoEventList: [ ],
	//End undoStack store values

	//font tab store values
	fontTab: undefined,
	//End font tab store values

	//font controls store values
	controlsValues: {},
	//end font controls store values

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
	glyphs: undefined,
	glyphSelected: 'A',
	glyphLocked: false,
	//end glyphs store values

	//template list store values
	templateList: [
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
	//end template list store values

	//font library store values
	errorAddFamily: undefined,
	errorAddVariant: undefined,
	fonts: [],
	//end font library store values

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
	uiShowCollection: undefined,
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
	'/prototypoStore': prototypoStore,
	'/undoableStore': undoableStore,
	'/userStore': userStore,
};

export default stores;
export {
	prototypoStore,
	userStore,
};
