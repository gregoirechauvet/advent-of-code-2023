const query = await fetch('input.txt');
const content = await query.text();
const lines = content.split("\n");

const dataset = parseDataset(lines);
console.log(dataset);
const partNumbers = computePartNumbers();
const sum = partNumbers.filter(isValid).reduce((acc, partNumber) => acc + partNumber.value, 0);
console.log(sum)

/** @typedef {{ value: number; x: number; y: number }} PartNumber */

/**
 * @param {string[]} lines
 * @return {(number | string | undefined)[][]}
 */
function parseDataset(lines) {
    return lines.map(line => {
        return line.split("").map(char => {
            if (char === ".") {
                return undefined;
            }
            return getDigit(char) ?? char;
        })
    });
}

/**
 * @param {string} char
 * @return {number | undefined}
 */
function getDigit(char) {
    const digits = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    return digits.has(char) ? Number(char) : undefined;
}

/**
 * @return {PartNumber[]}
 */
function computePartNumbers() {
    /** @type {PartNumber[]} */
    const numbers = [];

    dataset.forEach((row, x) => {
        /** @type {string | undefined} */
        let currentNumber = undefined;
        row.forEach((char, y) => {
            if (typeof char === "number") {
                currentNumber ??= "";
                currentNumber = `${currentNumber}${char}`;
                return;
            }

            if (currentNumber !== undefined) {
                numbers.push({ value: Number(currentNumber), x, y: y - currentNumber.length });
                currentNumber = undefined;
            }
        });
        if (currentNumber !== undefined) {
            numbers.push({ value: Number(currentNumber), x, y: row.length - currentNumber.length });
            currentNumber = undefined;
        }
    })

    return numbers;
}

/**
 * @param {number} posX
 * @param {number} posY
 * @return {bool}
 */
function computeSum() {
    let sum = 0;
    dataset.forEach((row, x) => {
        row.forEach((value, y) => {
            if (typeof value === "number" && isValid(x, y)) {
                sum += value;
            }
        })
    })
    return sum;
}

/**
 * @param {PartNumber} partNumber
 * @return {bool}
 */
function isValid(partNumber) {
    const maxX = dataset.length;
    const maxY = dataset[0].length;

    const length = partNumber.value.toString().length;
    const deltaYs = Array.from({ length: length + 2 }, (_, i) => i - 1);

    const { x: posX, y: posY } = partNumber;

    return [-1, 0, 1].some(deltaX => {
        return deltaYs.some(deltaY => {
            const x = posX + deltaX;
            const y = posY + deltaY;
            return x >= 0 && x < maxX && y >= 0 && y < maxY && typeof dataset[x][y] === "string";
        });
    });
}