/**
 * @description Takes care of every action an album can handle and execute.
 */

const album = {
	/** @type {(null|Album|TagAlbum)} */
	json: null,
};

/**
 * @param {?string} id
 * @returns {boolean}
 */
album.isSmartID = function (id) {
	return id === SmartAlbumID.UNSORTED || id === SmartAlbumID.STARRED || id === SmartAlbumID.PUBLIC || id === SmartAlbumID.RECENT;
};

/**
 * @param {?string} id
 * @returns {boolean}
 */
album.isModelID = function (id) {
	return typeof id === "string" && /^[-_0-9a-zA-Z]{24}$/.test(id);
};

/**
 * @returns {?string}
 */
album.getParentID = function () {
	if (album.json == null || album.isSmartID(album.json.id) === true || !album.json.parent_id) {
		return null;
	}
	return album.json.parent_id;
};

/**
 * @returns {?string} the album ID
 */
album.getID = function () {
	/** @type {?string} */
	let id = null;

	// this is a Lambda
	let isID = (_id) => {
		return album.isSmartID(_id) || album.isModelID(_id);
	};

	if (photo.json) id = photo.json.album_id;
	else if (album.json) id = album.json.id;
	else if (mapview.albumID) id = mapview.albumID;

	// Search
	if (isID(id) === false) id = $(".album:hover, .album.active").attr("data-id");
	if (isID(id) === false) id = $(".photo:hover, .photo.active").attr("data-album-id");

	if (isID(id) === true) return id;
	else return null;
};

/**
 * @returns {boolean}
 */
album.isTagAlbum = function () {
	return album.json && album.json.is_tag_album && album.json.is_tag_album === true;
};

/**
 * @param {?string} photoID
 * @returns {?Photo} the photo model
 */
album.getByID = function (photoID) {
	if (photoID == null || !album.json || !album.json.photos) {
		loadingBar.show("error", "Error: Album json not found !");
		return null;
	}

	let i = 0;
	while (i < album.json.photos.length) {
		if (album.json.photos[i].id === photoID) {
			return album.json.photos[i];
		}
		i++;
	}

	loadingBar.show("error", "Error: photo " + photoID + " not found !");
	return null;
};

/**
 * @param {?string} albumID
 * @returns {?Album} the album model
 */
album.getSubByID = function (albumID) {
	if (albumID == null || !album.json || !album.json.albums) {
		loadingBar.show("error", "Error: Album json not found!");
		return null;
	}

	let i = 0;
	while (i < album.json.albums.length) {
		if (album.json.albums[i].id === albumID) {
			return album.json.albums[i];
		}
		i++;
	}

	loadingBar.show("error", "Error: album " + albumID + " not found!");
	return null;
};

/**
 * @param {string} photoID
 * @returns {void}
 */
album.deleteByID = function (photoID) {
	if (photoID == null || !album.json || !album.json.photos) {
		loadingBar.show("error", "Error: Album json not found !");
		return;
	}

	$.each(album.json.photos, function (i) {
		if (album.json.photos[i].id === photoID) {
			album.json.photos.splice(i, 1);
			return false;
		}
	});
};

/**
 * @param {string} albumID
 * @returns {boolean}
 */
album.deleteSubByID = function (albumID) {
	if (albumID == null || !album.json || !album.json.albums) {
		loadingBar.show("error", "Error: Album json not found !");
		return false;
	}

	let deleted = false;

	$.each(album.json.albums, function (i) {
		if (album.json.albums[i].id === albumID) {
			album.json.albums.splice(i, 1);
			deleted = true;
			return false;
		}
	});

	return deleted;
};

/**
 * @callback AlbumLoadedCB
 * @param {boolean} accessible - `true`, if the album has successfully been
 *                                loaded and parsed; `false`, if the album is
 *                                private or public, but unlocked
 * @returns {void}
 */

/**
 * @param {string} albumID
 * @param {?AlbumLoadedCB} [albumLoadedCB=null]
 *
 * @returns {void}
 */
album.load = function (albumID, albumLoadedCB = null) {
	/**
	 * @param {Album} data
	 */
	const processAlbum = function (data) {
		album.json = data;

		if (albumLoadedCB === null) {
			lychee.animate($(".content"), "contentZoomOut");
		}
		let waitTime = 300;

		// Skip delay when we have a callback `albumLoadedCB`
		// Skip delay when opening a blank Lychee
		if (albumLoadedCB) waitTime = 0;
		if (!visible.albums() && !visible.photo() && !visible.album()) waitTime = 0;

		setTimeout(() => {
			view.album.init();

			if (albumLoadedCB === null) {
				lychee.animate(lychee.content, "contentZoomIn");
				header.setMode("album");
			}

			tabindex.makeFocusable(lychee.content);
			if (lychee.active_focus_on_page_load) {
				// Put focus on first element - either album or photo
				let first_album = $(".album:first");
				if (first_album.length !== 0) {
					first_album.focus();
				} else {
					const first_photo = $(".photo:first");
					if (first_photo.length !== 0) {
						first_photo.focus();
					}
				}
			}
		}, waitTime);
	};

	/**
	 * @param {Album} data
	 */
	const successHandler = function (data) {
		processAlbum(data);

		lychee.content.show();
		lychee.footer_show();
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

		if (albumLoadedCB) albumLoadedCB(true);
	};

	/**
	 * @param {XMLHttpRequest} jqXHR
	 * @param {Object} params the original JSON parameters of the request
	 * @param {?LycheeException} lycheeException the Lychee exception
	 * @returns {boolean}
	 */
	const errorHandler = function (jqXHR, params, lycheeException) {
		if (jqXHR.status !== 401 && jqXHR.status !== 403) {
			// Any other error then unauthenticated or unauthorized
			// shall be handled by the global error handler.
			return false;
		}

		if (lycheeException.message.includes("Password required")) {
			// If a password is required, then try to unlock the album
			// and in case of success, try again to load album with same
			// parameters
			password.getDialog(albumID, function () {
				album.load(albumID, albumLoadedCB);
			});
		} else {
			album.json = null;
			if (albumLoadedCB) {
				albumLoadedCB(false);
			} else {
				lychee.goto();
			}
		}

		return true;
	};

	api.post("Album::get", { albumID: albumID }, successHandler, null, errorHandler);
};

/**
 * @returns {void}
 */
album.parse = function () {
	if (!album.json.title) album.json.title = lychee.locale["UNTITLED"];
};

/**
 * Creates a new album.
 *
 * The method optionally calls the provided callback after the new albums
 * has been created and passes the ID of the newly created album plus the
 * provided `IDs`.
 *
 * Actually, the callback should enclose all additional parameter it needs.
 * The parameter `IDs` is not needed by this method itself.
 * TODO: Refactor callbacks.
 * Also see comments for {@link TargetAlbumSelectedCB} and
 * {@link contextMenu.move}.
 *
 * @param {string[]}              [IDs=null]      some IDs which are passed on to the callback
 * @param {TargetAlbumSelectedCB} [callback=null] called upon successful creation of the album
 *
 * @returns {void}
 */
album.add = function (IDs = null, callback = null) {
	/**
	 * @param {{title: string}} data
	 * @returns {void}
	 */
	const action = function (data) {
		// let title = data.title;

		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		const params = {
			title: data.title,
			parent_id: null,
		};

		if (visible.albums() || album.isSmartID(album.json.id)) {
			params.parent_id = null;
		} else if (visible.album()) {
			params.parent_id = album.json.id;
		} else if (visible.photo()) {
			params.parent_id = photo.json.album_id;
		}

		api.post(
			"Album::add",
			params,
			/** @param {Album} _data */
			function (_data) {
				if (IDs != null && callback != null) {
					callback(IDs, _data.id, false); // we do not confirm
				} else {
					albums.refresh();
					lychee.goto(_data.id);
				}
			}
		);
	};

	basicModal.show({
		body: lychee.html`<p>${lychee.locale["TITLE_NEW_ALBUM"]} <input class='text' name='title' type='text' maxlength='100' placeholder='Title' value='Untitled'></p>`,
		buttons: {
			action: {
				title: lychee.locale["CREATE_ALBUM"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @returns {void}
 */
album.addByTags = function () {
	/** @param {{title: string, tags: string}} data */
	const action = function (data) {
		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}
		if (!data.tags.trim()) {
			basicModal.error("tags");
			return;
		}

		basicModal.close();

		api.post(
			"Album::addByTags",
			{
				title: data.title,
				tags: data.tags.split(","),
			},
			/** @param {TagAlbum} _data */
			function (_data) {
				albums.refresh();
				lychee.goto(_data.id);
			}
		);
	};

	basicModal.show({
		body: lychee.html`<p>${lychee.locale["TITLE_NEW_ALBUM"]}
							<input class='text' name='title' type='text' maxlength='100' placeholder='Title' value='Untitled'>
							<input class='text' name='tags' type='text' minlength='1' placeholder='Tags' value=''>
						</p>`,
		buttons: {
			action: {
				title: lychee.locale["CREATE_TAG_ALBUM"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string} albumID
 * @returns {void}
 */
album.setShowTags = function (albumID) {
	/** @param {{show_tags: string}} data */
	const action = function (data) {
		if (!data.show_tags.trim()) {
			basicModal.error("show_tags");
			return;
		}
		const new_show_tags = data.show_tags
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag !== "" && tag.indexOf(",") === -1)
			.sort();

		basicModal.close();

		if (visible.album()) {
			album.json.show_tags = new_show_tags;
			view.album.show_tags();
		}

		api.post(
			"Album::setShowTags",
			{
				albumID: albumID,
				show_tags: new_show_tags,
			},
			() => album.reload()
		);
	};

	basicModal.show({
		body: lychee.html`
			<p>${lychee.locale["ALBUM_NEW_SHOWTAGS"]}
				<input
					class='text'
					name='show_tags'
					type='text'
					minlength='1'
					placeholder='Tags'
					value='$${album.json.show_tags.sort().join(", ")}'
				>
			</p>`,
		buttons: {
			action: {
				title: lychee.locale["ALBUM_SET_SHOWTAGS"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 *
 * @param {string[]} albumIDs
 * @returns {boolean}
 */
album.setTitle = function (albumIDs) {
	let oldTitle = "";

	if (albumIDs.length === 1) {
		// Get old title if only one album is selected
		if (album.json) {
			if (album.getID() === albumIDs[0]) {
				oldTitle = album.json.title;
			} else oldTitle = album.getSubByID(albumIDs[0]).title;
		}
		if (!oldTitle) {
			const a = albums.getByID(albumIDs[0]);
			if (a) oldTitle = a.title;
		}
	}

	/** @param {{title: string}} data */
	const action = function (data) {
		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		const newTitle = data.title;

		if (visible.album()) {
			if (albumIDs.length === 1 && album.getID() === albumIDs[0]) {
				// Rename only one album

				album.json.title = newTitle;
				view.album.title();

				const a = albums.getByID(albumIDs[0]);
				if (a) a.title = newTitle;
			} else {
				albumIDs.forEach(function (id) {
					album.getSubByID(id).title = newTitle;
					view.album.content.titleSub(id);

					let a = albums.getByID(id);
					if (a) a.title = newTitle;
				});
			}
		} else if (visible.albums()) {
			// Rename all albums

			albumIDs.forEach(function (id) {
				const a = albums.getByID(id);
				if (a) a.title = newTitle;
				view.albums.content.title(id);
			});
		}

		api.post("Album::setTitle", {
			albumIDs: albumIDs,
			title: newTitle,
		});
	};

	const inputHTML = lychee.html`<input class='text' name='title' type='text' maxlength='100' placeholder='$${lychee.locale["ALBUM_TITLE"]}' value='$${oldTitle}'>`;

	const dialogHTML =
		albumIDs.length === 1
			? lychee.html`<p>${lychee.locale["ALBUM_NEW_TITLE"]} ${inputHTML}</p>`
			: lychee.html`<p>${lychee.locale["ALBUMS_NEW_TITLE_1"]} $${albumIDs.length} ${lychee.locale["ALBUMS_NEW_TITLE_2"]} ${inputHTML}</p>`;

	basicModal.show({
		body: dialogHTML,
		buttons: {
			action: {
				title: lychee.locale["ALBUM_SET_TITLE"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string} albumID
 * @returns {void}
 */
album.setDescription = function (albumID) {
	const oldDescription = album.json.description ? album.json.description : "";

	/** @param {{description: string}} data */
	const action = function (data) {
		const description = data.description ? data.description : null;

		basicModal.close();

		if (visible.album()) {
			album.json.description = description;
			view.album.description();
		}

		api.post("Album::setDescription", {
			albumID: albumID,
			description: description,
		});
	};

	basicModal.show({
		body: lychee.html`<p>${lychee.locale["ALBUM_NEW_DESCRIPTION"]}<input class='text' name='description' type='text' maxlength='800' placeholder='$${lychee.locale["ALBUM_DESCRIPTION"]}' value='$${oldDescription}'></p>`,
		buttons: {
			action: {
				title: lychee.locale["ALBUM_SET_DESCRIPTION"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string} photoID
 * @returns {void}
 */
album.toggleCover = function (photoID) {
	album.json.cover_id = album.json.cover_id === photoID ? null : photoID;

	const params = {
		albumID: album.json.id,
		photoID: album.json.cover_id,
	};

	api.post("Album::setCover", params, function () {
		view.album.content.cover(photoID);
		if (!album.getParentID()) {
			albums.refresh();
		}
	});
};

/**
 * @param {string} albumID
 * @returns {void}
 */
album.setLicense = function (albumID) {
	const callback = function () {
		$("select#license").val(album.json.license === "" ? "none" : album.json.license);
	};

	/** @param {{license: string}} data */
	const action = function (data) {
		basicModal.close();

		api.post(
			"Album::setLicense",
			{
				albumID: albumID,
				license: data.license,
			},
			function () {
				if (visible.album()) {
					album.json.license = data.license;
					view.album.license();
				}
			}
		);
	};

	let msg = lychee.html`
	<div>
		<p>${lychee.locale["ALBUM_LICENSE"]}
		<span class="select" style="width:270px">
			<select name="license" id="license">
				<option value="none">${lychee.locale["ALBUM_LICENSE_NONE"]}</option>
				<option value="reserved">${lychee.locale["ALBUM_RESERVED"]}</option>
				<option value="CC0">CC0 - Public Domain</option>
				<option value="CC-BY-1.0">CC Attribution 1.0</option>
				<option value="CC-BY-2.0">CC Attribution 2.0</option>
				<option value="CC-BY-2.5">CC Attribution 2.5</option>
				<option value="CC-BY-3.0">CC Attribution 3.0</option>
				<option value="CC-BY-4.0">CC Attribution 4.0</option>
				<option value="CC-BY-ND-1.0">CC Attribution-NoDerivatives 1.0</option>
				<option value="CC-BY-ND-2.0">CC Attribution-NoDerivatives 2.0</option>
				<option value="CC-BY-ND-2.5">CC Attribution-NoDerivatives 2.5</option>
				<option value="CC-BY-ND-3.0">CC Attribution-NoDerivatives 3.0</option>
				<option value="CC-BY-ND-4.0">CC Attribution-NoDerivatives 4.0</option>
				<option value="CC-BY-SA-1.0">CC Attribution-ShareAlike 1.0</option>
				<option value="CC-BY-SA-2.0">CC Attribution-ShareAlike 2.0</option>
				<option value="CC-BY-SA-2.5">CC Attribution-ShareAlike 2.5</option>
				<option value="CC-BY-SA-3.0">CC Attribution-ShareAlike 3.0</option>
				<option value="CC-BY-SA-4.0">CC Attribution-ShareAlike 4.0</option>
				<option value="CC-BY-NC-1.0">CC Attribution-NonCommercial 1.0</option>
				<option value="CC-BY-NC-2.0">CC Attribution-NonCommercial 2.0</option>
				<option value="CC-BY-NC-2.5">CC Attribution-NonCommercial 2.5</option>
				<option value="CC-BY-NC-3.0">CC Attribution-NonCommercial 3.0</option>
				<option value="CC-BY-NC-4.0">CC Attribution-NonCommercial 4.0</option>
				<option value="CC-BY-NC-ND-1.0">CC Attribution-NonCommercial-NoDerivatives 1.0</option>
				<option value="CC-BY-NC-ND-2.0">CC Attribution-NonCommercial-NoDerivatives 2.0</option>
				<option value="CC-BY-NC-ND-2.5">CC Attribution-NonCommercial-NoDerivatives 2.5</option>
				<option value="CC-BY-NC-ND-3.0">CC Attribution-NonCommercial-NoDerivatives 3.0</option>
				<option value="CC-BY-NC-ND-4.0">CC Attribution-NonCommercial-NoDerivatives 4.0</option>
				<option value="CC-BY-NC-SA-1.0">CC Attribution-NonCommercial-ShareAlike 1.0</option>
				<option value="CC-BY-NC-SA-2.0">CC Attribution-NonCommercial-ShareAlike 2.0</option>
				<option value="CC-BY-NC-SA-2.5">CC Attribution-NonCommercial-ShareAlike 2.5</option>
				<option value="CC-BY-NC-SA-3.0">CC Attribution-NonCommercial-ShareAlike 3.0</option>
				<option value="CC-BY-NC-SA-4.0">CC Attribution-NonCommercial-ShareAlike 4.0</option>
			</select>
		</span>
		<br />
		<a href="https://creativecommons.org/choose/" target="_blank">${lychee.locale["ALBUM_LICENSE_HELP"]}</a>
		</p>
	</div>`;

	basicModal.show({
		body: msg,
		callback: callback,
		buttons: {
			action: {
				title: lychee.locale["ALBUM_SET_LICENSE"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string} albumID
 * @returns {void}
 */
album.setSorting = function (albumID) {
	const callback = function () {
		if (album.json.sorting) {
			$("select#sortingCol").val(album.json.sorting.column);
			$("select#sortingOrder").val(album.json.sorting.order);
		} else {
			$("select#sortingCol").val("");
			$("select#sortingOrder").val("");
		}
	};

	/** @param {{sortingCol: string, sortingOrder: string}} data */
	const action = function (data) {
		basicModal.close();

		api.post(
			"Album::setSorting",
			{
				albumID: albumID,
				sorting_column: data.sortingCol,
				sorting_order: data.sortingOrder,
			},
			function () {
				if (visible.album()) {
					album.reload();
				}
			}
		);
	};

	let msg = lychee.html`
		<div><p>
			${lychee.locale["SORT_PHOTO_BY_1"]}
			<span class="select">
				<select id="sortingCol" name="sortingCol">
					<option value=''>-</option>
					<option value='created_at'>${lychee.locale["SORT_PHOTO_SELECT_1"]}</option>
					<option value='taken_at'>${lychee.locale["SORT_PHOTO_SELECT_2"]}</option>
					<option value='title'>${lychee.locale["SORT_PHOTO_SELECT_3"]}</option>
					<option value='description'>${lychee.locale["SORT_PHOTO_SELECT_4"]}</option>
					<option value='is_public'>${lychee.locale["SORT_PHOTO_SELECT_5"]}</option>
					<option value='is_starred'>${lychee.locale["SORT_PHOTO_SELECT_6"]}</option>
					<option value='type'>${lychee.locale["SORT_PHOTO_SELECT_7"]}</option>
				</select>
			</span>
			${lychee.locale["SORT_PHOTO_BY_2"]}
			<span class="select">
				<select id="sortingOrder" name="sortingOrder">
					<option value=''>-</option>
					<option value='ASC'>${lychee.locale["SORT_ASCENDING"]}</option>
					<option value='DESC'>${lychee.locale["SORT_DESCENDING"]}</option>
				</select>
			</span>
			${lychee.locale["SORT_PHOTO_BY_3"]}
		</p></div>`;

	basicModal.show({
		body: msg,
		callback: callback,
		buttons: {
			action: {
				title: lychee.locale["ALBUM_SET_ORDER"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * Sets the accessibility attributes of an album.
 *
 * @param {string} albumID
 * @returns {void}
 */
album.setProtectionPolicy = function (albumID) {
	const action = function (data) {
		albums.refresh();

		// TODO: If the modal dialog would provide us with proper boolean values for the checkboxes as part of `data` the same way as it does for text inputs, then we would not need these slow and awkward jQeury selectors
		album.json.is_nsfw = $('.basicModal .switch input[name="is_nsfw"]:checked').length === 1;
		album.json.is_public = $('.basicModal .switch input[name="is_public"]:checked').length === 1;
		album.json.grants_full_photo = $('.basicModal .choice input[name="grants_full_photo"]:checked').length === 1;
		album.json.requires_link = $('.basicModal .choice input[name="requires_link"]:checked').length === 1;
		album.json.is_downloadable = $('.basicModal .choice input[name="is_downloadable"]:checked').length === 1;
		album.json.is_share_button_visible = $('.basicModal .choice input[name="is_share_button_visible"]:checked').length === 1;
		album.json.has_password = $('.basicModal .choice input[name="has_password"]:checked').length === 1;
		const newPassword = $('.basicModal .choice input[name="passwordtext"]').val() || null;

		// Modal input has been processed, now it can be closed
		basicModal.close();

		// Set data and refresh view
		if (visible.album()) {
			view.album.nsfw();
			view.album.public();
			view.album.requiresLink();
			view.album.downloadable();
			view.album.shareButtonVisible();
			view.album.password();
		}

		const params = {
			albumID: albumID,
			grants_full_photo: album.json.grants_full_photo,
			is_public: album.json.is_public,
			is_nsfw: album.json.is_nsfw,
			requires_link: album.json.requires_link,
			is_downloadable: album.json.is_downloadable,
			is_share_button_visible: album.json.is_share_button_visible,
		};
		if (album.json.has_password) {
			if (newPassword) {
				// We send the password only if there's been a change; that way the
				// server will keep the current password if it wasn't changed.
				params.password = newPassword;
			}
		} else {
			params.password = null;
		}

		api.post("Album::setProtectionPolicy", params);
	};

	const msg = lychee.html`
		<form>
			<div class='switch'>
				<label>
					${lychee.locale["ALBUM_PUBLIC"]}:&nbsp;
					<input type='checkbox' name='is_public'>
					<span class='slider round'></span>
				</label>
				<p>${lychee.locale["ALBUM_PUBLIC_EXPL"]}</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='grants_full_photo'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["ALBUM_FULL"]}</span>
				</label>
				<p>${lychee.locale["ALBUM_FULL_EXPL"]}</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='requires_link'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["ALBUM_HIDDEN"]}</span>
				</label>
				<p>${lychee.locale["ALBUM_HIDDEN_EXPL"]}</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='is_downloadable'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["ALBUM_DOWNLOADABLE"]}</span>
				</label>
				<p>${lychee.locale["ALBUM_DOWNLOADABLE_EXPL"]}</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='is_share_button_visible'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["ALBUM_SHARE_BUTTON_VISIBLE"]}</span>
				</label>
				<p>${lychee.locale["ALBUM_SHARE_BUTTON_VISIBLE_EXPL"]}</p>
			</div>
			<div class='choice'>
				<label>
					<input type='checkbox' name='has_password'>
					<span class='checkbox'>${build.iconic("check")}</span>
					<span class='label'>${lychee.locale["ALBUM_PASSWORD_PROT"]}</span>
				</label>
				<p>${lychee.locale["ALBUM_PASSWORD_PROT_EXPL"]}</p>
				<input class='text' name='passwordtext' type='text' placeholder='${lychee.locale["PASSWORD"]}' value=''>
			</div>
			<div class='hr'><hr></div>
			<div class='switch'>
				<label>
					${lychee.locale["ALBUM_NSFW"]}:&nbsp;
					<input type='checkbox' name='is_nsfw'>
					<span class='slider round'></span>
				</label>
				<p>${lychee.locale["ALBUM_NSFW_EXPL"]}</p>
			</div>
		</form>
	`;

	const dialogSetupCB = function () {
		// TODO: If the modal dialog would provide this callback with proper jQuery objects for all input/select/choice elements, then we would not need these jQuery selectors
		$('.basicModal .switch input[name="is_public"]').prop("checked", album.json.is_public);
		$('.basicModal .switch input[name="is_nsfw"]').prop("checked", album.json.is_nsfw);
		if (album.json.is_public) {
			$(".basicModal .choice input").attr("disabled", false);
			// Initialize options based on album settings.
			$('.basicModal .choice input[name="grants_full_photo"]').prop("checked", album.json.grants_full_photo);
			$('.basicModal .choice input[name="requires_link"]').prop("checked", album.json.requires_link);
			$('.basicModal .choice input[name="is_downloadable"]').prop("checked", album.json.is_downloadable);
			$('.basicModal .choice input[name="is_share_button_visible"]').prop("checked", album.json.is_share_button_visible);
			$('.basicModal .choice input[name="has_password"]').prop("checked", album.json.has_password);
			if (album.json.has_password) {
				$('.basicModal .choice input[name="passwordtext"]').show();
			}
		} else {
			$(".basicModal .choice input").attr("disabled", true);
			// Initialize options based on global settings.
			$('.basicModal .choice input[name="grants_full_photo"]').prop("checked", lychee.grants_full_photo);
			$('.basicModal .choice input[name="requires_link"]').prop("checked", false);
			$('.basicModal .choice input[name="is_downloadable"]').prop("checked", lychee.is_downloadable);
			$('.basicModal .choice input[name="is_share_button_visible"]').prop("checked", lychee.is_share_button_visible);
			$('.basicModal .choice input[name="has_password"]').prop("checked", false);
			$('.basicModal .choice input[name="passwordtext"]').hide();
		}

		$('.basicModal .switch input[name="is_public"]').on("change", function () {
			$(".basicModal .choice input").attr("disabled", $(this).prop("checked") !== true);
		});

		$('.basicModal .choice input[name="has_password"]').on("change", function () {
			if ($(this).prop("checked") === true) {
				$('.basicModal .choice input[name="passwordtext"]').show().focus();
			} else {
				$('.basicModal .choice input[name="passwordtext"]').hide();
			}
		});
	};

	basicModal.show({
		body: msg,
		callback: dialogSetupCB,
		buttons: {
			action: {
				title: lychee.locale["ALBUM_SHARING_CONFIRM"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * Lets a user update the sharing settings of an album.
 *
 * @param {string} albumID
 * @returns {void}
 */
album.shareUsers = function (albumID) {
	const action = function (data) {
		basicModal.close();

		/** @type {number[]} */
		const sharingToAdd = [];
		/** @type {number[]} */
		const sharingToDelete = [];
		$(".basicModal .choice input").each((_, input) => {
			const $input = $(input);
			if ($input.is(":checked")) {
				if ($input.data("sharingId") === undefined) {
					// Input is checked but has no sharing id => new share to create
					sharingToAdd.push(Number.parseInt(input.name));
				}
			} else {
				const sharingId = $input.data("sharingId");
				if (sharingId !== undefined) {
					// Input is not checked but has a sharing id => existing share to remove
					sharingToDelete.push(Number.parseInt(sharingId));
				}
			}
		});

		if (sharingToDelete.length > 0) {
			api.post("Sharing::delete", {
				shareIDs: sharingToDelete,
			});
		}
		if (sharingToAdd.length > 0) {
			api.post("Sharing::add", {
				albumIDs: [albumID],
				userIDs: sharingToAdd,
			});
		}
	};

	const msg = `<form id="sharing_people_form"><p>${lychee.locale["WAIT_FETCH_DATA"]}</p></form>`;

	const dialogSetupCB = function () {
		/** @param {SharingInfo} data */
		const successCallback = function (data) {
			const sharingForm = $("#sharing_people_form");
			sharingForm.empty();
			if (data.users.length !== 0) {
				sharingForm.append(`<p>${lychee.locale["SHARING_ALBUM_USERS_LONG_MESSAGE"]}</p>`);
				// Fill with the list of users
				data.users.forEach((user) => {
					sharingForm.append(lychee.html`<div class='choice'>
						<label>
							<input type='checkbox' name='${user.id}'>
							<span class='checkbox'>${build.iconic("check")}</span>
							<span class='label'>${user.username}</span>
						</label>
						<p></p>
					</div>`);
				});
				data.shared
					.filter((val) => val.album_id === albumID)
					.forEach((sharing) => {
						// Check all the shares who already exists, and store their sharing id on the element
						const elem = $(`.basicModal .choice input[name="${sharing.user_id}"]`);
						elem.prop("checked", true);
						elem.data("sharingId", sharing.id);
					});
			} else {
				sharingForm.append(`<p>${lychee.locale["SHARING_ALBUM_USERS_NO_USERS"]}</p>`);
			}
		};

		api.post("Sharing::list", {}, successCallback);
	};

	basicModal.show({
		body: msg,
		callback: dialogSetupCB,
		buttons: {
			action: {
				title: lychee.locale["ALBUM_SHARING_CONFIRM"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string} albumID
 * @returns {void}
 */
album.toggleNSFW = function (albumID) {
	album.json.is_nsfw = !album.json.is_nsfw;

	view.album.nsfw();

	api.post(
		"Album::setNSFW",
		{
			albumID: albumID,
			is_nsfw: album.json.is_nsfw,
		},
		() => albums.refresh()
	);
};

/**
 * @param {string} service - either `"twitter"`, `"facebook"` or `"mail"`
 * @returns {void}
 */
album.share = function (service) {
	if (album.json.hasOwnProperty("is_share_button_visible") && !album.json.is_share_button_visible) {
		return;
	}

	const url = location.href;

	switch (service) {
		case "twitter":
			window.open(`https://twitter.com/share?url=${encodeURI(url)}`);
			break;
		case "facebook":
			window.open(`https://www.facebook.com/sharer.php?u=${encodeURI(url)}&t=${encodeURI(album.json.title)}`);
			break;
		case "mail":
			location.href = `mailto:?subject=${encodeURI(album.json.title)}&body=${encodeURI(url)}`;
			break;
	}
};

/**
 * @param {string[]} albumIDs
 * @returns {void}
 */
album.getArchive = function (albumIDs) {
	location.href = "api/Album::getArchive?albumIDs=" + albumIDs.join();
};

/**
 * @param {string[]} albumIDs
 * @param {?string} albumID
 * @param {string} op1
 * @param {string} op2
 * @param {string} ops
 * @returns {string} the HTML content of the dialog
 */
album.buildMessage = function (albumIDs, albumID, op1, op2, ops) {
	let title = "";
	let sTitle = "";
	let msg = "";

	// Get title of first album
	if (albumID === null) {
		title = lychee.locale["ROOT"];
	} else {
		const album1 = albums.getByID(albumID);
		if (album1) {
			title = album1.title;
		}
	}

	// Fallback for first album without a title
	if (title === "") title = lychee.locale["UNTITLED"];

	if (albumIDs.length === 1) {
		// Get title of second album
		const album2 = albums.getByID(albumIDs[0]);
		if (album2) {
			sTitle = album2.title;
		}

		// Fallback for second album without a title
		if (sTitle === "") sTitle = lychee.locale["UNTITLED"];

		msg = lychee.html`<p>${lychee.locale[op1]} '$${sTitle}' ${lychee.locale[op2]} '$${title}'?</p>`;
	} else {
		msg = lychee.html`<p>${lychee.locale[ops]} '$${title}'?</p>`;
	}

	return msg;
};

/**
 * @param {string[]} albumIDs
 * @returns {void}
 */
album.delete = function (albumIDs) {
	let action = {};
	let cancel = {};
	let msg = "";

	action.fn = function () {
		basicModal.close();

		api.post(
			"Album::delete",
			{
				albumIDs: albumIDs,
			},
			function () {
				if (visible.albums()) {
					albumIDs.forEach(function (id) {
						view.albums.content.delete(id);
						albums.deleteByID(id);
					});
				} else if (visible.album()) {
					albums.refresh();
					if (albumIDs.length === 1 && album.getID() === albumIDs[0]) {
						lychee.goto(album.getParentID());
					} else {
						albumIDs.forEach(function (id) {
							album.deleteSubByID(id);
							view.album.content.deleteSub(id);
						});
					}
				}
			}
		);
	};

	if (albumIDs.length === 1 && albumIDs[0] === "unsorted") {
		action.title = lychee.locale["CLEAR_UNSORTED"];
		cancel.title = lychee.locale["KEEP_UNSORTED"];

		msg = `<p>` + lychee.locale["DELETE_UNSORTED_CONFIRM"] + `</p>`;
	} else if (albumIDs.length === 1) {
		let albumTitle = "";

		action.title = lychee.locale["DELETE_ALBUM_QUESTION"];
		cancel.title = lychee.locale["KEEP_ALBUM"];

		// Get title
		if (album.json) {
			if (album.getID() === albumIDs[0]) {
				albumTitle = album.json.title;
			} else albumTitle = album.getSubByID(albumIDs[0]).title;
		}
		if (!albumTitle) {
			let a = albums.getByID(albumIDs[0]);
			if (a) albumTitle = a.title;
		}

		// Fallback for album without a title
		if (albumTitle === "") albumTitle = lychee.locale["UNTITLED"];

		msg = lychee.html`<p>${lychee.locale["DELETE_ALBUM_CONFIRMATION_1"]} '$${albumTitle}' ${lychee.locale["DELETE_ALBUM_CONFIRMATION_2"]}</p>`;
	} else {
		action.title = lychee.locale["DELETE_ALBUMS_QUESTION"];
		cancel.title = lychee.locale["KEEP_ALBUMS"];

		msg = lychee.html`<p>${lychee.locale["DELETE_ALBUMS_CONFIRMATION_1"]} $${albumIDs.length} ${lychee.locale["DELETE_ALBUMS_CONFIRMATION_2"]}</p>`;
	}

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: action.title,
				fn: action.fn,
				class: "red",
			},
			cancel: {
				title: cancel.title,
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string[]} albumIDs
 * @param {string} albumID
 * @param {boolean} confirm
 */
album.merge = function (albumIDs, albumID, confirm = true) {
	const action = function () {
		basicModal.close();

		api.post(
			"Album::merge",
			{
				albumID: albumID,
				albumIDs: albumIDs,
			},
			() => album.reload()
		);
	};

	if (confirm) {
		basicModal.show({
			body: album.buildMessage(albumIDs, albumID, "ALBUM_MERGE_1", "ALBUM_MERGE_2", "ALBUMS_MERGE"),
			buttons: {
				action: {
					title: lychee.locale["MERGE_ALBUM"],
					fn: action,
					class: "red",
				},
				cancel: {
					title: lychee.locale["DONT_MERGE"],
					fn: basicModal.close,
				},
			},
		});
	} else {
		action();
	}
};

/**
 * @param {string[]} albumIDs source IDs
 * @param {string}   albumID  target ID
 * @param {boolean}  confirm  show confirmation dialog?
 */
album.setAlbum = function (albumIDs, albumID, confirm = true) {
	const action = function () {
		basicModal.close();

		api.post(
			"Album::move",
			{
				albumID: albumID,
				albumIDs: albumIDs,
			},
			() => album.reload()
		);
	};

	if (confirm) {
		basicModal.show({
			body: album.buildMessage(albumIDs, albumID, "ALBUM_MOVE_1", "ALBUM_MOVE_2", "ALBUMS_MOVE"),
			buttons: {
				action: {
					title: lychee.locale["MOVE_ALBUMS"],
					fn: action,
					class: "red",
				},
				cancel: {
					title: lychee.locale["NOT_MOVE_ALBUMS"],
					fn: basicModal.close,
				},
			},
		});
	} else {
		action();
	}
};

/**
 * @returns {void}
 */
album.apply_nsfw_filter = function () {
	if (lychee.nsfw_visible) {
		$('.album[data-nsfw="1"]').show();
	} else {
		$('.album[data-nsfw="1"]').hide();
	}
};

/**
 * Determines whether the user can upload to the currently active album.
 *
 * For special cases of no album / smart album / etc. we return true.
 * It's only for regular, non-matching albums that we return false.
 *
 * @returns {boolean}
 */
album.isUploadable = function () {
	if (lychee.admin) {
		return true;
	}
	if (lychee.publicMode || !lychee.may_upload) {
		return false;
	}

	// TODO: Comparison of numeric user IDs (instead of names) should be more robust
	return album.json !== null && album.json.owner_name === lychee.username;
};

/**
 * @param {Photo} data
 */
album.updatePhoto = function (data) {
	/**
	 * @param {?SizeVariant} src
	 * @returns {?SizeVariant}
	 */
	let deepCopySizeVariant = function (src) {
		if (src === undefined || src === null) return null;
		return {
			type: src.type,
			url: src.url,
			width: src.width,
			height: src.height,
		};
	};

	if (album.json && album.json.photos) {
		const photo = album.json.photos.find((p) => p.id === data.id);

		photo.filesize = data.filesize;
		// Deep copy size variants
		photo.size_variants = {
			thumb: deepCopySizeVariant(data.size_variants.thumb),
			thumb2x: deepCopySizeVariant(data.size_variants.thumb2x),
			small: deepCopySizeVariant(data.size_variants.small),
			small2x: deepCopySizeVariant(data.size_variants.small2x),
			medium: deepCopySizeVariant(data.size_variants.medium),
			medium2x: deepCopySizeVariant(data.size_variants.medium2x),
			original: deepCopySizeVariant(data.size_variants.original),
		};
		view.album.content.updatePhoto(photo);
		albums.refresh();
	}
};

/**
 * @returns {void}
 */
album.reload = function () {
	const albumID = album.getID();

	album.refresh();
	albums.refresh();

	if (visible.album()) lychee.goto(albumID);
	else lychee.goto();
};

/**
 * @returns {void}
 */
album.refresh = function () {
	album.json = null;
};
