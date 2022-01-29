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
			if (isHandled) return;
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
		success: successHandler,
		error: errorHandler,
	});
};
