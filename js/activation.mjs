import parse from "./parser.mjs"
import process from "./process.mjs"
import { validate, validateNumber } from "./parser.mjs"
import { clear } from "./draw.mjs"
import { mimeMap } from "./mime.mjs"

let lastText = ""

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
	parse(text).forEach(process)
}

const canvas = document.querySelector("canvas")
canvas.setAttribute("height", String(60 * vh))
canvas.setAttribute("width", String(60 * vw))

// ^ Idea: create an npm-library with common expressions/aliases/tasks for working with DOM API [like here - allowing the Tab insertion inside a 'textarea' element];
document.querySelector("#code").addEventListener("keydown", function (event) {
	if (event.key === "Tab" && document.activeElement.id === "code") {
		event.preventDefault()
		this.setRangeText("\t", this.selectionStart, this.selectionStart, "end")
	}
})

document.querySelector("#code").addEventListener("keyup", function (_kevent) {
	const v = this.value.trim()
	if (lastText !== v) {
		lastText = v
		validate(lastText, imgout)
	}
})

for (const metric of ["width", "height"]) {
	const change = function (_kevent) {
		validate(
			this.value.trim(),
			(text) => {
				canvas.setAttribute(metric, text)
				imgout(lastText)
			},
			validateNumber
		)
	}
	const metricInput = document.querySelector(`#${metric}`)
	change.call(metricInput)
	metricInput.addEventListener("input", change)
}

document.querySelector("#download-button").addEventListener("click", (_event) => {
	console.log(document.querySelector("#img-format").value)
	const ext = document.querySelector("#img-format").value || "png"
	const downloadA = document.createElement("a")
	downloadA.setAttribute("download", `draw-this.${ext}`)
	downloadA.hidden = true
	downloadA.setAttribute("href", canvas.toDataURL(mimeMap[ext]))
	downloadA.click()
})
