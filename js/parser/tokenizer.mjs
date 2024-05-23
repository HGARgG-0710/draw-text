// TODO: later, refactor this parser using the parser library of one's own...;
// ? Add a regex-module to it?

import { global } from "../lib/regex.mjs"

export const tokens = {
	arrow: /->/,
	hyphen: /-/,
	color: /#[\da-fA-F]{3,}/,
	decimal: /[\d]+/,
	varname: /[a-zA-Z\d_]+/,
	comma: /,/,
	opbrack: /\(/,
	clbrack: /\)/,
	quote: /"/,
	symbol: /./
}

// ! LATER, rewrite in terms of the 'InputHandler' interface from the 'parser' library (MUCH better than this for handling the 'isEnd' predicate);
export const parserTable = {
	// ! SPECIAL CASE OF 'delim' from the parsing library...;
	opbrack: function (tokens, i, parser) {
		const isEnd = tokens.length <= i
		let vals = []
		++i
		let lastComma = true
		while (tokens[i] && tokens[i].type !== "clbrack") {
			if (!lastComma) {
				lastComma = true
				++i
				continue
			}
			const pair = parser(tokens, i, i + 1)
			i = pair[0]
			vals = vals.concat(pair[1])
			lastComma = false
		}
		return [i + 1, isEnd ? [] : [{ type: "point", value: vals }]]
	},
	// ! and those refactor too...;
	varname: function (tokens, i) {
		return [i + 1, tokens[i]]
	},
	color: function (tokens, i) {
		return [i + 1, tokens[i]]
	},
	decimal: function (tokens, i) {
		return [i + 1, { type: "number", value: tokens[i].value }]
	},
	// ! refactor those... [use 'type'];
	hyphen: function (tokens, i, parser) {
		return ((pair) => [
			pair[0],
			{ type: "elliptic-connection", value: pair[1][0].value }
		])(this.opbrack(tokens, i + 1, parser))
	},
	arrow: function (tokens, i, parser) {
		const next = this.opbrack(tokens, i + 1, parser)
		return next[1].length && next[1][0].value.length === 1
			? ((pair) => [
					pair[0],
					{ type: "arrow-connection", value: pair[1][0].value }
			  ])(next)
			: [next[0], [{ type: "arrow-connection" }, ...next[1]]]
	},
	quote: function (tokens, i) {
		let finstr = ""
		let isPrevBacked = false
		while (tokens[++i].type !== "quote" || isPrevBacked) {
			if (!isPrevBacked && tokens[i].value === "\\") {
				isPrevBacked = true
				continue
			}
			isPrevBacked = false
			finstr += tokens[i].value
		}
		return [i + 1, { type: "string", value: finstr }]
	}
}

// ! refactor into 'math-expressions.j'
function DeObject(object) {
	return Object.keys(object).map((k) => [k, object[k]])
}

// ! refactor into 'math-expressions.j'...
const insert = (arr, ind, val) => arr.slice(0, ind).concat([val]).concat(arr.slice(ind))

// ^ idea: another good addition to the parisng library in question...
export function DeSymbol(symbols) {
	return function (string) {
		return symbols.reduce((acc, curr) => acc.split(curr).join(""), string)
	}
}

// ^ idea: a nice addition to one's parsing library... [particularly, to generalize...];
export function Tokenizer(patterns) {
	return function (string) {
		function tokenizePattern(string, pattern) {
			// ! later, when generalizing - make the 'type' function a higher-level parameter of Tokenizer, part of the signature...;
			const type = (v) => ({ type: pattern[0], value: v })
			return [...string.matchAll(global(pattern[1]))]
				.map((x) => x[0])
				.reduce(
					(acc, curr, i) => insert(acc, 2 * i + 1, type(curr)),
					string.split(pattern[1])
				)
				.filter((x) => typeof x !== "string" || x.length)
		}
		function tokenizeRecursive(string) {
			return DeObject(patterns).reduce(
				(acc, currPattern) =>
					acc
						.map((x) =>
							typeof x === "string" ? tokenizePattern(x, currPattern) : x
						)
						.flat(),
				[string]
			)
		}
		return tokenizeRecursive(string)
	}
}

// ^ IDEA: create a general 'Well-formed-ness' function (like with the Parser) - Effectively, it checks for whether a given string:
// * 	1. Contains only the allowed tokens;
// * 	2. Has them going in the correct order (for that - create functions 'forbidAfter', 'forbidBefore');
// returns a boolean;
// ^ Another good general addition to the parsing library;
export function Parser(table) {
	const thisF = function (tokens, iStart = 0, iEnd = tokens.length) {
		let final = []
		let i = iStart
		while (i < iEnd) {
			const pair = table[tokens[i].type](tokens, i, thisF)
			i = pair[0]
			if (pair[1] instanceof Array) final = final.concat(pair[1])
			else final.push(pair[1])
		}
		return [i, final]
	}
	return thisF
}
