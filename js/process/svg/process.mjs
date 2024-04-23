import { paramsList } from "../state/params.mjs"
import process from "../canvas/process.mjs"
import { tosvg } from "./svg.mjs"

export function svgProcess(expression) {
	const { command, argline } = expression
	if (["set-param", "variable"].includes(command) || paramsList.includes(command)) {
		// ? Replace this? [do the 'setParam' again... Separately...]
		process(expression)
		if (command === "variable") return ""
		if (command === "set-param")
			return svgProcess({ command: argline[0], argline: argline.slice(1) })
	}
	return tosvg(expression)
}
