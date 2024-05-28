export async function loadFont(name, url, files) {
	const fitting = files.filter((x) => x.name === url)
	if (fitting.length) {
		const fontBuffer = await fitting[0].arrayBuffer()
		// * NOTE: the 'window.chrome' check is for Chromium-based browsers (in them, apparently, the "..." is ommited...);
		document.fonts.add(new FontFace(window.chrome ? name : `"${name}"`, fontBuffer))
		await document.fonts.ready
	}
}
