// ^ extend! This can be made more powerful (draiwng with curves defined by Infinite Series and all that...); 
// * Use math-expressions.mjs, once it's completed...; 

/**
 * Creates a new ngon primitive.
 * @param {[number, number][]} points The points of the n-gon (n = length of the 'points' array passed)
// @param {boolean[]} connected An array of length `points.length - 1`, which tells for an index `i`, whether `points[i]` and `points[(i+1)%points.length]` are connected
 */
export function NGon(points, connected) {
	this.points = points
	this.connected = connected
}