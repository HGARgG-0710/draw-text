import { white } from "./colors.mjs"
import { canvas, context } from "./draw.mjs"

export function drawBackground(colour) {
	const prevFill = context.fillStyle
	this.fillStyle = colour
	this.fillRect(0, 0, canvas.width, canvas.height)
	this.fillStyle = prevFill
}

// ? Generalize this (and inside triples as well) to a separate data structure? [add appropriate 'get'/'set' methods?]
const params = new Map([
	[
		"background",
		[
			white,
			// ? Check for correctness properly? [presently, will just paint it black...];
			() => true,
			drawBackground
		]
	],
	[
		"line-width",
		[
			1,
			(x) => typeof x === "number" || x instanceof Number,
			function (widthValue) {
				this.lineWidth = widthValue
			}
		]
	],
	[
		"line-cap",
		[
			"b",
			(x) => ["b", "r", "s"].includes(x),
			function (capValue) {
				this.lineCap =
					capValue === "b" ? "butt" : capValue === "r" ? "round" : "square"
			}
		]
	]
])

export { params as default }
