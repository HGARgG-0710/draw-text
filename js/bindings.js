function bind() {
	const button = document.querySelector("div#input_area > button")
	const textarea = document.querySelector("div#input_area > textarea")

	button.addEventListener("click", () => {
        const primitives = evaluateText(getText(textarea))
		primitives.forEach((primitive) => draw(primitive))
    })
}

bind()
