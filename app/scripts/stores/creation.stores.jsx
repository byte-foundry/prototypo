import Remutable from 'remutable';

const undoableStore = new Remutable({
	//font controls store values
	controlsValues: {},
	//end font controls store values
});

const fastStuffStore = new Remutable({
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
	uiCreatefamilySelectedTemplate: undefined,
	canvasMode: 'move',
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
	// end first time tutorial store values
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
	buyCreditsForm: {
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

// how to add a coupon hash:
// 1. open a terminal in the prototypo directory
// 2. enter 'node' in the terminal
// 3. enter require('md5')('<coupon name>' + '.' + '<plan name>'); -> 'personal_annual_99' for example
// 4. paste the resulting hash here. shouldSkipCard is true when no card is
// required to subscribe to that plan (first month free for example).
const couponStore = new Remutable({
	'58e088c97aa400b0498fa3d11640ada8': {label: '$5 off your first month!'},
	'98d317f6598ce579eda20ec39e964203': {label: '$5 off your first month to celebrate our 10.000 users!'},
	'aa5355e6d09f960bd1010de998c079b2': {label: '50% off the annual price for schools!'}, // for persoNnal_annual. We should remove this later.
	'dfbc3313a2e4a0e1a46a96bb5e279121': {label: '50% off the annual price for schools!'},
	'97bfd3de0b6b8a38c78eaefb9f80313e': {label: 'You\'ve been referred by Dave. Enjoy your $5 discount :)'},
	'039fb1672f2148408a38abcd458c2b97': {label: 'You\'ve been referred by Ferdie. Enjoy your $5 discount :)'},
	'c5eeb05f4cfffc1dc8d8dba41848610e': {label: 'You\'ve been referred by Dominik. Enjoy your $5 discount :)'},
	'd0bbbbdc70993e53a67a7702b0343592': {label: 'You\'ve been referred by Manuel. Enjoy your $5 discount :)'},
	'3005f57f7a51ca170359a0e9e7f09668': {label: 'You\'ve been referred by Bea. Enjoy your $5 discount :)'},
	'43747a0358db2c16489c41267f3428f1': {label: 'You\'ve been referred by Tiago. Enjoy your $5 discount :)'},
	'cc57f5fc5ec2eec84babfe6fdf774548': {label: 'You\'ve been referred by Fraser. Enjoy your $5 discount :)'},
	'30172db2927d6ff9666a7eecfafc006c': {label: 'You\'ve been referred by Jan. Enjoy your $5 discount :)'},
	'8905f6bdae64fc09e14206cbc0161241': {label: '30% off your first month!'},
	'fee64920dd5880a397e9127b85fc891b': {label: '66% off your first month!'},
	'ec97fbff4acbb75abae0951d899bf580': {label: '70% off the annual price for schools!'},
	'9840edae45eeeaefa0591cd872c583ed': {label: 'The first month for $5!'},
	'de7ce5e5ee6d2527aa5aa0d1f624e704': {label: '50% off your annual subscription - Domestika discount'},
	'14a6c65efc3f285ea0b2f45d75f73bde': {label: 'The first month for $5!'},
	'b6f30aee2d4b895d61a2f72e6901c4e0': {label: 'Birthday offer, your first month for $1!'},
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
	'/undoableStore': undoableStore,
	'/fastStuffStore': fastStuffStore,
	'/userStore': userStore,
	'/planStore': planStore,
	'/creditStore': creditStore,
};

export default stores;
export {
	prototypoStore,
	undoableStore,
	fastStuffStore,
	userStore,
	couponStore,
	planStore,
	creditStore,
};
