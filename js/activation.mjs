import {
	clear as childClear,
	create,
	append,
	appendpar,
	text,
	cquery,
	attribute
} from "./components/lib.mjs"
import parse from "./parser/main.mjs"
import process from "./process/canvas/process.mjs"
import { validate, validateNumber } from "./parser/main.mjs"
import { clear, canvas } from "./process/canvas/draw.mjs"
import { svgURI } from "./process/svg/uri.mjs"

const imgExt = document.querySelector("#img-format")
const codeElem = document.querySelector("#code")
const filelists = document.querySelectorAll(".file-list")
const downloadButton = document.querySelector("#download-button")

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
codeElem.addEventListener("keydown", function (event) {
	if (event.key === "Tab" && document.activeElement.id === "code") {
		event.preventDefault()
		this.setRangeText("\t", this.selectionStart, this.selectionStart, "end")
	}
})

codeElem.addEventListener("keyup", function (_kevent) {
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
downloadButton.addEventListener("click", async (_event) => {
	const ext = imgExt.value
	// ? [later] make ternary conditional into a function-map? [possibly, add the '.avif' support later...];
	download(
		ext,
		ext === "svg"
			? svgURI(
					parse(
						(await readFiles(filelists[0]))
							.concat([codeElem.value])
							.concat(await readFiles(filelists[1]))
							.join("\n")
					)
			  )
			: canvas.toDataURL(ext in mimeMap ? mimeMap[ext] : "image/png")
	)
})

// ! add the generalization somewhere (to a module/library... very useful and commonplace...);
export function download(ext, dataUrl) {
	attribute(
		attribute(attribute(create("a"))("download", `draw-text.${ext}`))("hidden", "")
	)("href", dataUrl).click()
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
