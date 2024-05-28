// * Methods related to encoding/decoding file's binary data;

// ^ IDEA: make a library out of this!

export async function getBuffer(file) {
	return new Uint8Array(await file.arrayBuffer())
}

// * 'buffer' is Uint8Array [result of 'getBuffer'];
export function encodeBuffer(buffer) {
	return btoa(String.fromCharCode.apply(null, buffer))
}
export function decodeBuffer(encoded) {
	return new Uint8Array(
		atob(encoded)
			.split("")
			.map((x) => x.charCodeAt(0))
	).buffer
}

export function addFile(dataTransfer) {
	return (url, buffer) =>
		(dataTransfer.dat = dataTransfer.data.items.add(new File([buffer], url)))
}
export function getFiles(dataTransfer) {
	return async (inputFile) => (inputFile.files = dataTransfer.data.files)
}

export function SessionFileStorage(initial) {
	let _storage = { data: null }
	const storage = {
		clear: () => (_storage.data = new DataTransfer()),
		save: async (itemName) => {
			window.sessionStorage.removeItem(itemName)
			window.sessionStorage.setItem(
				itemName,
				(
					await Promise.all(
						Array.from(_storage.data.files).map(async (x) =>
							[x.name, encodeBuffer(await getBuffer(x))].join(";")
						)
					)
				).join(",")
			)
		},
		load: function (itemName) {
			this.set(
				window.sessionStorage
					.getItem(itemName)
					.split(",")
					.map((fontDef) =>
						fontDef.split(";").map((x, i) => (!i ? x : decodeBuffer(x)))
					)
			)
			return this
		},
		set: function (newStorage = []) {
			this.clear()
			newStorage.forEach((x) => this.add(...x))
			return this
		}
	}

	storage.set(initial)
	storage.add = addFile(_storage)
	storage.get = getFiles(_storage)

	return storage
}
