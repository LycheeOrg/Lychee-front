// Sub-implementation of lychee -------------------------------------------------------------- //

let lychee = {
	api_V2: true,
};

lychee.content = $(".content");

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

lychee.getEventName = function () {
	let touchendSupport =
		/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || window.opera) && "ontouchend" in document.documentElement;
	return touchendSupport === true ? "touchend" : "click";
};

// Sub-implementation of lychee -------------------------------------------------------------- //

let frame = {
	refresh: 30000,
};

frame.start_blur = function () {
	let img = document.getElementById("background");
	let canvas = document.getElementById("background_canvas");
	StackBlur.image(img, canvas, 20);
	canvas.style.width = "100%";
	canvas.style.height = "100%";
};

frame.next = function () {
	$("body").removeClass("loaded");
	setTimeout(function () {
		frame.refreshPicture();
	}, 1000);
};

frame.refreshPicture = function () {
	api.post("Photo::getRandom", {}, function (data) {
		if (data.size_variants === null || (data.size_variants.original === null && data.size_variants.medium === null)) {
			console.log("URL not found");
		}
		if (data.size_variants.thumb === null) console.log("Thumb not found");

		$("#background").attr("src", data.size_variants.thumb.url);

		let srcset = "";
		let src = "";
		this.frame.photo = null;
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
	});
};

frame.set = function (data) {
	//	console.log(data.refresh);
	frame.refresh = data.refresh ? parseInt(data.refresh, 10) + 1000 : 31000; // 30 sec + 1 sec of blackout
	//	console.log(frame.refresh);
	frame.refreshPicture();
};

frame.resize = function () {
	if (this.photo) {
		let ratio =
			this.photo.size_variants.original.height > 0 ? this.photo.size_variants.original.width / this.photo.size_variants.original.height : 1;
		let winWidth = $(window).width();
		let winHeight = $(window).height();

		// Our math assumes that the image occupies the whole frame.  That's
		// not quite the case (the default css sets it to 95%) but it's close
		// enough.
		let width = winWidth / ratio > winHeight ? winHeight * ratio : winWidth;

		$("#picture").attr("sizes", width + "px");
	}
};

/**
 *
 * @param {XMLHttpRequest} jqXHR
 * @param {Object} params the original JSON parameters of the request
 * @param {?LycheeException} lycheeException the Lychee Exception
 * @return {boolean}
 */
frame.error = function (jqXHR, params, lycheeException) {
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

let loadingBar = {
	/**
	 *
	 * @param {?string} status the status, either `null`, `"error"` or `"success"`
	 * @param {?string} errorText the error text to show
	 * @return {boolean}
	 */
	show(status, errorText) {
		return false;
	},

	/**
	 * @param {?boolean} force
	 */
	hide(force) {},
};

let imageview = $("#imageview");

$(function () {
	// set CSRF protection (Laravel)
	csrf.bind();

	// Set API error handler
	api.onError = frame.error;

	$(window).on("resize", function () {
		frame.resize();
	});

	$("#background").on("load", function () {
		frame.start_blur();
	});

	$("#picture").on("load", function () {
		$("body").addClass("loaded");
	});

	api.post("Frame::getSettings", {}, function (data) {
		frame.set(data);
	});
});
