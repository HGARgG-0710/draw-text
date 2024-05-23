// * general refactoring file;

import { svgParams } from "../process/state/params.mjs"

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

export const colour = (points, elliptics) =>
	points
		.map((x, i) => (x[2] ? x[2] : elliptics[i][2]))
		.reduce((acc, curr) => (acc ? acc : curr ? curr : null), null) ||
	svgParams.get("base-color")
