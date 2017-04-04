// @flow

type UnicodeRange = {
    begin: number,
    end: number,
}

const LIMIT16 = 32768; // The limit at which a 16-bit number switches signs == 2^15
const LIMIT32 = 2147483648; // The limit at which a 32-bit number switches signs == 2 ^ 31

const unicodeRanges: UnicodeRange[] = [
    {begin: 0x0000, end: 0x007F}, // Basic Latin
    {begin: 0x0080, end: 0x00FF}, // Latin-1 Supplement
    {begin: 0x0100, end: 0x017F}, // Latin Extended-A
    {begin: 0x0180, end: 0x024F}, // Latin Extended-B
    {begin: 0x0250, end: 0x02AF}, // IPA Extensions
    {begin: 0x02B0, end: 0x02FF}, // Spacing Modifier Letters
    {begin: 0x0300, end: 0x036F}, // Combining Diacritical Marks
    {begin: 0x0370, end: 0x03FF}, // Greek and Coptic
    {begin: 0x2C80, end: 0x2CFF}, // Coptic
    {begin: 0x0400, end: 0x04FF}, // Cyrillic
    {begin: 0x0530, end: 0x058F}, // Armenian
    {begin: 0x0590, end: 0x05FF}, // Hebrew
    {begin: 0xA500, end: 0xA63F}, // Vai
    {begin: 0x0600, end: 0x06FF}, // Arabic
    {begin: 0x07C0, end: 0x07FF}, // NKo
    {begin: 0x0900, end: 0x097F}, // Devanagari
    {begin: 0x0980, end: 0x09FF}, // Bengali
    {begin: 0x0A00, end: 0x0A7F}, // Gurmukhi
    {begin: 0x0A80, end: 0x0AFF}, // Gujarati
    {begin: 0x0B00, end: 0x0B7F}, // Oriya
    {begin: 0x0B80, end: 0x0BFF}, // Tamil
    {begin: 0x0C00, end: 0x0C7F}, // Telugu
    {begin: 0x0C80, end: 0x0CFF}, // Kannada
    {begin: 0x0D00, end: 0x0D7F}, // Malayalam
    {begin: 0x0E00, end: 0x0E7F}, // Thai
    {begin: 0x0E80, end: 0x0EFF}, // Lao
    {begin: 0x10A0, end: 0x10FF}, // Georgian
    {begin: 0x1B00, end: 0x1B7F}, // Balinese
    {begin: 0x1100, end: 0x11FF}, // Hangul Jamo
    {begin: 0x1E00, end: 0x1EFF}, // Latin Extended Additional
    {begin: 0x1F00, end: 0x1FFF}, // Greek Extended
    {begin: 0x2000, end: 0x206F}, // General Punctuation
    {begin: 0x2070, end: 0x209F}, // Superscripts And Subscripts
    {begin: 0x20A0, end: 0x20CF}, // Currency Symbol
    {begin: 0x20D0, end: 0x20FF}, // Combining Diacritical Marks For Symbols
    {begin: 0x2100, end: 0x214F}, // Letterlike Symbols
    {begin: 0x2150, end: 0x218F}, // Number Forms
    {begin: 0x2190, end: 0x21FF}, // Arrows
    {begin: 0x2200, end: 0x22FF}, // Mathematical Operators
    {begin: 0x2300, end: 0x23FF}, // Miscellaneous Technical
    {begin: 0x2400, end: 0x243F}, // Control Pictures
    {begin: 0x2440, end: 0x245F}, // Optical Character Recognition
    {begin: 0x2460, end: 0x24FF}, // Enclosed Alphanumerics
    {begin: 0x2500, end: 0x257F}, // Box Drawing
    {begin: 0x2580, end: 0x259F}, // Block Elements
    {begin: 0x25A0, end: 0x25FF}, // Geometric Shapes
    {begin: 0x2600, end: 0x26FF}, // Miscellaneous Symbols
    {begin: 0x2700, end: 0x27BF}, // Dingbats
    {begin: 0x3000, end: 0x303F}, // CJK Symbols And Punctuation
    {begin: 0x3040, end: 0x309F}, // Hiragana
    {begin: 0x30A0, end: 0x30FF}, // Katakana
    {begin: 0x3100, end: 0x312F}, // Bopomofo
    {begin: 0x3130, end: 0x318F}, // Hangul Compatibility Jamo
    {begin: 0xA840, end: 0xA87F}, // Phags-pa
    {begin: 0x3200, end: 0x32FF}, // Enclosed CJK Letters And Months
    {begin: 0x3300, end: 0x33FF}, // CJK Compatibility
    {begin: 0xAC00, end: 0xD7AF}, // Hangul Syllables
    {begin: 0xD800, end: 0xDFFF}, // Non-Plane 0 *
    {begin: 0x10900, end: 0x1091F}, // Phoenicia
    {begin: 0x4E00, end: 0x9FFF}, // CJK Unified Ideographs
    {begin: 0xE000, end: 0xF8FF}, // Private Use Area (plane 0)
    {begin: 0x31C0, end: 0x31EF}, // CJK Strokes
    {begin: 0xFB00, end: 0xFB4F}, // Alphabetic Presentation Forms
    {begin: 0xFB50, end: 0xFDFF}, // Arabic Presentation Forms-A
    {begin: 0xFE20, end: 0xFE2F}, // Combining Half Marks
    {begin: 0xFE10, end: 0xFE1F}, // Vertical Forms
    {begin: 0xFE50, end: 0xFE6F}, // Small Form Variants
    {begin: 0xFE70, end: 0xFEFF}, // Arabic Presentation Forms-B
    {begin: 0xFF00, end: 0xFFEF}, // Halfwidth And Fullwidth Forms
    {begin: 0xFFF0, end: 0xFFFF}, // Specials
    {begin: 0x0F00, end: 0x0FFF}, // Tibetan
    {begin: 0x0700, end: 0x074F}, // Syriac
    {begin: 0x0780, end: 0x07BF}, // Thaana
    {begin: 0x0D80, end: 0x0DFF}, // Sinhala
    {begin: 0x1000, end: 0x109F}, // Myanmar
    {begin: 0x1200, end: 0x137F}, // Ethiopic
    {begin: 0x13A0, end: 0x13FF}, // Cherokee
    {begin: 0x1400, end: 0x167F}, // Unified Canadian Aboriginal Syllabics
    {begin: 0x1680, end: 0x169F}, // Ogham
    {begin: 0x16A0, end: 0x16FF}, // Runic
    {begin: 0x1780, end: 0x17FF}, // Khmer
    {begin: 0x1800, end: 0x18AF}, // Mongolian
    {begin: 0x2800, end: 0x28FF}, // Braille Patterns
    {begin: 0xA000, end: 0xA48F}, // Yi Syllables
    {begin: 0x1700, end: 0x171F}, // Tagalog
    {begin: 0x10300, end: 0x1032F}, // Old Italic
    {begin: 0x10330, end: 0x1034F}, // Gothic
    {begin: 0x10400, end: 0x1044F}, // Deseret
    {begin: 0x1D000, end: 0x1D0FF}, // Byzantine Musical Symbols
    {begin: 0x1D400, end: 0x1D7FF}, // Mathematical Alphanumeric Symbols
    {begin: 0xFF000, end: 0xFFFFD}, // Private Use (plane 15)
    {begin: 0xFE00, end: 0xFE0F}, // Variation Selectors
    {begin: 0xE0000, end: 0xE007F}, // Tags
    {begin: 0x1900, end: 0x194F}, // Limbu
    {begin: 0x1950, end: 0x197F}, // Tai Le
    {begin: 0x1980, end: 0x19DF}, // New Tai Lue
    {begin: 0x1A00, end: 0x1A1F}, // Buginese
    {begin: 0x2C00, end: 0x2C5F}, // Glagolitic
    {begin: 0x2D30, end: 0x2D7F}, // Tifinagh
    {begin: 0x4DC0, end: 0x4DFF}, // Yijing Hexagram Symbols
    {begin: 0xA800, end: 0xA82F}, // Syloti Nagri
    {begin: 0x10000, end: 0x1007F}, // Linear B Syllabary
    {begin: 0x10140, end: 0x1018F}, // Ancient Greek Numbers
    {begin: 0x10380, end: 0x1039F}, // Ugaritic
    {begin: 0x103A0, end: 0x103DF}, // Old Persian
    {begin: 0x10450, end: 0x1047F}, // Shavian
    {begin: 0x10480, end: 0x104AF}, // Osmanya
    {begin: 0x10800, end: 0x1083F}, // Cypriot Syllabary
    {begin: 0x10A00, end: 0x10A5F}, // Kharoshthi
    {begin: 0x1D300, end: 0x1D35F}, // Tai Xuan Jing Symbols
    {begin: 0x12000, end: 0x123FF}, // Cuneiform
    {begin: 0x1D360, end: 0x1D37F}, // Counting Rod Numerals
    {begin: 0x1B80, end: 0x1BBF}, // Sundanese
    {begin: 0x1C00, end: 0x1C4F}, // Lepcha
    {begin: 0x1C50, end: 0x1C7F}, // Ol Chiki
    {begin: 0xA880, end: 0xA8DF}, // Saurashtra
    {begin: 0xA900, end: 0xA92F}, // Kayah Li
    {begin: 0xA930, end: 0xA95F}, // Rejang
    {begin: 0xAA00, end: 0xAA5F}, // Cham
    {begin: 0x10190, end: 0x101CF}, // Ancient Symbols
    {begin: 0x101D0, end: 0x101FF}, // Phaistos Disc
    {begin: 0x102A0, end: 0x102DF}, // Carian
    {begin: 0x1F030, end: 0x1F09F},  // Domino Tiles
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

function constant(v) {
	return function() {
		return v;
	};
}

const encode = {};
const sizeOf = {};

encode.BYTE = (v) => {
	check.argument(v >= 0 && v <= 255, 'Byte value should be between 0 and 255.');
    return [v];
};

sizeOf.BYTE = constant(1);

encode.CHAR = (v) => {
    return [v.charCodeAt(0)];
};

sizeOf.CHAR = constant(1);

encode.CHARARRAY = (v) => {
    const b = [];

    for (let i = 0; i < v.length; i += 1) {
        b[i] = v.charCodeAt(i);
    }

    return b;
};

sizeOf.CHARARRAY = (v) => {
	return v.length;
};

encode.USHORT = (v) => {
    return [(v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.USHORT = constant(2);

encode.UINT24 = (v) => {
    return [(v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.UINT24 = constant(3);

encode.ULONG = (v) => {
    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.ULONG = constant(4);

encode.LONG = (v) => {
    // Two's complement
    if (v >= LIMIT32) {
        v = -(2 * LIMIT32 - v);
    }

    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.LONG = constant(4);

encode.FIXED = encode.ULONG;
sizeOf.FIXED = sizeOf.ULONG;

encode.FWORD = encode.SHORT;
sizeOf.FWORD = sizeOf.SHORT;

encode.UFWORD = encode.USHORT;
sizeOf.UFWORD = sizeOf.USHORT;

encode.LONGDATETIME = (v) => {
    return [0, 0, 0, 0, (v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.LONGDATETIME = constant(8);

encode.TAG = (v) => {
    check.argument(v.length === 4, 'Tag should be exactly 4 ASCII characters.');
    return [v.charCodeAt(0),
            v.charCodeAt(1),
            v.charCodeAt(2),
            v.charCodeAt(3)];
};

sizeOf.TAG = constant(4);

encode.Card8 = encode.BYTE;
sizeOf.Card8 = sizeOf.BYTE;

encode.Card16 = encode.USHORT;
sizeOf.Card16 = sizeOf.USHORT;

encode.OffSize = encode.BYTE;
sizeOf.OffSize = sizeOf.BYTE;

encode.SID = encode.USHORT;
sizeOf.SID = sizeOf.USHORT;

encode.NUMBER = (v) => {
    if (v >= -107 && v <= 107) {
        return [v + 139];
	}
	else if (v >= 108 && v <= 1131) {
        const val = v - 108;

        return [(val >> 8) + 247, val & 0xFF];
	}
	else if (v >= -1131 && v <= -108) {
        const val = -v - 108;

        return [(val >> 8) + 251, val & 0xFF];
	}
	else if (v >= -32768 && v <= 32767) {
        return encode.NUMBER16(v);
	}
	else {
        return encode.NUMBER32(v);
    }
};

sizeOf.NUMBER = (v) => {
    return encode.NUMBER(v).length;
};

encode.NUMBER16 = (v) => {
    return [28, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.NUMBER16 = constant(3);

encode.NUMBER32 = (v) => {
    return [29, (v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};

sizeOf.NUMBER32 = constant(4);

encode.REAL = (v) => {
    let value = v.toString();

    // Some numbers use an epsilon to encode the value. (e.g. JavaScript will store 0.0000001 as 1e-7)
    // This code converts it back to a number without the epsilon.
    const m = /\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(value);

    if (m) {
        const epsilon = parseFloat(`1e${((m[2] ? +m[2] : 0) + m[1].length)}`);

        value = (Math.round(v * epsilon) / epsilon).toString();
    }

    let nibbles = '';
    let i;

    for (i = 0; i < value.length; i++) {
        const c = value[i];

        if (c === 'e') {
            nibbles += value[++i] === '-' ? 'c' : 'b';
		}
		else if (c === '.') {
            nibbles += 'a';
		}
		else if (c === '-') {
            nibbles += 'e';
		}
		else {
            nibbles += c;
        }
    }

    nibbles += (nibbles.length & 1) ? 'f' : 'ff';
    const out = [30];

    for (i = 0, ii = nibbles.length; i < ii; i += 2) {
        out.push(parseInt(nibbles.substr(i, 2), 16));
    }

    return out;
};

sizeOf.REAL = (v) => {
	return encode.REAL(v).length;
};

encode.NAME = encode.CHARARRAY;
sizeOf.NAME = sizeOf.CHARARRAY;

encode.STRING = encode.CHARARRAY;
sizeOf.STRING = sizeOf.CHARARRAY;

encode.UTF16 = (v) => {
    const b = [];

    for (let i = 0; i < v.length; i++) {
        const codepoint = v.charCodeAt(i);

        b[b.length] = (codepoint >> 8) & 0xFF;
        b[b.length] = codepoint & 0xFF;
    }

    return b;
};

/**
 * @param {string}
 * @returns {number}
 */
sizeOf.UTF16 = (v) => {
    return v.length * 2;
};

const eightBitMacEncodings = {
	'x-mac-croatian': // Python: 'mac_croatian'
		'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø'
		+ '¿¡¬√≈Ć«Č… ÀÃÕŒœĐ“”‘’÷◊©⁄€Æ»·„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙı¯πË˚¸Êæˇ',
    'x-mac-cyrillic': // Python: 'mac_cyrillic'
		'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°£§¶І®©™Ђђ≠Ѓѓ∞±≤≥іµЈЄєЇїЉљЊњ'
		+ 'јЅ¬√≈∆«»… ЋћЌќѕ“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю',
    'x-mac-gaelic':
        // http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/GAELIC.TXT
		'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæø'
		+ 'ṁṖṗɼſṠ«»… ÀÃÕŒœ“”‘’ṡẛÿŸṪ€Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ',
    'x-mac-greek': // Python: 'mac_greek'
		'Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩ'
		+ 'άΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ\u00AD',
    'x-mac-icelandic': // Python: 'mac_iceland'
		'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø'
		+ '¿¡¬√≈∆«»… ÀÃÕŒœ“”‘’÷◊ÿŸ⁄€ÐðÞþý·„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙı¯˘˙˚¸˝˛ˇ',
    'x-mac-inuit':
        // http://unicode.org/Public/MAPPINGS/VENDORS/APPLE/INUIT.TXT
		'ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗ'
		+ 'ᓘᓚᓛᓪᔨᔩᔪᔫᔭ… ᔮᔾᕕᕖᕗ“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł',
    'x-mac-ce': // Python: 'mac_latin2'
		'ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅ'
		+ 'ņŃ¬√ńŇ∆«»… ňŐÕőŌ“”‘’÷◊ōŔŕŘřŖŗŠ„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ',
    macintosh: // Python: 'mac_roman'
		'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø'
		+ '¿¡¬√≈∆«»… ÀÃÕŒœ“”‘’÷◊ÿŸ⁄€ﬁﬂ‡·„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙı¯˘˙˚¸˝˛ˇ',
    'x-mac-romanian': // Python: 'mac_romanian'
		'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș'
		+ '¿¡¬√≈∆«»… ÀÃÕŒœ“”‘’÷◊ÿŸ⁄€Țț‡·„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙı¯˘˙˚¸˝˛ˇ',
    'x-mac-turkish': // Python: 'mac_turkish'
		'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø'
		+ '¿¡¬√≈∆«»… ÀÃÕŒœ“”‘’÷◊ÿŸĞğİıŞş‡·„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙ¯˘˙˚¸˝˛ˇ',
};

const macEncodingTableCache = typeof WeakMap === 'function' && new WeakMap();
let macEncodingCacheKeys;
const getMacEncodingTable = (encoding) => {
    // Since we use encoding as a cache key for WeakMap, it has to be
    // a String object and not a literal. And at least on NodeJS 2.10.1,
    // WeakMap requires that the same String instance is passed for cache hits.
    if (!macEncodingCacheKeys) {
        macEncodingCacheKeys = {};

		_.forOwn(eightBitMacEncodings, (value, key) => {
            macEncodingCacheKeys[key] = new String(key);
		});
    }

    const cacheKey = macEncodingCacheKeys[encoding];

    if (cacheKey === undefined) {
        return undefined;
    }

    // We can't do "if (cache.has(key)) {return cache.get(key)}" here:
    // since garbage collection may run at any time, it could also kick in
    // between the calls to cache.has() and cache.get(). In that case,
    // we would return 'undefined' even though we do support the encoding.
    if (macEncodingTableCache) {
        const cachedTable = macEncodingTableCache.get(cacheKey);

        if (cachedTable !== undefined) {
            return cachedTable;
        }
    }

    const decodingTable = eightBitMacEncodings[encoding];

    if (decodingTable === undefined) {
        return undefined;
    }

    const encodingTable = {};

    for (let i = 0; i < decodingTable.length; i++) {
        encodingTable[decodingTable.charCodeAt(i)] = i + 0x80;
    }

    if (macEncodingTableCache) {
        macEncodingTableCache.set(cacheKey, encodingTable);
    }

    return encodingTable;
};

encode.MACSTRING = (str, encoding) => {
    const table = getMacEncodingTable(encoding);

    if (table === undefined) {
        return undefined;
    }

    const result = [];

    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);

        // In all eight-bit Mac encodings, the characters 0x00..0x7F are
        // mapped to U+0000..U+007F; we only need to look up the others.
        if (c >= 0x80) {
            c = table[c];
            if (c === undefined) {
                // str contains a Unicode character that cannot be encoded
                // in the requested encoding.
                return undefined;
            }
        }
        result[i] = c;
        // result.push(c);
    }

    return result;
};

sizeOf.MACSTRING = (str, encoding) => {
    const b = encode.MACSTRING(str, encoding);

    if (b === undefined) {
        return 0;
	}
	else {
        return b.length;
    }
};

// Helper for encode.VARDELTAS
function isByteEncodable(value) {
    return value >= -128 && value <= 127;
}

// Helper for encode.VARDELTAS
function encodeVarDeltaRunAsZeroes(deltas, pos, result) {
    let runLength = 0;
    const numDeltas = deltas.length;
	let position = pos;

    while (position < numDeltas && runLength < 64 && deltas[position] === 0) {
        ++position;
        ++runLength;
    }
    result.push(0x80 | (runLength - 1));
    return position;
}

// Helper for encode.VARDELTAS
function encodeVarDeltaRunAsBytes(deltas, offset, result) {
    let runLength = 0;
    const numDeltas = deltas.length;
    let pos = offset;

    while (pos < numDeltas && runLength < 64) {
        const value = deltas[pos];

        if (!isByteEncodable(value)) {
            break;
        }

        // Within a byte-encoded run of deltas, a single zero is best
        // stored literally as 0x00 value. However, if we have two or
        // more zeroes in a sequence, it is better to start a new run.
        // Fore example, the sequence of deltas [15, 15, 0, 15, 15]
        // becomes 6 bytes (04 0F 0F 00 0F 0F) when storing the zero
        // within the current run, but 7 bytes (01 0F 0F 80 01 0F 0F)
        // when starting a new run.
        if (value === 0 && pos + 1 < numDeltas && deltas[pos + 1] === 0) {
            break;
        }

        ++pos;
        ++runLength;
    }

    result.push(runLength - 1);

    for (let i = offset; i < pos; i++) {
        result.push((deltas[i] + 256) & 0xff);
    }

    return pos;
}

// Helper for encode.VARDELTAS
function encodeVarDeltaRunAsWords(deltas, offset, result) {
    let runLength = 0;
    const numDeltas = deltas.length;
    let pos = offset;

    while (pos < numDeltas && runLength < 64) {
        const value = deltas[pos];

        // Within a word-encoded run of deltas, it is easiest to start
        // a new run (with a different encoding) whenever we encounter
        // a zero value. For example, the sequence [0x6666, 0, 0x7777]
        // needs 7 bytes when storing the zero inside the current run
        // (42 66 66 00 00 77 77), and equally 7 bytes when starting a
        // new run (40 66 66 80 40 77 77).
        if (value === 0) {
            break;
        }

        // Within a word-encoded run of deltas, a single value in the
        // range (-128..127) should be encoded within the current run
        // because it is more compact. For example, the sequence
        // [0x6666, 2, 0x7777] becomes 7 bytes when storing the value
        // literally (42 66 66 00 02 77 77), but 8 bytes when starting
        // a new run (40 66 66 00 02 40 77 77).
        if (isByteEncodable(value) && pos + 1 < numDeltas && isByteEncodable(deltas[pos + 1])) {
            break;
        }

        ++pos;
        ++runLength;
    }

    result.push(0x40 | (runLength - 1));

    for (let i = offset; i < pos; i++) {
        const val = deltas[i];

        result.push(((val + 0x10000) >> 8) & 0xff, (val + 0x100) & 0xff);
    }

    return pos;
}

/**
 * Encode a list of variation adjustment deltas.
 *
 * Variation adjustment deltas are used in ‘gvar’ and ‘cvar’ tables.
 * They indicate how points (in ‘gvar’) or values (in ‘cvar’) get adjusted
 * when generating instances of variation fonts.
 *
 * @see https://www.microsoft.com/typography/otspec/gvar.htm
 * @see https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6gvar.html
 * @param {Array}
 * @return {Array}
 */
encode.VARDELTAS = (deltas) => {
    let pos = 0;
    const result = [];

    while (pos < deltas.length) {
        const value = deltas[pos];

        if (value === 0) {
            pos = encodeVarDeltaRunAsZeroes(deltas, pos, result);
		}
		else if (value >= -128 && value <= 127) {
            pos = encodeVarDeltaRunAsBytes(deltas, pos, result);
		}
		else {
            pos = encodeVarDeltaRunAsWords(deltas, pos, result);
        }
    }

    return result;
};

encode.INDEX = (l) => {
    let i;
    //var offset, offsets, offsetEncoder, encodedOffsets, encodedOffset, data,
    //    i, v;
    // Because we have to know which data type to use to encode the offsets,
    // we have to go through the values twice: once to encode the data and
    // calculate the offets, then again to encode the offsets using the fitting data type.
    let offset = 1; // First offset is always 1.
    const offsets = [offset];
    const data = [];

    for (i = 0; i < l.length; i++) {
        const v = encode.OBJECT(l[i]);

        data.push(...v);
        offset += v.length;
        offsets.push(offset);
    }

    if (data.length === 0) {
        return [0, 0];
    }

    const encodedOffsets = [];
    const offSize = (1 + Math.floor(Math.log(offset) / Math.log(2)) / 8) | 0;
    const offsetEncoder = [undefined, encode.BYTE, encode.USHORT, encode.UINT24, encode.ULONG][offSize];

    for (i = 0; i < offsets.length; i += 1) {
        const encodedOffset = offsetEncoder(offsets[i]);

        encodedOffsets.push(...encodedOffset);
    }

    return Array.prototype.concat(encode.Card16(l.length),
                           encode.OffSize(offSize),
                           encodedOffsets,
                           data);
};

sizeOf.INDEX = (v) => {
    return encode.INDEX(v).length;
};

encode.DICT = (m) => {
    let d = [];
    const keys = Object.keys(m);
    const length = keys.length;

    for (let i = 0; i < length; i++) {
        // Object.keys() return string keys, but our keys are always numeric.
        const k = parseInt(keys[i], 0);
        const v = m[k];

        // Value comes before the key.
        d = d.concat(encode.OPERAND(v.value, v.type));
        d = d.concat(encode.OPERATOR(k));
    }

    return d;
};

sizeOf.DICT = (m) => {
    return encode.DICT(m).length;
};

/**
 * @param {number}
 * @returns {Array}
 */
encode.OPERATOR = (v) => {
    if (v < 1200) {
        return [v];
	}
	else {
        return [12, v - 1200];
    }
};

encode.OPERAND = (v, type) => {
    let d = [];

    if (Array.isArray(type)) {
        for (let i = 0; i < type.length; i++) {
            check.argument(v.length === type.length, `Not enough arguments given for type ${type}`);
            d = d.concat(encode.OPERAND(v[i], type[i]));
        }
	}
	else if (type === 'SID') {
		d = d.concat(encode.NUMBER(v));
	}
	else if (type === 'offset') {
		// We make it easy for ourselves and always encode offsets as
		// 4 bytes. This makes offset calculation for the top dict easier.
		d = d.concat(encode.NUMBER32(v));
	}
	else if (type === 'number') {
		d = d.concat(encode.NUMBER(v));
	}
	else if (type === 'real') {
		d = d.concat(encode.REAL(v));
	}
	else {
		throw new Error(`Unknown operand type ${type}`);
		// FIXME Add support for booleans
	}

    return d;
};

encode.OP = encode.BYTE;
sizeOf.OP = sizeOf.BYTE;

const charStringCache = typeof WeakMap === 'function' && new WeakMap();

encode.CHARSTRING = (ops) => {
    // See encode.MACSTRING for why we don't do "if (wmm && wmm.has(ops))".
    if (charStringCache) {
        const cachedValue = charStringCache.get(ops);

        if (cachedValue !== undefined) {
            return cachedValue;
        }
    }

    let d = [];
    const length = ops.length;

    for (let i = 0; i < length; i++) {
        const op = ops[i];

        d = d.concat(encode[op.type](op.value));
    }

    if (charStringCache) {
        charStringCache.set(ops, d);
    }

    return d;
};

sizeOf.CHARSTRING = (ops) => {
    return encode.CHARSTRING(ops).length;
};

encode.OBJECT = (v) => {
    const encodingFunction = encode[v.type];

    check.argument(encodingFunction !== undefined, `No encoding function for type ${v.type}`);
    return encodingFunction(v.value);
};

sizeOf.OBJECT = (v) => {
    const sizeOfFunction = sizeOf[v.type];

    check.argument(sizeOfFunction !== undefined, `No sizeOf function for type ${v.type}`);
    return sizeOfFunction(v.value);
};

encode.TABLE = (table) => {
	let d = [];
	const length = table.fields.length;
	const subtables = [];
	const subtableOffsets = [];

	for (let i = 0; i < length; i++) {
		const field = table.fields[i];
		const encodingFunction = encode[field.type];
		let value = table[field.name];

		check.argument(encodingFunction !== undefined, `No encoding function for field type ${field.type} (${field.name})`);

		if (value === undefined) {
			value = field.value;
		}

		const bytes = encodingFunction(value);

		if (field.type === 'TABLE') {
			subtableOffsets.push(d.length);
			d = d.concat([0, 0]);
			subtables.push(bytes);
		}
		else {
			d = d.concat(bytes);
		}
	}

	for (let i = 0; i < subtables.length; i++) {
		const o = subtableOffsets[i];
		const offset = d.length;

		check.argument(offset < 65536, `Table ${table.tableNamk} too big.`);
		d[o] = offset >> 8;
		d[o + 1] = offset & 0xff;
		d = d.concat(subtables[i]);
	}

	return d;
};

sizeOf.TABLE = (table) => {
	let numBytes = 0;
    const length = table.fields.length;

    for (let i = 0; i < length; i++) {
        const field = table.fields[i];
        const sizeOfFunction = sizeOf[field.type];
        let value = table[field.name];

        check.argument(sizeOfFunction !== undefined, `No sizeOf function for field type ${field.type} (${field.name})`);

        if (value === undefined) {
            value = field.value;
        }

        numBytes += sizeOfFunction(value);

        // Subtables take 2 more bytes for offsets.
        if (field.type === 'TABLE') {
            numBytes += 2;
        }
    }

    return numBytes;
};

