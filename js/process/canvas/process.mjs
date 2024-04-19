import draw from "./draw.mjs"
import { context as drawcontext } from "./draw.mjs"
import { parseSingle } from "../../parser/types.mjs"
import { paramsList, setParam } from "../state/params.mjs"
import { vars, substitute } from "../state/vars.mjs"

export default function process(expression, context = drawcontext) {
	const { command, argline } = expression
	switch (command) {
		case "set-param":
		case "variable":
			const [name, value] = argline
			return (command === "set-param" ? setParam : vars.set.bind(vars))(
				name,
				parseSingle(value),
				context
			)
		default:
			if (paramsList.includes(command))
				return process({
					command: "set-param",
					argline: [command].concat(argline)
				})
			return draw(substitute(expression))
	}
}
