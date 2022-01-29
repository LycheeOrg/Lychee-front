/**
 * @description Takes care of every action albums can handle and execute.
 */

const albums = {
	/** @type {?Albums} */
	json: null,
};

/**
 * @returns void
 */
albums.load = function () {
	let startTime = new Date().getTime();

	lychee.animate($(".content"), "contentZoomOut");

	/**
	 * @param {Albums} data
	 */
	const successCallback = function (data) {
		// Smart Albums
		if (data.smart_albums.length > 0) albums._createSmartAlbums(data.smart_albums);

		albums.json = data;

		// Skip delay when opening a blank Lychee
		const skipDelay = (!visible.albums() && !visible.photo() && !visible.album()) || (visible.album() && lychee.content.html() === "");
		// Calculate delay
		const durationTime = new Date().getTime() - startTime;
		const waitTime = durationTime > 300 || skipDelay ? 0 : 300 - durationTime;

		setTimeout(() => {
			header.setMode("albums");
			view.albums.init();
			lychee.animate(lychee.content, "contentZoomIn");

			tabindex.makeFocusable(lychee.content);

			if (lychee.active_focus_on_page_load) {
				// Put focus on first element - either album or photo
				let first_album = $(".album:first");
				if (first_album.length !== 0) {
					first_album.focus();
				} else {
					let first_photo = $(".photo:first");
					if (first_photo.length !== 0) {
						first_photo.focus();
					}
				}
			}

			setTimeout(() => {
				lychee.footer_show();
			}, 300);
		}, waitTime);
	};

	if (albums.json === null) {
		api.post("Albums::get", {}, successCallback);
	} else {
		setTimeout(() => {
			header.setMode("albums");
			view.albums.init();
			lychee.animate(lychee.content, "contentZoomIn");

			tabindex.makeFocusable(lychee.content);

			if (lychee.active_focus_on_page_load) {
				// Put focus on first element - either album or photo
				const first_album = $(".album:first");
				if (first_album.length !== 0) {
					first_album.focus();
				} else {
					const first_photo = $(".photo:first");
					if (first_photo.length !== 0) {
						first_photo.focus();
					}
				}
			}
		}, 300);
	}
};

/**
 * @param {(Album|TagAlbum|SmartAlbum)} album
 * @returns void
 */
albums.parse = function (album) {
	if (!album.thumb) {
		album.thumb = {
			id: "",
			thumb: album.has_password ? "img/password.svg" : "img/no_images.svg",
			type: "image/svg+xml",
			thumb2x: null,
		};
	}
};

/**
 * Normalizes the built-in smart albums.
 *
 * TODO: REFACTOR THIS
 *
 * @param {SmartAlbums} data
 * @returns void
 */
albums._createSmartAlbums = function (data) {
	if (data.unsorted) {
		data.unsorted.title = lychee.locale["UNSORTED"];
	}

	if (data.starred) {
		data.starred.title = lychee.locale["STARRED"];
	}

	if (data.public) {
		data.public.title = lychee.locale["PUBLIC"];
		data.public.is_public = true;
		data.public.requires_link = true;
	}

	if (data.recent) {
		data.recent.title = lychee.locale["RECENT"];
	}
};

/**
 * @param {?string} albumID
 * @returns {boolean}
 */
albums.isShared = function (albumID) {
	if (albumID == null) return false;
	if (!albums.json) return false;
	if (!albums.json.albums) return false;

	let found = false;

	/**
	 * @this {Album}
	 * @returns {boolean}
	 */
	const func = function () {
		if (this.id === albumID) {
			found = true;
			return false; // stop the loop
		}
		if (this.albums) {
			$.each(this.albums, func);
		}
	};

	if (albums.json.shared_albums !== null) $.each(albums.json.shared_albums, func);

	return found;
};

/**
 * @param {?string} albumID
 * @returns {(null|Album|TagAlbum|SmartAlbum)}
 */
albums.getByID = function (albumID) {
	if (albumID == null) return null;
	if (!albums.json) return null;
	if (!albums.json.albums) return null;

	let json = null;

	/**
	 * @this {(Album|TagAlbum|SmartAlbum)}
	 * @returns {boolean}
	 */
	const func = function () {
		if (this.id === albumID) {
			json = this;
			return false; // stop the loop
		}
		if (this.albums) {
			$.each(this.albums, func);
		}
	};

	$.each(albums.json.albums, func);

	if (json === null) $.each(albums.json.shared_albums, func);

	if (json === null) $.each(albums.json.smart_albums, func);

	return json;
};

/**
 * Deletes an album by ID.
 *
 * This function is only ever invoked for top-level albums, so it doesn't
 * need to walk the albums tree.
 *
 * TODO: Check above statement.
 *
 * The method is called by {@link album.delete} after the album has
 * successfully been deleted at the server-side.
 * How does this match the statement above?
 *
 * @param {?string} albumID
 * @returns {void}
 */
albums.deleteByID = function (albumID) {
	if (albumID == null) return;
	if (!albums.json) return;
	if (!albums.json.albums) return;

	let idx = albums.json.albums.findIndex((a) => a.id === albumID);
	albums.json.albums.splice(idx, 1);

	if (idx !== -1) return;

	idx = albums.json.shared_albums.findIndex((a) => a.id === albumID);
	albums.json.albums.splice(idx, 1);

	if (idx !== -1) return;

	delete albums.json.smart_albums[albumID];
};

/**
 * @returns void
 */
albums.refresh = function () {
	albums.json = null;
};
