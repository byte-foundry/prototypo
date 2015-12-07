import React from 'react';
import Lifespan from 'lifespan';
import ClassNames from 'classnames';


export default class SearchGlyphList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// 
		}
	}

	render() {
		if (process.env.__SHOW_RENDER__) {
			console.log('[RENDER] SearchGlyphList');
		}


		const latin3 = [
			{
				"unicode": "0020",
				"character": " ",
				"glyphName": "space",
				"characterName": "SPACE"
			},
			{
				"unicode": "0021",
				"character": "!",
				"glyphName": "exclam",
				"characterName": "EXCLAMATION MARK"
			},
			{
				"unicode": "0022",
				"character": "\"",
				"glyphName": "quotedbl",
				"characterName": "QUOTATION MARK"
			},
			{
				"unicode": "0023",
				"character": "#",
				"glyphName": "numbersign",
				"characterName": "NUMBER SIGN"
			},
			{
				"unicode": "0024",
				"character": "$",
				"glyphName": "dollar",
				"characterName": "DOLLAR SIGN"
			},
			{
				"unicode": "0025",
				"character": "%",
				"glyphName": "percent",
				"characterName": "PERCENT SIGN"
			},
			{
				"unicode": "0026",
				"character": "&amp;",
				"glyphName": "ampersand",
				"characterName": "AMPERSAND"
			},
			{
				"unicode": "0027",
				"character": "'",
				"glyphName": "quotesingle",
				"characterName": "APOSTROPHE"
			},
			{
				"unicode": "0028",
				"character": "(",
				"glyphName": "parenleft",
				"characterName": "LEFT PARENTHESIS"
			},
			{
				"unicode": "0029",
				"character": ")",
				"glyphName": "parenright",
				"characterName": "RIGHT PARENTHESIS"
			},
			{
				"unicode": "002A",
				"character": "*",
				"glyphName": "asterisk",
				"characterName": "ASTERISK"
			},
			{
				"unicode": "002B",
				"character": "+",
				"glyphName": "plus",
				"characterName": "PLUS SIGN"
			},
			{
				"unicode": "002C",
				"character": ",",
				"glyphName": "comma",
				"characterName": "COMMA"
			},
			{
				"unicode": "002D",
				"character": "-",
				"glyphName": "hyphen",
				"characterName": "HYPHEN-MINUS"
			},
			{
				"unicode": "002E",
				"character": ".",
				"glyphName": "period",
				"characterName": "FULL STOP"
			},
			{
				"unicode": "002F",
				"character": "/",
				"glyphName": "slash",
				"characterName": "SOLIDUS"
			},
			{
				"unicode": "0030",
				"character": "0",
				"glyphName": "zero",
				"characterName": "DIGIT ZERO"
			},
			{
				"unicode": "0031",
				"character": "1",
				"glyphName": "one",
				"characterName": "DIGIT ONE"
			},
			{
				"unicode": "0032",
				"character": "2",
				"glyphName": "two",
				"characterName": "DIGIT TWO"
			},
			{
				"unicode": "0033",
				"character": "3",
				"glyphName": "three",
				"characterName": "DIGIT THREE"
			},
			{
				"unicode": "0034",
				"character": "4",
				"glyphName": "four",
				"characterName": "DIGIT FOUR"
			},
			{
				"unicode": "0035",
				"character": "5",
				"glyphName": "five",
				"characterName": "DIGIT FIVE"
			},
			{
				"unicode": "0036",
				"character": "6",
				"glyphName": "six",
				"characterName": "DIGIT SIX"
			},
			{
				"unicode": "0037",
				"character": "7",
				"glyphName": "seven",
				"characterName": "DIGIT SEVEN"
			},
			{
				"unicode": "0038",
				"character": "8",
				"glyphName": "eight",
				"characterName": "DIGIT EIGHT"
			},
			{
				"unicode": "0039",
				"character": "9",
				"glyphName": "nine",
				"characterName": "DIGIT NINE"
			},
			{
				"unicode": "003A",
				"character": ":",
				"glyphName": "colon",
				"characterName": "COLON"
			},
			{
				"unicode": "003B",
				"character": ";",
				"glyphName": "semicolon",
				"characterName": "SEMICOLON"
			},
			{
				"unicode": "003C",
				"character": "&lt;",
				"glyphName": "less",
				"characterName": "LESS-THAN SIGN"
			},
			{
				"unicode": "003D",
				"character": "=",
				"glyphName": "equal",
				"characterName": "EQUALS SIGN"
			},
			{
				"unicode": "003E",
				"character": "&gt;",
				"glyphName": "greater",
				"characterName": "GREATER-THAN SIGN"
			},
			{
				"unicode": "003F",
				"character": "?",
				"glyphName": "question",
				"characterName": "QUESTION MARK"
			},
			{
				"unicode": "0040",
				"character": "@",
				"glyphName": "at",
				"characterName": "COMMERCIAL AT"
			},
			{
				"unicode": "0041",
				"character": "A",
				"glyphName": "A",
				"characterName": "LATIN CAPITAL LETTER A"
			},
			{
				"unicode": "0042",
				"character": "B",
				"glyphName": "B",
				"characterName": "LATIN CAPITAL LETTER B"
			},
			{
				"unicode": "0043",
				"character": "C",
				"glyphName": "C",
				"characterName": "LATIN CAPITAL LETTER C"
			},
			{
				"unicode": "0044",
				"character": "D",
				"glyphName": "D",
				"characterName": "LATIN CAPITAL LETTER D"
			},
			{
				"unicode": "0045",
				"character": "E",
				"glyphName": "E",
				"characterName": "LATIN CAPITAL LETTER E"
			},
			{
				"unicode": "0046",
				"character": "F",
				"glyphName": "F",
				"characterName": "LATIN CAPITAL LETTER F"
			},
			{
				"unicode": "0047",
				"character": "G",
				"glyphName": "G",
				"characterName": "LATIN CAPITAL LETTER G"
			},
			{
				"unicode": "0048",
				"character": "H",
				"glyphName": "H",
				"characterName": "LATIN CAPITAL LETTER H"
			},
			{
				"unicode": "0049",
				"character": "I",
				"glyphName": "I",
				"characterName": "LATIN CAPITAL LETTER I"
			},
			{
				"unicode": "004A",
				"character": "J",
				"glyphName": "J",
				"characterName": "LATIN CAPITAL LETTER J"
			},
			{
				"unicode": "004B",
				"character": "K",
				"glyphName": "K",
				"characterName": "LATIN CAPITAL LETTER K"
			},
			{
				"unicode": "004C",
				"character": "L",
				"glyphName": "L",
				"characterName": "LATIN CAPITAL LETTER L"
			},
			{
				"unicode": "004D",
				"character": "M",
				"glyphName": "M",
				"characterName": "LATIN CAPITAL LETTER M"
			},
			{
				"unicode": "004E",
				"character": "N",
				"glyphName": "N",
				"characterName": "LATIN CAPITAL LETTER N"
			},
			{
				"unicode": "004F",
				"character": "O",
				"glyphName": "O",
				"characterName": "LATIN CAPITAL LETTER O"
			},
			{
				"unicode": "0050",
				"character": "P",
				"glyphName": "P",
				"characterName": "LATIN CAPITAL LETTER P"
			},
			{
				"unicode": "0051",
				"character": "Q",
				"glyphName": "Q",
				"characterName": "LATIN CAPITAL LETTER Q"
			},
			{
				"unicode": "0052",
				"character": "R",
				"glyphName": "R",
				"characterName": "LATIN CAPITAL LETTER R"
			},
			{
				"unicode": "0053",
				"character": "S",
				"glyphName": "S",
				"characterName": "LATIN CAPITAL LETTER S"
			},
			{
				"unicode": "0054",
				"character": "T",
				"glyphName": "T",
				"characterName": "LATIN CAPITAL LETTER T"
			},
			{
				"unicode": "0055",
				"character": "U",
				"glyphName": "U",
				"characterName": "LATIN CAPITAL LETTER U"
			},
			{
				"unicode": "0056",
				"character": "V",
				"glyphName": "V",
				"characterName": "LATIN CAPITAL LETTER V"
			},
			{
				"unicode": "0057",
				"character": "W",
				"glyphName": "W",
				"characterName": "LATIN CAPITAL LETTER W"
			},
			{
				"unicode": "0058",
				"character": "X",
				"glyphName": "X",
				"characterName": "LATIN CAPITAL LETTER X"
			},
			{
				"unicode": "0059",
				"character": "Y",
				"glyphName": "Y",
				"characterName": "LATIN CAPITAL LETTER Y"
			},
			{
				"unicode": "005A",
				"character": "Z",
				"glyphName": "Z",
				"characterName": "LATIN CAPITAL LETTER Z"
			},
			{
				"unicode": "005B",
				"character": "[",
				"glyphName": "bracketleft",
				"characterName": "LEFT SQUARE BRACKET"
			},
			{
				"unicode": "005C",
				"character": "\\",
				"glyphName": "backslash",
				"characterName": "REVERSE SOLIDUS"
			},
			{
				"unicode": "005D",
				"character": "]",
				"glyphName": "bracketright",
				"characterName": "RIGHT SQUARE BRACKET"
			},
			{
				"unicode": "005E",
				"character": "^",
				"glyphName": "asciicircum",
				"characterName": "CIRCUMFLEX ACCENT"
			},
			{
				"unicode": "005F",
				"character": "_",
				"glyphName": "underscore",
				"characterName": "LOW LINE"
			},
			{
				"unicode": "0060",
				"character": "`",
				"glyphName": "grave",
				"characterName": "GRAVE ACCENT"
			},
			{
				"unicode": "0061",
				"character": "a",
				"glyphName": "a",
				"characterName": "LATIN SMALL LETTER A"
			},
			{
				"unicode": "0062",
				"character": "b",
				"glyphName": "b",
				"characterName": "LATIN SMALL LETTER B"
			},
			{
				"unicode": "0063",
				"character": "c",
				"glyphName": "c",
				"characterName": "LATIN SMALL LETTER C"
			},
			{
				"unicode": "0064",
				"character": "d",
				"glyphName": "d",
				"characterName": "LATIN SMALL LETTER D"
			},
			{
				"unicode": "0065",
				"character": "e",
				"glyphName": "e",
				"characterName": "LATIN SMALL LETTER E"
			},
			{
				"unicode": "0066",
				"character": "f",
				"glyphName": "f",
				"characterName": "LATIN SMALL LETTER F"
			},
			{
				"unicode": "0067",
				"character": "g",
				"glyphName": "g",
				"characterName": "LATIN SMALL LETTER G"
			},
			{
				"unicode": "0068",
				"character": "h",
				"glyphName": "h",
				"characterName": "LATIN SMALL LETTER H"
			},
			{
				"unicode": "0069",
				"character": "i",
				"glyphName": "i",
				"characterName": "LATIN SMALL LETTER I"
			},
			{
				"unicode": "006A",
				"character": "j",
				"glyphName": "j",
				"characterName": "LATIN SMALL LETTER J"
			},
			{
				"unicode": "006B",
				"character": "k",
				"glyphName": "k",
				"characterName": "LATIN SMALL LETTER K"
			},
			{
				"unicode": "006C",
				"character": "l",
				"glyphName": "l",
				"characterName": "LATIN SMALL LETTER L"
			},
			{
				"unicode": "006D",
				"character": "m",
				"glyphName": "m",
				"characterName": "LATIN SMALL LETTER M"
			},
			{
				"unicode": "006E",
				"character": "n",
				"glyphName": "n",
				"characterName": "LATIN SMALL LETTER N"
			},
			{
				"unicode": "006F",
				"character": "o",
				"glyphName": "o",
				"characterName": "LATIN SMALL LETTER O"
			},
			{
				"unicode": "0070",
				"character": "p",
				"glyphName": "p",
				"characterName": "LATIN SMALL LETTER P"
			},
			{
				"unicode": "0071",
				"character": "q",
				"glyphName": "q",
				"characterName": "LATIN SMALL LETTER Q"
			},
			{
				"unicode": "0072",
				"character": "r",
				"glyphName": "r",
				"characterName": "LATIN SMALL LETTER R"
			},
			{
				"unicode": "0073",
				"character": "s",
				"glyphName": "s",
				"characterName": "LATIN SMALL LETTER S"
			},
			{
				"unicode": "0074",
				"character": "t",
				"glyphName": "t",
				"characterName": "LATIN SMALL LETTER T"
			},
			{
				"unicode": "0075",
				"character": "u",
				"glyphName": "u",
				"characterName": "LATIN SMALL LETTER U"
			},
			{
				"unicode": "0076",
				"character": "v",
				"glyphName": "v",
				"characterName": "LATIN SMALL LETTER V"
			},
			{
				"unicode": "0077",
				"character": "w",
				"glyphName": "w",
				"characterName": "LATIN SMALL LETTER W"
			},
			{
				"unicode": "0078",
				"character": "x",
				"glyphName": "x",
				"characterName": "LATIN SMALL LETTER X"
			},
			{
				"unicode": "0079",
				"character": "y",
				"glyphName": "y",
				"characterName": "LATIN SMALL LETTER Y"
			},
			{
				"unicode": "007A",
				"character": "z",
				"glyphName": "z",
				"characterName": "LATIN SMALL LETTER Z"
			},
			{
				"unicode": "007B",
				"character": "{",
				"glyphName": "braceleft",
				"characterName": "LEFT CURLY BRACKET"
			},
			{
				"unicode": "007C",
				"character": "|",
				"glyphName": "bar",
				"characterName": "VERTICAL LINE"
			},
			{
				"unicode": "007D",
				"character": "}",
				"glyphName": "braceright",
				"characterName": "RIGHT CURLY BRACKET"
			},
			{
				"unicode": "007E",
				"character": "~",
				"glyphName": "asciitilde",
				"characterName": "TILDE"
			},
			{
				"unicode": "00A0",
				"character": "&nbsp;",
				"glyphName": "uni00A0",
				"characterName": "NO-BREAK SPACE"
			},
			{
				"unicode": "00A1",
				"character": "¡",
				"glyphName": "exclamdown",
				"characterName": "INVERTED EXCLAMATION MARK"
			},
			{
				"unicode": "00A2",
				"character": "¢",
				"glyphName": "cent",
				"characterName": "CENT SIGN"
			},
			{
				"unicode": "00A3",
				"character": "£",
				"glyphName": "sterling",
				"characterName": "POUND SIGN"
			},
			{
				"unicode": "00A4",
				"character": "¤",
				"glyphName": "currency",
				"characterName": "CURRENCY SIGN"
			},
			{
				"unicode": "00A5",
				"character": "¥",
				"glyphName": "yen",
				"characterName": "YEN SIGN"
			},
			{
				"unicode": "00A6",
				"character": "¦",
				"glyphName": "brokenbar",
				"characterName": "BROKEN BAR"
			},
			{
				"unicode": "00A7",
				"character": "§",
				"glyphName": "section",
				"characterName": "SECTION SIGN"
			},
			{
				"unicode": "00A8",
				"character": "¨",
				"glyphName": "dieresis",
				"characterName": "DIAERESIS"
			},
			{
				"unicode": "00A9",
				"character": "©",
				"glyphName": "copyright",
				"characterName": "COPYRIGHT SIGN"
			},
			{
				"unicode": "00AA",
				"character": "ª",
				"glyphName": "ordfeminine",
				"characterName": "FEMININE ORDINAL INDICATOR"
			},
			{
				"unicode": "00AB",
				"character": "«",
				"glyphName": "guillemotleft",
				"characterName": "LEFT-POINTING DOUBLE ANGLE QUOTATION MARK"
			},
			{
				"unicode": "00AC",
				"character": "¬",
				"glyphName": "logicalnot",
				"characterName": "NOT SIGN"
			},
			{
				"unicode": "00AD",
				"character": "&shy;",
				"glyphName": "uni00AD",
				"characterName": "SOFT HYPHEN"
			},
			{
				"unicode": "00AE",
				"character": "®",
				"glyphName": "registered",
				"characterName": "REGISTERED SIGN"
			},
			{
				"unicode": "00AF",
				"character": "¯",
				"glyphName": "macron",
				"characterName": "MACRON"
			},
			{
				"unicode": "00B0",
				"character": "°",
				"glyphName": "degree",
				"characterName": "DEGREE SIGN"
			},
			{
				"unicode": "00B1",
				"character": "±",
				"glyphName": "plusminus",
				"characterName": "PLUS-MINUS SIGN"
			},
			{
				"unicode": "00B2",
				"character": "²",
				"glyphName": "twosuperior",
				"characterName": "SUPERSCRIPT TWO"
			},
			{
				"unicode": "00B3",
				"character": "³",
				"glyphName": "threesuperior",
				"characterName": "SUPERSCRIPT THREE"
			},
			{
				"unicode": "00B4",
				"character": "´",
				"glyphName": "acute",
				"characterName": "ACUTE ACCENT"
			},
			{
				"unicode": "00B5",
				"character": "µ",
				"glyphName": "uni00B5",
				"characterName": "MICRO SIGN"
			},
			{
				"unicode": "00B6",
				"character": "¶",
				"glyphName": "paragraph",
				"characterName": "PILCROW SIGN"
			},
			{
				"unicode": "00B7",
				"character": "·",
				"glyphName": "periodcentered",
				"characterName": "MIDDLE DOT"
			},
			{
				"unicode": "00B8",
				"character": "¸",
				"glyphName": "cedilla",
				"characterName": "CEDILLA"
			},
			{
				"unicode": "00B9",
				"character": "¹",
				"glyphName": "onesuperior",
				"characterName": "SUPERSCRIPT ONE"
			},
			{
				"unicode": "00BA",
				"character": "º",
				"glyphName": "ordmasculine",
				"characterName": "MASCULINE ORDINAL INDICATOR"
			},
			{
				"unicode": "00BB",
				"character": "»",
				"glyphName": "guillemotright",
				"characterName": "RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK"
			},
			{
				"unicode": "00BC",
				"character": "¼",
				"glyphName": "onequarter",
				"characterName": "VULGAR FRACTION ONE QUARTER"
			},
			{
				"unicode": "00BD",
				"character": "½",
				"glyphName": "onehalf",
				"characterName": "VULGAR FRACTION ONE HALF"
			},
			{
				"unicode": "00BE",
				"character": "¾",
				"glyphName": "threequarters",
				"characterName": "VULGAR FRACTION THREE QUARTERS"
			},
			{
				"unicode": "00BF",
				"character": "¿",
				"glyphName": "questiondown",
				"characterName": "INVERTED QUESTION MARK"
			},
			{
				"unicode": "00C0",
				"character": "À",
				"glyphName": "Agrave",
				"characterName": "LATIN CAPITAL LETTER A WITH GRAVE"
			},
			{
				"unicode": "00C1",
				"character": "Á",
				"glyphName": "Aacute",
				"characterName": "LATIN CAPITAL LETTER A WITH ACUTE"
			},
			{
				"unicode": "00C2",
				"character": "Â",
				"glyphName": "Acircumflex",
				"characterName": "LATIN CAPITAL LETTER A WITH CIRCUMFLEX"
			},
			{
				"unicode": "00C3",
				"character": "Ã",
				"glyphName": "Atilde",
				"characterName": "LATIN CAPITAL LETTER A WITH TILDE"
			},
			{
				"unicode": "00C4",
				"character": "Ä",
				"glyphName": "Adieresis",
				"characterName": "LATIN CAPITAL LETTER A WITH DIAERESIS"
			},
			{
				"unicode": "00C5",
				"character": "Å",
				"glyphName": "Aring",
				"characterName": "LATIN CAPITAL LETTER A WITH RING ABOVE"
			},
			{
				"unicode": "00C6",
				"character": "Æ",
				"glyphName": "AE",
				"characterName": "LATIN CAPITAL LETTER AE"
			},
			{
				"unicode": "00C7",
				"character": "Ç",
				"glyphName": "Ccedilla",
				"characterName": "LATIN CAPITAL LETTER C WITH CEDILLA"
			},
			{
				"unicode": "00C8",
				"character": "È",
				"glyphName": "Egrave",
				"characterName": "LATIN CAPITAL LETTER E WITH GRAVE"
			},
			{
				"unicode": "00C9",
				"character": "É",
				"glyphName": "Eacute",
				"characterName": "LATIN CAPITAL LETTER E WITH ACUTE"
			},
			{
				"unicode": "00CA",
				"character": "Ê",
				"glyphName": "Ecircumflex",
				"characterName": "LATIN CAPITAL LETTER E WITH CIRCUMFLEX"
			},
			{
				"unicode": "00CB",
				"character": "Ë",
				"glyphName": "Edieresis",
				"characterName": "LATIN CAPITAL LETTER E WITH DIAERESIS"
			},
			{
				"unicode": "00CC",
				"character": "Ì",
				"glyphName": "Igrave",
				"characterName": "LATIN CAPITAL LETTER I WITH GRAVE"
			},
			{
				"unicode": "00CD",
				"character": "Í",
				"glyphName": "Iacute",
				"characterName": "LATIN CAPITAL LETTER I WITH ACUTE"
			},
			{
				"unicode": "00CE",
				"character": "Î",
				"glyphName": "Icircumflex",
				"characterName": "LATIN CAPITAL LETTER I WITH CIRCUMFLEX"
			},
			{
				"unicode": "00CF",
				"character": "Ï",
				"glyphName": "Idieresis",
				"characterName": "LATIN CAPITAL LETTER I WITH DIAERESIS"
			},
			{
				"unicode": "00D0",
				"character": "Ð",
				"glyphName": "Eth",
				"characterName": "LATIN CAPITAL LETTER ETH"
			},
			{
				"unicode": "00D1",
				"character": "Ñ",
				"glyphName": "Ntilde",
				"characterName": "LATIN CAPITAL LETTER N WITH TILDE"
			},
			{
				"unicode": "00D2",
				"character": "Ò",
				"glyphName": "Ograve",
				"characterName": "LATIN CAPITAL LETTER O WITH GRAVE"
			},
			{
				"unicode": "00D3",
				"character": "Ó",
				"glyphName": "Oacute",
				"characterName": "LATIN CAPITAL LETTER O WITH ACUTE"
			},
			{
				"unicode": "00D4",
				"character": "Ô",
				"glyphName": "Ocircumflex",
				"characterName": "LATIN CAPITAL LETTER O WITH CIRCUMFLEX"
			},
			{
				"unicode": "00D5",
				"character": "Õ",
				"glyphName": "Otilde",
				"characterName": "LATIN CAPITAL LETTER O WITH TILDE"
			},
			{
				"unicode": "00D6",
				"character": "Ö",
				"glyphName": "Odieresis",
				"characterName": "LATIN CAPITAL LETTER O WITH DIAERESIS"
			},
			{
				"unicode": "00D7",
				"character": "×",
				"glyphName": "multiply",
				"characterName": "MULTIPLICATION SIGN"
			},
			{
				"unicode": "00D8",
				"character": "Ø",
				"glyphName": "Oslash",
				"characterName": "LATIN CAPITAL LETTER O WITH STROKE"
			},
			{
				"unicode": "00D9",
				"character": "Ù",
				"glyphName": "Ugrave",
				"characterName": "LATIN CAPITAL LETTER U WITH GRAVE"
			},
			{
				"unicode": "00DA",
				"character": "Ú",
				"glyphName": "Uacute",
				"characterName": "LATIN CAPITAL LETTER U WITH ACUTE"
			},
			{
				"unicode": "00DB",
				"character": "Û",
				"glyphName": "Ucircumflex",
				"characterName": "LATIN CAPITAL LETTER U WITH CIRCUMFLEX"
			},
			{
				"unicode": "00DC",
				"character": "Ü",
				"glyphName": "Udieresis",
				"characterName": "LATIN CAPITAL LETTER U WITH DIAERESIS"
			},
			{
				"unicode": "00DD",
				"character": "Ý",
				"glyphName": "Yacute",
				"characterName": "LATIN CAPITAL LETTER Y WITH ACUTE"
			},
			{
				"unicode": "00DE",
				"character": "Þ",
				"glyphName": "Thorn",
				"characterName": "LATIN CAPITAL LETTER THORN"
			},
			{
				"unicode": "00DF",
				"character": "ß",
				"glyphName": "germandbls",
				"characterName": "LATIN SMALL LETTER SHARP S"
			},
			{
				"unicode": "00E0",
				"character": "à",
				"glyphName": "agrave",
				"characterName": "LATIN SMALL LETTER A WITH GRAVE"
			},
			{
				"unicode": "00E1",
				"character": "á",
				"glyphName": "aacute",
				"characterName": "LATIN SMALL LETTER A WITH ACUTE"
			},
			{
				"unicode": "00E2",
				"character": "â",
				"glyphName": "acircumflex",
				"characterName": "LATIN SMALL LETTER A WITH CIRCUMFLEX"
			},
			{
				"unicode": "00E3",
				"character": "ã",
				"glyphName": "atilde",
				"characterName": "LATIN SMALL LETTER A WITH TILDE"
			},
			{
				"unicode": "00E4",
				"character": "ä",
				"glyphName": "adieresis",
				"characterName": "LATIN SMALL LETTER A WITH DIAERESIS"
			},
			{
				"unicode": "00E5",
				"character": "å",
				"glyphName": "aring",
				"characterName": "LATIN SMALL LETTER A WITH RING ABOVE"
			},
			{
				"unicode": "00E6",
				"character": "æ",
				"glyphName": "ae",
				"characterName": "LATIN SMALL LETTER AE"
			},
			{
				"unicode": "00E7",
				"character": "ç",
				"glyphName": "ccedilla",
				"characterName": "LATIN SMALL LETTER C WITH CEDILLA"
			},
			{
				"unicode": "00E8",
				"character": "è",
				"glyphName": "egrave",
				"characterName": "LATIN SMALL LETTER E WITH GRAVE"
			},
			{
				"unicode": "00E9",
				"character": "é",
				"glyphName": "eacute",
				"characterName": "LATIN SMALL LETTER E WITH ACUTE"
			},
			{
				"unicode": "00EA",
				"character": "ê",
				"glyphName": "ecircumflex",
				"characterName": "LATIN SMALL LETTER E WITH CIRCUMFLEX"
			},
			{
				"unicode": "00EB",
				"character": "ë",
				"glyphName": "edieresis",
				"characterName": "LATIN SMALL LETTER E WITH DIAERESIS"
			},
			{
				"unicode": "00EC",
				"character": "ì",
				"glyphName": "igrave",
				"characterName": "LATIN SMALL LETTER I WITH GRAVE"
			},
			{
				"unicode": "00ED",
				"character": "í",
				"glyphName": "iacute",
				"characterName": "LATIN SMALL LETTER I WITH ACUTE"
			},
			{
				"unicode": "00EE",
				"character": "î",
				"glyphName": "icircumflex",
				"characterName": "LATIN SMALL LETTER I WITH CIRCUMFLEX"
			},
			{
				"unicode": "00EF",
				"character": "ï",
				"glyphName": "idieresis",
				"characterName": "LATIN SMALL LETTER I WITH DIAERESIS"
			},
			{
				"unicode": "00F0",
				"character": "ð",
				"glyphName": "eth",
				"characterName": "LATIN SMALL LETTER ETH"
			},
			{
				"unicode": "00F1",
				"character": "ñ",
				"glyphName": "ntilde",
				"characterName": "LATIN SMALL LETTER N WITH TILDE"
			},
			{
				"unicode": "00F2",
				"character": "ò",
				"glyphName": "ograve",
				"characterName": "LATIN SMALL LETTER O WITH GRAVE"
			},
			{
				"unicode": "00F3",
				"character": "ó",
				"glyphName": "oacute",
				"characterName": "LATIN SMALL LETTER O WITH ACUTE"
			},
			{
				"unicode": "00F4",
				"character": "ô",
				"glyphName": "ocircumflex",
				"characterName": "LATIN SMALL LETTER O WITH CIRCUMFLEX"
			},
			{
				"unicode": "00F5",
				"character": "õ",
				"glyphName": "otilde",
				"characterName": "LATIN SMALL LETTER O WITH TILDE"
			},
			{
				"unicode": "00F6",
				"character": "ö",
				"glyphName": "odieresis",
				"characterName": "LATIN SMALL LETTER O WITH DIAERESIS"
			},
			{
				"unicode": "00F7",
				"character": "÷",
				"glyphName": "divide",
				"characterName": "DIVISION SIGN"
			},
			{
				"unicode": "00F8",
				"character": "ø",
				"glyphName": "oslash",
				"characterName": "LATIN SMALL LETTER O WITH STROKE"
			},
			{
				"unicode": "00F9",
				"character": "ù",
				"glyphName": "ugrave",
				"characterName": "LATIN SMALL LETTER U WITH GRAVE"
			},
			{
				"unicode": "00FA",
				"character": "ú",
				"glyphName": "uacute",
				"characterName": "LATIN SMALL LETTER U WITH ACUTE"
			},
			{
				"unicode": "00FB",
				"character": "û",
				"glyphName": "ucircumflex",
				"characterName": "LATIN SMALL LETTER U WITH CIRCUMFLEX"
			},
			{
				"unicode": "00FC",
				"character": "ü",
				"glyphName": "udieresis",
				"characterName": "LATIN SMALL LETTER U WITH DIAERESIS"
			},
			{
				"unicode": "00FD",
				"character": "ý",
				"glyphName": "yacute",
				"characterName": "LATIN SMALL LETTER Y WITH ACUTE"
			},
			{
				"unicode": "00FE",
				"character": "þ",
				"glyphName": "thorn",
				"characterName": "LATIN SMALL LETTER THORN"
			},
			{
				"unicode": "00FF",
				"character": "ÿ",
				"glyphName": "ydieresis",
				"characterName": "LATIN SMALL LETTER Y WITH DIAERESIS"
			},
			{
				"unicode": "0100",
				"character": "Ā",
				"glyphName": "Amacron",
				"characterName": "LATIN CAPITAL LETTER A WITH MACRON"
			},
			{
				"unicode": "0101",
				"character": "ā",
				"glyphName": "amacron",
				"characterName": "LATIN SMALL LETTER A WITH MACRON"
			},
			{
				"unicode": "0102",
				"character": "Ă",
				"glyphName": "Abreve",
				"characterName": "LATIN CAPITAL LETTER A WITH BREVE"
			},
			{
				"unicode": "0103",
				"character": "ă",
				"glyphName": "abreve",
				"characterName": "LATIN SMALL LETTER A WITH BREVE"
			},
			{
				"unicode": "0104",
				"character": "Ą",
				"glyphName": "Aogonek",
				"characterName": "LATIN CAPITAL LETTER A WITH OGONEK"
			},
			{
				"unicode": "0105",
				"character": "ą",
				"glyphName": "aogonek",
				"characterName": "LATIN SMALL LETTER A WITH OGONEK"
			},
			{
				"unicode": "0106",
				"character": "Ć",
				"glyphName": "Cacute",
				"characterName": "LATIN CAPITAL LETTER C WITH ACUTE"
			},
			{
				"unicode": "0107",
				"character": "ć",
				"glyphName": "cacute",
				"characterName": "LATIN SMALL LETTER C WITH ACUTE"
			},
			{
				"unicode": "010C",
				"character": "Č",
				"glyphName": "Ccaron",
				"characterName": "LATIN CAPITAL LETTER C WITH CARON"
			},
			{
				"unicode": "010D",
				"character": "č",
				"glyphName": "ccaron",
				"characterName": "LATIN SMALL LETTER C WITH CARON"
			},
			{
				"unicode": "010E",
				"character": "Ď",
				"glyphName": "Dcaron",
				"characterName": "LATIN CAPITAL LETTER D WITH CARON"
			},
			{
				"unicode": "010F",
				"character": "ď",
				"glyphName": "dcaron",
				"characterName": "LATIN SMALL LETTER D WITH CARON"
			},
			{
				"unicode": "0110",
				"character": "Đ",
				"glyphName": "Dcroat",
				"characterName": "LATIN CAPITAL LETTER D WITH STROKE"
			},
			{
				"unicode": "0111",
				"character": "đ",
				"glyphName": "dcroat",
				"characterName": "LATIN SMALL LETTER D WITH STROKE"
			},
			{
				"unicode": "0112",
				"character": "Ē",
				"glyphName": "Emacron",
				"characterName": "LATIN CAPITAL LETTER E WITH MACRON"
			},
			{
				"unicode": "0113",
				"character": "ē",
				"glyphName": "emacron",
				"characterName": "LATIN SMALL LETTER E WITH MACRON"
			},
			{
				"unicode": "0116",
				"character": "Ė",
				"glyphName": "Edotaccent",
				"characterName": "LATIN CAPITAL LETTER E WITH DOT ABOVE"
			},
			{
				"unicode": "0117",
				"character": "ė",
				"glyphName": "edotaccent",
				"characterName": "LATIN SMALL LETTER E WITH DOT ABOVE"
			},
			{
				"unicode": "0118",
				"character": "Ę",
				"glyphName": "Eogonek",
				"characterName": "LATIN CAPITAL LETTER E WITH OGONEK"
			},
			{
				"unicode": "0119",
				"character": "ę",
				"glyphName": "eogonek",
				"characterName": "LATIN SMALL LETTER E WITH OGONEK"
			},
			{
				"unicode": "011A",
				"character": "Ě",
				"glyphName": "Ecaron",
				"characterName": "LATIN CAPITAL LETTER E WITH CARON"
			},
			{
				"unicode": "011B",
				"character": "ě",
				"glyphName": "ecaron",
				"characterName": "LATIN SMALL LETTER E WITH CARON"
			},
			{
				"unicode": "011E",
				"character": "Ğ",
				"glyphName": "Gbreve",
				"characterName": "LATIN CAPITAL LETTER G WITH BREVE"
			},
			{
				"unicode": "011F",
				"character": "ğ",
				"glyphName": "gbreve",
				"characterName": "LATIN SMALL LETTER G WITH BREVE"
			},
			{
				"unicode": "0122",
				"character": "Ģ",
				"glyphName": "uni0122",
				"characterName": "LATIN CAPITAL LETTER G WITH CEDILLA"
			},
			{
				"unicode": "0123",
				"character": "ģ",
				"glyphName": "uni0123",
				"characterName": "LATIN SMALL LETTER G WITH CEDILLA"
			},
			{
				"unicode": "012A",
				"character": "Ī",
				"glyphName": "Imacron",
				"characterName": "LATIN CAPITAL LETTER I WITH MACRON"
			},
			{
				"unicode": "012B",
				"character": "ī",
				"glyphName": "imacron",
				"characterName": "LATIN SMALL LETTER I WITH MACRON"
			},
			{
				"unicode": "012E",
				"character": "Į",
				"glyphName": "Iogonek",
				"characterName": "LATIN CAPITAL LETTER I WITH OGONEK"
			},
			{
				"unicode": "012F",
				"character": "į",
				"glyphName": "iogonek",
				"characterName": "LATIN SMALL LETTER I WITH OGONEK"
			},
			{
				"unicode": "0130",
				"character": "İ",
				"glyphName": "Idotaccent",
				"characterName": "LATIN CAPITAL LETTER I WITH DOT ABOVE"
			},
			{
				"unicode": "0131",
				"character": "ı",
				"glyphName": "dotlessi",
				"characterName": "LATIN SMALL LETTER DOTLESS I"
			},
			{
				"unicode": "0136",
				"character": "Ķ",
				"glyphName": "uni0136",
				"characterName": "LATIN CAPITAL LETTER K WITH CEDILLA"
			},
			{
				"unicode": "0137",
				"character": "ķ",
				"glyphName": "uni0137",
				"characterName": "LATIN SMALL LETTER K WITH CEDILLA"
			},
			{
				"unicode": "0139",
				"character": "Ĺ",
				"glyphName": "Lacute",
				"characterName": "LATIN CAPITAL LETTER L WITH ACUTE"
			},
			{
				"unicode": "013A",
				"character": "ĺ",
				"glyphName": "lacute",
				"characterName": "LATIN SMALL LETTER L WITH ACUTE"
			},
			{
				"unicode": "013B",
				"character": "Ļ",
				"glyphName": "uni013B",
				"characterName": "LATIN CAPITAL LETTER L WITH CEDILLA"
			},
			{
				"unicode": "013C",
				"character": "ļ",
				"glyphName": "uni013C",
				"characterName": "LATIN SMALL LETTER L WITH CEDILLA"
			},
			{
				"unicode": "013D",
				"character": "Ľ",
				"glyphName": "Lcaron",
				"characterName": "LATIN CAPITAL LETTER L WITH CARON"
			},
			{
				"unicode": "013E",
				"character": "ľ",
				"glyphName": "lcaron",
				"characterName": "LATIN SMALL LETTER L WITH CARON"
			},
			{
				"unicode": "0141",
				"character": "Ł",
				"glyphName": "Lslash",
				"characterName": "LATIN CAPITAL LETTER L WITH STROKE"
			},
			{
				"unicode": "0142",
				"character": "ł",
				"glyphName": "lslash",
				"characterName": "LATIN SMALL LETTER L WITH STROKE"
			},
			{
				"unicode": "0143",
				"character": "Ń",
				"glyphName": "Nacute",
				"characterName": "LATIN CAPITAL LETTER N WITH ACUTE"
			},
			{
				"unicode": "0144",
				"character": "ń",
				"glyphName": "nacute",
				"characterName": "LATIN SMALL LETTER N WITH ACUTE"
			},
			{
				"unicode": "0145",
				"character": "Ņ",
				"glyphName": "uni0145",
				"characterName": "LATIN CAPITAL LETTER N WITH CEDILLA"
			},
			{
				"unicode": "0146",
				"character": "ņ",
				"glyphName": "uni0146",
				"characterName": "LATIN SMALL LETTER N WITH CEDILLA"
			},
			{
				"unicode": "0147",
				"character": "Ň",
				"glyphName": "Ncaron",
				"characterName": "LATIN CAPITAL LETTER N WITH CARON"
			},
			{
				"unicode": "0148",
				"character": "ň",
				"glyphName": "ncaron",
				"characterName": "LATIN SMALL LETTER N WITH CARON"
			},
			{
				"unicode": "014C",
				"character": "Ō",
				"glyphName": "Omacron",
				"characterName": "LATIN CAPITAL LETTER O WITH MACRON"
			},
			{
				"unicode": "014D",
				"character": "ō",
				"glyphName": "omacron",
				"characterName": "LATIN SMALL LETTER O WITH MACRON"
			},
			{
				"unicode": "0150",
				"character": "Ő",
				"glyphName": "Ohungarumlaut",
				"characterName": "LATIN CAPITAL LETTER O WITH DOUBLE ACUTE"
			},
			{
				"unicode": "0151",
				"character": "ő",
				"glyphName": "ohungarumlaut",
				"characterName": "LATIN SMALL LETTER O WITH DOUBLE ACUTE"
			},
			{
				"unicode": "0152",
				"character": "Œ",
				"glyphName": "OE",
				"characterName": "LATIN CAPITAL LIGATURE OE"
			},
			{
				"unicode": "0153",
				"character": "œ",
				"glyphName": "oe",
				"characterName": "LATIN SMALL LIGATURE OE"
			},
			{
				"unicode": "0154",
				"character": "Ŕ",
				"glyphName": "Racute",
				"characterName": "LATIN CAPITAL LETTER R WITH ACUTE"
			},
			{
				"unicode": "0155",
				"character": "ŕ",
				"glyphName": "racute",
				"characterName": "LATIN SMALL LETTER R WITH ACUTE"
			},
			{
				"unicode": "0156",
				"character": "Ŗ",
				"glyphName": "uni0156",
				"characterName": "LATIN CAPITAL LETTER R WITH CEDILLA"
			},
			{
				"unicode": "0157",
				"character": "ŗ",
				"glyphName": "uni0157",
				"characterName": "LATIN SMALL LETTER R WITH CEDILLA"
			},
			{
				"unicode": "0158",
				"character": "Ř",
				"glyphName": "Rcaron",
				"characterName": "LATIN CAPITAL LETTER R WITH CARON"
			},
			{
				"unicode": "0159",
				"character": "ř",
				"glyphName": "rcaron",
				"characterName": "LATIN SMALL LETTER R WITH CARON"
			},
			{
				"unicode": "015A",
				"character": "Ś",
				"glyphName": "Sacute",
				"characterName": "LATIN CAPITAL LETTER S WITH ACUTE"
			},
			{
				"unicode": "015B",
				"character": "ś",
				"glyphName": "sacute",
				"characterName": "LATIN SMALL LETTER S WITH ACUTE"
			},
			{
				"unicode": "015E",
				"character": "Ş",
				"glyphName": "uni015E",
				"characterName": "LATIN CAPITAL LETTER S WITH CEDILLA"
			},
			{
				"unicode": "015F",
				"character": "ş",
				"glyphName": "uni015F",
				"characterName": "LATIN SMALL LETTER S WITH CEDILLA"
			},
			{
				"unicode": "0160",
				"character": "Š",
				"glyphName": "Scaron",
				"characterName": "LATIN CAPITAL LETTER S WITH CARON"
			},
			{
				"unicode": "0161",
				"character": "š",
				"glyphName": "scaron",
				"characterName": "LATIN SMALL LETTER S WITH CARON"
			},
			{
				"unicode": "0162",
				"character": "Ţ",
				"glyphName": "uni0162",
				"characterName": "LATIN CAPITAL LETTER T WITH CEDILLA"
			},
			{
				"unicode": "0163",
				"character": "ţ",
				"glyphName": "uni0163",
				"characterName": "LATIN SMALL LETTER T WITH CEDILLA"
			},
			{
				"unicode": "0164",
				"character": "Ť",
				"glyphName": "Tcaron",
				"characterName": "LATIN CAPITAL LETTER T WITH CARON"
			},
			{
				"unicode": "0165",
				"character": "ť",
				"glyphName": "tcaron",
				"characterName": "LATIN SMALL LETTER T WITH CARON"
			},
			{
				"unicode": "016A",
				"character": "Ū",
				"glyphName": "Umacron",
				"characterName": "LATIN CAPITAL LETTER U WITH MACRON"
			},
			{
				"unicode": "016B",
				"character": "ū",
				"glyphName": "umacron",
				"characterName": "LATIN SMALL LETTER U WITH MACRON"
			},
			{
				"unicode": "016E",
				"character": "Ů",
				"glyphName": "Uring",
				"characterName": "LATIN CAPITAL LETTER U WITH RING ABOVE"
			},
			{
				"unicode": "016F",
				"character": "ů",
				"glyphName": "uring",
				"characterName": "LATIN SMALL LETTER U WITH RING ABOVE"
			},
			{
				"unicode": "0170",
				"character": "Ű",
				"glyphName": "Uhungarumlaut",
				"characterName": "LATIN CAPITAL LETTER U WITH DOUBLE ACUTE"
			},
			{
				"unicode": "0171",
				"character": "ű",
				"glyphName": "uhungarumlaut",
				"characterName": "LATIN SMALL LETTER U WITH DOUBLE ACUTE"
			},
			{
				"unicode": "0172",
				"character": "Ų",
				"glyphName": "Uogonek",
				"characterName": "LATIN CAPITAL LETTER U WITH OGONEK"
			},
			{
				"unicode": "0173",
				"character": "ų",
				"glyphName": "uogonek",
				"characterName": "LATIN SMALL LETTER U WITH OGONEK"
			},
			{
				"unicode": "0178",
				"character": "Ÿ",
				"glyphName": "Ydieresis",
				"characterName": "LATIN CAPITAL LETTER Y WITH DIAERESIS"
			},
			{
				"unicode": "0179",
				"character": "Ź",
				"glyphName": "Zacute",
				"characterName": "LATIN CAPITAL LETTER Z WITH ACUTE"
			},
			{
				"unicode": "017A",
				"character": "ź",
				"glyphName": "zacute",
				"characterName": "LATIN SMALL LETTER Z WITH ACUTE"
			},
			{
				"unicode": "017B",
				"character": "Ż",
				"glyphName": "Zdotaccent",
				"characterName": "LATIN CAPITAL LETTER Z WITH DOT ABOVE"
			},
			{
				"unicode": "017C",
				"character": "ż",
				"glyphName": "zdotaccent",
				"characterName": "LATIN SMALL LETTER Z WITH DOT ABOVE"
			},
			{
				"unicode": "017D",
				"character": "Ž",
				"glyphName": "Zcaron",
				"characterName": "LATIN CAPITAL LETTER Z WITH CARON"
			},
			{
				"unicode": "017E",
				"character": "ž",
				"glyphName": "zcaron",
				"characterName": "LATIN SMALL LETTER Z WITH CARON"
			},
			{
				"unicode": "0192",
				"character": "ƒ",
				"glyphName": "florin",
				"characterName": "LATIN SMALL LETTER F WITH HOOK"
			},
			{
				"unicode": "0218",
				"character": "Ș",
				"glyphName": "uni0218",
				"characterName": "LATIN CAPITAL LETTER S WITH COMMA BELOW"
			},
			{
				"unicode": "0219",
				"character": "ș",
				"glyphName": "uni0219",
				"characterName": "LATIN SMALL LETTER S WITH COMMA BELOW"
			},
			{
				"unicode": "021A",
				"character": "Ț",
				"glyphName": "uni021A",
				"characterName": "LATIN CAPITAL LETTER T WITH COMMA BELOW"
			},
			{
				"unicode": "021B",
				"character": "ț",
				"glyphName": "uni021B",
				"characterName": "LATIN SMALL LETTER T WITH COMMA BELOW"
			},
			{
				"unicode": "02C6",
				"character": "ˆ",
				"glyphName": "circumflex",
				"characterName": "MODIFIER LETTER CIRCUMFLEX ACCENT"
			},
			{
				"unicode": "02C7",
				"character": "ˇ",
				"glyphName": "caron",
				"characterName": "CARON"
			},
			{
				"unicode": "02C9",
				"character": "ˉ",
				"glyphName": "uni02C9",
				"characterName": "MODIFIER LETTER MACRON"
			},
			{
				"unicode": "02D8",
				"character": "˘",
				"glyphName": "breve",
				"characterName": "BREVE"
			},
			{
				"unicode": "02D9",
				"character": "˙",
				"glyphName": "dotaccent",
				"characterName": "DOT ABOVE"
			},
			{
				"unicode": "02DA",
				"character": "˚",
				"glyphName": "ring",
				"characterName": "RING ABOVE"
			},
			{
				"unicode": "02DB",
				"character": "˛",
				"glyphName": "ogonek",
				"characterName": "OGONEK"
			},
			{
				"unicode": "02DC",
				"character": "˜",
				"glyphName": "tilde",
				"characterName": "SMALL TILDE"
			},
			{
				"unicode": "02DD",
				"character": "˝",
				"glyphName": "hungarumlaut",
				"characterName": "DOUBLE ACUTE ACCENT"
			},
			{
				"unicode": "03C0",
				"character": "π",
				"glyphName": "pi",
				"characterName": "GREEK SMALL LETTER PI"
			},
			{
				"unicode": "2013",
				"character": "–",
				"glyphName": "endash",
				"characterName": "EN DASH"
			},
			{
				"unicode": "2014",
				"character": "—",
				"glyphName": "emdash",
				"characterName": "EM DASH"
			},
			{
				"unicode": "2018",
				"character": "‘",
				"glyphName": "quoteleft",
				"characterName": "LEFT SINGLE QUOTATION MARK"
			},
			{
				"unicode": "2019",
				"character": "’",
				"glyphName": "quoteright",
				"characterName": "RIGHT SINGLE QUOTATION MARK"
			},
			{
				"unicode": "201A",
				"character": "‚",
				"glyphName": "quotesinglbase",
				"characterName": "SINGLE LOW-9 QUOTATION MARK"
			},
			{
				"unicode": "201C",
				"character": "“",
				"glyphName": "quotedblleft",
				"characterName": "LEFT DOUBLE QUOTATION MARK"
			},
			{
				"unicode": "201D",
				"character": "”",
				"glyphName": "quotedblright",
				"characterName": "RIGHT DOUBLE QUOTATION MARK"
			},
			{
				"unicode": "201E",
				"character": "„",
				"glyphName": "quotedblbase",
				"characterName": "DOUBLE LOW-9 QUOTATION MARK"
			},
			{
				"unicode": "2020",
				"character": "†",
				"glyphName": "dagger",
				"characterName": "DAGGER"
			},
			{
				"unicode": "2021",
				"character": "‡",
				"glyphName": "daggerdbl",
				"characterName": "DOUBLE DAGGER"
			},
			{
				"unicode": "2022",
				"character": "•",
				"glyphName": "bullet",
				"characterName": "BULLET"
			},
			{
				"unicode": "2026",
				"character": "…",
				"glyphName": "ellipsis",
				"characterName": "HORIZONTAL ELLIPSIS"
			},
			{
				"unicode": "2030",
				"character": "‰",
				"glyphName": "perthousand",
				"characterName": "PER MILLE SIGN"
			},
			{
				"unicode": "2039",
				"character": "‹",
				"glyphName": "guilsinglleft",
				"characterName": "SINGLE LEFT-POINTING ANGLE QUOTATION MARK"
			},
			{
				"unicode": "203A",
				"character": "›",
				"glyphName": "guilsinglright",
				"characterName": "SINGLE RIGHT-POINTING ANGLE QUOTATION MARK"
			},
			{
				"unicode": "2044",
				"character": "⁄",
				"glyphName": "fraction",
				"characterName": "FRACTION SLASH"
			},
			{
				"unicode": "20AC",
				"character": "€",
				"glyphName": "Euro",
				"characterName": "EURO SIGN"
			},
			{
				"unicode": "20BA",
				"character": "₺",
				"glyphName": "uni20BA",
				"characterName": "TURKISH LIRA SIGN"
			},
			{
				"unicode": "20BD",
				"character": "₽",
				"glyphName": "uni20BD",
				"characterName": "RUBLE SIGN"
			},
			{
				"unicode": "2113",
				"character": "ℓ",
				"glyphName": "uni2113",
				"characterName": "SCRIPT SMALL L"
			},
			{
				"unicode": "2122",
				"character": "™",
				"glyphName": "trademark",
				"characterName": "TRADE MARK SIGN"
			},
			{
				"unicode": "2126",
				"character": "Ω",
				"glyphName": "uni2126",
				"characterName": "OHM SIGN"
			},
			{
				"unicode": "212E",
				"character": "℮",
				"glyphName": "estimated",
				"characterName": "ESTIMATED SYMBOL"
			},
			{
				"unicode": "2202",
				"character": "∂",
				"glyphName": "partialdiff",
				"characterName": "PARTIAL DIFFERENTIAL"
			},
			{
				"unicode": "2206",
				"character": "∆",
				"glyphName": "uni2206",
				"characterName": "INCREMENT"
			},
			{
				"unicode": "220F",
				"character": "∏",
				"glyphName": "product",
				"characterName": "N-ARY PRODUCT"
			},
			{
				"unicode": "2211",
				"character": "∑",
				"glyphName": "summation",
				"characterName": "N-ARY SUMMATION"
			},
			{
				"unicode": "2212",
				"character": "−",
				"glyphName": "minus",
				"characterName": "MINUS SIGN"
			},
			{
				"unicode": "2215",
				"character": "∕",
				"glyphName": "uni2215",
				"characterName": "DIVISION SLASH"
			},
			{
				"unicode": "2219",
				"character": "∙",
				"glyphName": "uni2219",
				"characterName": "BULLET OPERATOR"
			},
			{
				"unicode": "221A",
				"character": "√",
				"glyphName": "radical",
				"characterName": "SQUARE ROOT"
			},
			{
				"unicode": "221E",
				"character": "∞",
				"glyphName": "infinity",
				"characterName": "INFINITY"
			},
			{
				"unicode": "222B",
				"character": "∫",
				"glyphName": "integral",
				"characterName": "INTEGRAL"
			},
			{
				"unicode": "2248",
				"character": "≈",
				"glyphName": "approxequal",
				"characterName": "ALMOST EQUAL TO"
			},
			{
				"unicode": "2260",
				"character": "≠",
				"glyphName": "notequal",
				"characterName": "NOT EQUAL TO"
			},
			{
				"unicode": "2264",
				"character": "≤",
				"glyphName": "lessequal",
				"characterName": "LESS-THAN OR EQUAL TO"
			},
			{
				"unicode": "2265",
				"character": "≥",
				"glyphName": "greaterequal",
				"characterName": "GREATER-THAN OR EQUAL TO"
			},
			{
				"unicode": "25CA",
				"character": "◊",
				"glyphName": "lozenge",
				"characterName": "LOZENGE"
			},
			{
				"unicode": "FB01",
				"character": "ﬁ",
				"glyphName": "fi",
				"characterName": "LATIN SMALL LIGATURE FI"
			},
			{
				"unicode": "FB02",
				"character": "ﬂ",
				"glyphName": "fl",
				"characterName": "LATIN SMALL LIGATURE FL"
			}
		]


		const classes = ClassNames({
			'search-glyph-list': true
		});

		return (
			<form className={classes}>
				<input className="search-glyph-list-input" placeholder="Search glyph…" type="text"/>
				<input className="search-glyph-list-submit" onClick={(e) => { console.log('click') }} type="button"/>
			</form>
		)
	}
}
