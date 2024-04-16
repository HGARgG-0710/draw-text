// TODO: use the 'lib.mjs' files for absolutely everything related to refactoring - let every directory have its own 'lib.mjs'...;
// ^ IDEA: make a mini-module with those aliases (or put them somewhere, anyway; this functional-like style of mutating functions is very beautiful)
// ^ IDEA: turn into a full-blown library, which would permit the user to do this kind of thing (codename: 'fluid'/'noconst') - functional style for elimination of 'const' expressions;
export const appendpar = (element) => (child) => {
	element.append(child)
	return element
}
export const append = (element) => (child) => element.appendChild(child)
export const create = document.createElement.bind(document)
export const attribute = (element) => (name, value) => {
	element.setAttribute(name, value)
	return element
}
export const text = document.createTextNode.bind(document)
export const remove = (el) => (c) => {
	el.removeChild(c)
	return el
}
export const clear = (el) => {
	Array.from(el.children).forEach((x) => remove(el)(x))
	return el
}
export const query = (x) => (q) => x.querySelector(q)
export const cquery = (q) => (x) => x.querySelector(q)

export const prop = (obj) => (prop, val) => {
	obj[prop] = val
	return obj
}