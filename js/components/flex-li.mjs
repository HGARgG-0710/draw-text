import { attribute, create, appendpar } from "../lib/components.mjs"

// TODO: GENERALIZE THIS CONSTRUCTION! [appears in two separate classes... Make a class-generation function];
window.customElements.define(
	"flex-li",
	class extends HTMLElement {
		constructor() {
			super()
		}
		connectedCallback() {
			appendpar(attribute(this)("class", "flexli"))(create("slot"))
		}
	}
)
