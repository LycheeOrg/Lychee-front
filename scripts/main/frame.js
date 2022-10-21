const frame = {
	/** @type {?Photo} */
	photo: null,
	/** @type {Number} */
	nextTimeOutId: 0,

	_dom: {
		/**
		 * Hidden image element with thumb variant of current picture used
		 * as a source for blurring.
		 * @type {?HTMLImageElement}
		 */
		bgImage: null,
		/**
		 * Canvas element which shows the blurry variant of `bgImage`.
		 * @type {?HTMLCanvasElement}
		 */
		canvas: null,
		/**
		 * Image element which displays the full-size image
		 * @type {?HTMLImageElement}
		 */
		image: null,
		/**
		 * Div element which works as a shutter to blend over between
		 * subsequent photos
		 * @type {?HTMLDivElement}
		 */
		shutter: null,
	},
};

/**
 * Determines whether the photo loading loop of the frame mode is currently
 * running.
 * @returns {boolean}
 */
frame.isRunning = function () {
	return frame.nextTimeOutId !== 0;
};

/**
 * Stops loading images for frame mode.
 * @returns {void}
 */
frame.stop = function () {
	if (frame.nextTimeOutId !== 0) {
		clearTimeout(frame.nextTimeOutId);
	}
	frame.photo = null;
	frame.nextTimeOutId = 0;
};

/**
 * Initializes the DOM (if called for the very first time), sets the frontend
 * into "frame mode" and enters the photo loading loop.
 *
 * @returns {void}
 */
frame.initAndStart = function () {
	lychee.setMode("frame");
	if (frame._dom.bgImage === null) {
		frame._dom.bgImage = document.getElementById("background");
		frame._dom.bgImage.addEventListener("load", function () {
			// After a new background image has been loaded, draw a blurry
			// version on the canvas.
			StackBlur.image(frame._dom.bgImage, frame._dom.canvas, 20);
			// We must reset the canvas to its originally defined dimensions
			// as StackBlur resets it.
			frame._dom.canvas.style.width = null;
			frame._dom.canvas.style.height = null;
		});
	}
	if (frame._dom.canvas === null) {
		frame._dom.canvas = document.getElementById("background_canvas");
	}
	if (frame._dom.image === null) {
		frame._dom.image = document.getElementById("picture");
		frame._dom.image.addEventListener("load", function () {
			// After a new image has been loaded, open the shutter
			frame._dom.shutter.classList.add("opened");
		});
	}
	if (frame._dom.shutter === null) {
		frame._dom.shutter = document.getElementById("frame-shutter");
	}

	// We also must call the very first invocation of `runPhotoLoop`
	// asynchronously to ensure that `nextTimeOutId` is also set for the first
	// call, otherwise `frame.isRunning` and `frame.stop` will report false
	// results and not work during the first invocation.
	frame.nextTimeOutId = setTimeout(() => frame.runPhotoLoop(), 0);
};

/**
 * Repeatedly loads random photos by calling {@link frame.loadRandomPhoto}
 * every {@link lychee.mod_frame_refresh} interval forever unless an error
 * occurs.
 *
 * The method stops loading photos upon an error or when {@link frame.stop}
 * is called.
 *
 * @returns {void}
 */
frame.runPhotoLoop = function () {
	/**
	 * Recalls this method after the refresh timeout unless the loop
	 * hasn't been stopped in the meantime.
	 *
	 * @returns {void}
	 */
	const onSuccess = function () {
		if (frame.nextTimeOutId !== 0) {
			frame.nextTimeOutId = setTimeout(() => frame.runPhotoLoop(), 1000 * lychee.mod_frame_refresh);
		}
	};

	/**
	 * Shows the error prominently and stops the loop.
	 *
	 * This is the old error handler when the frame mode was independently
	 * implemented of the remaining frontend.
	 * Historically, any error was shown in a browser-provided alert box,
	 * because the native Lychee error was not available in frame mode.
	 * Currently, no error is shown at all as it was decided that an
	 * alert box which needs to be clicked away manually is not a good
	 * solution for the frame mode.
	 * When the box model will have been revamped, i.e. after
	 * https://github.com/LycheeOrg/Lychee-front/pull/335
	 * will have been merged, then this error handler will become irrelevant
	 * as we can then use the normal Lychee error handler and error bar.
	 * In other words, this whole method will become obsolete.
	 * TODO: Remove this method after https://github.com/LycheeOrg/Lychee-front/pull/335
	 *
	 * @param {XMLHttpRequest} jqXHR
	 * @param {Object} params
	 * @param {?LycheeException} lycheeException
	 *
	 * @returns {boolean}
	 */
	const onError = function (jqXHR, params, lycheeException) {
		const msg = jqXHR.statusText + (lycheeException ? " - " + lycheeException.message : "");
		console.error("The server returned an error response", {
			description: msg,
			params: params,
			response: lycheeException,
		});
		return true;
	};

	// Closes the shutter and loads a new, random photo after that.
	// The CSS defines that the shutter takes 1s to close; hence the
	// 1s of timeout here and the duration of the animation as defined in the
	// CSS must be aligned to for a pleasant visual experience.
	frame._dom.shutter.classList.remove("opened");
	// Only set the timeout, if the loop hasn't been stopped in the
	// meantime
	if (frame.nextTimeOutId !== 0) {
		frame.nextTimeOutId = setTimeout(() => frame.loadRandomPhoto(onSuccess, onError), 1000);
	}
};

/**
 * Attempts to load a random photo from the backend.
 *
 * Upon success, the method calls {@link frame.onRandomPhotoLoaded} followed
 * by `successCallback` in that order.
 * Upon error, the method calls `errorCallback`.
 *
 * @param {APISuccessCB} successCallback
 * @param {APIErrorCB} errorCallback
 * @returns {void}
 */
frame.loadRandomPhoto = function (successCallback, errorCallback) {
	api.post(
		"Photo::getRandom",
		{},
		/** @param {Photo} data */
		function (data) {
			frame.onRandomPhotoLoaded(data);
			successCallback(data);
		},
		null,
		errorCallback
	);
};

/**
 * Displays the given photo in the central image area of the frame mode.
 *
 * This method is called by {@link frame.loadRandomPhoto} on success.
 *
 * @param {Photo} photo
 *
 * @returns {void}
 */
frame.onRandomPhotoLoaded = function (photo) {
	if (photo.size_variants.thumb) {
		frame._dom.bgImage.src = photo.size_variants.thumb.url;
	} else {
		frame._dom.bgImage.src = "";
		console.log("Thumb not found");
	}

	frame.photo = photo;
	frame._dom.image.src = photo.size_variants.medium !== null ? photo.size_variants.medium.url : photo.size_variants.original.url;
	frame._dom.image.srcset =
		photo.size_variants.medium !== null && photo.size_variants.medium2x !== null
			? `${photo.size_variants.medium.url} ${photo.size_variants.medium.width}w, ${photo.size_variants.medium2x.url} ${photo.size_variants.medium2x.width}w`
			: "";
	frame.resize();
};

/**
 * @returns {void}
 */
frame.resize = function () {
	if (frame.photo && frame._dom.image) {
		const ratio =
			this.photo.size_variants.original.height > 0 ? this.photo.size_variants.original.width / this.photo.size_variants.original.height : 1;
		// Our math assumes that the image occupies the whole frame.  That's
		// not quite the case (the default css sets it to 95%) but it's close
		// enough.
		const width = window.innerWidth / ratio > window.innerHeight ? window.innerHeight * ratio : window.innerWidth;

		frame._dom.image.sizes = "" + width + "px";
	}
};
