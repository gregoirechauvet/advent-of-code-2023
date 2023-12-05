const query = await fetch('input.txt');
const content = await query.text();
const lines = content.split("\n");

/** @typedef {{winings: Set<number>; owned: Set<number>}} Card */

const cards = lines.map(parseCards);
console.log(cards);
const score = computeTotalScore(cards);
console.log(score);

/**
 * @param {string} line 
 * @return {Card}
 */
function parseCards(line) {
    const [_, values] = line.split(":");
    const [winingPart, ownedPart] = values.split("|");
    const winings = new Set(winingPart.split(" ").filter(x => x !== "").map(x => Number(x)));
    const owned = new Set(ownedPart.split(" ").filter(x => x !== "").map(x => Number(x)));
    return { winings, owned };
}

/**
 * @param {number} count 
 * @return {number}
 */
function computeCardScore(count) {
    if (count === 0) {
        return 0;
    }

    return 2 ** (count - 1);
}

/**
 * @param {Card[]} cards
 * @return {number}
 */
function computeTotalScore(cards) {
    return cards.reduce((acc, { winings, owned }) => {
        const count = [...owned.values()].filter(value => winings.has(value)).length;
        return acc + computeCardScore(count);
    }, 0);
}