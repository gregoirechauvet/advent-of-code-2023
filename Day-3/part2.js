const query = await fetch('input.txt');
const content = await query.text();
const lines = content.split("\n");

const dataset = parseDataset(lines);
computePartNumbers();
console.log(dataset);
const sum = computeGears();
console.log(sum);

/** @typedef {{ value: number }} PartValue */

/**
 * @param {string[]} lines
 * @return {(number | string | PartValue | undefined)[][]}
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
 * @return {void}
 */
function computePartNumbers() {
    dataset.forEach((row, x) => {
        row.forEach((value, y) => {
            const previousValue = y > 0 ? dataset[x][y - 1] : undefined;

            if (typeof value === "number") {
                const previousPartNumber = typeof previousValue === "object" ? previousValue : { value: 0 };
                previousPartNumber.value = Number(`${previousPartNumber.value}${value}`);
                dataset[x][y] = previousPartNumber;
            }
        });
    });
}

/**
 * @return {number}
 */
function computeGears() {
    let sum = 0;

    const maxX = dataset.length;
    const maxY = dataset[0].length;
    const neighbors = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
    ]

    dataset.forEach((row, posX) => {
        row.forEach((value, posY) => {
            if (value === "*") {
                // Set to deduplicate references
                /** @type {Set<PartValue>} */
                const partNumbers = new Set();
                neighbors.forEach(([deltaX, deltaY]) => {
                    const x = posX + deltaX;
                    const y = posY + deltaY;

                    if (x >= 0 && x < maxX && y >= 0 && y < maxY && typeof dataset[x][y] === "object") {
                        partNumbers.add(dataset[x][y]);
                    }
                });

                if (partNumbers.size === 2) {
                    const [{ value: first }, { value: second }] = Array.of(...partNumbers);
                    sum += first * second;
                }
            }
        });
    });

    return sum;
}