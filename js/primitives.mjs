// ^ extend! This can be made more powerful (draiwng with curves defined by Infinite Series and all that...);
// * Use math-expressions.mjs, once it's completed...;
// ? Re-organize? Temporarily, as the infinite series and function-defined curves aren't quite there yet...;

/**
 * Creates a new ngon primitive.
 * @param {[number, number][]} points The points of the n-gon (n = length of the 'points' array passed)
 * @param {([boolean, string?] | [number, number?, number?, string?])[]} connections An array of length `points.length - 1`, which tells for an index `i`, whether `points[i]` and `points[(i+1)%points.length]` are connected
 */
export const NGon = (points, connections) => ({ points, connections })
