const query = await fetch("input.txt");
const content = await query.text();
const lines = content;

const fieldMap = parseGameInput(lines);
console.log(fieldMap);
const lowestLocation = findLowestLocation(fieldMap);
console.log(lowestLocation);

/**
 * @typedef {{
 *  seeds: number[];
 *  mappings: {
 *    from: string;
 *    to: string;
 *    ranges: {
 *      sourceRangeStart: number;
 *      destinationRangeStart: number;
 *      rangeLength: number;
 *    }[];
 *  }[]
 * }} FieldMap
 */

/**
 * @param {string} input
 * @return {FieldMap}
 */
function parseGameInput(input) {
  const [firstLine, ...mappingLines] = input.split("\n\n");
  const seeds = firstLine
    .replace("seeds:", "")
    .trim()
    .split(" ")
    .map((x) => Number(x));

  const mappings = mappingLines.map((mapping) => {
    const [text, ...rangeLines] = mapping.split("\n");
    const [from, to] = text.split(" ", 1)[0].split("-to-");

    const ranges = rangeLines.map((line) => {
      const [destinationRangeStart, sourceRangeStart, rangeLength] = line
        .split(" ")
        .map((x) => Number(x));

      return { sourceRangeStart, destinationRangeStart, rangeLength };
    });

    return {
      from,
      to,
      ranges,
    };
  });

  return {
    seeds,
    mappings,
  };
}

/**
 * @param {FieldMap} fieldMap
 * @return {number}
 */
function findLowestLocation(fieldMap) {
  const sourceKey = "seed";
  const destinationKey = "location";

  const { seeds, mappings } = fieldMap;

  const sourceMap = Object.fromEntries(
    mappings.map(({ from, to, ranges }) => [from, { to, ranges }])
  );

  /**
   * @param {number} value
   * @param {string} nodeName
   * @return {number}
   */
  function iterateMappings(value, nodeName) {
    if (nodeName === destinationKey) {
      return value;
    }

    const node = sourceMap[nodeName];
    const mappedValue = mapFromRange(value, node.ranges);
    return iterateMappings(mappedValue, node.to);
  }

  const locations = seeds.map((seed) => iterateMappings(seed, sourceKey));
  return Math.min(...locations);
}

/**
 * @param {number} value
 * @param {FieldMap["mappings"][number]["ranges"]} ranges
 * @return {number}
 */
function mapFromRange(value, ranges) {
  const validRange = ranges.find(({ sourceRangeStart, rangeLength }) => {
    return value >= sourceRangeStart && value < sourceRangeStart + rangeLength;
  });
  if (validRange === undefined) {
    return value;
  }

  const { sourceRangeStart, destinationRangeStart } = validRange;
  return value + destinationRangeStart - sourceRangeStart;
}
