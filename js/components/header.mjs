// TODO: create more web components for this (refactor the HTML, essentially);
// * To add:
// 1. space-rect component [for CSS pseudo-class only];
// 2. main-rect component [for CSS pseudo-class only];
// 3. uni-main component (the current 'main') - for refactoring only...; Would add all of its' elements to the 'main-rect' child;
// ! 4. refactor others as well... [those 'div.nogapli' and 'ol.gappedol', and the rest...]:
// * 5. the 'uni-input' component + the 'uni-export' and other drawing-related components..;
// ^ Effectively, REWRITE THE WEBSITE ENTIRELY USING THE Web Components API;

import { append, appendpar, create, text, attribute } from "./lib.mjs"

export class header extends HTMLElement {
	constructor() {
		super()
	}
	connectedCallback() {
		const _append = append(this)

		const pagetop = _append(attribute(create("div"))("id", "pagetop"))
		const pagename = _append(attribute(create("div"))("id", "pagename"))

		// * the GitHub repo area-clickable;
		append(pagetop)(
			appendpar(attribute(create("map"))("name", "ghicon"))(
				attribute(
					attribute(
						attribute(
							attribute(create("area"))(
								"href",
								"https://github.com/HGARgG-0710/draw-text"
							)
						)("shape", "rect")
					)("coords", "0,0,80,80")
				)("target", "_blank")
			)
		)

		// * The image for the area-clickable;
		append(pagetop)(
			attribute(
				attribute(
					attribute(create("img"))(
						"src",
						`${this.getAttribute("img-path") || "."}/img/github.svg`
					)
				)("usemap", "#ghicon")
			)("id", "ghimg")
		)

		// * The reference to my page
		// TODO: once personal website complete, CHANGE!
		append(pagetop)(
			appendpar(
				attribute(
					attribute(create("a"))("href", "https://github.com/HGARgG-0710/")
				)("target", "_blank")
			)(text("Me"))
		)

		// * The documentation reference;
		append(pagetop)(
			attribute(
				attribute(appendpar(create("a"))(text("Documentation")))(
					"href",
					`${this.getAttribute("doc-path") || "html"}/docs.html`
				)
			)("id", "docs-ref")
		)

		// * The copyright
		append(pagetop)(
			appendpar(attribute(create("div"))("id", "pagetop-end"))(
				appendpar(create("p"))(
					document.createTextNode("\u00A9 Igor Kuznetsov, 2024")
				)
			)
		)

		// * The pagename;
		append(pagename)(
			appendpar(
				attribute(create("a"))("href", this.getAttribute("main-path") || ".")
			)(appendpar(create("h1"))(text("draw-text")))
		)
	}
}

window.customElements.define("uni-header", header)
