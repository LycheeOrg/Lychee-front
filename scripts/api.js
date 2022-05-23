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
 * @callback APIV2Call
 * @param {Object} params the parameters
 * @param {?APISuccessCB} [successCallback = null]
 * @param {?APIProgressCB} [responseProgressCB = null]
 * @param {?APIErrorCB} [errorCallback = null]
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
 * There seem to be two variants how an expired session may be reported:
 *
 *  1. The web-application has already been loaded, is fully initialized
 *     and a user tries to navigate to another part of the gallery.
 *     In this case, the AJAX request sends the previous, expired CSRF token
 *     and the backend responds with a 419 status code.
 *  2. The user completely reloads the website (e.g. typically be hitting
 *     F5 in most browsers).
 *     In this case, the CSRF token is re-generated by the backend, so no
 *     CSRF mismatch occurs, but the user is no longer authenticated. and the
 *     backend responds with a 401 status code.
 *
 * Note, case 2 also happens if a user directly navigates to a link
 * of the form `#/album-id/` or `#/album-id/photo-id` unless the album is
 * public, but password protected.
 * In that case, the backend also sends a 401 status code, but with a
 * special "Password Required" exception which is handled specially in
 * `album.js`.
 *
 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
 * @param {?LycheeException} lycheeException the Lychee exception
 *
 * @returns {boolean}
 */
api.hasSessionExpired = function (jqXHR, lycheeException) {
	return (
		(jqXHR.status === 419 && !!lycheeException && lycheeException.exception.endsWith("SessionExpiredException")) ||
		(jqXHR.status === 401 && !!lycheeException && lycheeException.exception.endsWith("UnauthenticatedException"))
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
api.get = function (fn, params, successCallback = null, responseProgressCB = null, errorCallback = null) {
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

	const urlParams = new URLSearchParams();
	for (const param in params) {
		let value = params[param];
		if (value === true) value = "1";
		else if (value === false) value = "0";
		urlParams.set(param, value);
	}

	let ajaxParams = {
		type: "GET",
		url: "api/" + fn,
		contentType: "application/json",
		data: urlParams.toString(),
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
 * @param {string} fn
 * @param {Object} params
 * @param {?APISuccessCB} successCallback
 * @param {?APIProgressCB} responseProgressCB
 * @param {?APIErrorCB} errorCallback
 * @returns {void}
 */
api.delete = function (fn, params, successCallback = null, responseProgressCB = null, errorCallback = null) {
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

	const urlParams = new URLSearchParams();
	for (const param in params) {
		let value = params[param];
		if (value === true) value = "1";
		else if (value === false) value = "0";
		urlParams.set(param, value);
	}

	let ajaxParams = {
		type: "DELETE",
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

/**
 * create a function which queries the API
 * @param {string} endpoint
 * @param {string} method
 * @return APIV2Call
 */
api.createV2API = function (endpoint, method) {
	return function (params, successCallback = null, responseProgressCB = null, errorCallback = null) {
		loadingBar.show();

		let url = endpoint;
		for (const param in params) {
			if (url.includes(`{${param}}`)) {
				url = url.replace(`{${param}}`, params[param]);
				delete params[param];
			}
		}

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

		let ajaxParams;
		switch (method) {
			case "POST":
				ajaxParams = {
					type: "POST",
					url: "api/" + url,
					contentType: "application/json",
					data: JSON.stringify(params),
					dataType: "json",
					headers: {
						"X-XSRF-TOKEN": csrf.getCSRFCookieValue(),
					},
					success: successHandler,
					error: errorHandler,
				};
				break;
			case "GET":
				const urlParams = new URLSearchParams();
				for (const param in params) {
					let value = params[param];
					if (value === true) value = "1";
					else if (value === false) value = "0";
					urlParams.set(param, value);
				}
				ajaxParams = {
					type: "GET",
					url: "api/" + url,
					contentType: "application/json",
					data: urlParams.toString(),
					headers: {
						"X-XSRF-TOKEN": csrf.getCSRFCookieValue(),
					},
					success: successHandler,
					error: errorHandler,
				};
				break;
			case "DELETE":
				ajaxParams = {
					type: "DELETE",
					url: "api/" + url,
					contentType: "application/json",
					data: JSON.stringify(params),
					dataType: "json",
					headers: {
						"X-XSRF-TOKEN": csrf.getCSRFCookieValue(),
					},
					success: successHandler,
					error: errorHandler,
				};
				break;
		}
		if (responseProgressCB !== null) {
			ajaxParams.xhrFields = {
				onprogress: responseProgressCB,
			};
		}

		$.ajax(ajaxParams);
	};
};

api.v2 = {
	/**
	 * @type APIV2Call
	 */
	getAlbum: api.createV2API("album/{albumID}", "GET"),
	/**
	 * @type APIV2Call
	 */
	getAlbumPosition: api.createV2API("album/{albumID}/positions", "GET"),
	/**
	 * @type APIV2Call
	 */
	deleteAlbumTrack: api.createV2API("album/{albumID}/track", "DELETE"),
	/**
	 * @type APIV2Call
	 */
	listWebAuthn: api.createV2API("webauthn", "GET"),
	/**
	 * @type APIV2Call
	 */
	search: api.createV2API("search/{term}", "GET"),
	/**
	 * @type APIV2Call
	 */
	photoEditorRotate: api.createV2API("photo/{photoID}/editor/rotate/{direction}", "POST"),
	/**
	 * @type APIV2Call
	 */
	photoSetLicense: api.createV2API("photo/{photoID}/license", "POST"),
	/**
	 * @type APIV2Call
	 */
	photoSetPublic: api.createV2API("photo/{photoID}/public", "POST"),
	/**
	 * @type APIV2Call
	 */
	photoSetDescription: api.createV2API("photo/{photoID}/description", "POST"),
	/**
	 * @type APIV2Call
	 */
	photoRandom: api.createV2API("photo/random", "GET"),
	/**
	 * @type APIV2Call
	 */
	getPhoto: api.createV2API("photo/{photoID}", "GET"),
	/**
	 * @type APIV2Call
	 */
	translateLegacy: api.createV2API("legacy/translate", "GET"),
	/**
	 * @type APIV2Call
	 */
	importServer: api.createV2API("import/server", "POST"),
	/**
	 * @type APIV2Call
	 */
	importServerCancel: api.createV2API("import/server/cancel", "POST"),
	/**
	 * @type APIV2Call
	 */
	frameSettings: api.createV2API("frame/settings", "GET"),
	/**
	 * @type APIV2Call
	 */
	albumsTree: api.createV2API("albums/tree", "GET"),
	/**
	 * @type APIV2Call
	 */
	albumsPosition: api.createV2API("albums/position", "GET"),
	/**
	 * @type APIV2Call
	 */
	getAlbums: api.createV2API("albums", "GET"),
	/**
	 * @type APIV2Call
	 */
	setAlbumSorting: api.createV2API("album/{albumID}/sorting", "POST"),
	/**
	 * @type APIV2Call
	 */
	setAlbumLicense: api.createV2API("album/{albumID}/license", "POST"),
	/**
	 * @type APIV2Call
	 */
	setAlbumProtectionPolicy: api.createV2API("album/{albumID}/protection", "POST"),
	/**
	 * @type APIV2Call
	 */
	setTagAlbumTags: api.createV2API("album/{albumID}/tags", "POST"),
	/**
	 * @type APIV2Call
	 */
	setAlbumCover: api.createV2API("album/{albumID}/cover", "POST"),
	/**
	 * @type APIV2Call
	 */
	setAlbumDescription: api.createV2API("album/{albumID}/description", "POST"),
	/**
	 * @type APIV2Call
	 */
	setAlbumNSFW: api.createV2API("album/{albumID}/nsfw", "POST"),
	/**
	 * @type APIV2Call
	 */
	addTagAlbum: api.createV2API("album/tag", "POST"),
	/**
	 * @type APIV2Call
	 */
	addAlbum: api.createV2API("album", "POST"),
	/**
	 * @type APIV2Call
	 */
	unlockAlbum: api.createV2API("album/{albumID}/unlock", "POST"),
	/**
	 * @type APIV2Call
	 */
	initSession: api.createV2API("session/init", "GET"),
	/**
	 * @type APIV2Call
	 */
	loginSession: api.createV2API("session/login", "POST"),
	/**
	 * @type APIV2Call
	 */
	logoutSession: api.createV2API("session/login", "POST"),
	/**
	 * @type APIV2Call
	 */
	setLogin: api.createV2API("settings/login", "POST"),
};
