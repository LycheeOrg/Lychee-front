/**
 * @description Used as an alternative `main` to view single photos with `view.php`
 *
 * Note, the build script picks a subset of the JS files to build a variant
 * of the JS code for the special "view mode".
 * As this variant does not include all JS files, some objects are missing.
 * Hence, we must partially re-implement these objects to the extent which is
 * required by the methods we call.
 *
 * This approach is very tedious and error-prone, because we actually
 * duplicate code.
 * Also, it is not documented nor obvious why these "subset implementations"
 * are necessary.
 * Ideally, the full code base would be used all the time independent of
 * the users entry point.
 *
 * TODO: Find out why we actually need this approach. Re-implementing different variants of the same objects is very error-prone.
 */

// Sub-implementation of lychee -------------------------------------------------------------- //

const lychee = {};

lychee.content = $(".content");
lychee.imageview = $("#imageview");
lychee.mapview = $("#mapview");
lychee.locale = {};

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

// Sub-implementation of photo -------------------------------------------------------------- //

const photo = {
	/** @type {?Photo} */
	json: null,
	/** @type {?LivePhotosKit.Player} */
	livePhotosObject: null,
};

/**
 * @param {string} photoID
 * @param {string} service - one out of `"twitter"`, `"facebook"`, `"mail"` or `"dropbox"`
 * @returns {void}
 */
photo.share = function (photoID, service) {
	let url = location.toString();

	switch (service) {
		case "twitter":
			window.open(`https://twitter.com/share?url=${encodeURI(url)}`);
			break;
		case "facebook":
			window.open(`https://www.facebook.com/sharer.php?u=${encodeURI(url)}`);
			break;
		case "mail":
			location.href = `mailto:?subject=&body=${encodeURI(url)}`;
			break;
	}
};

/**
 * @returns {string}
 */
photo.getDirectLink = function () {
	return $("#imageview img")
		.attr("src")
		.replace(/"/g, "")
		.replace(/url\(|\)$/gi, "");
};

/**
 * @returns {void}
 */
photo.show = function () {
	$("#imageview").removeClass("full");
	header.dom().removeClass("header--hidden");
};

/**
 * @returns {void}
 */
photo.hide = function () {
	if (visible.photo() && !visible.sidebar() && !visible.contextMenu()) {
		$("#imageview").addClass("full");
		header.dom().addClass("header--hidden");
	}
};

/**
 * @param {number} [animationDuration=300]
 * @param {number} [pauseBetweenUpdated=10]
 * @returns {void}
 */
photo.updateSizeLivePhotoDuringAnimation = function (animationDuration = 300, pauseBetweenUpdated = 10) {
	// For the LivePhotoKit, we need to call the updateSize manually
	// during CSS animations
	//
	const interval = setInterval(function () {
		if (photo.isLivePhotoInitialized()) {
			photo.livePhotosObject.updateSize();
		}
	}, pauseBetweenUpdated);

	setTimeout(function () {
		clearInterval(interval);
	}, animationDuration);
};

/**
 * @returns {boolean}
 */
photo.isLivePhotoInitialized = function () {
	return !!photo.livePhotosObject;
};

/**
 * @returns {void}
 */
photo.onresize = function () {
	// Copy of view.photo.onresize
	if (photo.json.size_variants.medium === null || photo.json.size_variants.medium2x === null) return;

	let imgWidth = photo.json.size_variants.medium.width;
	let imgHeight = photo.json.size_variants.medium.height;
	let containerWidth = parseFloat($("#imageview").width());
	let containerHeight = parseFloat($("#imageview").height());

	let width = imgWidth < containerWidth ? imgWidth : containerWidth;
	let height = (width * imgHeight) / imgWidth;
	if (height > containerHeight) {
		width = (containerHeight * imgWidth) / imgHeight;
	}

	$("img#image").attr("sizes", width + "px");
};

// Sub-implementation of contextMenu -------------------------------------------------------------- //

const contextMenu = {};

/**
 * @param {string} photoID
 * @param {jQuery.Event} e
 * @returns {void}
 */
contextMenu.sharePhoto = function (photoID, e) {
	const iconClass = "ionicons";

	const items = [
		{ title: build.iconic("twitter", iconClass) + "Twitter", fn: () => photo.share(photoID, "twitter") },
		{ title: build.iconic("facebook", iconClass) + "Facebook", fn: () => photo.share(photoID, "facebook") },
		{ title: build.iconic("envelope-closed") + "Mail", fn: () => photo.share(photoID, "mail") },
		{ title: build.iconic("link-intact") + "Direct Link", fn: () => window.open(photo.getDirectLink(), "_newtab") },
	];

	basicContext.show(items, e.originalEvent);
};

// Sub-implementation of photo -------------------------------------------------------------- //

const album = {
	json: null,
};

album.isUploadable = function () {
	return false;
};

// Main -------------------------------------------------------------- //

const loadingBar = {
	show() {},
	hide() {},
};

/**
 * @type {jQuery}
 */
const imageview = $("#imageview");

$(document).ready(function () {
	// Image View
	$(window).on("resize", photo.onresize);

	// Save ID of photo
	const queryParams = new URLSearchParams(document.location.search);
	const photoID = queryParams.get("p");

	// Set API error handler
	api.onError = handleAPIError;

	// Share
	header.dom("#button_share").on("click", function (e) {
		contextMenu.sharePhoto(photoID, e);
	});

	// Infobox
	header.dom("#button_info").on("click", function () {
		sidebar.toggle(true);
	});

	// Load photo
	loadPhotoInfo(photoID);
});

/**
 * TODO: This method is global for no particular reason. In case we ever clean up the view mode, this should be fixed, too.
 * @param {string} photoID
 */
const loadPhotoInfo = function (photoID) {
	const params = {
		photoID: photoID,
	};

	api.post(
		"Photo::get",
		params,
		/** @param {Photo} data */
		function (data) {
			photo.json = data;

			// Set title
			const _title = data.title ? data.title : lychee.locale["UNTITLED"];
			// TODO: Actually the prefix should not be a hard-coded, but the value of `lychee.title`. However, I am unsure whether we load the configuration options in view mode.
			document.title = "Lychee – " + _title;
			header.dom(".header__title").text(_title);

			if (!lychee.share_button_visible) {
				$("#button_share").hide();
			}

			// Render HTML
			imageview.html(build.imageview(data, true, false).html);
			imageview.find(".arrow_wrapper").remove();
			imageview.addClass("fadeIn").show();
			photo.onresize();

			// Render Sidebar
			const structure = sidebar.createStructure.photo(data);
			const html = sidebar.render(structure);

			// Fullscreen
			let timeout = null;

			$(document).bind("mousemove", function () {
				clearTimeout(timeout);
				photo.show();
				timeout = setTimeout(photo.hide, 2500);
			});
			timeout = setTimeout(photo.hide, 2500);

			sidebar.dom(".sidebar__wrapper").html(html);
			sidebar.bind();
		}
	);
};

/**
 * @param {XMLHttpRequest} jqXHR
 * @param {Object} params the original JSON parameters of the request
 * @param {?LycheeException} lycheeException the Lychee Exception
 * @returns {boolean}
 */
const handleAPIError = function (jqXHR, params, lycheeException) {
	const msg = jqXHR.statusText + (lycheeException ? " - " + lycheeException.message : "");
	loadingBar.show("error", msg);
	console.error("The server returned an error response", {
		description: msg,
		params: params,
		response: lycheeException,
	});
	return true;
};
