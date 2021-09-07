/**
 * @description This module communicates with Lychee's API
 */

let api = {
	onError: null,
};

api.isTimeout = function (errorThrown, jqXHR) {
	if (
		errorThrown &&
		((errorThrown === "Bad Request" &&
			jqXHR &&
			jqXHR.responseJSON &&
			jqXHR.responseJSON.error &&
			jqXHR.responseJSON.error === "Session timed out") ||
			(errorThrown === "unknown status" &&
				jqXHR &&
				jqXHR.status &&
				jqXHR.status === 419 &&
				jqXHR.responseJSON &&
				jqXHR.responseJSON.message &&
				jqXHR.responseJSON.message === "CSRF token mismatch."))
	) {
		return true;
	}

	return false;
};

api.post = function (fn, params, successCallback, responseProgressCB = null, errorCallback) {
	loadingBar.show();

	params = $.extend({ function: fn }, params);

	let api_url = "api/" + fn;

	const success = (data) => {
		setTimeout(loadingBar.hide, 100);

		// Catch errors
		if (typeof data === "string" && data.substring(0, 7) === "Error: ") {
			api.onError(data.substring(7, data.length), params, data);
			return false;
		}

		successCallback(data);
	};

	const error = (jqXHR, textStatus, errorThrown) => {
		if (errorCallback) {
			let isHandled = errorCallback(jqXHR);
			if (isHandled) return;
		}
		// Call global error handler for unhandled errors
		api.onError(api.isTimeout(errorThrown, jqXHR) ? "Session timed out." : "Server error or API not found.", params, errorThrown);
	};

	let ajaxParams = {
		type: "POST",
		url: api_url,
		data: params,
		dataType: "json",
		success,
		error,
	};

	if (responseProgressCB !== null) {
		ajaxParams.xhrFields = {
			onprogress: responseProgressCB,
		};
	}

	$.ajax(ajaxParams);
};

api.get = function (url, callback) {
	loadingBar.show();

	const success = (data) => {
		setTimeout(loadingBar.hide, 100);

		// Catch errors
		if (typeof data === "string" && data.substring(0, 7) === "Error: ") {
			api.onError(data.substring(7, data.length), params, data);
			return false;
		}

		callback(data);
	};

	const error = (jqXHR, textStatus, errorThrown) => {
		api.onError(api.isTimeout(errorThrown, jqXHR) ? "Session timed out." : "Server error or API not found.", {}, errorThrown);
	};

	$.ajax({
		type: "GET",
		url: url,
		data: {},
		dataType: "text",
		success,
		error,
	});
};

api.post_raw = function (fn, params, callback) {
	loadingBar.show();

	params = $.extend({ function: fn }, params);

	let api_url = "api/" + fn;

	const success = (data) => {
		setTimeout(loadingBar.hide, 100);

		// Catch errors
		if (typeof data === "string" && data.substring(0, 7) === "Error: ") {
			api.onError(data.substring(7, data.length), params, data);
			return false;
		}

		callback(data);
	};

	const error = (jqXHR, textStatus, errorThrown) => {
		api.onError(api.isTimeout(errorThrown, jqXHR) ? "Session timed out." : "Server error or API not found.", params, errorThrown);
	};

	$.ajax({
		type: "POST",
		url: api_url,
		data: params,
		dataType: "text",
		success,
		error,
	});
};
