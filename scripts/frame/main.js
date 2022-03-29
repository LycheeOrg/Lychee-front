/**
 * @description Used as an alternative `main` to view photos with "frame mode"
 *
 * Note, the build script picks a subset of the JS files to build a variant
 * of the JS code for the special "frame mode".
 * As this variant does not include all JS files, some objects are missing.
 * Hence, we must partially re-implement these objects to the extent which is
 * required by the methods we call.
 *
 * This approach is very tedious and error-prone, because we actually
 * duplicate code.
 * This variant of a sub-implementation only exists, because it saves some
 * AJAX calls.
 * For example certain meta-data about the viewed photo (e.g. tags) is not
 * fetch via AJAX, but inlined by the backend into the eventual HTML page.
 */

// Sub-implementation of lychee -------------------------------------------------------------- //

const lychee = {};

lychee.content = $(".content");

/**
 * DON'T USE THIS METHOD.
 *
 * TODO: Find all invocations of this method and nuke them.
 *
 * This method does not cover all potentially dangerous characters and this
 * method should not be required on the first place.
 * jQuery and even native JS has better methods for this in the year 2022!
 *
 * @param {string} [html=""]
 * @returns {string}
 */
lychee.escapeHTML = function (html = "") {
	// Ensure that html is a string
	html += "";

	// Escape all critical characters
	html = html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/`/g, "&#96;");

	return html;
};

/**
 * Creates a HTML string with some fancy variable substitution.
 *
 * Actually, this method should not be required in the year 2022.
 * jQuery and even native JS should probably provide a suitable alternative.
 * But this method is used so ubiquitous that it might be difficult to get
 * rid of it.
 *
 * TODO: Try it nonetheless.
 *
 * @param literalSections
 * @param substs
 * @returns {string}
 */
lychee.html = function (literalSections, ...substs) {
	// Use raw literal sections: we don’t want
	// backslashes (\n etc.) to be interpreted
	let raw = literalSections.raw;
	let result = "";

	substs.forEach((subst, i) => {
		// Retrieve the literal section preceding
		// the current substitution
		let lit = raw[i];

		// If the substitution is preceded by a dollar sign,
		// we escape special characters in it
		if (lit.slice(-1) === "$") {
			subst = lychee.escapeHTML(subst);
			lit = lit.slice(0, -1);
		}

		result += lit;
		result += subst;
	});

	// Take care of last literal section
	// (Never fails, because an empty template string
	// produces one literal section, an empty string)
	result += raw[raw.length - 1];

	return result;
};

/**
 * @returns {string} - either `"touchend"` or `"click"`
 */
lychee.getEventName = function () {
	const touchendSupport =
		/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || window.opera) && "ontouchend" in document.documentElement;
	return touchendSupport === true ? "touchend" : "click";
};

// Sub-implementation of lychee -------------------------------------------------------------- //

const frame = {
	/** @type {number} */
	refresh: 30000,
	/** @type {?Photo} */
	photo: null,
};

/**
 * @returns {void}
 */
frame.start_blur = function () {
	const img = document.getElementById("background");
	const canvas = document.getElementById("background_canvas");
	StackBlur.image(img, canvas, 20);
	canvas.style.width = "100%";
	canvas.style.height = "100%";
};

/**
 * @returns {void}
 */
frame.next = function () {
	$("body").removeClass("loaded");
	setTimeout(function () {
		frame.refreshPicture();
	}, 1000);
};

/**
 * @returns {void}
 */
frame.refreshPicture = function () {
	api.post(
		"Photo::getRandom",
		{},
		/** @param {Photo} data */
		function (data) {
			if (data.size_variants.thumb) {
				$("#background").attr("src", data.size_variants.thumb.url);
			} else {
				$("#background").removeAttr("src");
				console.log("Thumb not found");
			}

			let srcset = "";
			let src = "";
			frame.photo = null;
			if (data.size_variants.medium !== null) {
				src = data.size_variants.medium.url;

				if (data.size_variants.medium2x !== null) {
					srcset = `${data.size_variants.medium.url} ${data.size_variants.medium.width}w, ${data.size_variants.medium2x.url} ${data.size_variants.medium2x.width}w`;
					// We use it in the resize callback.
					this.frame.photo = data;
				}
			} else {
				src = data.size_variants.original.url;
			}

			$("#picture").attr("srcset", srcset);
			frame.resize();
			$("#picture").attr("src", src).css("display", "inline");

			setTimeout(function () {
				frame.next();
			}, frame.refresh);
		}
	);
};

/**
 * @param {FrameSettings} data
 * @returns {void}
 */
frame.set = function (data) {
	frame.refresh = data.refresh + 1000; // + 1 sec of blackout
	frame.refreshPicture();
};

/**
 * @returns {void}
 */
frame.resize = function () {
	if (this.photo) {
		const ratio =
			this.photo.size_variants.original.height > 0 ? this.photo.size_variants.original.width / this.photo.size_variants.original.height : 1;
		const winWidth = $(window).width();
		const winHeight = $(window).height();

		// Our math assumes that the image occupies the whole frame.  That's
		// not quite the case (the default css sets it to 95%) but it's close
		// enough.
		const width = winWidth / ratio > winHeight ? winHeight * ratio : winWidth;

		$("#picture").attr("sizes", width + "px");
	}
};

/**
 *
 * @param {XMLHttpRequest} jqXHR
 * @param {Object} params the original JSON parameters of the request
 * @param {?LycheeException} lycheeException the Lychee Exception
 * @returns {boolean}
 */
frame.handleAPIError = function (jqXHR, params, lycheeException) {
	const msg = jqXHR.statusText + (lycheeException ? " - " + lycheeException.message : "");
	loadingBar.show("error", msg);
	console.error("The server returned an error response", {
		description: msg,
		params: params,
		response: lycheeException,
	});
	alert(msg);
	return true;
};

// Main -------------------------------------------------------------- //

const loadingBar = {
	/**
	 * @param {?string} status the status, either `null`, `"error"` or `"success"`
	 * @param {?string} errorText the error text to show
	 * @returns {void}
	 */
	show(status, errorText) {},

	/**
	 * @param {?boolean} force
	 */
	hide(force) {},
};

$(function () {
	// Set API error handler
	api.onError = frame.handleAPIError;

	$(window).on("resize", function () {
		frame.resize();
	});

	$("#background").on("load", function () {
		frame.start_blur();
	});

	$("#picture").on("load", function () {
		$("body").addClass("loaded");
	});

	api.post(
		"Frame::getSettings",
		{},
		/** @param {FrameSettings} data */
		function (data) {
			frame.set(data);
		}
	);
});
