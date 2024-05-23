export function loadFont(name, url, files) {
	document.fonts.add(
		new FontFace(name, files.filter((x) => x.name === url)[0].arrayBuffer())
	)
}
