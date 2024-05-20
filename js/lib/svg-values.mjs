// * A very nasty place, where no mortal soul should ever have to look - module for values-correction in SVG.

export const arcNextPoint = (t) => (x, i) =>
	Math.abs(x) < 1 / 10000 ? 0 : x - (1 / 10 ** (4 * i)) * (1 & (i + t))
