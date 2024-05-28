// * general refactoring file;

import draw from "../process/canvas/draw.mjs"

export const setallbackground = (i) => (background) => (x) => {
	x[i] = background
	return x
}

export const replaceColourBackground =
	(command) => (background) => (points, arrows, elliptics) => ({
		command: command,
		argline: {
			points: points.map(setallbackground(2)(background)),
			connections: {
				arrows: arrows.map(setallbackground(1)(background)),
				elliptics: elliptics.map(setallbackground(3)(background))
			}
		}
	})

export const drawReplaceBackground =
	(command) => (background) => (points, arrows, elliptics) =>
		draw(replaceColourBackground(command)(background)(points, arrows, elliptics))

export const currpair = (points, i) => [0, 1].map((k) => points[(i + k) % points.length])

export const Primitive = (points, connections) => ({ points, connections })

export const colour = (params) => (points, elliptics, arrows) =>
	points
		.map((x, i) => (x[2] ? x[2] : arrows[i][1] ? arrows[i][1] : elliptics[i][2]))
		.reduce((acc, curr) => (acc ? acc : curr ? curr : null), null) ||
	params.get("base-color")

export const capitalize = (x) => `${x[0].toUpperCase()}${x.slice(1).toLowerCase()}`
