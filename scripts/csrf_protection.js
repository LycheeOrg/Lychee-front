const csrf = {};

/**
 * Returns the value of the CSRF token.
 *
 * Inspired by https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#example_2_get_a_sample_cookie_named_test2
 *
 * @returns {?string}
 */
csrf.getCSRFCookieValue = function () {
	const cookie = document.cookie.split(";").find((row) => /^\s*(X-)?[XC]SRF-TOKEN\s*=/.test(row));
	// We must remove all '%3D' from the end of the string.
	// Background:
	// The actual binary value of the CSFR value is encoded in Base64.
	// If the length of original, binary value is not a multiple of 3 bytes,
	// the encoding gets padded with `=` on the right; i.e. there might be
	// zero, one or two `=` at the end of the encoded value.
	// If the value is sent from the server to the client as part of a cookie,
	// the `=` character is URL-encoded as `%3D`, because `=` is already used
	// to separate a cookie key from its value.
	// When we send back the value to the server as part of an AJAX request,
	// Laravel expects an unpadded value.
	// Hence, we must remove the `%3D`.
	return cookie ? cookie.split("=")[1].trim().replace(/%3D/g, "") : null;
};
