import { paramsList } from "../state/params.mjs"
import process from "../canvas/process.mjs"
import { tosvg } from "./svg.mjs"

// ! PROBLEM - the 'vars' and 'params' for 'SVG' and 'Canvas' ought to be different - the SVG's "background", for instance, causes the Canvas' background to change as well...;
export function svgProcess(expression) {
	const { command, argline } = expression
	if (["set-param", "variable"].includes(command) || paramsList.includes(command)) {
		// ! THIS CHECK IS BAD! [one should create a general mechanism for creating separate 'params' systems - not this unity...];
		if (
			!(command === "set-param" && argline[0] === "background") &&
			command != "background"
		)
			process(expression)
		if (command === "variable") return ""
		if (command === "set-param")
			return svgProcess({ command: argline[0], argline: argline.slice(1) })
	}
	return tosvg(expression)
}
