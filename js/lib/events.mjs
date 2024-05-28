// TODO: Array-of-Objects->Object conv a great addition to some math-expressions.js
export const events = ((x) => x.reduce((prev, curr) => ({ ...prev, ...curr }), {}))(
	["change"].map((x) => ({
		[x]: new Event(x)
	}))
)
