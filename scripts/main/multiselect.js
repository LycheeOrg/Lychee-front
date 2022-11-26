/**
 * @description Select multiple albums or photos.
 */

/**
 * @param {jQuery.Event} e
 * @returns {boolean}
 */
const isSelectKeyPressed = function (e) {
	return e.metaKey || e.ctrlKey;
};

const multiselect = {
	/** @type {string[]} */
	ids: [],
	albumsSelected: 0,
	photosSelected: 0,
	/** @type {?jQuery} */
	lastClicked: null,
};

/**
 * @typedef SelectionPosition
 *
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 * @property {number} left
 */

/**
 * @type {?SelectionPosition}
 */
multiselect.position = null;

multiselect.bind = function () {
	$("#lychee_view_content").on("mousedown", (e) => {
		if (e.which === 1) multiselect.show(e);
	});

	return true;
};

/**
 * @returns {void}
 */
multiselect.unbind = function () {
	$("#lychee_view_content").off("mousedown");
};

/**
 * @param {string} id
 * @returns {{position: number, selected: boolean}}
 */
multiselect.isSelected = function (id) {
	const pos = multiselect.ids.indexOf(id);

	return {
		selected: pos !== -1,
		position: pos,
	};
};

/**
 * @param {jQuery} object
 * @param {string} id
 */
multiselect.toggleItem = function (object, id) {
	if (album.isSmartID(id) || album.isSearchID(id)) return;

	let selected = multiselect.isSelected(id).selected;

	if (selected === false) multiselect.addItem(object, id);
	else multiselect.removeItem(object, id);
};

/**
 * @param {jQuery} object
 * @param {string} id
 */
multiselect.addItem = function (object, id) {
	if (album.isSmartID(id) || album.isSearchID(id)) return;
	if (!lychee.rights.is_admin && albums.isShared(id)) return;
	if (multiselect.isSelected(id).selected === true) return;

	let isAlbum = object.hasClass("album");

	if ((isAlbum && multiselect.photosSelected > 0) || (!isAlbum && multiselect.albumsSelected > 0)) {
		loadingBar.show("error", lychee.locale["ERROR_EITHER_ALBUMS_OR_PHOTOS"]);
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

/**
 * @param {jQuery} object
 * @param {string} id
 */
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

/**
 * @param {jQuery.Event} e
 * @param {jQuery} albumObj
 *
 * @returns {void}
 */
multiselect.albumClick = function (e, albumObj) {
	const id = albumObj.attr("data-id");

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

/**
 * @param {jQuery.Event} e
 * @param {jQuery} photoObj
 *
 * @returns {void}
 */
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

/**
 * @param {jQuery.Event} e
 * @param {jQuery} albumObj
 *
 * @returns {void}
 */
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

/**
 * @param {jQuery.Event} e
 * @param {jQuery} photoObj
 *
 * @returns {void}
 */
multiselect.photoContextMenu = function (e, photoObj) {
	const id = photoObj.attr("data-id");
	const selected = multiselect.isSelected(id).selected;

	if (photoObj.hasClass("disabled")) return;

	if (selected !== false && multiselect.ids.length > 1) {
		contextMenu.photoMulti(multiselect.ids, e);
	} else if (visible.album() || visible.search()) {
		contextMenu.photo(id, e);
	} else if (visible.photo()) {
		// should not happen... but you never know...
		contextMenu.photo(photo.getID(), e);
	} else {
		loadingBar.show("error", lychee.locale["ERROR_COULD_NOT_FIND"]);
	}
};

/**
 * @returns {void}
 */
multiselect.clearSelection = function () {
	multiselect.deselect($(".photo.active, .album.active"));
	multiselect.ids = [];
	multiselect.albumsSelected = 0;
	multiselect.photosSelected = 0;
	multiselect.lastClicked = null;
};

/**
 * @param {jQuery.Event} e
 * @returns {boolean}
 */
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

	multiselect.position = {
		top: e.pageY,
		right: $(document).width() - e.pageX,
		bottom: $(document).height() - e.pageY,
		left: e.pageX,
	};

	$("body").append(build.multiselect(multiselect.position.top, multiselect.position.left));

	$(document)
		.on("mousemove", multiselect.resize)
		.on("mouseup", (_e) => {
			if (_e.which === 1) {
				multiselect.getSelection(_e);
			}
		});
};

/**
 * @param {jQuery.Event} e
 * @returns {boolean}
 */
multiselect.resize = function (e) {
	if (multiselect.position === null) return false;

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

/**
 * @returns {void}
 */
multiselect.stopResize = function () {
	if (multiselect.position !== null) $(document).off("mousemove mouseup");
};

/**
 * @returns {null|{top: number, left: number, width: number, height: number}}
 */
multiselect.getSize = function () {
	if (!visible.multiselect()) return null;

	let $elem = $("#multiselect");
	let offset = $elem.offset();

	return {
		top: offset.top,
		left: offset.left,
		width: parseFloat($elem.css("width")),
		height: parseFloat($elem.css("height")),
	};
};

/**
 * TODO: This method is called **`get...`** but it doesn't get anything.
 *
 * @param {jQuery.Event} e
 * @returns {void}
 */
multiselect.getSelection = function (e) {
	const size = multiselect.getSize();

	if (visible.contextMenu()) return;
	if (!visible.multiselect()) return;

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

/**
 * @param {jQuery} elem
 * @returns {void}
 */
multiselect.select = function (elem) {
	elem.addClass("selected");
	elem.addClass("active");
};

/**
 * @param {jQuery} elem
 * @returns {void}
 */
multiselect.deselect = function (elem) {
	elem.removeClass("selected");
	elem.removeClass("active");
};

/**
 * Note, identical to {@link multiselect.close}
 * @returns {void}
 */
multiselect.hide = function () {
	sidebar.setSelectable(true);
	multiselect.stopResize();
	multiselect.position = null;
	lychee.animate($("#multiselect"), "fadeOut");
	setTimeout(() => $("#multiselect").remove(), 300);
};

/**
 * Note, identical to {@link multiselect.hide}
 * @returns {void}
 */
multiselect.close = function () {
	sidebar.setSelectable(true);
	multiselect.stopResize();
	multiselect.position = null;
	lychee.animate($("#multiselect"), "fadeOut");
	setTimeout(() => $("#multiselect").remove(), 300);
};

/**
 * @returns {void}
 */
multiselect.selectAll = function () {
	if (!album.isUploadable()) return;
	if (visible.search()) return;
	if (!visible.albums() && !visible.album) return;
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
