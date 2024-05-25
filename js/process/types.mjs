import { vars } from "./state/vars.mjs"

export const parseSingle = (x) =>
	(x instanceof Array
		? (x) => x.map(parseSingle)
		: vars.has(x)
		? (x) => parseSingle(vars.get(x))
		: ["true", "false"].includes(x)
		? (x) => x === "true"
		: !isNaN(x)
		? Number
		: (x) => x)(x)
