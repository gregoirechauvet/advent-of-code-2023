const query = await fetch("input.txt");
const content = await query.text();
const lines = content;

const fieldMap = parseGameInput(lines);
console.log(fieldMap);
const lowestLocation = findLowestLocation(fieldMap);
console.log(lowestLocation);

/**
 * @typedef {{ start: number; end: number; }} ValueRange
 * @typedef {{
 *  seeds: { start: number; range: number; }[];
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
  const seedNumbers = firstLine
    .replace("seeds:", "")
    .trim()
    .split(" ")
    .map((x, idx, array) => Number(x));
  const rangedSeeds = Object.groupBy(seedNumbers, (_, i) => (i - (i % 2)) / 2);
  const seeds = Object.values(rangedSeeds).map(([start, range]) => ({
    start,
    range,
  }));

  const mappings = mappingLines.map((mapping) => {
    const [text, ...rangeLines] = mapping.split("\n");
    const [from, to] = text.split(" ", 1)[0].split("-to-");

    const ranges = rangeLines.map((line) => {
      const [destinationRangeStart, sourceRangeStart, rangeLength] = line
        .split(" ")
        .map((x) => Number(x));

      return {
        sourceRangeStart,
        sourceRangeEnd: sourceRangeStart + rangeLength - 1,
        destinationRangeStart,
        destinationRangeEnd: destinationRangeStart + rangeLength - 1,
      };
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
   * @param {ValueRange} seedRange
   * @param {string} nodeName
   * @return {ValueRange[]}
   */
  function iterateMappings(seedRange, nodeName) {
    if (nodeName === destinationKey) {
      return seedRange;
    }

    const node = sourceMap[nodeName];
    const mappedValues = mapFromRange(seedRange, node.ranges);
    return mappedValues.flatMap((mappedValue) =>
      iterateMappings(mappedValue, node.to)
    );
  }

  const locations = seeds
    .map(({ start, range }) => ({ start, end: start + range - 1 }))
    .flatMap((seed) => iterateMappings(seed, sourceKey));
  console.log(locations);
  return Math.min(...locations.map((x) => x.start));
}

/**
 * @param {ValueRange} seedRange
 * @param {FieldMap["mappings"][number]["ranges"]} ranges
 * @return {ValueRange[]}
 */
function mapFromRange(seedRange, ranges) {
  const { start, end } = seedRange;
  const validRanges = ranges.filter(({ sourceRangeStart, sourceRangeEnd }) => {
    return end >= sourceRangeStart && start <= sourceRangeEnd;
  });

  const output = validRanges.map(
    ({ sourceRangeStart, sourceRangeEnd, destinationRangeStart }) => {
      const newRangeStart = Math.max(start, sourceRangeStart);
      const newRangeEnd = Math.min(end, sourceRangeEnd);
      const offset = destinationRangeStart - sourceRangeStart;
      return {
        start: newRangeStart + offset,
        end: newRangeEnd + offset,
        originStart: newRangeStart,
        originEnd: newRangeEnd,
      };
    }
  );

  const emptyRanges = computeMissingRanges(seedRange, output);

  return [...output, ...emptyRanges];
}

/**
 * @param {ValueRange} seedRange
 * @param {{ start: number; end: number; originStart: number; originEnd: number; }[]} ranges
 * @return {ValueRange[]}
 */
function computeMissingRanges(seedRange, ranges) {
  const { start, end } = seedRange;

  let emptyRanges = [{ start, end }];
  ranges.forEach(({ originStart, originEnd }) => {
    const newEmptyRanges = emptyRanges.flatMap(({ start, end }) => {
      const min = Math.max(start, originStart - 1);
      const max = Math.min(end, originEnd + 1);

      if (max <= min) {
        return [{ start, end }];
      }

      return [
        {
          start,
          end: min,
        },
        {
          start: max,
          end,
        },
      ];
    });
    emptyRanges = newEmptyRanges;
  });

  return emptyRanges.filter(({ start, end }) => start !== end);
}
