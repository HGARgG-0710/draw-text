export async function loadFont(name, url, files) {
	const fitting = files.filter((x) => x.name === url)
	if (fitting.length) {
		const t = await fitting[0].arrayBuffer()
		document.fonts.add(new FontFace(`"${name}"`, t))
	}
}
