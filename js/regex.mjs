// ! Put somewhere else later... [in a distinct library; too good to just remain here];

const bracket = (regexp) =>
	((a, r) => `(${a.slice(1, a.length - 1 - r.flags.length)})`)(
		regexp.toString(),
		regexp
	)

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
	return (regexp) => new RegExp(`${bracket(regexp)}{${args.slice(0, 2).join(",")}}`)
}

export const [begin, end] = ["^", "$"].map(
	(marker, i) => (regex) =>
		new RegExp(`${i ? "" : marker}${bracket(regex)}${i ? marker : ""}`)
)

export const [plookahead, nlookahead, plookbehind, nlookbehind] = [
	"?=",
	"?!",
	"?<=",
	"?<!"
].map(
	(sym, i) => (regex) =>
		new RegExp(`(${i < 2 ? "" : sym}${bracket(regex)}${i >= 2 ? "" : sym})`)
)
