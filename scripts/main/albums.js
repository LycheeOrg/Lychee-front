/**
 * @description Takes care of every action albums can handle and execute.
 */

let albums = {
	json: null,
};

albums.load = function () {
	let startTime = new Date().getTime();

	lychee.animate(".content", "contentZoomOut");

	if (albums.json === null) {
		api.post("Albums::get", {}, function (data) {
			let waitTime;

			// Smart Albums
			if (data.smart_albums != null) albums._createSmartAlbums(data.smart_albums);

			albums.json = data;

			// Calculate delay
			let durationTime = new Date().getTime() - startTime;
			if (durationTime > 300) waitTime = 0;
			else waitTime = 300 - durationTime;

			// Skip delay when opening a blank Lychee
			if (!visible.albums() && !visible.photo() && !visible.album()) waitTime = 0;
			if (visible.album() && lychee.content.html() === "") waitTime = 0;

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
		});
	} else {
		setTimeout(() => {
			header.setMode("albums");
			view.albums.init();
			lychee.animate(lychee.content, "contentZoomIn");

			tabindex.makeFocusable(lychee.content);

			if (lychee.active_focus_on_page_load) {
				// Put focus on first element - either album or photo
				first_album = $(".album:first");
				if (first_album.length !== 0) {
					first_album.focus();
				} else {
					first_photo = $(".photo:first");
					if (first_photo.length !== 0) {
						first_photo.focus();
					}
				}
			}
		}, 300);
	}
};

albums.parse = function (album) {
	if (!album.thumb) {
		album.thumb = {};
		album.thumb.id = "";
		album.thumb.thumb = album.has_password ? "img/password.svg" : "img/no_images.svg";
		album.thumb.type = "";
		album.thumb.thumb2x = "";
	}
};

// TODO: REFACTOR THIS
albums._createSmartAlbums = function (data) {
	if (data.unsorted) {
		data.unsorted = {
			id: "unsorted",
			title: lychee.locale["UNSORTED"],
			created_at: null,
			is_unsorted: true,
			thumb: data.unsorted.thumb,
		};
	}

	if (data.starred) {
		data.starred = {
			id: "starred",
			title: lychee.locale["STARRED"],
			created_at: null,
			is_starred: true,
			thumb: data.starred.thumb,
		};
	}

	if (data.public) {
		data.public = {
			id: "public",
			title: lychee.locale["PUBLIC"],
			created_at: null,
			is_public: true,
			requires_link: true,
			thumb: data.public.thumb,
		};
	}

	if (data.recent) {
		data.recent = {
			id: "recent",
			title: lychee.locale["RECENT"],
			created_at: null,
			is_recent: true,
			thumb: data.recent.thumb,
		};
	}
};

albums.isShared = function (albumID) {
	if (albumID == null) return false;
	if (!albums.json) return false;
	if (!albums.json.albums) return false;

	let found = false;

	let func = function () {
		if (parseInt(this.id, 10) === parseInt(albumID, 10)) {
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

albums.getByID = function (albumID) {
	// Function returns the JSON of an album

	if (albumID == null) return undefined;
	if (!albums.json) return undefined;
	if (!albums.json.albums) return undefined;

	let json = undefined;

	let func = function () {
		if (parseInt(this.id, 10) === parseInt(albumID, 10)) {
			json = this;
			return false; // stop the loop
		}
		if (this.albums) {
			$.each(this.albums, func);
		}
	};

	$.each(albums.json.albums, func);

	if (json === undefined && albums.json.shared_albums !== null) $.each(albums.json.shared_albums, func);

	if (json === undefined && albums.json.smart_albums !== null) $.each(albums.json.smart_albums, func);

	return json;
};

albums.deleteByID = function (albumID) {
	// Function returns the JSON of an album
	// This function is only ever invoked for top-level albums so it
	// doesn't need to descend down the albums tree.

	if (albumID == null) return false;
	if (!albums.json) return false;
	if (!albums.json.albums) return false;

	let deleted = false;

	$.each(albums.json.albums, function (i) {
		if (parseInt(albums.json.albums[i].id) === parseInt(albumID)) {
			albums.json.albums.splice(i, 1);
			deleted = true;
			return false; // stop the loop
		}
	});

	if (deleted === false) {
		if (!albums.json.shared_albums) return undefined;
		$.each(albums.json.shared_albums, function (i) {
			if (parseInt(albums.json.shared_albums[i].id) === parseInt(albumID)) {
				albums.json.shared_albums.splice(i, 1);
				deleted = true;
				return false; // stop the loop
			}
		});
	}

	if (deleted === false) {
		if (!albums.json.smart_albums) return undefined;
		$.each(albums.json.smart_albums, function (i) {
			if (parseInt(albums.json.smart_albums[i].id) === parseInt(albumID)) {
				delete albums.json.smart_albums[i];
				deleted = true;
				return false; // stop the loop
			}
		});
	}

	return deleted;
};

albums.refresh = function () {
	albums.json = null;
};
