// @flow
import os2, {getUnicodeRange} from './os2.js';

import check from '../check';
import table from '../table';
import cmap from './cmap';
import cff from './cff';
import head from './head';
import hhea from './hhea';
import hmtx from './hmtx';
import ltag from './ltag';
import maxp from './maxp';
import name from './name';
import post from './post';

const usWeightClasses = {
    THIN: 100,
    EXTRA_LIGHT: 200,
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMI_BOLD: 600,
    BOLD: 700,
    EXTRA_BOLD: 800,
    BLACK: 900,
};

const usWidthClasses = {
    ULTRA_CONDENSED: 1,
    EXTRA_CONDENSED: 2,
    CONDENSED: 3,
    SEMI_CONDENSED: 4,
    MEDIUM: 5,
    SEMI_EXPANDED: 6,
    EXPANDED: 7,
    EXTRA_EXPANDED: 8,
    ULTRA_EXPANDED: 9,
};

type LocalizedName = {
    en: string,
};

type UsWeightClass = $Keys<typeof usWeightClasses>;
type UsWidthClass = $Keys<typeof usWidthClasses>;

type Os2Table = {
    usWeightClass: UsWeightClass,
    usWidthClass: UsWidthClass,
};

type Tables = {
    os2: Os2Table
};

type Glyph = {
    unicode: number,
    advanceWidth: number,
    name: string,
}

type Font = {
    fontFamily: LocalizedName,
    fontSubFamily: LocalizedName,
    fullName?: LocalizedName,
    postScriptName?: LocalizedName,
    designer?: LocalizedName,
    designerUrl?: LocalizedName,
    manufacturer?: LocalizedName,
    manufacturerUrl?: LocalizedName,
    license?: LocalizedName,
    licenseUrl?: LocalizedName,
    version?: LocalizedName,
    description?: LocalizedName,
    copyright?: LocalizedName,
    trademark?: LocalizedName,
    unitsPerEm: number,
    ascender: number,
    descender: number,
    createdTimestamp?: number,
    usWeightClass?: UsWeightClass,
    usWidthClass?: UsWidthClass,
    tables?: Tables,
    glyphs: Glyph[],
};

export function funcFontToSfntTable(font: Font): ArrayBuffer {
    const {
        ascender,
        descender,
        unitsPerEm,
        glyphs,
        createdTimestamp,
        fontFamily,
        fontSubFamily,
        postScriptName,
        manufacturer,
        manufacturerUrl,
        designer,
        designerUrl,
        license,
        licenseUrl,
        version,
        description,
        copyright,
        trademark,
        usWeightClass,
        usWidthClass,
    } = font;

    const xMins: number[] = [];
    const yMins: number[] = [];
    const xMaxs: number[] = [];
    const yMaxs: number[] = [];
    const advanceWidths: number[] = [];
    const leftSideBearings: number[] = [];
    const rightSideBearings: number[] = [];
    let firstCharIndex: number = Infinity;
    let lastCharIndex: number = 0;
    let ulUnicodeRange1: number = 0;
    let ulUnicodeRange2: number = 0;
    let ulUnicodeRange3: number = 0;
    let ulUnicodeRange4: number = 0;

    for (let i: number = 0; i < font.glyphs.length; i++) {
        const glyph: Glyph = font.glyphs[i];
        const unicode: number = glyph.unicode;

        if (isNaN(glyph.advanceWidth)) {
            throw new Error(`Glyph ${glyph.name} (${i}): advanceWidth is not a number`);
        }

        if (firstCharIndex > unicode && unicode > 0) {
            firstCharIndex = unicode;
        }

        if (lastCharIndex < unicode) {
            lastCharIndex = unicode;
        }

        const position: number = getUnicodeRange(unicode);

        if (position < 32) {
            ulUnicodeRange1 |= 1 << position;
        }
        else if (position < 64) {
            ulUnicodeRange2 |= 1 << position - 32;
        }
        else if (position < 96) {
            ulUnicodeRange3 |= 1 << position - 64;
        }
        else if (position < 123) {
            ulUnicodeRange4 |= 1 << position - 96;
        }
        else {
            throw new Error('Unicode ranges bits > 123 are reserved for internal usage');
        }

        if (glyph.name === '.notdef') {
            continue;
        }

        const metrics: Metrics = getMetrics(glyph);

        xMins.push(metrics.xMin);
        yMins.push(metrics.yMin);
        xMaxs.push(metrics.xMaxs);
        yMaxs.push(metrics.yMaxs);
        leftSideBearings.push(metrics.leftSideBearing);
        rightSideBearings.push(metrics.rightSideBearing);
        advanceWidths.push(glyph.advanceWidth);
    }
    const advanceWidthMax: number = Math.max.apply(null, advanceWidths);
	const advanceWithAvg: number = _.reduce(advanceWidths, (acc, item) => { return acc + item; }, 0) / advanceWidths.length;
    const minLeftSideBearing: number = Math.min.apply(null, leftSideBearings);
    const maxLeftSideBearing: number = Math.min.apply(null, leftSideBearings);
    const xMin: number = Math.min.apply(null, xMins);
    const yMin: number = Math.min.apply(null, yMins);
    const xMax: number = Math.max.apply(null, xMaxs);
    const yMax: number = Math.max.apply(null, yMaxs);

    const headTable: HeadTable = head.make({
        flags: 3,
        unitsPerEm: font.unitsPerEm,
        xMin,
        yMin,
        xMax,
        yMax,
        lowestRectPPEM: 3,
        createdTimestamp,
    });

    const hheaTable: HheaTable = hhea.make({
        ascender,
        descender,
        advanceWidthMax,
        minLeftSideBearing,
        maxLeftSideBearing,
        xMaxExtent: maxLeftSideBearing + xMax - xMin,
    });

    const maxpTable = maxp.make(font.glyphs.length);

    const os2Table = os2.make({
        xAvgCharWidth: Math.round(advanceWithAvg),
        usWeightClass,
        usWidthClass,
        usFirstCharIndex: firstCharIndex,
        usLastCharIndex: lastCharIndex,
        ulUnicodeRange1,
        ulUnicodeRange2,
        ulUnicodeRange3,
        ulUnicodeRange4,
        fsSelection,
        sTypoAscender: ascender,
        sTypoDescender: descender,
        sTypeLineGap: 0,
        usWinAscent: yMax,
        usWinDescent: Math.abs(yMin),
        ulCodePageRange1: 1,
        sxHeight: metricsForChar(font, 'xyvw', {yMax: Math.round(ascender / 2)}).yMax,
        sCapHeight: metricsForChar(font, 'HIKLEFJMNTZBDPRAGOQSUVWXY', {yMax}).yMax,
    });

    const hmtxTable = hmtx.make(glyphs);
    const cmapTable = cmap.make(glyphs);

    const englishFamilyName = fontFamily.en;
    const englishStyleName = fontSubFamily.en;
    const englishFullName = `${englishFamilyName} ${englishStyleName}`;
    const postScriptNameString = postScriptName.en || `${englishFamilyName.replace(/\s/g, '')}-${englishStyleName}`;

    const names = {
        fontFamily,
        fontSubFamily,
        fullName: {en: englishFullName},
        postScriptName: {en: postScriptNameString},
        designer,
        designerUrl,
        manufacturer,
        manufacturerUrl,
        license,
        licenseUrl,
        version,
        description,
        copyright,
        trademark,
        uniqueID: {en: `${manufacturer}:${englishFullName}`},
        preferredFamily: fontFamily,
        preferredSubFamily: fontSubFamily,
    };

    const languageTags = [];
    const nameTable = name.make(names, languageTags);
    const ltagTable = languageTags.length > 0 ? ltag.make(languageTags) : undefined;

    const postTable = post.make();
    const cffTable = cff.make(glyphs, {
        version: version.en,
        fullName: englishFullName,
        familyName: englishFamilyName,
        weightName: englishStyleName,
        postScriptNameString,
        unitsPerEm,
        fontBBox: [0, yMin, ascender, advanceWidthMax],
    });

    const tables = [headTable, hheaTable, maxpTable, os2Table, nameTable, cmapTable, postTable, cffTable, hmtxTable];

    if (ltagTable) {
        tables.push(ltagTable);
    }

    const sfntTable = makeSfntTable(tables);
    const bytes = sfntTable.encode();
    const checkSum = computeCheckSum(bytes);
    const tableFields = sfntTable.fields;
    let checkSumAdjusted = false;

    for (let i = 0; i < tableFields.length; i++) {
        if (tableFields[i].name === 'head table') {
            tableFields[i].value.checkSumAdjusted = 0xB1B0AFBA - checkSum;
            checkSumAdjusted = true;
            break;
        }
    }

    if (!checkSumAdjusted) {
        throw new Error('Could not find head table with checkSum to adjust');
    }

    return sfntTable;
}

function makeSfntTable(tables) {
    const sfnt = new table.Table('sfnt', [
        {name: 'version', type: 'TAG', value: 'OTTO'},
        {name: 'numTables', type: 'USHORT', value: 0},
        {name: 'searchRange', type: 'USHORT', value: 0},
        {name: 'entrySelector', type: 'USHORT', value: 0},
        {name: 'rangeShift', type: 'USHORT', value: 0},
    ]);

    sfnt.tables = tables;
    sfnt.numTables = tables.length;
    const highestPowerOf2 = Math.pow(2, log2(sfnt.numTables));

    sfnt.searchRange = 16 * highestPowerOf2;
    sfnt.entrySelector = log2(highestPowerOf2);
    sfnt.rangeShift = sfnt.numTables * 16 - sfnt.searchRange;

    const recordFields = [];
    const tableFields = [];

    let offset = sfnt.sizeOf() + (makeTableRecord().sizeOf() * sfnt.numTables);

    while (offset % 4 !== 0) {
        offset += 1;
        tableFields.push({name: 'padding', type: 'BYTE', value: 0});
    }

    for (let i = 0; i < tables.length; i += 1) {
        const t = tables[i];

        check.argument(t.tableName.length === 4, `Table name ${t.tableName} is invalid.`);

        const tableLength = t.sizeOf();
        const tableRecord = makeTableRecord(t.tableName, computeCheckSum(t.encode()), offset, tableLength);

        recordFields.push({name: `${tableRecord.tag} Table Record`, type: 'RECORD', value: tableRecord});
        tableFields.push({name: `${t.tableName} table`, type: 'RECORD', value: t});
        offset += tableLength;
        check.argument(!isNaN(offset), 'Something went wrong calculating the offset.');
        while (offset % 4 !== 0) {
            offset += 1;
            tableFields.push({name: 'padding', type: 'BYTE', value: 0});
        }
    }

    // Table records need to be sorted alphabetically.
    recordFields.sort(function(r1, r2) {
        if (r1.value.tag > r2.value.tag) {
            return 1;
        }
        else {
            return -1;
        }
    });

    sfnt.fields = sfnt.fields.concat(recordFields);
    sfnt.fields = sfnt.fields.concat(tableFields);
    return sfnt;
}

function metricsForChar(glyphs, chars, notFoundMetrics) {
    for (let i = 0; i < chars.length; i++) {
        const glyph = _.find(glyphs, {
            unicode: chars[i].charCodeAt(0),
        });

        if (glyph) {
            return getMetrics(glyph);
        }
    }

    return notFoundMetrics;
}

function getMetrics(glyph) {
    const xCoords = [];
    const yCoords = [];

    glyph.contours.forEach((contour) => {
        contour.nodes.forEach((node) => {
            xCoords.push(node.x);
            yCoords.push(node.y);

            xCoords.push(handleIn.x);
            yCoords.push(handleIn.y);

            xCoords.push(handleOut.x);
            yCoords.push(handleOut.y);
        });
    });

    return {
        xMin: Math.min(...xCoords),
        xMax: Math.max(...xCoords),
        yMin: Math.min(...yCoords),
        yMax: Math.max(...yCoords),
        leftSideBearing: glyph.spacingLeft,
        rightSideBearing: glyph.spacingRight,
    };
}
