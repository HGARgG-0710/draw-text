import params from "../state/params.mjs";
import process from "../canvas/process.mjs";
import { tosvg } from "./svg.mjs";

// * Finding that the thing is analogous to 'process';
// ! ERROR  - the params have to be settled individually as well (generalize the procedure for param-setting, use it here...); 

export function svgProcess(expression) {
	const { command } = expression;
	if (["set-param", "variable"].includes(command) || params.has(command)) {
		process(expression);
		return "";
	}
	return tosvg(expression);
}
