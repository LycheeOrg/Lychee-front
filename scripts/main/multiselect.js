/**
 * @description Select multiple albums or photos.
 */

const isSelectKeyPressed = function (e) {
	return e.metaKey || e.ctrlKey;
};

let multiselect = {
	ids: [],
	albumsSelected: 0,
	photosSelected: 0,
	lastClicked: null,
};

multiselect.position = {
	top: null,
	right: null,
	bottom: null,
	left: null,
};

multiselect.bind = function () {
	$(".content").on("mousedown", (e) => {
		if (e.which === 1) multiselect.show(e);
	});

	return true;
};

multiselect.unbind = function () {
	$(".content").off("mousedown");
};

multiselect.isSelected = function (id) {
	let pos = $.inArray(id, multiselect.ids);

	return {
		selected: pos !== -1,
		position: pos,
	};
};

multiselect.toggleItem = function (object, id) {
	if (album.isSmartID(id)) return;

	let selected = multiselect.isSelected(id).selected;

	if (selected === false) multiselect.addItem(object, id);
	else multiselect.removeItem(object, id);
};

multiselect.addItem = function (object, id) {
	if (album.isSmartID(id)) return;
	if (!lychee.admin && albums.isShared(id)) return;
	if (multiselect.isSelected(id).selected === true) return;

	let isAlbum = object.hasClass("album");

	if ((isAlbum && multiselect.photosSelected > 0) || (!isAlbum && multiselect.albumsSelected > 0)) {
		lychee.error("Please select either albums or photos!");
		return;
	}

	multiselect.ids.push(id);
	multiselect.select(object);

	if (isAlbum) {
		multiselect.albumsSelected++;
	} else {
		multiselect.photosSelected++;
	}

	multiselect.lastClicked = object;
};

multiselect.removeItem = function (object, id) {
	let { selected, position } = multiselect.isSelected(id);

	if (selected === false) return;

	multiselect.ids.splice(position, 1);
	multiselect.deselect(object);

	let isAlbum = object.hasClass("album");

	if (isAlbum) {
		multiselect.albumsSelected--;
	} else {
		multiselect.photosSelected--;
	}

	multiselect.lastClicked = object;
};

multiselect.albumClick = function (e, albumObj) {
	let id = albumObj.attr("data-id");

	if ((isSelectKeyPressed(e) || e.shiftKey) && album.isUploadable()) {
		if (albumObj.hasClass("disabled")) return;

		if (isSelectKeyPressed(e)) {
			multiselect.toggleItem(albumObj, id);
		} else {
			if (multiselect.albumsSelected > 0) {
				// Click with Shift. Select all elements between the current
				// element and the last clicked-on one.

				if (albumObj.prevAll(".album").toArray().includes(multiselect.lastClicked[0])) {
					albumObj.prevUntil(multiselect.lastClicked, ".album").each(function () {
						multiselect.addItem($(this), $(this).attr("data-id"));
					});
				} else if (albumObj.nextAll(".album").toArray().includes(multiselect.lastClicked[0])) {
					albumObj.nextUntil(multiselect.lastClicked, ".album").each(function () {
						multiselect.addItem($(this), $(this).attr("data-id"));
					});
				}
			}

			multiselect.addItem(albumObj, id);
		}
	} else {
		lychee.goto(id);
	}
};

multiselect.photoClick = function (e, photoObj) {
	let id = photoObj.attr("data-id");

	if ((isSelectKeyPressed(e) || e.shiftKey) && album.isUploadable()) {
		if (photoObj.hasClass("disabled")) return;

		if (isSelectKeyPressed(e)) {
			multiselect.toggleItem(photoObj, id);
		} else {
			if (multiselect.photosSelected > 0) {
				// Click with Shift. Select all elements between the current
				// element and the last clicked-on one.

				if (photoObj.prevAll(".photo").toArray().includes(multiselect.lastClicked[0])) {
					photoObj.prevUntil(multiselect.lastClicked, ".photo").each(function () {
						multiselect.addItem($(this), $(this).attr("data-id"));
					});
				} else if (photoObj.nextAll(".photo").toArray().includes(multiselect.lastClicked[0])) {
					photoObj.nextUntil(multiselect.lastClicked, ".photo").each(function () {
						multiselect.addItem($(this), $(this).attr("data-id"));
					});
				}
			}

			multiselect.addItem(photoObj, id);
		}
	} else {
		lychee.goto(album.getID() + "/" + id);
	}
};

multiselect.albumContextMenu = function (e, albumObj) {
	let id = albumObj.attr("data-id");
	let selected = multiselect.isSelected(id).selected;

	if (albumObj.hasClass("disabled")) return;

	if (selected !== false && multiselect.ids.length > 1) {
		contextMenu.albumMulti(multiselect.ids, e);
	} else {
		contextMenu.album(id, e);
	}
};

multiselect.photoContextMenu = function (e, photoObj) {
	let id = photoObj.attr("data-id");
	let selected = multiselect.isSelected(id).selected;

	if (photoObj.hasClass("disabled")) return;

	if (selected !== false && multiselect.ids.length > 1) {
		contextMenu.photoMulti(multiselect.ids, e);
	} else if (visible.album() || visible.search()) {
		contextMenu.photo(id, e);
	} else if (visible.photo()) {
		// should not happen... but you never know...
		contextMenu.photo(photo.getID(), e);
	} else {
		lychee.error("Could not find what you want.");
	}
};

multiselect.clearSelection = function () {
	multiselect.deselect(".photo.active, .album.active");
	multiselect.ids = [];
	multiselect.albumsSelected = 0;
	multiselect.photosSelected = 0;
	multiselect.lastClicked = null;
};

multiselect.show = function (e) {
	if (!album.isUploadable()) return false;
	if (!visible.albums() && !visible.album()) return false;
	if ($(".album:hover, .photo:hover").length !== 0) return false;
	if (visible.search()) return false;
	if (visible.multiselect()) $("#multiselect").remove();

	sidebar.setSelectable(false);

	if (!isSelectKeyPressed(e) && !e.shiftKey) {
		multiselect.clearSelection();
	}

	multiselect.position.top = e.pageY;
	multiselect.position.right = $(document).width() - e.pageX;
	multiselect.position.bottom = $(document).height() - e.pageY;
	multiselect.position.left = e.pageX;

	$("body").append(build.multiselect(multiselect.position.top, multiselect.position.left));

	$(document)
		.on("mousemove", multiselect.resize)
		.on("mouseup", (_e) => {
			if (_e.which === 1) {
				multiselect.getSelection(_e);
			}
		});
};

multiselect.resize = function (e) {
	if (
		multiselect.position.top === null ||
		multiselect.position.right === null ||
		multiselect.position.bottom === null ||
		multiselect.position.left === null
	)
		return false;

	// Default CSS
	let newCSS = {
		top: null,
		bottom: null,
		height: null,
		left: null,
		right: null,
		width: null,
	};

	if (e.pageY >= multiselect.position.top) {
		newCSS.top = multiselect.position.top;
		newCSS.bottom = "inherit";
		newCSS.height = Math.min(e.pageY, $(document).height() - 3) - multiselect.position.top;
	} else {
		newCSS.top = "inherit";
		newCSS.bottom = multiselect.position.bottom;
		newCSS.height = multiselect.position.top - Math.max(e.pageY, 2);
	}

	if (e.pageX >= multiselect.position.left) {
		newCSS.right = "inherit";
		newCSS.left = multiselect.position.left;
		newCSS.width = Math.min(e.pageX, $(document).width() - 3) - multiselect.position.left;
	} else {
		newCSS.right = multiselect.position.right;
		newCSS.left = "inherit";
		newCSS.width = multiselect.position.left - Math.max(e.pageX, 2);
	}

	// Updated all CSS properties at once
	$("#multiselect").css(newCSS);
};

multiselect.stopResize = function () {
	if (multiselect.position.top !== null) $(document).off("mousemove mouseup");
};

multiselect.getSize = function () {
	if (!visible.multiselect()) return false;

	let $elem = $("#multiselect");
	let offset = $elem.offset();

	return {
		top: offset.top,
		left: offset.left,
		width: parseFloat($elem.css("width"), 10),
		height: parseFloat($elem.css("height"), 10),
	};
};

multiselect.getSelection = function (e) {
	let size = multiselect.getSize();

	if (visible.contextMenu()) return false;
	if (!visible.multiselect()) return false;

	$(".photo, .album").each(function () {
		// We select if there's even a slightest overlap.  Overlap between
		// an object and the selection occurs if the left edge of the
		// object is to the left of the right edge of the selection *and*
		// the right edge of the object is to the right of the left edge of
		// the selection; analogous for top/bottom.
		if (
			$(this).offset().left < size.left + size.width &&
			$(this).offset().left + $(this).width() > size.left &&
			$(this).offset().top < size.top + size.height &&
			$(this).offset().top + $(this).height() > size.top
		) {
			let id = $(this).attr("data-id");

			if (isSelectKeyPressed(e)) {
				multiselect.toggleItem($(this), id);
			} else {
				multiselect.addItem($(this), id);
			}
		}
	});

	multiselect.hide();
};

multiselect.select = function (id) {
	let el = $(id);

	el.addClass("selected");
	el.addClass("active");
};

multiselect.deselect = function (id) {
	let el = $(id);

	el.removeClass("selected");
	el.removeClass("active");
};

multiselect.hide = function () {
	sidebar.setSelectable(true);

	multiselect.stopResize();

	multiselect.position.top = null;
	multiselect.position.right = null;
	multiselect.position.bottom = null;
	multiselect.position.left = null;

	lychee.animate("#multiselect", "fadeOut");
	setTimeout(() => $("#multiselect").remove(), 300);
};

multiselect.close = function () {
	sidebar.setSelectable(true);

	multiselect.stopResize();

	multiselect.position.top = null;
	multiselect.position.right = null;
	multiselect.position.bottom = null;
	multiselect.position.left = null;

	lychee.animate("#multiselect", "fadeOut");
	setTimeout(() => $("#multiselect").remove(), 300);
};

multiselect.selectAll = function () {
	if (!album.isUploadable()) return false;
	if (visible.search()) return false;
	if (!visible.albums() && !visible.album) return false;
	if (visible.multiselect()) $("#multiselect").remove();

	sidebar.setSelectable(false);

	multiselect.clearSelection();

	$(".photo").each(function () {
		multiselect.addItem($(this), $(this).attr("data-id"));
	});

	if (multiselect.photosSelected === 0) {
		// There are no pictures.  Try albums then.
		$(".album").each(function () {
			multiselect.addItem($(this), $(this).attr("data-id"));
		});
	}
};
