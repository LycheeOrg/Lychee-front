/**
 * @description Swipes and moves an object.
 */

let swipe = {

	obj            : null,
	tolerance_X    : 150,
	tolerance_Y    : 250,
	offsetX        : 0,
	offsetY        : 0,
	preventNextHeaderToggle : false

};

swipe.start = function(obj, tolerance_X, tolerance_Y) {

	if (obj) {
		swipe.obj         = obj;
	}
	if (tolerance_X) {
		swipe.tolerance_X = tolerance_X;
	}
	if (tolerance_Y) {
		swipe.tolerance_Y = tolerance_Y;
	}

	return true

};

swipe.move = function(e) {

	if (swipe.obj===null)
	{
		return false;
	}

	if (Math.abs(e.x) > Math.abs(e.y)) {
		swipe.offsetX = -1 * e.x;
		swipe.offsetY = 0.0;
	} else {
	  swipe.offsetX = 0.0;
	  swipe.offsetY = +1 * e.y;
	}

	translate_string = 'translate(' + swipe.offsetX + 'px, ' +  swipe.offsetY + 'px)';
	swipe.obj.css({
		'WebkitTransform' : translate_string,
		'MozTransform'    : translate_string,
		'transform'       : translate_string
	})

	return true;

};

swipe.stop = function(e, left, right) {

	// Only execute once
	if (swipe.obj==null)
	{
		return false;
	}

	if (e.y<=-swipe.tolerance_Y) {

      lychee.goto(album.getID());

	} else if (e.y>=swipe.tolerance_Y) {

     lychee.goto(album.getID());

	} else if (e.x<=-swipe.tolerance_X) {

		left(true);

		// 'touchend' will be called after 'swipeEnd'
		// in case of moving to next image, we want to skip
		// the toggling of the header
		swipe.preventNextHeaderToggle = true;

	} else if (e.x>=swipe.tolerance_X) {

		right(true);

		// 'touchend' will be called after 'swipeEnd'
		// in case of moving to next image, we want to skip
		// the toggling of the header
		swipe.preventNextHeaderToggle = true;

	} else {

		translate_string = 'translate(0px, 0px)';
		swipe.obj.css({
			WebkitTransform : translate_string,
			MozTransform    : translate_string,
			transform       : translate_string
		})

	}

	swipe.obj            = null;
	swipe.offsetX        = 0;
	swipe.offsetY        = 0

	return true;
};
