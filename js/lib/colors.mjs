// ^ IDEA: create a module for various color-palettes and formats for their representations [call is 'colors.js' or something such...];
export const [black, white] = ["0", "f"].map((s) => `#${s.repeat(3)}`)
export const svgColour = (colour) => ({
	fill: colour,
	stroke: colour
})
