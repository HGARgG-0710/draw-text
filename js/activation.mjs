import draw from "./draw.mjs"
import parse from "./parser.mjs"
import { validate } from "./parser.mjs"
import { clear } from "./draw.mjs"

// * Note: future code, currently not working...
// document.addEventListener("keyup", (_kevent) => {
// 	if (document.activeElement.id === "code") {
// 		validate(document.activeElement.value.trim(), (text) => {
// 			clear()
// 			parse(text).forEach(draw)
// 		})
// 	}
// })

document.querySelector("button").addEventListener("click", () => {
	validate(document.querySelector("#code").value.trim(), (text) => {
		clear()
		parse(text).forEach(draw)
	})
})
