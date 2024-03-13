import draw from "./draw.mjs"
import parse from "./parser.mjs"
import { validate, validateNumber } from "./parser.mjs"
import { clear } from "./draw.mjs"

// ^ The size of the image is equal to that of a canvas...;
// ! adjust CSS in such a fashion so as to react properly to changes of canvas' sizes;
// ? note: what about the user simply selecting the thing (again)? Althouth, yes, it would be far better if the sizes changed with the picture (seemingly) remaining untouched...;

let lastCode = ""
// ? the user isn't able to see the intermediate background values anyway... So, maybe, just clean them out?
// ! to be used for background colour... (it's saved with 'background', then used for 'clean'/'erase'); 
// let background = ""

const [vh, vw] = ["Height", "Width"].map((x) =>
	Math.max(
		...[
			[document.documentElement, `client${x}`],
			[window, `inner${x}`]
		].map((x) => (x[0][x[1]] || 0) / 100)
	)
)

const imgout = (text) => {
	clear()
	parse(text).forEach(draw)
}

const canvas = document.querySelector("canvas")
canvas.setAttribute("height", String(60 * vh))
canvas.setAttribute("width", String(60 * vw))

document.addEventListener("keyup", (_kevent) => {
	if (document.activeElement.id === "code") {
		const v = document.activeElement.value.trim()
		if (lastCode !== v) {
			lastCode = v
			validate(lastCode, imgout)
		}
	}
	for (const metric of ["width", "height"])
		if (document.activeElement.id === metric)
			validate(
				document.activeElement.value.trim(),
				(text) => {
					canvas.setAttribute(metric, text)
					imgout(lastCode)
				},
				validateNumber
			)
})
