const query = await fetch('input.txt');
const content = await query.text();
const lines = content.split("\n");

const games = lines.map(parseGame);
console.log(games)
const sum = games.filter(computePower).reduce((acc, game) => acc + game.id, 0);
console.log(sum);

/** @typedef {{ id: number; rounds: { green?: number; red?: number; blue?: number }[] }} Game */

/**
 * @param {string} line
 * @return {Game}
 */
function parseGame(line) {
    const [start, end] = line.split(":");
    const id = Number(start.slice(5));

    const rounds = end.split(";").map(stringRound => {
        const colors = stringRound.split(",").map(stringColor => {
            const [value, name] = stringColor.trim().split(" ");
            return { value: Number(value), name };
        });
        const red = colors.find(x => x.name === "red")?.value;
        const green = colors.find(x => x.name === "green")?.value;
        const blue = colors.find(x => x.name === "blue")?.value;

        return {
            red,
            green,
            blue,
        }
    })

    return {
        id,
        rounds,
    }
}

/**
 * @param {Game} game
 * @return {bool}
 */
function computePower(game) {
    const totalRed = 12;
    const totalGreen = 13;
    const totalBlue = 14;

    return game.rounds.every(({red, green, blue}) => {
        return (green === undefined || green <= totalGreen) && (blue === undefined || blue <= totalBlue) && (red === undefined || red <= totalRed);
    });
}