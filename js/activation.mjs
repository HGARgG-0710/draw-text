import draw from "./draw.mjs"
import parse from "./parser.mjs"
import { validate } from "./parser.mjs"
import { clear } from "./draw.mjs"

document.addEventListener("keyup", (_kevent) => {
	if (document.activeElement.id === "#code") {
		validate(document.activeElement.value, (text) => {
			clear()
			parse(text).forEach(draw)
		})
	}
})
