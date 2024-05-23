// TODO: refactor all of the functions amongst this stuff - should go to a 'lib' directory instead... (separate usage and definition by location);

import {
	clear as childClear,
	create,
	append,
	appendpar,
	text,
	query,
	attribute,
	mquery,
	prop
} from "./lib/components.mjs"
import parse, { validate, validateNumber } from "./parser/main.mjs"
import process from "./process/canvas/process.mjs"
import { clear, canvas, context } from "./process/canvas/draw.mjs"
import { svgURI } from "./process/svg/uri.mjs"
import { download } from "./lib/components.mjs"
import { canvasParams } from "./process/state/params.mjs"

const [imgExt, codeElem, downloadButton] = ["img-format", "code", "download-button"]
	.map((x) => `#${x}`)
	.map(query())
const [filelists, fileContainers] = [".file-list", ".files-container"].map(mquery())

export const [fontFiles, preFiles, postFiles] = Array.from(filelists)

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
const outList = (list) => list.forEach(outSingle)
const readFiles = async (files) =>
	await Promise.all(Array.from(files).map(async (file) => file.text()))

const outOnChange = function (_kevent) {
	const v = this.value.trim()
	if (lastText !== v) {
		lastText = v
		validate(lastText, imgout)
	}
}

const imgout = async (text) => {
	clear()
	canvasParams.reset(context)
	outList(await readFiles(files(preFiles)))
	outSingle(text)
	outList(await readFiles(files(postFiles)))
}

// ? This doesn't work for changing of the viewport values - make reactive?
attribute(attribute(canvas)("height", String(60 * (vh > vw ? vw : vh))))(
	"width",
	String(60 * vw)
)

// ^ Idea: create an npm-library with common expressions/aliases/tasks for working with DOM API [like here - allowing the Tab insertion inside a 'textarea' element];
codeElem.addEventListener("keydown", function (event) {
	if (event.key === "Tab" && document.activeElement.id === "code") {
		event.preventDefault()
		this.setRangeText("\t", this.selectionStart, this.selectionStart, "end")
	}
})

codeElem.addEventListener("keyup", outOnChange)
outOnChange.call(codeElem)

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
	const metricInput = query()(`#${metric}`)
	change.call(metricInput)
	metricInput.addEventListener("input", change)
}

const mimeMap = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp"
}

export const files = (x) => Array.from(query(x)("input[type='file']").files)

// TODO: BUG - for whatever reason, pressing the 'download' button for 'svg' causes the image on the canvas to vanish...;
downloadButton.addEventListener("click", async (_event) => {
	const ext = imgExt.value
	const isSVG = ext === "svg"
	// ? [later] make ternary conditional into a function-map? [possibly, add the '.avif' support later...];
	download(
		ext,
		isSVG
			? svgURI(
					validate(
						(await readFiles(files(preFiles)))
							.concat([codeElem.value])
							.concat(await readFiles(files(postFiles)))
							.join("\n"),
						parse
					)
			  )
			: canvas.toDataURL(ext in mimeMap ? mimeMap[ext] : "image/png"),
		isSVG
	)
})

// ! take the '...'-string bit out somewhere (useful for 'common patterns' on a webpage/somewhere else, where UX is concerned...);
const filesOut = (fileList) =>
	function (target) {
		const list = childClear(query(fileList)("ul"))
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
	}

;[preFiles, postFiles].forEach((fileList) => {
	const input = query(fileList)("input[type='file']")
	filesOut(fileList)(input)
	input.addEventListener("change", function (event) {
		return filesOut(fileList)(event.target)
	})
})

fileContainers.forEach((container) => {
	query(container)("button.clear-button").addEventListener("click", function (_event) {
		const input = query(container)("input[type='file']")
		prop(input)("value", "")
		filesOut(query(container)(".file-list"))(input)
	})
})
