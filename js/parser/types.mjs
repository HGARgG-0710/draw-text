import { regexps } from "./syntax.mjs"
import { vars } from "../process/state/vars.mjs"

// ! Integrate this with 'regexps' more closely [namely, with regexps.types (in future - 'types', 'structures', 'tokens')...];
// ^ Add the types SPECIFICALLY... - namely, generalize for the finite-set types... [such as r/b/s]
export const parseSingle = (x) =>
	(x instanceof Array
		? (x) => x.map(parseSingle)
		: vars.has(x)
		? (x) => parseSingle(vars.get(x))
		: ["true", "false"].includes(x)
		? (x) => x === "true"
		: ["r", "b", "s"].includes(x)
		? (x) => x
		: typeof x === "boolean"
		? (x) => x
		: !isNaN(x)
		? Number
		: (text) => text.match(regexps.colorarg)[0] || params.get("base-color")[0])(x)
