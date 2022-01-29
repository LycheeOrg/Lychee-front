/**
 * @description Swipes and moves an object.
 */

const swipe = {
	/** @type {?jQuery} */
	obj: null,
	/** @type {number} */
	offsetX: 0,
	/** @type {number} */
	offsetY: 0,
	/** @type {boolean} */
	preventNextHeaderToggle: false,
};

/**
 * @param {jQuery} obj
 * @returns {void}
 */
swipe.start = function (obj) {
	// TODO: The condition is always true and the method is only called in one place
	if (obj) swipe.obj = obj;
};

/**
 * @param {jQuery.Event} e
 * @returns {void}
 */
swipe.move = function (e) {
	if (swipe.obj === null) {
		return;
	}

	if (Math.abs(e.x) > Math.abs(e.y)) {
		swipe.offsetX = -1 * e.x;
		swipe.offsetY = 0.0;
	} else {
		swipe.offsetX = 0.0;
		swipe.offsetY = +1 * e.y;
	}

	const value = "translate(" + swipe.offsetX + "px, " + swipe.offsetY + "px)";
	swipe.obj.css({
		WebkitTransform: value,
		MozTransform: value,
		transform: value,
	});
};

/**
 * @callback SwipeStoppedCB
 *
 * Find a better name for that, but I have no idea what this callback is
 * supposed to do.
 *
 * @param {boolean} animate
 * @returns {void}
 */

/**
 * @param {{x: number, y: number, direction: number, distance: number, angle: number, speed: number, }} e
 * @param {SwipeStoppedCB} left
 * @param {SwipeStoppedCB} right
 * @returns {void}
 */
swipe.stop = function (e, left, right) {
	// Only execute once
	if (swipe.obj === null) {
		return;
	}

	if (e.y <= -lychee.swipe_tolerance_y) {
		lychee.goto(album.getID());
	} else if (e.y >= lychee.swipe_tolerance_y) {
		lychee.goto(album.getID());
	} else if (e.x <= -lychee.swipe_tolerance_x) {
		left(true);

		// 'touchend' will be called after 'swipeEnd'
		// in case of moving to next image, we want to skip
		// the toggling of the header
		swipe.preventNextHeaderToggle = true;
	} else if (e.x >= lychee.swipe_tolerance_x) {
		right(true);

		// 'touchend' will be called after 'swipeEnd'
		// in case of moving to next image, we want to skip
		// the toggling of the header
		swipe.preventNextHeaderToggle = true;
	} else {
		const value = "translate(0px, 0px)";
		swipe.obj.css({
			WebkitTransform: value,
			MozTransform: value,
			transform: value,
		});
	}

	swipe.obj = null;
	swipe.offsetX = 0;
	swipe.offsetY = 0;
};
