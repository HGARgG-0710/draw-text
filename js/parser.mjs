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
	return text
		.split(";")
		.join("\n")
		.split("\n")
		.filter((x) => x.length)
		.every((line) => {
			const r = commandList.map((command) => countOccurrencesStr(line, command))
			const command = commandList[r.indexOf(1)]
			return (
				[commandList.length - 1, 1].every((x, i) => x === countOccurencesArr(r, i)) &&
				isEntire(
					line.split(command)[1],
					command !== "background"
						? /((->)|(\([0-9]+,( ?)[0-9]+\))|(\t)|( ))/g
						: /#[0-9a-f]/g
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

export const commandList = ["contour", "fill", "clean", "erase", "background"]

// TODO: more new features to include [parser, the 'draw' function]:
// * 1. background-colour setting [parser - CHECK!];
// ! Not supported by parser yet...
// * 2. colour-setting for the nGons (last argument in a line, parsColours->'parseHexes|...' [add other colour schemes/representations/formats, think about prefixing them, maybe... make a CMYK- or RGB-default]);

export default function parse(text) {
	const lines = text
		.split(";")
		.join("\n")
		.split("\n")
		.filter((x) => x.length)
	const commandInds = lines.map((l) =>
		commandList.map((command) => countOccurrencesStr(l, command)).indexOf(1)
	)
	const commands = lines.map((_x, i) => commandList[commandInds[i]])
	return lines.map((x, i) => ({
		command: commands[i],
		argline: (commandInds[i] < 4 && !(commandInds[i] % 2)
			? (y) => new NGon(y, parseConnections(x))
			: (x) => x)(
			(commandInds[i] < 4 ? parsePairs : (x) => x)(x.split(commands[i])[1])
		)
	}))
}
