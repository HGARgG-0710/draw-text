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

// TODO: more new features to include [parser]:
// * 1. background-colour setting;
// * 2. colour-setting for the nGons (last argument in a line, parsColours->'parseHexes|...' [add other colour schemes/representations/formats, think about prefixing them, maybe... make a CMYK- or RGB-default]);
export default function parse(text) {
	const lines = text.split(";").join("\n").split("\n")
	const parsed = []
	for (let i = 0; i < lines.length; i++)
		parsed.push(new NGon(parsePairs(lines[i]), parseConnections(lines[i])))
	return parsed
}

function isEntire(string, regex) {
	return (
		Array.from(string.matchAll(regex))
			.map((x) => x[0])
			.join("") === string
	)
}

// * All that's needed to check for validation:
// ! All pairs on all lines have beginning and ending '(', ')', and the arguments are separated either by ','. Also - THEY'RE ALL INTEGERS...;
function isValid(text) {
	return text
		.split("\n")
		.map((line) => isEntire(line, /((->)|(\([0-9]+,( ?)[0-9]+\))|(\t)|( ))/g))
}

export function validate(text, callback) {
	if (isValid(text)) return callback(text)
}
