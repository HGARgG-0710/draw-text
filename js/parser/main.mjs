import { Primitive } from "../lib/lib.mjs"
import { regexps, validityMap, commandList, connectionCommands } from "./syntax.mjs"
import { Parser, parserTable, Tokenizer, tokens } from "./tokenizer.mjs"

// TODO: later, generalize the 'parseTable' to not have 'parseLine', instead donig everything in 'parse' - when adding the 'function' expressions;
function parseLine(line) {
	return Parser(parserTable)(Tokenizer(tokens)(line))[1]
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
									? ((x) => (x ? x : []))(
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
	return getType(parsed)("point").map((x) => x.value)
}

function getCommand(line) {
	return line.split("\t").join(" ").split(" ")[0]
}

function isValid(text) {
	return getlines(text).every((line) => {
		const command = getCommand(line)
		return (
			commandList.includes(command) &&
			regexps[validityMap[command]].test(line.split(command)[1])
		)
	})
}

export function validateNumber(string) {
	return regexps.decimal.test(string)
}

export async function validate(text, callback, validityCheck = isValid) {
	if (validityCheck(text)) return await callback(text)
}

// ! later, refactor using 'math-expressions.js';
function getlines(text) {
	return text
		.split("\r")
		.join("")
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

// ^ IDEA: create a formatter for the thing (draw-text input format)?

// ! Support more color-schemes (CMYK, RGBA, grayscale and others...);
// ! PROBLEM: for now, only the HEX colour notation is supported (RGB used...) - expand numeric systems syntax;

export default function parse(text) {
	const lines = getlines(text)
	const commands = lines.map(getCommand)
	return lines.map((x, i) =>
		((isConnection) => ({
			command: commands[i],
			argline: (isConnection
				? (x) => Primitive(...[points, connections].map((f) => f(x)))
				: (x) => x.map((x) => x.value))(parseLine(x.split(commands[i])[1].trim()))
		}))(connectionCommands.has(commands[i]))
	)
}
