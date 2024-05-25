import { append, appendpar, attribute, create, text } from "../lib/components.mjs"

window.customElements.define("files-container", class extends HTMLElement {
	constructor() {
		super()
	}
	connectedCallback() {
		appendpar(attribute(this)("class", "files-container"))(
			attribute(appendpar(create("button"))(text("Clear")))("class", "clear-button")
		)

		const fileList = append(this)(attribute(create("div"))("class", "file-list"))
		const labelName = this.getAttribute("label-name")
		const label = this.getAttribute("label")

		appendpar(fileList)(
			attribute(
				attribute(appendpar(create("label"))(text(label)))("for", labelName)
			)("class", "file-input")
		)

		appendpar(fileList)(
			attribute(
				attribute(
					attribute(attribute(create("input"))("type", "file"))("id", labelName)
				)("multiple", "true")
			)("hidden", "true")
		)

		appendpar(fileList)(create("ul"))
	}
})
