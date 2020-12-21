/**
 * @description Swipes and moves an object.
 */

let swipe = {
	obj: null,
	offsetX: 0,
	offsetY: 0,
	preventNextHeaderToggle: false,
};

swipe.start = function (obj) {
	if (obj) swipe.obj = obj;
	return true;
};

swipe.move = function (e) {
	if (swipe.obj === null) {
		return false;
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
	return;
};

swipe.stop = function (e, left, right) {
	// Only execute once
	if (swipe.obj == null) {
		return false;
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

	return;
};
