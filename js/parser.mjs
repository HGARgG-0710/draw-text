// TODO: later, refactor this parser using the parser library of one's own...;
// ? This 'findSegments' is a good addition to the library in question...; Also - consider index-passing-based parsing (one, where one of inputs is an index, and so is one of outputs...);
// ? Add a 'regex' module to it?

import { and, or, occurences, global, begin, end, nlookbehind } from "./regex.mjs"
import { Primitive } from "./primitives.mjs"

// ^ IDEA: create a module for working with regexp tables [note: they could be used to construct the 'parser-type-recognition-tables' for parsers created by one of self's currently developed libraries...];
// TODO: refactor these... [lots of repetition...];

const reg = {
	arrow: /->/,
	space: /( |\t)*/,
	opbrack: /\(/,
	clbrack: /\)/,
	color: /#[\da-fA-F]{3,}/,
	varname: /[a-zA-Z\d_]+/,
	decimal: /[\d]+/,
	tab: /\t/,
	spacebar: / /,
	comma: /,/,
	hyphen: /-/
}

// ! later, use some properly defined alias space instead of something particular like this (math-expressions.js);
function r(...args) {
	return args.map((x) => reg[x])
}

const regfun = {
	variable: (...x) => or(...r(...x, "varname")),
	brackets: (...x) => and(reg.opbrack, ...x, reg.clbrack)
}

export const regexps = {
	arrow: reg.arrow
}
regexps.colorarrow = and(
	...r("arrow", "space"),
	occurences(0, 1)(regfun.brackets(regfun.variable("color")))
)
regexps.triple = global(
	and(
		nlookbehind(and(...r("hyphen", "space"))),
		regfun.brackets(
			reg.space,
			regfun.variable("decimal"),
			...r("space", "comma", "space"),
			regfun.variable("decimal"),
			occurences(0, 1)(and(...r("comma", "space"), regfun.variable("color")))
		)
	)
)

regexps.vararg = occurences(1)(
	and(
		...r("varname", "space", "spacebar", "space"),
		regfun.variable("color", "decimal")
	)
)

regexps.decimal = end(begin(reg.decimal))
regexps.colorarg = global(and(reg.space, regfun.variable("color"), reg.space))
regexps.colorarrowStrict = and(
	...r("arrow", "space"),
	regfun.brackets(regfun.variable("color"))
)

regexps.elliptic = and(
	...r("hyphen", "space"),
	regfun.brackets(
		reg.space,
		regfun.variable("decimal"),
		reg.space,
		occurences(
			0,
			1
		)(
			and(
				...r("comma", "space"),
				regfun.variable("decimal"),
				occurences(
					0,
					1
				)(
					and(
						...r("comma", "space"),
						regfun.variable("decimal"),
						occurences(
							0,
							1
						)(and(...r("comma", "space"), regfun.variable("color")))
					)
				),
				reg.space
			)
		)
	)
)

regexps.argseq = occurences(
	1,
	""
)(
	and(
		reg.space,
		regexps.triple,
		reg.space,
		occurences(0, 1)(or(...["elliptic", "colorarrow"].map((x) => regexps[x])))
	)
)
// ^ IDEA: it's getting big - rewrite the commandList via 'Array.from' of union of 'connectionCommands', 'pairCommands' and 'singleCommands' (background, line-width and line-cap currently...);
export const commandList = [
	"contour",
	"fill",
	"clear",
	"erase",
	"background",
	"line-cap",
	"line-width",
	"variable",
	"set-param"
]

const [connectionCommands, pairCommands] = [
	["contour", "fill", "clear", "erase"],
	["variable", "set-param"]
].map((x) => new Set(x))

function extractFirst(string, from, to, regex) {
	return string.slice(from, to).match(new RegExp(regex, "g"))[0]
}
// ! this one's somewhat ugly. Rewrite - first of all, create a special function which would parse the 'between' values, then - check for them, insert the missing defaults/parse-depending-on-the-type. The thing ends up being separated into a sequence of functions instead of getting written only just here...;
function parseConnections(string) {
	const pairsinds = triplesInds(string)
	function retrieveType(type, parsingFunc = (x) => [x]) {
		const [presentConnections, colouredConnections] = type.map((x) =>
			findSegments(string, regexps[x])
		)
		const colouredBeginnings = colouredConnections.map((x) => x[0])
		return pairsinds.map((_x, i) => {
			// ! This condition is broken. Better just change the values for 'presentConnection' based off the second part of the '||'-expression... (include the missing ones, then shoren the 'fel' to !!presentConnections[i]);
			const fel =
				!!presentConnections[i] &&
				(i > (i + 1) % pairsinds.length ||
					presentConnections[i][0] < pairsinds[(i + 1) % pairsinds.length][0])
			return [fel].concat(
				fel
					? [
							...(colouredBeginnings.includes(presentConnections[i][0])
								? ((x) =>
										parsingFunc(
											extractFirst(
												string,
												colouredBeginnings[x],
												colouredBeginnings[x] +
													colouredConnections[x][1],
												regexps[type[0]]
											)
										))(
										colouredBeginnings.indexOf(
											presentConnections[i][0]
										)
								  )
								: false)
					  ]
					: []
			)
		})
	}
	return {
		arrows: retrieveType(["arrow", "colorarrowStrict"]),
		elliptics: retrieveType(Array(2).fill("elliptic"), (x) =>
			((x) => x.slice(2, x.length - 1).split(","))(
				x.split(" ").join("\t").split("\t").join("")
			)
		)
	}
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
				.split("\t")
				.join("")
				.split(",")
		)
}

function isValid(text) {
	return getlines(text).every((line, i) => {
		const r = commandList.map((command) => countOccurrencesStr(line, command))
		const command = commandList[r.indexOf(1)]
		return (
			[commandList.length - 1, 1].every((x, i) => x === countOccurencesArr(r, i)) &&
			regexps[
				command === "background"
					? "colorarg"
					: command === "variable"
					? "vararg"
					: "argseq"
			].test(line.split(command)[1])
		)
	})
}

export function validateNumber(string) {
	return regexps.decimal.test(string)
}

export function validate(text, callback, validityCheck = isValid) {
	const t = validityCheck(text)
	if (t) return callback(text)
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

// ^ IDEA: no, don't have that. Get rid of 'deBackground' altogether (let the user be capable of changing backgrounds dynamically!);
// ^ IDEA: create a formatter for the thing (code format)?
function deBackground(text) {
	const lines = getlines(text)
	// ? Generalize this as well?
	const commands = lines.map(
		(l) => commandList[commandList.map((c) => countOccurrencesStr(l, c)).indexOf(1)]
	)
	const backgroundIndexes = commands
		.map((x, i) => (x === "background" ? i : -1))
		.filter((x) => x >= 0)
	return !!backgroundIndexes.length
		? [lines[backgroundIndexes[0]]].concat(
				lines
					.slice(0, backgroundIndexes[0])
					.concat(lines.slice(backgroundIndexes[0] + 1))
					.filter(
						(_x, i) =>
							!backgroundIndexes.includes(i + (i >= backgroundIndexes[0]))
					)
		  )
		: lines
}

// ! Support more color-schemes (CMYK, RGBA, grayscale and others...);
// ! PROBLEM: for now, only the HEX colour notation is supported (RGB used...) - expand syntax;

// ^ IDEA: add ability to specify the default colours;
export default function parse(text) {
	const lines = deBackground(text)
	const commandInds = lines.map((l) =>
		commandList.map((command) => countOccurrencesStr(l, command)).indexOf(1)
	)
	const commands = lines.map((_x, i) => commandList[commandInds[i]])
	return lines.map((x, i) => ({
		command: commands[i],
		argline: (connectionCommands.has(commands[i])
			? (y) => Primitive(parseSemiTriples(y), parseConnections(x))
			: pairCommands.has(commands[i])
			? (x) =>
					x
						.split("\t")
						.join(" ")
						.split(" ")
						.filter((x) => x.length)
			: (x) => x)(x.split(commands[i])[1].trim())
	}))
}
