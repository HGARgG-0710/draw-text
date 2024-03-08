// TODO: later, refactor this parser using the parser library of one's own...;
// ? This 'parseNext' is a good addition to the library in question...; Index-based parsing...;

import { NGon } from "./primitives.mjs"

// * Note: slightly too 'inaccurate'; Things like '->(..., ...)->(..., ...)' will create issues...;
function parseConnections(string) {
	const presentConnections = findSegments(string, /->/)
	const pairsinds = pairsInds(string)
	return pairsinds
		.slice(0, pairsinds.length - 1)
		.map((_x, i) => presentConnections[i][0] < pairsinds[i + 1][0])
}

function findSegments(string, regex) {
	const segments = []
	let arr = []
	while ((arr = regex.exec(string, regex)))
		segments.push([arr.index, arr.index + arr[0].length])
	return segments
}

function pairsInds(string) {
	return findSegments(string, /\([0-9], [0-9]\)/)
}

function parsePairs(string) {
	// ? Extend to hexidecimal/different numeric notations supported by native JS number-conversion? Add own implementation, if that is too narrow?
	return pairsInds(string)
		.map((x) => string.slice(...x))
		.map((pair) => pair.split(", ").map((x) => Number(x)))
}

// TODO: more new features to include [parser]:
// * 1. background-colour setting;
// * 2. colour-setting for the nGons (last argument in a line, parseNextColour->'parseNextHex|...' [add other colour schemes/representations/formats, think about prefixing them, maybe... make a CMYK- or RGB-default]);
export default function parse(text) {
	const lines = text.split(";").join("\n").split("\n")
	const parsed = []
	for (let i = 0; i < lines.length; i++)
		parsed.push(NGon(parsePairs(lines[i]), parseConnections(lines[i])))
	return parsed
}

// * All that's needed to check for validation:
// ! All pairs on all lines have beginning and ending '(', ')', and the arguments are separated either by ',' or by ';'. Also - THEY'RE ALL INTEGERS...;
function isValid(text) {}

export function validate(text, callback) {
	if (isValid(text)) return callback(text)
}
