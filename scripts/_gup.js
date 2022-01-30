/**
 * Returns the value of a query-string parameter.
 *
 * TODO: Why it is called "gup"?
 *
 * TODO @ildiria: This method strikes me as completely unnecessary and overly complicated. Moreover it is only used in a single place. Why don't we simply use (https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/get#example) in the place where we need it?
 *
 * @param {string} b
 * @returns {string}
 */
function gup(b) {
	b = b.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

	let a = "[\\?&]" + b + "=([^&#]*)";
	let d = new RegExp(a);
	let c = d.exec(window.location.href);

	if (c === null) return "";
	else return c[1];
}
