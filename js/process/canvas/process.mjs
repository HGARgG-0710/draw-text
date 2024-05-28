import draw from "./draw.mjs"
import { parseSingle } from "../types.mjs"
import { canvasParams } from "../state/params.mjs"
import { vars, substitute } from "../state/vars.mjs"

export default async function canvasProcess(expression, context) {
	const { command, argline } = expression
	switch (command) {
		case "set-param":
		case "variable":
			const [name, value] = argline
			return (command === "set-param" ? canvasParams.set : vars.set.bind(vars))(
				name,
				parseSingle(value),
				context
			)
		default:
			if (canvasParams.list().includes(command))
				return canvasProcess(
					{
						command: "set-param",
						argline: [command].concat(argline)
					},
					context
				)
			return await draw(substitute(expression))
	}
}
