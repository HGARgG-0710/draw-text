import { NGon } from "./primitives.mjs"

// ! Later expand the 'primitives' to not only work with NGons...;
export default function draw(primitive) {
	const canvas = document.querySelector("canvas")
	const context = canvas.getContext("2d")
	if (primitive instanceof NGon) {
		const keys = Array.from(primitive.points.keys())
		for (const key of keys) {
			const data = []
			const [[begpointx, begpointy], [endpointx, endpointy]] = ["min", "max"].map(
				(z) =>
					[0, 1].map((y) =>
						Math[z](
							...[key, (key + 1) % primitive.points.length].map(
								(x) => primitive.points[x][y]
							)
						)
					)
			)
			let it = 0
			let jt = 0
			const multc = (endpointy - begpointy) / (endpointx - begpointx)
			const addc = endpointy - multc * endpointx

			const predicate = primitive.connected[key]
				? (i, j) => multc * i + addc === j
				: (i, j) =>
						[
							[i, 0],
							[j, 1]
						].every((pair) => pair[0] === primitive.points[key][pair[1]])

			for (let i = begpointx; i < endpointx; i++, it++) {
				data.push([])
				// ^ Literally drawing the line using a linear equation 'y = multc*x + addc', or adding a single point
				// ! ALLOW THE CHANGE OF '0' TO APPROPRIATE USER-DEFINED COLOURS! CREATE WAYS TO TRANSFORM FROM RGB!
				for (let j = begpointy; j < endpointy; j++, jt++)
					data[it][jt] = [0, 0, 0, predicate(it, jt) ? 255 : 0]
			}

			context.putImageData(
				new ImageData(new Uint8ClampedArray(data.flat().flat())),
				0,
				0
			)
		}
	}
}
export function clear() {
	const canvas = document.querySelector("canvas")
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
}
