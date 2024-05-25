// TODO: later, make this into a full-blown SVG-AST API, then publish as an NPM package...; [also, write a parser and a way to construct SVG from the AST]; [And the 'formatter' - done by means of parsing, then using the obtained AST to get the 'normalized' SVG];
// * NOTE: Many of the features of SVG are excessive, and are thus not present in Draw-Text (as it's intended to be as minimalistic and compact as possible...); Thus, this is only an early sketch/prototype of whatever the SVG module would end up being...;

export function svgCode(tagName, signature) {
	const attrsFunc = SvgAttributesString(signature)
	return (attrs, children = []) =>
		`<${tagName} ${attrsFunc(attrs)}>\n${svg(children)}\n</${tagName}>`
}

export const pairFill = (x) => Array(2).fill(x)

export const svgMap = ((x) =>
	[
		[
			"circle",
			[["center", (t, i) => `c${i ? "y" : "x"}="${t}"`], ["radius", "r"], ...x]
		],
		["rect", [...["x", "y", "height", "width"].map(pairFill), ...x]],
		["polyline", [pairFill("points").concat([(points) => points.join(",")]), ...x]],
		[
			"path",
			[
				pairFill("d").concat([
					(d) =>
						d
							.map((c) => {
								const { command, params } = c
								switch (command) {
									case "A":
										const {
											radius,
											angle,
											largeArc,
											sweep,
											nextPoint: next
										} = params
										return `A ${radius.join(
											" "
										)} ${angle} ${+largeArc} ${+sweep} ${next.join(
											","
										)}`
									case "M":
									case "L":
										const { point } = params
										return `${command} ${point.join(",")}`
								}
							})
							.join("\n")
				]),
				pairFill("transform").concat([
					(transform) =>
						transform
							.map((x) => `${x.transform}(${x.args.join(" ")})`)
							.join(" ")
				]),
				...x
			]
		],
		["text", [...["x", "y", "paint-order"].map(pairFill), ...x]],
		["style", []]
	].reduce(
		(prev, curr) => ({ ...prev, ...((x, y) => ({ [x]: svgCode(x, y) }))(...curr) }),
		{}
	))(
	[
		"stroke",
		"fill",
		"stroke-linecap",
		"stroke-width",
		"stroke-linejoin",
		"stroke-miterlimit",
		"style"
	].map(pairFill)
)

export default function svg(tagNode) {
	if (!tagNode) return ""
	if (!(tagNode instanceof Object)) return tagNode
	if (tagNode instanceof Array) return tagNode.map(svg).join("\n")
	const { tag, attrs, children } = tagNode
	return svgMap[tag](attrs, children)
}

export function SvgAttributesString(signature) {
	return (attrs) =>
		signature
			.map((x) =>
				attrs[x[0]] != undefined
					? typeof x[1] === "function"
						? attrs[x[0]].map(x[1] || ((x) => x))
						: `${x[1]}="${(x[2] || ((x) => x))(attrs[x[0]])}"`
					: ""
			)
			.flat()
			.filter((x) => x && x.length)
			.join(" ")
}
