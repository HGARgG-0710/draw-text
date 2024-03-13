// TODO: later, refactor this parser using the parser library of one's own...;
// ? This 'findSegments' is a good addition to the library in question...; Also - consider index-passing-based parsing (one, where one of inputs is an index, and so is one of outputs...);

import { NGon } from "./primitives.mjs"

function parseConnections(string) {
	const presentConnections = findSegments(string, /->/)
	const pairsinds = pairsInds(string)
	return pairsinds
		.slice(0, pairsinds.length)
		.map(
			(_x, i) =>
				!!presentConnections[i] &&
				(i > (i + 1) % pairsinds.length ||
					presentConnections[i][0] < pairsinds[(i + 1) % pairsinds.length][0])
		)
}

function findSegments(string, regex) {
	regex = new RegExp(regex, "g")
	const segments = []
	let arr = []
	while ((arr = regex.exec(string)) !== null)
		segments.push([arr.index, arr.index + arr[0].length])
	return segments
}

function pairsInds(string) {
	return findSegments(string, /\([0-9]+, ?[0-9]+\)/)
}

function parsePairs(string) {
	// ? Extend to hexidecimal/different numeric notations supported by native JS number-conversion? Add own implementation, if that is too narrow?
	return pairsInds(string)
		.map((x) => string.slice(...x))
		.map((pair) =>
			pair
				.slice(1, pair.length - 1)
				.split(", ")
				.join(",")
				.split(",")
				.map((x) => Number(x))
		)
}

function isEntire(string, regex) {
	return (
		Array.from(string.matchAll(regex))
			.map((x) => x[0])
			.join("") === string
	)
}

// ! PROBLEM: for now, only the HEX colour notation is supported (RGB used...): ADD OTHER COLOUR SCHEMES... (possibly, ways of defining them??? via transformations, perhaps?);
function isValid(text) {
	// ! note : the '.split-.join-.filter' sequence appears for the second time. Refactor.
	return getlines(text).every((line) => {
		const r = commandList.map((command) => countOccurrencesStr(line, command))
		const command = commandList[r.indexOf(1)]
		return (
			[commandList.length - 1, 1].every((x, i) => x === countOccurencesArr(r, i)) &&
			isEntire(
				line.split(command)[1],
				command !== "background"
					? /((->)|(\([0-9]+,( ?)[0-9]+\))|(\t)|( ))/g
					: /( |\t)*#[0-9a-f]{6,}( |\t)*/g
			)
		)
	})
}

export function validateNumber(string) {
	return isEntire(string, /[0-9]+/g)
}

export function validate(text, callback, validityCheck = isValid) {
	if (validityCheck(text)) return callback(text)
}

// ! note: a useful general algorithm/alias to add to 'math-expressions.js'...;
// * (can be easily achieved via '.indexesOf(...).length' - same algorithm, but more general, for unlimited types...);
function countOccurrencesStr(string, sub) {
	let counted = 0
	out: for (let i = 0; i < string.length; i++)
		for (let j = 0; j < sub.length; j++) {
			if (string[i + j] !== sub[j]) continue out
			if (j === sub.length - 1) counted++
		}
	return counted
}

function countOccurencesArr(arr, elem) {
	return arr.reduce((acc, curr) => acc + (curr === elem), 0)
}

export const commandList = ["contour", "fill", "clear", "erase", "background"]

// TODO: more new features to include [parser, the 'draw' function]:
// * 1. background-colour setting [parser - CHECK!];
// ! Not supported by parser yet...
// * 2. colour-setting for the nGons (last argument in a line, parsColours->'parseHexes|...' [add other colour schemes/representations/formats, think about prefixing them, maybe... make a CMYK- or RGB-default]);

function getlines(text) {
	return text
		.split(";")
		.join("\n")
		.split("\n")
		.filter((x) => x.length)
}

function deBackground(text) {
	const lines = getlines(text)
	// ! GENERALIZE THIS AS WELL...
	const commands = lines.map(
		(l) => commandList[commandList.map((c) => countOccurrencesStr(l, c)).indexOf(1)]
	)
	const backgroundIndexes = commands
		.map((x, i) => (x === "background" ? i : -1))
		.filter((x) => x >= 0)
	const islen = !!backgroundIndexes.length
	return [
		islen
			? [lines[backgroundIndexes[0]]].concat(
					lines
						.slice(0, backgroundIndexes[0])
						.concat(lines.slice(backgroundIndexes[0] + 1))
						.filter(
							(_x, i) =>
								!backgroundIndexes.includes(
									i + (i >= backgroundIndexes[0])
								)
						)
			  )
			: lines,
		islen
	]
}

// ! Support more formats for colour-setting (CMYK, RGBA, grayscale and others...);
function parseColour(text, single = true) {
	return (single ? (x) => x[0] : (x) => x)(
		text.match(/( |\t)*#([0-9a-f]{6,}( |\t)*)/g) || ["#ffffff"]
	)
}

// ^ IDEA: add ability to specify the default colours;
export default function parse(text) {
	const [lines, hasBackground] = deBackground(text)
	const commandInds = lines.map((l) =>
		commandList.map((command) => countOccurrencesStr(l, command)).indexOf(1)
	)
	const commands = lines.map((_x, i) => commandList[commandInds[i]])
	return lines
		.slice(0, hasBackground)
		.map((x, i) => ({ command: commands[i], argline: parseColour(x).trim() }))
		.concat(
			lines.slice(hasBackground).map((x, i) => ({
				command: commands[i + 1],
				argline: (!(commandInds[i + 1] % 2)
					? (y) => new NGon(y, parseConnections(x))
					: (x) => x)(parsePairs(x.split(commands[i + 1])[1]))
			}))
		)
}
