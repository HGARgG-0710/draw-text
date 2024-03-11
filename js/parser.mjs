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
	return text.split("\n").every((line) => {
		const r = commandList.map((command) => countOccurrencesStr(line, command))
		return (
			[0, 1].every(r.includes) &&
			[3, 1].map((x, i) => i === countOccurencesArr(r, x)) &&
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
			counted++
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
	const commandInd = commandList
		.map((command) => countOccurrencesStr(text, command))
		.indexOf(1)
	const notBackground = commandInd < 4
	const lines = text.split(";").join("\n").split("\n")

	return {
		command: commandList[commandInd],
		args: lines.reduce(
			(acc, curr, i) =>
				acc.concat([
					(notBackground && !(commandInd % 2)
						? (x) => new NGon(x, parseConnections(lines[i]))
						: (x) => x)((notBackground ? parsePairs : (x) => x)(curr))
				]),
			[]
		)
	}
}
