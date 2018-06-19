// @flow

type UnicodeRange = {
	begin: number,
	end: number,
};

const unicodeRanges: UnicodeRange[] = [
	{begin: 0x0000, end: 0x007f}, // Basic Latin
	{begin: 0x0080, end: 0x00ff}, // Latin-1 Supplement
	{begin: 0x0100, end: 0x017f}, // Latin Extended-A
	{begin: 0x0180, end: 0x024f}, // Latin Extended-B
	{begin: 0x0250, end: 0x02af}, // IPA Extensions
	{begin: 0x02b0, end: 0x02ff}, // Spacing Modifier Letters
	{begin: 0x0300, end: 0x036f}, // Combining Diacritical Marks
	{begin: 0x0370, end: 0x03ff}, // Greek and Coptic
	{begin: 0x2c80, end: 0x2cff}, // Coptic
	{begin: 0x0400, end: 0x04ff}, // Cyrillic
	{begin: 0x0530, end: 0x058f}, // Armenian
	{begin: 0x0590, end: 0x05ff}, // Hebrew
	{begin: 0xa500, end: 0xa63f}, // Vai
	{begin: 0x0600, end: 0x06ff}, // Arabic
	{begin: 0x07c0, end: 0x07ff}, // NKo
	{begin: 0x0900, end: 0x097f}, // Devanagari
	{begin: 0x0980, end: 0x09ff}, // Bengali
	{begin: 0x0a00, end: 0x0a7f}, // Gurmukhi
	{begin: 0x0a80, end: 0x0aff}, // Gujarati
	{begin: 0x0b00, end: 0x0b7f}, // Oriya
	{begin: 0x0b80, end: 0x0bff}, // Tamil
	{begin: 0x0c00, end: 0x0c7f}, // Telugu
	{begin: 0x0c80, end: 0x0cff}, // Kannada
	{begin: 0x0d00, end: 0x0d7f}, // Malayalam
	{begin: 0x0e00, end: 0x0e7f}, // Thai
	{begin: 0x0e80, end: 0x0eff}, // Lao
	{begin: 0x10a0, end: 0x10ff}, // Georgian
	{begin: 0x1b00, end: 0x1b7f}, // Balinese
	{begin: 0x1100, end: 0x11ff}, // Hangul Jamo
	{begin: 0x1e00, end: 0x1eff}, // Latin Extended Additional
	{begin: 0x1f00, end: 0x1fff}, // Greek Extended
	{begin: 0x2000, end: 0x206f}, // General Punctuation
	{begin: 0x2070, end: 0x209f}, // Superscripts And Subscripts
	{begin: 0x20a0, end: 0x20cf}, // Currency Symbol
	{begin: 0x20d0, end: 0x20ff}, // Combining Diacritical Marks For Symbols
	{begin: 0x2100, end: 0x214f}, // Letterlike Symbols
	{begin: 0x2150, end: 0x218f}, // Number Forms
	{begin: 0x2190, end: 0x21ff}, // Arrows
	{begin: 0x2200, end: 0x22ff}, // Mathematical Operators
	{begin: 0x2300, end: 0x23ff}, // Miscellaneous Technical
	{begin: 0x2400, end: 0x243f}, // Control Pictures
	{begin: 0x2440, end: 0x245f}, // Optical Character Recognition
	{begin: 0x2460, end: 0x24ff}, // Enclosed Alphanumerics
	{begin: 0x2500, end: 0x257f}, // Box Drawing
	{begin: 0x2580, end: 0x259f}, // Block Elements
	{begin: 0x25a0, end: 0x25ff}, // Geometric Shapes
	{begin: 0x2600, end: 0x26ff}, // Miscellaneous Symbols
	{begin: 0x2700, end: 0x27bf}, // Dingbats
	{begin: 0x3000, end: 0x303f}, // CJK Symbols And Punctuation
	{begin: 0x3040, end: 0x309f}, // Hiragana
	{begin: 0x30a0, end: 0x30ff}, // Katakana
	{begin: 0x3100, end: 0x312f}, // Bopomofo
	{begin: 0x3130, end: 0x318f}, // Hangul Compatibility Jamo
	{begin: 0xa840, end: 0xa87f}, // Phags-pa
	{begin: 0x3200, end: 0x32ff}, // Enclosed CJK Letters And Months
	{begin: 0x3300, end: 0x33ff}, // CJK Compatibility
	{begin: 0xac00, end: 0xd7af}, // Hangul Syllables
	{begin: 0xd800, end: 0xdfff}, // Non-Plane 0 *
	{begin: 0x10900, end: 0x1091f}, // Phoenicia
	{begin: 0x4e00, end: 0x9fff}, // CJK Unified Ideographs
	{begin: 0xe000, end: 0xf8ff}, // Private Use Area (plane 0)
	{begin: 0x31c0, end: 0x31ef}, // CJK Strokes
	{begin: 0xfb00, end: 0xfb4f}, // Alphabetic Presentation Forms
	{begin: 0xfb50, end: 0xfdff}, // Arabic Presentation Forms-A
	{begin: 0xfe20, end: 0xfe2f}, // Combining Half Marks
	{begin: 0xfe10, end: 0xfe1f}, // Vertical Forms
	{begin: 0xfe50, end: 0xfe6f}, // Small Form Variants
	{begin: 0xfe70, end: 0xfeff}, // Arabic Presentation Forms-B
	{begin: 0xff00, end: 0xffef}, // Halfwidth And Fullwidth Forms
	{begin: 0xfff0, end: 0xffff}, // Specials
	{begin: 0x0f00, end: 0x0fff}, // Tibetan
	{begin: 0x0700, end: 0x074f}, // Syriac
	{begin: 0x0780, end: 0x07bf}, // Thaana
	{begin: 0x0d80, end: 0x0dff}, // Sinhala
	{begin: 0x1000, end: 0x109f}, // Myanmar
	{begin: 0x1200, end: 0x137f}, // Ethiopic
	{begin: 0x13a0, end: 0x13ff}, // Cherokee
	{begin: 0x1400, end: 0x167f}, // Unified Canadian Aboriginal Syllabics
	{begin: 0x1680, end: 0x169f}, // Ogham
	{begin: 0x16a0, end: 0x16ff}, // Runic
	{begin: 0x1780, end: 0x17ff}, // Khmer
	{begin: 0x1800, end: 0x18af}, // Mongolian
	{begin: 0x2800, end: 0x28ff}, // Braille Patterns
	{begin: 0xa000, end: 0xa48f}, // Yi Syllables
	{begin: 0x1700, end: 0x171f}, // Tagalog
	{begin: 0x10300, end: 0x1032f}, // Old Italic
	{begin: 0x10330, end: 0x1034f}, // Gothic
	{begin: 0x10400, end: 0x1044f}, // Deseret
	{begin: 0x1d000, end: 0x1d0ff}, // Byzantine Musical Symbols
	{begin: 0x1d400, end: 0x1d7ff}, // Mathematical Alphanumeric Symbols
	{begin: 0xff000, end: 0xffffd}, // Private Use (plane 15)
	{begin: 0xfe00, end: 0xfe0f}, // Variation Selectors
	{begin: 0xe0000, end: 0xe007f}, // Tags
	{begin: 0x1900, end: 0x194f}, // Limbu
	{begin: 0x1950, end: 0x197f}, // Tai Le
	{begin: 0x1980, end: 0x19df}, // New Tai Lue
	{begin: 0x1a00, end: 0x1a1f}, // Buginese
	{begin: 0x2c00, end: 0x2c5f}, // Glagolitic
	{begin: 0x2d30, end: 0x2d7f}, // Tifinagh
	{begin: 0x4dc0, end: 0x4dff}, // Yijing Hexagram Symbols
	{begin: 0xa800, end: 0xa82f}, // Syloti Nagri
	{begin: 0x10000, end: 0x1007f}, // Linear B Syllabary
	{begin: 0x10140, end: 0x1018f}, // Ancient Greek Numbers
	{begin: 0x10380, end: 0x1039f}, // Ugaritic
	{begin: 0x103a0, end: 0x103df}, // Old Persian
	{begin: 0x10450, end: 0x1047f}, // Shavian
	{begin: 0x10480, end: 0x104af}, // Osmanya
	{begin: 0x10800, end: 0x1083f}, // Cypriot Syllabary
	{begin: 0x10a00, end: 0x10a5f}, // Kharoshthi
	{begin: 0x1d300, end: 0x1d35f}, // Tai Xuan Jing Symbols
	{begin: 0x12000, end: 0x123ff}, // Cuneiform
	{begin: 0x1d360, end: 0x1d37f}, // Counting Rod Numerals
	{begin: 0x1b80, end: 0x1bbf}, // Sundanese
	{begin: 0x1c00, end: 0x1c4f}, // Lepcha
	{begin: 0x1c50, end: 0x1c7f}, // Ol Chiki
	{begin: 0xa880, end: 0xa8df}, // Saurashtra
	{begin: 0xa900, end: 0xa92f}, // Kayah Li
	{begin: 0xa930, end: 0xa95f}, // Rejang
	{begin: 0xaa00, end: 0xaa5f}, // Cham
	{begin: 0x10190, end: 0x101cf}, // Ancient Symbols
	{begin: 0x101d0, end: 0x101ff}, // Phaistos Disc
	{begin: 0x102a0, end: 0x102df}, // Carian
	{begin: 0x1f030, end: 0x1f09f}, // Domino Tiles
];

export function getUnicodeRange(unicode: number): number {
	for (let i: number = 0; i < unicodeRanges.length; i++) {
		const range: UnicodeRange = unicodeRanges[i];

		if (unicode >= range.begin && unicode < range.end) {
			return i;
		}
	}

	return -1;
}
