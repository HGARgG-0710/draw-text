import draw from "./draw.mjs"
import { context as drawcontext } from "./draw.mjs"
import { parseSingle } from "../../parser/types.mjs"
import params, { setParam } from "../state/params.mjs"
import { vars, substitute } from "../state/vars.mjs"

export default function process(expression, context = drawcontext) {
	const { command, argline } = expression
	switch (command) {
		case "set-param":
			const [paramName, value] = argline
			setParam(paramName, value, context)
			break
		case "variable":
			vars.set(argline[0], parseSingle(argline[1]))
			break
		default:
			if (params.has(command))
				return process({
					command: "set-param",
					argline: [command].concat(argline)
				})
			return draw(substitute(expression))
	}
}
