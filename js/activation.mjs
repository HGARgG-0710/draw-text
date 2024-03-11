import draw from "./draw.mjs"
import parse from "./parser.mjs"
import { validate, validateNumber } from "./parser.mjs"
import { clear } from "./draw.mjs"

// ^ IDEA: make the "canvas's" size configurable by the user (so that images may be of according size...);
// * This would also be the size of the saved image;
// ! The default is given by CSS, while the actual value set by user is regulated via JS + an additional pair of <input> tags;
// % note: when changing size, THE PICTURE DOES NOT GET SAVED (RE-DRAWN)... Should one fix this? [Would be quite nice, actually...]; 

document.addEventListener("keyup", (_kevent) => {
	if (document.activeElement.id === "code") {
		validate(document.activeElement.value.trim(), (text) => {
			clear()
			parse(text).forEach(draw)
		})
	}
	for (const metric of ["width", "height"])
		if (document.activeElement.id === metric)
			validate(
				document.activeElement.value.trim(),
				(text) => document.querySelector("canvas").setAttribute(metric, text),
				validateNumber
			)
})
