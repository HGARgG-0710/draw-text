import draw from "./draw.mjs"
import parse from "./parser.mjs"
import { validate, validateNumber } from "./parser.mjs"
import { clear } from "./draw.mjs"

let lastCode = ""
let background = "#ffffff"

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
	parse(text).forEach((x) => (background = draw(x, background) || background))
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

// ? Allow user to do the thing with other 'mime-types'? (not only 'image/')
// ? validate the code for working with things besides png/jpg...;
document.querySelector("#download-button").addEventListener("click", (_event) => {
	const ext = document.querySelector("#img-format").value || "png"
	const downloadA = document.createElement("a")
	downloadA.setAttribute("download", `draw-this.${ext}`)
	downloadA.hidden = true
	downloadA.setAttribute("href", canvas.toDataURL(`image/${ext}`))
	downloadA.click()
})
