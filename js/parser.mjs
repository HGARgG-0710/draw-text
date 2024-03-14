// TODO: later, refactor this parser using the parser library of one's own...;
// ? This 'findSegments' is a good addition to the library in question...; Also - consider index-passing-based parsing (one, where one of inputs is an index, and so is one of outputs...);

import { NGon } from "./primitives.mjs"

// ^ IDEA: create a module for working with regexp tables [note: they could be used to construct the 'parser-type-recognition-tables' for parsers created by one of self's currently developed libraries...];
// TODO: refactor these... [lots of repetition...];
export const regexps = {
	arrow: /->/,
	colorarrow: /->( |\t)*\(#[0-9a-f]{3,}\)/,
	triple: /\(( |\t)*[0-9]+,( |\t)*[0-9]+(,( |\t)*#[0-9a-f]{3,})?\)/g,
	argseq: /((->(( )*\(#[0-9a-f]{3,}\))?)|(\(( |\t)*[0-9]+,( |\t)*[0-9]+(,( |\t)*#[0-9a-f]{3,})?\))|(\t)|( ))/g,
	colorarg: /( |\t)*#[0-9a-f]{3,}( |\t)*/g,
	decimal: /[0-9]+/g
}
export const commandList = ["contour", "fill", "clear", "erase", "background"]

function extractFirst(string, from, to, regex) {
	return string.slice(from, to).match(new RegExp(regex, "g"))[0]
}

function parseConnections(string) {
	const [presentConnections, colouredArrows] = ["arrow", "colorarrow"].map((x) =>
		findSegments(string, regexps[x])
	)
	console.log(colouredArrows)
	const colouredArrowsBegs = colouredArrows.map((x) => x[0])
	const pairsinds = triplesInds(string)
	return pairsinds.map((_x, i) => {
		const fel =
			!!presentConnections[i] &&
			(i > (i + 1) % pairsinds.length ||
				presentConnections[i][0] < pairsinds[(i + 1) % pairsinds.length][0])
		return [fel].concat(
			fel
				? [
						colouredArrowsBegs.includes(presentConnections[i][0])
							? ((x) =>
									extractFirst(
										string,
										colouredArrowsBegs[x],
										colouredArrowsBegs[x] + colouredArrows[x][1],
										regexps.colorarg
									))(
									colouredArrowsBegs.indexOf(presentConnections[i][0])
							  )
							: false
				  ]
				: []
		)
	})
}

function findSegments(string, regex) {
	regex = new RegExp(regex, "g")
	const segments = []
	let arr = []
	while ((arr = regex.exec(string)) !== null)
		segments.push([arr.index, arr.index + arr[0].length])
	return segments
}

function triplesInds(string) {
	return findSegments(string, regexps.triple)
}

function parseSemiTriples(string) {
	// ? Extend to hexidecimal/different numeric notations supported by native JS number-conversion? Add own implementation, if that is too narrow?
	return triplesInds(string)
		.map((x) => string.slice(...x))
		.map((pair) =>
			pair
				.slice(1, pair.length - 1)
				.split(" ")
				.join("")
				.split(",")
				.map((x, i) => (i < 2 ? Number(x) : x))
		)
}

function isEntire(string, regex) {
	return (
		Array.from(string.matchAll(regex))
			.map((x) => x[0])
			.join("") === string
	)
}

function isValid(text) {
	return getlines(text).every((line) => {
		const r = commandList.map((command) => countOccurrencesStr(line, command))
		const command = commandList[r.indexOf(1)]
		return (
			[commandList.length - 1, 1].every((x, i) => x === countOccurencesArr(r, i)) &&
			isEntire(
				line.split(command)[1],
				regexps[command !== "background" ? "argseq" : "colorarg"]
			)
		)
	})
}

export function validateNumber(string) {
	return isEntire(string, regexps.decimal)
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
// ! PROBLEM: for now, only the HEX colour notation is supported (RGB used...): ADD OTHER COLOUR SCHEMES... (possibly, ways of defining them??? via transformations, perhaps?);
function parseColour(text, single = true) {
	return (single ? (x) => x[0] : (x) => x)(text.match(regexps.colorarg) || ["#ffffff"])
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
				command: commands[i + hasBackground],
				argline: (!(commandInds[i + hasBackground] % 2)
					? (y) => new NGon(y, parseConnections(x))
					: (x) => x)(parseSemiTriples(x.split(commands[i + hasBackground])[1]))
			}))
		)
}
