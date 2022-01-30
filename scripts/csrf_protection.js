let csrf = {};

/**
 * @param {jQuery.Event} event
 * @param {XMLHttpRequest} jqxhr
 * @param {Object} settings
 * @returns {void}
 */
csrf.addLaravelCSRF = function (event, jqxhr, settings) {
	// TODO: Instead of sending the header everytime except to the update path on GIT, it should *only* be sent to the API backend; maybe make `setRequestHeader` simply be part of `api.post`
	if (settings.url !== lychee.updatePath) {
		jqxhr.setRequestHeader("X-XSRF-TOKEN", csrf.getCookie("XSRF-TOKEN"));
	}
};

/**
 * @param {string} s
 * @returns {string}
 */
csrf.escape = function (s) {
	return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
};

/**
 * @param {string} name
 * @returns {?string}
 */
csrf.getCookie = function (name) {
	// TODO @ildyria: The `match` below strikes me as overly complicated and completely unnecessary: a) We exactly know what cookie we are looking for ('X-XSRF-TOKEN'); why do we pass it through the `escape` function? b) The first capturing group doesn't make any sense to me: it captures the beginning of the string (^) or a preceding semi-colon (;) followed by an arbitrary number of spaces. So far so good. But the `?:` doesn't make any sense to me.
	// we stop the selection at = (default json) but also at % to prevent any %3D at the end of the string
	const match = document.cookie.match(RegExp("(?:^|;\\s*)" + csrf.escape(name) + "=([^;^%]*)"));
	return match ? match[1] : null;
	// TODO: Consider of the following code isn't much easier to understand.
	// (See https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#example_2_get_a_sample_cookie_named_test2)
	//
	//    cookieValue = document.cookie
	//      .split(';')
	//      .find(row => /^\s*X-XSRF-TOKEN\s*=/.test(row))
	//      .split('=')[1]
	//      .trim();
};

/**
 * @returns {void}
 */
csrf.bind = function () {
	// TODO: Instead of sending the CSRF cookie for any AJAX request, we probably should simply make this part of our `api.post` method and *only* send the token to the back-end
	$(document).on("ajaxSend", csrf.addLaravelCSRF);
};
