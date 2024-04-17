// TODO: later, make this into a full-blown SVG-AST API, then publish as an NPM package...; [also, write a parser and a way to construct SVG from the AST]; [And the 'formatter' - done by means of parsing, then using the obtained AST to get the 'normalized' SVG];
// ^ redo as a function-map...;
// * Many of the features of SVG are excessive, and are thus not present in Draw-Text (as it's intended to be as minimalistic and compact as possible...);
// ! THERE IS A FORMATTING PROBLEM ! Unneeded spaces. Delete them - make it look perfect...;
export default function svg(tagNode) {
	if (tagNode instanceof Array) return tagNode.map(svg).join("\n")
	const { tag, attrs, children } = tagNode
	const { stroke, fill } = attrs
	switch (tag) {
		case "circle":
			const { center, radius } = attrs
			return `<circle ${
				center
					? `a${["x", "y"].map((t, i) => `c${t}='${center[i]}'`).join(" ")}`
					: ``
			} ${radius ? `r='${radius}'` : ""} ${stroke ? `stroke='${stroke}'` : ""} ${
				fill ? `fill='${fill}'` : ""
			} >\n${(children || []).map(svg).join("\n")}\n</circle>`
		case "rect":
			const { x, y, height, width } = attrs
			return `<rect ${x ? `x='${x}'` : ""} ${y ? `y='${y}'` : ""} ${
				height ? `height='${height}'` : ""
			} ${width ? `width=${width}` : ""} ${stroke ? `stroke='${stroke}'` : ""} ${
				fill ? `fill='${fill}'` : ""
			}>\n${(children || []).map(svg).join("\n")}\n</rect>`
		case "polyline":
			return `<polyline ${points ? `points='${points.join(",")}'` : ""} ${
				stroke ? `stroke='${stroke}'` : ""
			} ${fill ? `fill='${fill}'` : ""}>\n${(children || [])
				.map(svg)
				.join("\n")}\n</polyline>`
		case "path":
			const { d, pathLength } = attrs
			// TODO: later, GENERALIZE THIS - create a general interface for the attributes, so as not to have to create repetitious ternaries like these every single time... (generalize to a function, then define the desired SVG specs in terms of it...);
			// TODO: generalize the switch for 'd'-parsing to an external function-map later...
			// TODO: add more commands for 'd'...;
			return `<path ${
				d
					? `d='${attrs.d
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
							.join("\n")}'`
					: ""
			} ${pathLength ? `pathLength='${pathLength}'` : ""} ${
				stroke ? `stroke='${stroke}'` : ""
			} ${fill ? `fill='${fill}'` : ""}>\n${(children || [])
				.map(svg)
				.join("\n")}\n</path>`
	}
}
