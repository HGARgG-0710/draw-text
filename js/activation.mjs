// TODO: refactor all of the functions amongst this stuff - should go to a 'lib' directory instead... (separate usage and definition by location);

import {
	clear as childClear,
	create,
	append,
	appendpar,
	text,
	query,
	cquery,
	attribute,
	mquery,
	prop
} from "./lib/components.mjs"
import parse, { validate, validateNumber } from "./parser/main.mjs"
import process from "./process/canvas/process.mjs"
import { clear, canvas, context } from "./process/canvas/draw.mjs"
import { svgURI } from "./process/svg/uri.mjs"
import { download } from "./lib/components.mjs"
import { resetParams } from "./process/state/params.mjs"

const [imgExt, codeElem, downloadButton] = ["img-format", "code", "download-button"]
	.map((x) => `#${x}`)
	.map(query())
const [filelists, fileContainers] = [".file-list", ".files-container"].map(mquery())

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
const readFiles = async (files) => {
	return await Promise.all(Array.from(files).map(async (file) => file.text()))
}

const outOnChange = function (_kevent) {
	const v = this.value.trim()
	if (lastText !== v) {
		lastText = v
		validate(lastText, imgout)
	}
}

const imgout = async (text) => {
	clear()
	resetParams(context)
	const [filesPre, filesAfter] = Array.from(filelists)
		.map(cquery("input[type='file']"))
		.map((x) => x.files)
	outList(await readFiles(filesPre))
	outSingle(text)
	outList(await readFiles(filesAfter))
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

// TODO: BUG - for whatever reason, pressing the 'download' button for 'svg' causes the image on the canvas to vanish...; 
downloadButton.addEventListener("click", async (_event) => {
	const ext = imgExt.value
	// ? [later] make ternary conditional into a function-map? [possibly, add the '.avif' support later...];
	download(
		ext,
		ext === "svg"
			? svgURI(
					validate(
						(await readFiles(filelists[0]))
							.concat([codeElem.value])
							.concat(await readFiles(filelists[1]))
							.join("\n"),
						parse
					)
			  )
			: canvas.toDataURL(ext in mimeMap ? mimeMap[ext] : "image/png"),
		ext === "SVG"
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

filelists.forEach((fileList) => {
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
