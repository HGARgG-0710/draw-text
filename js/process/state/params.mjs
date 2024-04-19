import { black, white } from "../../lib/colors.mjs"
import { canvas, context } from "../canvas/draw.mjs"

export function drawBackground(colour) {
	const prevFill = context.fillStyle
	this.fillStyle = colour
	this.fillRect(0, 0, canvas.width, canvas.height)
	this.fillStyle = prevFill
}

function Parameter(name, _default, typedef, processor) {
	return [name, [_default, typedef, processor]]
}

// ? Generalize this (and inside triples as well) to a separate data structure? [add appropriate 'get'/'set' methods?]
const params = new Map(
	[
		// ? Perhaps, return (partially) the previous 'deBackground' functionality? [require the re-drawing every time that the background is changed, + add a 0-or-1-arguments 'clean [colour]' command that would do what background currently does?]
		// ^ YES! The background should only do that - CHANGE THE BACKGROUND! (so, it's needed to [somehow] redraw the entire thing prior to it (save the state of parsed things, instead of dynamic variable-putting, like it currently does? [cache the previous things, then clear/redraw? Think about it some more...]))
		[
			"background",
			white,
			// ? Check for correctness properly? [presently, will just paint it black...];
			() => true,
			drawBackground
		],
		[
			"line-width",
			1,
			(x) => typeof x === "number",
			function (widthValue) {
				this.lineWidth = widthValue
			}
		],
		[
			"line-cap",
			"b",
			(x) => ["b", "r", "s"].includes(x),
			function (capValue) {
				this.lineCap =
					capValue === "b" ? "butt" : capValue === "r" ? "round" : "square"
			}
		],
		["draw-points", false, (x) => [false, true].includes(x)],
		["point-size", 1, (x) => typeof x === "number"],
		["point-shape", "rect", (x) => ["rect", "circ"].includes(x)],
		["base-color", black, (x) => typeof x === "string"],
		[
			"line-join",
			"m",
			(x) => ["r", "b", "m"].includes(x),
			function (joinValue) {
				this.lineJoin =
					joinValue === "r" ? "round" : joinValue === "b" ? "bevel" : "miter"
			}
		],
		[
			"miter-limit",
			4,
			(x) => typeof x === "number",
			function (miterValue) {
				this.miterLimit = miterValue
			}
		]
	].map((paramargs) => Parameter(...paramargs))
)

export function setParam(paramName, value, context) {
	if (params.has(paramName)) {
		const param = params.get(paramName)
		if (param[1](value)) {
			param[0] = value
			if (typeof param[2] === "function" && context)
				param[2].call(context, value)
		}
	}
}

export function getParam(name) {
	return params.get(name)[0]
}

export const paramsList = Array.from(params.keys())