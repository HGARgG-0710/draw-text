import { vars } from "../state/vars.mjs"
import { svgParams } from "../state/params.mjs"
import { tosvg } from "./svg.mjs"
import { parseSingle } from "../types.mjs"

// ? [potential] PROBLEM - the 'vars' for 'SVG' and 'Canvas' ought to be different - the SVG's "background", for instance, causes the Canvas' background to change as well...;
export function svgProcess(expression) {
	const { command, argline } = expression
	const isParam = svgParams.list().includes(command)
	if (["set-param", "variable"].includes(command) || isParam) {
		const [name, value] = argline
		if (isParam)
			return svgProcess({ command: "set-param", argline: [command, ...argline] })
		console.log("HELLOOOOO???")
		console.log(argline[0])
		return (command === "set-param" ? svgParams.set : vars.set.bind(vars))(
			name,
			parseSingle(value)
		)
	}
	return tosvg(expression)
}
