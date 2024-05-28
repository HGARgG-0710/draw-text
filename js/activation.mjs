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
	prop,
	downloadGeneral
} from "./lib/components.mjs"
import parse, { validate, validateNumber } from "./parser/main.mjs"
import process from "./process/canvas/process.mjs"
import { clear, canvas, context } from "./process/canvas/draw.mjs"
import { svgURI } from "./process/svg/uri.mjs"
import { download } from "./lib/components.mjs"
import { canvasParams } from "./process/state/params.mjs"
import { events } from "./lib/events.mjs"
import { SessionFileStorage } from "./lib/files.mjs"
import { capitalize } from "./lib/lib.mjs"

export const clearButton = (x) => query(x)("button.clear-button")
export const filesInput = (x) => query(x)("input[type='file']")
export const files = (x) => Array.from(filesInput(x).files)

const [imgExt, codeElem, downloadButton] = ["img-format", "code", "download-button"]
	.map((x) => `#${x}`)
	.map(query())
const [filelists, fileContainers] = [".file-list", ".files-container"].map(mquery())

export const [fontContainer] = fileContainers
export const [fontFiles, preFiles, postFiles] = Array.from(filelists)

export const fontStorage = SessionFileStorage()

if (window.sessionStorage.getItem("fonts")) {
	const fontInput = filesInput(fontFiles)
	fontStorage.load("fonts").get(fontInput)
	fontInput.dispatchEvent(events.change)
}

// ? Make a separate files with all the constants?
const maxFilenameLength = 25

let lastText = ""

const [vh, vw] = ["height", "width"].map((x) =>
	Math.max(
		...[
			[document.documentElement, `client${capitalize(x)}`],
			[window, `inner${x}`]
		].map((x) => (x[0][x[1]] || 0) / 100)
	)
)

const outSingle = async (text) =>
	await validate(text, async (text) => {
		for await (const x of parse(text)) await process(x, context)
	})
const outList = async (list) => {
	for await (const x of list) outSingle(x)
}
const readFiles = async (files) =>
	await Promise.all(Array.from(files).map(async (file) => file.text()))

const outOnChange = async function (_kevent) {
	const v = this.value.trim()
	if (lastText !== v)
		await validate((lastText = v), async (text) => {
			await imgout(text)
			window.sessionStorage.setItem("code", text)
		})
}

const imgout = async (text) => {
	await document.fonts.ready

	clear()
	canvasParams.reset(context)

	await outList(await readFiles(files(preFiles)))
	await outSingle(text)
	await outList(await readFiles(files(postFiles)))
}

const isMetric = async (x) =>
	await (async (x) => x && (await validate(x, (x) => x, validateNumber)))(
		window.sessionStorage.getItem(x)
	)

// ? This doesn't work for changing of the viewport values - make reactive?
attribute(
	attribute(canvas)(
		"height",
		(await isMetric("height")) || String(60 * (vh > vw ? vw : vh))
	)
)("width", (await isMetric("width")) || String(60 * vw))

codeElem.value = window.sessionStorage.getItem("code") || ""

// ^ Idea: create an npm-library with common expressions/aliases/tasks for working with DOM API [like here - allowing the Tab insertion inside a 'textarea' element];
codeElem.addEventListener(
	"keydown",
	function (event) {
		if (event.key === "Tab" && document.activeElement.id === "code") {
			event.preventDefault()
			this.setRangeText("\t", this.selectionStart, this.selectionStart, "end")
		}
	},
	true
)

codeElem.addEventListener("keyup", outOnChange, true)
await outOnChange.call(codeElem)

for (const metric of ["width", "height"]) {
	const sizeChange = async function (_kevent) {
		await validate(
			this.value.trim(),
			async (text) => {
				window.sessionStorage.setItem(metric, text)
				canvas.setAttribute(metric, text)
				await imgout(lastText)
			},
			validateNumber
		)
		if (!this.value) window.sessionStorage.removeItem(metric)
	}
	const metricInput = query()(`#${metric}`)
	if (await isMetric(metric)) metricInput.value = window.sessionStorage.getItem(metric)
	await sizeChange.call(metricInput)
	metricInput.addEventListener("input", sizeChange, true)
}

const mimeMap = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp"
}

downloadButton.addEventListener(
	"click",
	async (_event) => {
		const ext = imgExt.value
		const isSVG = ext === "svg"
		if (isSVG) {
			let i = 0
			const reader = new FileReader()
			const readFonts = []
			reader.onload = function (event) {
				readFonts.push(reader.result)
				++i
				if (i === fonts.length)
					fonts.forEach((x, i) => downloadGeneral(() => x.name)(readFonts[i]))
			}
			const fonts = files(fontFiles)
			fonts.forEach((x) => reader.readAsDataURL(x))
		}
		// ? possibly, add the '.avif' support later
		download(
			isSVG
				? svgURI(
						await validate(
							(
								await readFiles(files(preFiles))
							)
								.concat([codeElem.value])
								.concat(await readFiles(files(postFiles)))
								.join("\n"),
							parse
						)
				  )
				: canvas.toDataURL(ext in mimeMap ? mimeMap[ext] : "image/png"),
			ext,
			isSVG
		)
	},
	true
)

// ! take the '...'-string bit out somewhere (useful for 'common patterns' on a webpage/somewhere else, where UX is concerned...);
const filesOut = (fileList) =>
	async function (target) {
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
		await imgout(lastText)
	}

filesInput(fontFiles).addEventListener(
	"change",
	async (_event) => {
		fontStorage.set(
			await Promise.all(
				files(fontFiles).map(async (file) => [
					file.name,
					await file.arrayBuffer()
				])
			)
		)
		await fontStorage.save("fonts")
	},
	true
)

for await (const fileList of filelists) {
	const input = filesInput(fileList)
	await filesOut(fileList)(input)
	input.addEventListener(
		"change",
		async (event) => await filesOut(fileList)(event.target),
		true
	)
}

clearButton(fontContainer).addEventListener(
	"click",
	() => {
		fontStorage.clear()
		window.sessionStorage.removeItem("fonts")
	},
	true
)

fileContainers.forEach((container) => {
	clearButton(container).addEventListener(
		"click",
		async (_event) =>
			await filesOut(query(container)(".file-list"))(
				prop(filesInput(container))("value", "")
			),
		true
	)
})

// ^ IDEA: the 'for await' serves the same function as a mean of 'chaining' the asyncronous calls (synchronizing them as a sequence). Create an 'async' library with things like that - they'd contain typical tasks for synchronization of different function calls (a more complex one - SYNCHRONIZING A TREE);
// ^ IDEA: create a library for event-emission types...;
