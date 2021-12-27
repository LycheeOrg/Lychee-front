/**
 * @description This module communicates with Lychee's API
 */

/**
 * @callback SuccessCallback
 * @param {Object} data the decoded JSON response
 */

/**
 * @callback ErrorCallback
 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
 * @param {Object} params the original JSON parameters of the request
 * @return {boolean}
 */

/**
 * @callback ProgressCallback
 * @param {Object} event         the progress event
 * @param {number} event.loaded  the amount of loaded data so far
 * @param {number} event.total   the total amount of data to be loaded
 */

/**
 * @typedef {Object} LycheeException
 * @property {string} message     the message of the exception
 * @property {string} [exception] the name of the exception class; only in developer mode
 * @property {string} [file]      the file name where the exception has been thrown; only in developer mode
 * @property {number} [line]      the line number where the exception has been thrown; only in developer mode
 * @property {Array} [trace]      the backtrace; only in developer mode
 * @property {?LycheeException} [previous_exception] the previous exception, if any; only in developer mode
 */

/**
 * The main API object
 */
let api = {
	/**
	 * Global, default error handler
	 *
	 * @type {?ErrorCallback}
	 */
	onError: null,
};

/**
 *
 * @param {string} fn
 * @param {Object} params
 * @param {?SuccessCallback} successCallback
 * @param {?ProgressCallback} responseProgressCB
 * @param {?ErrorCallback} errorCallback
 */
api.post = function (fn, params, successCallback, responseProgressCB = null, errorCallback = null) {
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
		if (errorCallback) {
			let isHandled = errorCallback(jqXHR, params);
			if (isHandled) return;
		}
		// Call global error handler for unhandled errors
		api.onError(jqXHR, params);
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
 * @param {SuccessCallback} callback
 */
api.get = function (url, callback) {
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
		api.onError(jqXHR, {});
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

/**
 *
 * @param {string} fn
 * @param {Object} params
 * @param {SuccessCallback} callback
 */
api.post_raw = function (fn, params, callback) {
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
		api.onError(jqXHR, params);
	};

	$.ajax({
		type: "POST",
		url: "api/" + fn,
		data: params,
		dataType: "text",
		success: successHandler,
		error: errorHandler,
	});
};
