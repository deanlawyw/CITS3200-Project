import {doNonNullCheck, doTypeCheck} from "./types";
import {convertRichTextToHTML} from "./richText";

const Excel = require("exceljs");

export class ExcelType {
    exceljsType; // Excel.ValueType
    name; // String

    constructor(exceljsType, name) {
        doNonNullCheck(exceljsType);
        doTypeCheck(name, "string");

        this.exceljsType = exceljsType;
        this.name = name;
    }

    /**
     * Attempts to coerce value with the given type to this
     * type, returning undefined if it is not possible.
     */
    coerceType(value, type) {
        return undefined;
    }

    /**
     * Returns the value of the given cell, or undefined if
     * the cell does not contain a value that is compatible
     * with this type.
     */
    readCellValue(cell) {
        if (cell.type === this.exceljsType)
            return cell.value;

        return this.coerceType(cell.value, cell.type);
    }

    static getExcelJSTypeName(exceljsType) {
        doNonNullCheck(exceljsType);

        switch (exceljsType) {
            case Excel.ValueType.Null:
                return "nothing";
            case Excel.ValueType.Merge:
                return "a merged cell";
            case Excel.ValueType.Number:
                return "a number";
            case Excel.ValueType.String:
                return "a string";
            case Excel.ValueType.Date:
                return "a date";
            case Excel.ValueType.Hyperlink:
                return "a hyperlink"
            case Excel.ValueType.Formula:
                return "a formula";
            case Excel.ValueType.SharedString:
                return "a shared string";
            case Excel.ValueType.RichText:
                return "formatted text"
            case Excel.ValueType.Boolean:
                return "a boolean";
            case Excel.ValueType.Error:
                return "an error";
            default:
                return "an unknown type (" + exceljsType + ")";
        }
    }
}

class ExcelStringType extends ExcelType {
    constructor() {
        super(Excel.ValueType.String, "a string");
    }

    coerceType(value, type) {
        if (type === Excel.ValueType.RichText)
            return convertRichTextToHTML(value);
        if (type === Excel.ValueType.Boolean || type === Excel.ValueType.Number || type === Excel.ValueType.Date)
            return String(value);
        return undefined;
    }
}

class ExcelBooleanType extends ExcelType {
    constructor() {
        super(Excel.ValueType.Boolean, "a boolean");
    }

    coerceType(value, type) {
        if (type === Excel.ValueType.String) {
            value = value.toUpperCase();
            if ("YES" === value || "TRUE" === value || "Y" === value || "T" === value)
                return true;
            if ("NO" === value || "FALSE" === value || "N" === value || "F" === value)
                return false;
        }
        return super.coerceType(value, type);
    }
}

class ExcelImageType extends ExcelType {
    constructor() {
        super(Excel.ValueType.Null, "an image");
    }

    readCellValue(cell) {
        // We have to search the images in the worksheet to find
        // the image in the given cell.
        const worksheetImages = cell.worksheet.getImages();
        for (let key in worksheetImages) {
            if (!worksheetImages.hasOwnProperty(key))
                continue;

            const imageRef = worksheetImages[key];
            if (imageRef.type !== "image" || !imageRef.range || imageRef.range.editAs !== "oneCell")
                continue;

            const tl = imageRef.range.tl;
            if (!tl || tl.nativeRow + 1 !== cell.row || tl.nativeCol + 1 !== cell.col)
                continue;

            return cell.workbook.getImage(imageRef.imageId);
        }
        return this.coerceType(cell.value, cell.type);
    }
}

class ExcelTextOrImageType extends ExcelType {
    imageType = new ExcelImageType();
    textType = new ExcelStringType();

    constructor() {
        super(Excel.ValueType.Null, "text or an image");
    }

    readCellValue(cell) {
        const image = this.imageType.readCellValue(cell);
        if (image !== undefined)
            return image;

        return this.textType.readCellValue(cell);
    }
}

export const ExcelString = new ExcelStringType();
export const ExcelNumber = new ExcelType(Excel.ValueType.Number, "a number");
export const ExcelPercentage = new ExcelType(Excel.ValueType.Number, "a percentage");
export const ExcelBoolean = new ExcelBooleanType();
export const ExcelImage = new ExcelImageType();
export const ExcelTextOrImage = new ExcelTextOrImageType();


export class WorkbookLoc {
    name; // String
    worksheet; // String
    cell; // String
    type; // ExcelType

    constructor(name, worksheet, cell, type) {
        doTypeCheck(name, "string");
        doTypeCheck(worksheet, "string");
        doTypeCheck(cell, "string");
        doTypeCheck(type, ExcelType);

        this.name = name;
        this.worksheet = worksheet;
        this.cell = cell;
        this.type = type;
    }

    get address() {
        return this.worksheet + "!" + this.cell;
    }
}

export class WorkbookColumn {
    name; // String
    worksheet; // String
    column; // String
    type; // ExcelType

    constructor(name, worksheet, column, type) {
        doTypeCheck(name, "string");
        doTypeCheck(worksheet, "string");
        doTypeCheck(column, "string");
        doTypeCheck(type, ExcelType);

        this.name = name;
        this.worksheet = worksheet;
        this.column = column;
        this.type = type;
    }

    row(row) {
        doTypeCheck(row, "number");
        return new WorkbookLoc(this.name, this.worksheet, this.column + row, this.type);
    }
}


function isCellAtAddressBlank(workbook, worksheet, address) {
    const cell = workbook.getWorksheet(worksheet).getCell(address);
    // This also returns true for cells that contain images, but oh well...
    return cell.type === Excel.ValueType.Null || cell.type === Excel.ValueType.Merge;
}


/**
 * An error that is thrown when the value in a cell does
 * not match the type of value that is expected.
 */
export class CellTypeError extends Error {}

/**
 * Returns whether the cell at the given WorkbookLoc is blank.
 */
export function isCellBlank(workbook, loc) {
    return isCellAtAddressBlank(workbook, loc.worksheet, loc.address);
}

/**
 * Returns whether all the cells in the given range of cells is blank.
 * The range is specified as the intersection of the given rows and columns.
 */
export function areCellsBlank(workbook, worksheet, columns, rows) {
    for (let colIndex = 0; colIndex < columns.length; ++colIndex) {
        for (let rowIndex = 0; rowIndex < rows.length; ++rowIndex) {
            const address = columns[colIndex] + rows[rowIndex];
            if (!isCellAtAddressBlank(workbook, worksheet, address))
                return false;
        }
    }
    return true;
}

/**
 * Reads the value of the cell at the given location.
 * If the value is missing or not of the expected type,
 * then an error will be thrown.
 */
export function readCell(workbook, loc) {
    doTypeCheck(loc, WorkbookLoc);

    const cell = workbook.getWorksheet(loc.worksheet).getCell(loc.cell);
    const value = loc.type.readCellValue(cell);
    if (value === undefined) {
        throw new CellTypeError(
            "Expected " + loc.address + " (" + loc.name + ") to contain " + loc.type.name +
            ", but instead it contained " + ExcelType.getExcelJSTypeName(cell.type) +
            ": " + JSON.stringify(cell.value)
        );
    }
    return value;
}
