const stringDigits = [
    { "name": "one", "value": 1 },
    { "name": "two", "value": 2 },
    { "name": "three", "value": 3 },
    { "name": "four", "value": 4 },
    { "name": "five", "value": 5 },
    { "name": "six", "value": 6 },
    { "name": "seven", "value": 7 },
    { "name": "eight", "value": 8 },
    { "name": "nine", "value": 9 }
];

const query = await fetch('input.txt');
const content = await query.text();
const lines = content.split("\n");

const digitTree = computeStringDigitTree(stringDigits);
const sum = lines.reduce((acc, line) => acc + computeLineValue(line), 0);
console.log(sum);

/** @typedef {Map<string, number | Tree>} Tree */

/**
 * @param {string} line 
 * @return {number}
 */
function computeLineValue(line) {
    const chars = line.split("");
    const firstDigit = findDigit(chars, 0, x => x + 1);
    const lastDigit = findDigit(chars, chars.length - 1, x => x - 1);

    console.log(line, firstDigit, lastDigit);
    return Number(`${firstDigit}${lastDigit}`);
}

/**
 * @param {string[]} chars
 * @param {number} iteration
 * @param {(x: number) => number} iterator
 * @return {number | undefined}
 */
function findDigit(chars, iteration, iterator) {
    const digit = isDigit(chars, iteration);
    if (digit !== undefined) {
        return digit;
    }

    return findDigit(chars, iterator(iteration), iterator)
}

/**
 * @param {string[]} chars
 * @param {number} iteration
 * @return {number | undefined}
 */
function isDigit(chars, iteration, iterator) {
    let potentialDigit = Number(chars[iteration]);
    if (!Number.isNaN(potentialDigit)) {
        return potentialDigit;
    }

    potentialDigit = extractStringDigit(digitTree, chars, iteration);
    if (potentialDigit !== undefined) {
        return potentialDigit;
    }

    return undefined;
}

/**
 * @param {Tree} tree
 * @param {string[]} chars
 * @param {number} cursor
 * @return {number | undefined}
 */
function extractStringDigit(tree, chars, cursor) {
    const currentChar = chars[cursor];
    const existingNode = tree.get(currentChar);

    if (typeof existingNode !== "object") {
        return existingNode;
    }

    return extractStringDigit(existingNode, chars, cursor + 1);
}

/**
  * @param {{ name: string; value: number }[]} stringDigits 
 * @return {Tree}
 */
function computeStringDigitTree(stringDigits) {
    /** @type Tree */
    const output = new Map();

    stringDigits.forEach(({ name, value }) => {
        let currentNode = output;
        name.split("").forEach((char, index, array) => {
            const isLastChar = index === array.length - 1;
            if (isLastChar) {
                currentNode.set(char, value);
                return;
            }
            
            let existingNode = currentNode.get(char);
            if (existingNode === undefined) {
                /** @type Tree */
                const newNode = new Map();
                currentNode.set(char, newNode);
                existingNode = newNode;
            }
            currentNode = existingNode
        });
    });

    return output;
}
