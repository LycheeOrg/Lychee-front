/**
 * @description This module communicates with Lychee's API
 */

/**
 * @callback APISuccessCB
 * @param {Object} data the decoded JSON response
 * @returns {void}
 */

/**
 * @callback APIErrorCB
 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
 * @param {Object} params the original JSON parameters of the request
 * @param {?LycheeException} lycheeException the Lychee exception
 * @returns {boolean}
 */

/**
 * @callback APIProgressCB
 * @param {ProgressEvent} event the progress event
 * @returns {void}
 */

/**
 * The main API object
 */
let api = {
	/**
	 * Global, default error handler
	 *
	 * @type {?APIErrorCB}
	 */
	onError: null,
};

/**
 * Checks whether the returned error is probably due to an expired HTTP session.
 *
 * Unfortunately, Laravel has no consistent way how to report an expired and
 * hence unknown session.
 * Laravel simply starts a new session with the (previous, outdated) session
 * ID provided by the client and will fail later at some unpredictable point.
 * The two most likely errors are a CSRF mismatch or a decryption error,
 * because Laravel does either not find the old CSRF token or cannot encrypt
 * a cookie.
 *
 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
 * @param {?LycheeException} lycheeException the Lychee exception
 *
 * @returns {boolean}
 */
api.hasSessionExpired = function (jqXHR, lycheeException) {
	return (
		jqXHR.status === 419 &&
		!!lycheeException &&
		!!lycheeException.previous_exception &&
		(lycheeException.previous_exception.exception === "Illuminate\\Session\\TokenMismatchException" ||
			lycheeException.previous_exception.exception === "Illuminate\\Contracts\\Encryption\\DecryptException")
	);
};

/**
 *
 * @param {string} fn
 * @param {Object} params
 * @param {?APISuccessCB} successCallback
 * @param {?APIProgressCB} responseProgressCB
 * @param {?APIErrorCB} errorCallback
 * @returns {void}
 */
api.post = function (fn, params, successCallback = null, responseProgressCB = null, errorCallback = null) {
	loadingBar.show();

	/**
	 * The success handler
	 * @param {Object} data the decoded JSON object of the response
	 */
	const successHandler = (data) => {
		setTimeout(loadingBar.hide, 100);
		if (successCallback) successCallback(data);
	};

	/**
	 * The error handler
	 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
	 */
	const errorHandler = (jqXHR) => {
		/**
		 * @type {?LycheeException}
		 */
		const lycheeException = jqXHR.responseJSON;

		if (errorCallback) {
			let isHandled = errorCallback(jqXHR, params, lycheeException);
			if (isHandled) {
				setTimeout(loadingBar.hide, 100);
				return;
			}
		}
		// Call global error handler for unhandled errors
		api.onError(jqXHR, params, lycheeException);
	};

	let ajaxParams = {
		type: "POST",
		url: "api/" + fn,
		contentType: "application/json",
		data: JSON.stringify(params),
		dataType: "json",
		headers: {
			"X-XSRF-TOKEN": csrf.getCSRFCookieValue(),
		},
		success: successHandler,
		error: errorHandler,
	};

	if (responseProgressCB !== null) {
		ajaxParams.xhrFields = {
			onprogress: responseProgressCB,
		};
	}

	$.ajax(ajaxParams);
};

/**
 *
 * @param {string} url
 * @param {APISuccessCB} callback
 * @returns {void}
 */
api.getCSS = function (url, callback) {
	loadingBar.show();

	/**
	 * The success handler
	 * @param {Object} data the decoded JSON object of the response
	 */
	const successHandler = (data) => {
		setTimeout(loadingBar.hide, 100);

		callback(data);
	};

	/**
	 * The error handler
	 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
	 */
	const errorHandler = (jqXHR) => {
		api.onError(jqXHR, {}, null);
	};

	$.ajax({
		type: "GET",
		url: url,
		data: {},
		dataType: "text",
		headers: {
			"X-XSRF-TOKEN": csrf.getCSRFCookieValue(),
		},
		success: successHandler,
		error: errorHandler,
	});
};
