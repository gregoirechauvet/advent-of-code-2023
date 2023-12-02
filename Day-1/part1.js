
const query = await fetch('input.txt');
const content = await query.text();
const lines = content.split("\n");

const sum = lines.reduce((acc, line) => acc + computeLineValue(line), 0);
console.log(sum);

/**
 * @param {string} line 
 * @return {number}
 */
function computeLineValue(line) {
    const chars = line.split("");
    const firstDigit = chars.find(char => isDigit(char));
    const lastDigit = chars.toReversed().find(char => isDigit(char));

    return Number(`${firstDigit}${lastDigit}`);
}

/**
 * @param {string} char 
 * @return {bool}
 */
function isDigit(char) {
    return !Number.isNaN(Number(char))
}