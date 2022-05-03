/**
 * @description This module is used to show and hide the loading bar.
 */

const loadingBar = {
	/** @type {?string} */
	status: null,
	/** @type {jQuery} */
	_dom: $("#loading"),
};

/**
 * @param {string} [selector=""]
 * @returns {jQuery}
 */
loadingBar.dom = function (selector) {
	if (selector == null || selector === "") return loadingBar._dom;
	return loadingBar._dom.find(selector);
};

/**
 * @param {?string} status the status, either `null`, `"error"` or `"success"`
 * @param {?string} errorText the error text to show
 * @returns {void}
 */
loadingBar.show = function (status, errorText) {
	if (status === "error") {
		// Set status
		loadingBar.status = "error";

		// Parse text
		if (errorText) errorText = errorText.replace("<br>", "");
		if (!errorText) errorText = lychee.locale["ERROR_TEXT"];

		// Move header down
		if (visible.header()) header.dom().addClass("header--error");

		// Also move down the dark background
		if (basicModal.visible()) {
			$(".basicModalContainer").addClass("basicModalContainer--error");
			$(".basicModal").addClass("basicModal--error");
		}

		// Modify loading
		loadingBar
			.dom()
			.removeClass("loading uploading error success")
			.html(`<h1>` + lychee.locale["ERROR"] + `: <span>${errorText}</span></h1>`)
			.addClass(status)
			.show();

		// Set timeout
		clearTimeout(loadingBar._timeout);
		loadingBar._timeout = setTimeout(() => loadingBar.hide(true), 3000);

		return;
	}

	if (status === "success") {
		// Set status
		loadingBar.status = "success";

		// Parse text
		if (errorText) errorText = errorText.replace("<br>", "");
		if (!errorText) errorText = lychee.locale["ERROR_TEXT"];

		// Move header down
		if (visible.header()) header.dom().addClass("header--error");

		// Also move down the dark background
		if (basicModal.visible()) {
			$(".basicModalContainer").addClass("basicModalContainer--error");
			$(".basicModal").addClass("basicModal--error");
		}

		// Modify loading
		loadingBar
			.dom()
			.removeClass("loading uploading error success")
			.html(`<h1>` + lychee.locale["SUCCESS"] + `: <span>${errorText}</span></h1>`)
			.addClass(status)
			.show();

		// Set timeout
		clearTimeout(loadingBar._timeout);
		loadingBar._timeout = setTimeout(() => loadingBar.hide(true), 2000);

		return;
	}

	if (loadingBar.status === null) {
		// Set status
		loadingBar.status = lychee.locale["LOADING"];

		// Set timeout
		clearTimeout(loadingBar._timeout);
		loadingBar._timeout = setTimeout(() => {
			// Move header down
			if (visible.header()) header.dom().addClass("header--loading");

			// Modify loading
			loadingBar.dom().removeClass("loading uploading error").html("").addClass("loading").show();
		}, 1000);
	}
};

/**
 * @param {boolean} force
 * @returns {void}
 */
loadingBar.hide = function (force) {
	if ((loadingBar.status !== "error" && loadingBar.status !== "success" && loadingBar.status != null) || force) {
		// Remove status
		loadingBar.status = null;

		// Move header up
		header.dom().removeClass("header--error header--loading");
		// Also move up the dark background
		$(".basicModalContainer").removeClass("basicModalContainer--error");
		$(".basicModal").removeClass("basicModal--error");

		// Set timeout
		clearTimeout(loadingBar._timeout);
		setTimeout(() => loadingBar.dom().hide(), 300);
	}
};
