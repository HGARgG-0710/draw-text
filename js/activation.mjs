import {
	clear as childClear,
	create,
	append,
	appendpar,
	text,
	cquery
} from "./components/lib.mjs"
import parse from "./parser/main.mjs"
import process from "./process.mjs"
import { validate, validateNumber } from "./parser/main.mjs"
import { clear, canvas } from "./draw.mjs"
import { svgURI } from "./svg.mjs"

const filelists = document.querySelectorAll(".file-list")

// ? Make a separate files with all the constants?
const maxFilenameLength = 25

let lastText = ""

const [vh, vw] = ["Height", "Width"].map((x) =>
	Math.max(
		...[
			[document.documentElement, `client${x}`],
			[window, `inner${x}`]
		].map((x) => (x[0][x[1]] || 0) / 100)
	)
)

const outSingle = (text) => {
	validate(text, (text) => parse(text).forEach(process))
}
const outList = (list) => {
	list.forEach(outSingle)
}
const readFiles = async (files) => {
	return await Promise.all(files.map(async (file) => (await file.arrayBuffer()).text()))
}

const imgout = async (text) => {
	clear()
	const [filesPre, filesAfter] = filelists
		.map(cquery("input[type='file']"))
		.map((x) => x.files)
	outList(await readFiles(filesPre))
	outSingle(text)
	outList(await readFiles(filesAfter))
}

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

const mimeMap = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp"
}

// TODO: write a documentation on the precise list of available MIME-types;
// ! refactor that thing with the 'download'-a element...; Then, use the output from
document.querySelector("#download-button").addEventListener("click", (_event) => {
	const ext = document.querySelector("#img-format").value
	// ? [later] make ternary conditional into a function-map? [possibly, add the '.avif' support later...];
	download(
		ext,
		ext === "svg"
			? svgURI(parse(document.querySelector("#code").value))
			: canvas.toDataURL(ext in mimeMap ? mimeMap[ext] : "image/png")
	)
})

// ! add somewhere (to a module/library... very useful and commonplace...);
export function download(ext, dataUrl) {
	const downloadA = document.createElement("a")
	downloadA.setAttribute("download", `draw-text.${ext}`)
	downloadA.hidden = true
	downloadA.setAttribute("href", dataUrl)
	downloadA.click()
}

// TODO: implement running from file; [create more examples - then implement and test...];
filelists.forEach((fileList) =>
	fileList
		.querySelector("input[type='file']")
		.addEventListener("change", function (event) {
			const list = childClear(fileList.querySelector("ul"))
			const { target } = event
			const { files } = target
			Array.from(files)
				.map((f) => f.name)
				.forEach((name) =>
					append(list)(
						appendpar(create("li"))(
							text(
								`${name.slice(0, maxFilenameLength)}${
									name.length > maxFilenameLength ? "..." : ""
								}`
							)
						)
					)
				)
			imgout(lastText)
		})
)
