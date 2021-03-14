class Primitive {
	constructor(givenType) {
		this.type = givenType
	}
}

class Square extends Primitive {
	constructor(sizes) {}
}

class Rectangle extends Primitive {
	constructor(sizes) {}
}

class Triangle extends Primitive {
	constructor(sizes) {}
}

class Ellipse extends Primitive {
	constructor(sizes) {}
}

class Parallelepiped extends Primitive {
	constructor(sizes) {}
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
				//TODO: IDK what should I write as height (h) for an ellipse for now `\_*_*_/`
				break

			case "4":
				primitiveName = "Parallelepiped"
				h = 4
		}

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
		obj = new [primitiveName](coordinates)

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
