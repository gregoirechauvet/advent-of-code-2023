const query = await fetch('input.txt');
const content = await query.text();
const lines = content.split("\n");

/** @typedef {{winings: Set<number>; owned: Set<number>, counter: number}} Card */

const cards = lines.map(parseCards);
console.log(cards);
const count = computeCardCount(cards);
console.log(count);

/**
 * @param {string} line 
 * @return {Card}
 */
function parseCards(line) {
    const [_, values] = line.split(":");
    const [winingPart, ownedPart] = values.split("|");
    const winings = new Set(winingPart.split(" ").filter(x => x !== "").map(x => Number(x)));
    const owned = new Set(ownedPart.split(" ").filter(x => x !== "").map(x => Number(x)));
    return { winings, owned, counter: 1 };
}

/**
 * @param {Card[]} cards
 * @return {number}
 */
function computeCardCount(cards) {
    return cards.reduce((acc, { winings, owned, counter }, index, array) => {
        const count = [...owned.values()].filter(value => winings.has(value)).length;

        Array(count).fill().forEach((_, i) => {
            array[index + i + 1].counter += counter;
        })

        return acc + counter;
    }, 0);
}