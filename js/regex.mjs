// ! Put somewhere else later... [in a distinct library; too good to just remain here];

const bracket = (regexp) => ((a) => `(${a.slice(1, a.length - 1)})`)(regexp.toString())

export const [and, or] = ["", "|"].map(
	(sym) =>
		(...regexes) =>
			new RegExp(regexes.map(bracket).join(sym))
)

export function addFlag(flag) {
	return (regexp) => new RegExp(regexp, [flag])
}

export const global = addFlag("g")

export function occurences(...args) {
	return (regexp) => new RegExp(`${bracket(regexp)}{${args.slice(0, 2).join(", ")}}`)
}
