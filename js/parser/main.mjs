import { Primitive } from "../lib/lib.mjs"
import { regexps, validityMap, commandList, connectionCommands } from "./syntax.mjs"
import { Parser, parserTable, Tokenizer, tokens, DeSymbol } from "./tokenizer.mjs"

// TODO: later, generalize the 'parseTable' to not have 'parseLine', instead donig everything in 'parse' - when adding the 'function' expressions;
function parseLine(line, splitSpace = false) {
	return Parser(parserTable)(
		Tokenizer(tokens)(
			(splitSpace
				? (x) =>
						x
							.split(" ")
							.join("\t")
							.split("\t")
							.filter((x) => x.length)
				: (x) => DeSymbol([" ", "\t"])(x))(line)
		)
	)[1]
}

// ^ idea: another good addition to the parsing library...;
function getInds(parsed) {
	return function (type) {
		return parsed.reduce(
			(acc, curr, i) => (curr.type === type ? acc.concat([i]) : acc),
			[]
		)
	}
}

function getType(parsed) {
	return (type) => parsed.filter((x) => x.type === type)
}

// ! change method signatures! [this needs to re-parse everything all over again!];
function connections(parsed) {
	const [pointPos, ellipticPos, arrowPos] = [
		"point",
		"elliptic-connection",
		"arrow-connection"
	].map(getInds(parsed))
	const connectionPos = [arrowPos, ellipticPos]
	let counters = Array(2).fill(0)
	const [arrows, elliptics] = Array(2)
		.fill(0)
		.map((_x, i) =>
			pointPos.reduce(
				(acc, curr) =>
					((isConnection) =>
						acc.concat([
							[
								isConnection,
								...(isConnection
									? ((x) => (x ? x.map((x) => x.value) : []))(
											parsed[connectionPos[i][counters[i]++]].value
									  )
									: [])
							]
						]))(connectionPos[i][counters[i]] === curr + 1),
				[]
			)
		)
	return { arrows, elliptics }
}

// ? Extend numbers to hexidecimal/different base- notations supported by native JS number-conversion? Add own implementation, if that is too narrow?
function points(parsed) {
	return getType(parsed)("point").map((x) => x.value.map((x) => x.value))
}

function isValid(text) {
	return getlines(text).every((line) => {
		const r = commandList.map((command) => countOccurrencesStr(line, command))
		const command = commandList[r.indexOf(1)]
		return (
			[commandList.length - 1, 1].every((x, i) => x === countOccurencesArr(r, i)) &&
			regexps[validityMap[command]].test(line.split(command)[1])
		)
	})
}

export function validateNumber(string) {
	return regexps.decimal.test(string)
}

export function validate(text, callback, validityCheck = isValid) {
	if (validityCheck(text)) return callback(text)
}

// ! note: a useful general algorithm/alias to add to 'math-expressions.js'...;
// * (can be easily achieved via '.indexesOf(...).length' - same algorithm, but more general, for unlimited types...);
function countOccurrencesStr(string, sub) {
	let counted = 0
	out: for (let i = 0; i < string.length; i++) {
		for (let j = 0; j < sub.length; j++) if (string[i + j] !== sub[j]) continue out
		counted++
	}
	return counted
}
// ! another useful alias...;
function countOccurencesArr(arr, elem) {
	return arr.reduce((acc, curr) => acc + (curr === elem), 0)
}

function getlines(text) {
	return text
		.split(";")
		.join("\n")
		.split("\n")
		.filter(
			(x) =>
				x
					.split(" ")
					.join("\t")
					.split("\t")
					.filter((x) => x.length).length
		)
}

// ^ IDEA: create a formatter for the thing (code format)?

// ! Support more color-schemes (CMYK, RGBA, grayscale and others...);
// ! PROBLEM: for now, only the HEX colour notation is supported (RGB used...) - expand syntax;

// ^ IDEA: add ability to specify the default colours [as a parameter];
export default function parse(text) {
	const lines = getlines(text)
	const commandInds = lines.map((l) =>
		commandList.map((command) => countOccurrencesStr(l, command)).indexOf(1)
	)
	const commands = lines.map((_x, i) => commandList[commandInds[i]])
	return lines.map((x, i) =>
		((isConnection) => ({
			command: commands[i],
			argline: (isConnection
				? (x) => Primitive(...[points, connections].map((f) => f(x)))
				: (x) => x.map((x) => x.value))(
				parseLine(x.split(commands[i])[1].trim(), !isConnection)
			)
		}))(connectionCommands.has(commands[i]))
	)
}
