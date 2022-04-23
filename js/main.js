class Primitive {
	constructor(givenType) {
		this.type = givenType
	}
}

class Square extends Primitive {
	constructor(sizes) {
		super("Square")
	}
}

class Rectangle extends Primitive {
	constructor(sizes) {
		super("Rectangle")
	}
}

class Triangle extends Primitive {
	constructor(sizes) {
		super("Triangle")
	}
}

class Ellipse extends Primitive {
	constructor(sizes) {
		super("Ellipse")
	}
}

class Parallelogram extends Primitive {
	constructor(sizes) {
		super("Parallelogram")
	}
}

function draw(primitive) {}

function evaluateText(text) {
	const primitives = []
	const coordinates = []

	for (let i = 0; i < text.length; i++) {
		let obj
		let primitiveName
		let j = 0
		let h

		switch (text[i]) {
			case "0":
				primitiveName = "Square"
			case "1":
				primitiveName =
					primitiveName == "Square" ? primitiveName : "Rectangle"
				h = 1
				break

			case "2":
				primitiveName = "Triangle"
				h = 2
				break

			case "3":
				primitiveName = "Ellipse"
				//TODO: IDK what should I write as height (h) for an ellipse for now `\_*_*_/`, will decide later.
				break

			case "4":
				primitiveName = "Parallelogramm"
				h = 3
		}

		// Filling the coordinates array according to the user's input.
		for (let n = 0; text[i] != "|"; ++i) {
			if (text[i] != "(" && text[i] != ")" && isANumber(text[i])) {
				coordinates[j][n] += text[i]
			} else if (text[i] == ";") {
				coordinates[j][n] = Number(coordinates[j][n])
				j = j == h ? h : j + 1
				n = 0
			} else if (text[i] == ",") {
				n = 1
			}
		}
		eval(`obj = new ${primitiveName}(coordinates)`)
		primitives.push(obj)
	}

	return primitives
}

function getText(text_element) {
	return text_element.value
}

function isANumber(num_str) {
	return "0123456789".includes(num_str)
}
