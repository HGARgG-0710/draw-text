import { appendpar, attribute, create } from "../lib/components.mjs"

window.customElements.define(
	"item-description",
	class extends HTMLElement {
		constructor() {
			super()
		}
		connectedCallback() {
			appendpar(attribute(this)("class", "description"))(create("slot"))
		}
	}
)
