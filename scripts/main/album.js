/**
 * @description Takes care of every action an album can handle and execute.
 */

const album = {
	/** @type {(?Album|?TagAlbum|?SearchAlbum)} */
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
album.isSearchID = function (id) {
	return id !== null && (id === SearchAlbumIDPrefix || id.startsWith(SearchAlbumIDPrefix + "/"));
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
	if (album.json === null || album.isSmartID(album.json.id) || album.isSearchID(album.json.id) || !album.json.parent_id) {
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

	/** @param {?string} _id */
	const isID = (_id) => {
		return album.isSmartID(_id) || album.isSearchID(_id) || album.isModelID(_id);
	};

	if (photo.json) id = photo.json.album_id;
	else if (album.json) id = album.json.id;
	else if (mapview.albumID) id = mapview.albumID;

	if (isID(id) === false) {
		const active = $(".album:hover, .album.active");
		if (active.length === 1) {
			id = active.attr("data-id") || null;
		}
	}
	if (isID(id) === false) {
		const active = $(".photo:hover, .photo.active");
		if (active.length === 1) {
			id = active.attr("data-album-id") || null;
		}
	}

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
 * Returns the sub-album of the current album by ID, if found.
 *
 * Note: If the current album is the special {@link SearchAlbum}, then
 * also {@link TagAlbum} may be returned as a "sub album".
 *
 * @param {?string} albumID
 * @returns {(?Album|?TagAlbum)} the sub-album model
 */
album.getSubByID = function (albumID) {
	// The special `SearchAlbum`  may also contain `TagAlbum` as sub-albums
	if (albumID == null || !album.json || (!album.json.albums && !album.json.tag_albums)) {
		loadingBar.show("error", lychee.locale["ERROR_ALBUM_JSON_NOT_FOUND"]);
		return null;
	}

	const subAlbum = album.json.albums ? album.json.albums.find((a) => a.id === albumID) : null;
	if (subAlbum) {
		return subAlbum;
	}

	const subTagAlbum = album.json.tag_albums ? album.json.tag_albums.find((a) => a.id === albumID) : null;
	if (subTagAlbum) {
		return subTagAlbum;
	}

	loadingBar.show("error", sprintf(lychee.locale["ERROR_ALBUM_NOT_FOUND"], albumID));
	return null;
};

/**
 * @param {string} photoID
 * @returns {void}
 */
album.deleteByID = function (photoID) {
	if (photoID == null || !album.json || !album.json.photos) {
		loadingBar.show("error", lychee.locale["ERROR_ALBUM_JSON_NOT_FOUND"]);
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
		loadingBar.show("error", lychee.locale["ERROR_ALBUM_JSON_NOT_FOUND"]);
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
 * @param {?string} parentID
 *
 * @returns {void}
 */
album.load = function (albumID, albumLoadedCB = null, parentID = null) {
	/**
	 * @param {Album} data
	 */
	const processAlbum = function (data) {
		album.json = data;

		if (parentID !== null) {
			// Used with search so that the back button sends back to the
			// search results.
			album.json.original_parent_id = album.json.parent_id;
			album.json.parent_id = parentID;
		}

		if (albumLoadedCB === null) {
			lychee.animate(lychee.content, "contentZoomOut");
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

		if (lycheeException.exception.endsWith("PasswordRequiredException")) {
			// If a password is required, then try to unlock the album
			// and in case of success, try again to load album with same
			// parameters
			password.getDialog(albumID, function () {
				albums.refresh();
				album.load(albumID, albumLoadedCB);
			});
			return true;
		} else if (lycheeException.exception.endsWith("UnauthenticatedException") && !albumLoadedCB) {
			// If no password is required, but we still get a 401 error
			// try to properly log in as a user
			// We only try this, if `albumLoadedCB` is not set.
			// This is not optimal, but the best we can do without too much
			// refactoring for now.
			// `albumLoadedCB` is set, if the user directly jumps to a photo
			// in an album via a direct link.
			// Even though the album might be private, the photo could still
			// be visible.
			// If we caught users for a direct link to a public photo
			// within a private album, we would "trap" the users in a login
			// dialog which they cannot pass by.
			lychee.loginDialog();
			return true;
		} else if (albumLoadedCB) {
			// In case we could not successfully load and unlock the album,
			// but we have a callback, we call that and consider the error
			// handled.
			// Note: This case occurs for a single public photo on an
			// otherwise non-public album.
			album.json = null;
			albumLoadedCB(false);
			return true;
		} else {
			// In any other case, let the global error handler deal with the
			// problem.
			return false;
		}
	};

	api.post("Album::get", { albumID: albumID }, successHandler, null, errorHandler);
};

/**
 * Creates a new album.
 *
 * The method optionally calls the provided callback after the new album
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
		if (!data.title.trim()) {
			basicModal.focusError("title");
			return;
		}

		basicModal.close();

		const params = {
			title: data.title,
			parent_id: null,
		};

		if (visible.albums() || album.isSmartID(album.json.id) || album.isSearchID(album.json.id)) {
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

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initAddAlbumDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent = lychee.locale["TITLE_NEW_ALBUM"];
		formElements.title.placeholder = "Title";
		formElements.title.value = lychee.locale["UNTITLED"];
	};

	const addAlbumDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='title' type='text' maxlength='100'/></div>
		</form>
	`;

	basicModal.show({
		body: addAlbumDialogBody,
		readyCB: initAddAlbumDialog,
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
			basicModal.focusError("title");
			return;
		}
		if (!data.tags.trim()) {
			basicModal.focusError("tags");
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

	const addTagAlbumDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='title' type='text' maxlength='100'></div>
			<div class="input-group stacked"><input class='text' name='tags' type='text' minlength='1'></div>
		</form>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initAddTagAlbumDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent = lychee.locale["TITLE_NEW_ALBUM"];
		formElements.title.placeholder = "Title";
		formElements.title.value = lychee.locale["UNTITLED"];
		formElements.tags.placeholder = "Tags";
	};

	basicModal.show({
		body: addTagAlbumDialogBody,
		readyCB: initAddTagAlbumDialog,
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
			basicModal.focusError("show_tags");
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

	const setShowTagDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='show_tags' type='text' minlength='1'></div>
		</form>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initShowTagAlbumDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent = lychee.locale["ALBUM_NEW_SHOWTAGS"];
		formElements.show_tags.placeholder = "Tags";
		formElements.show_tags.value = album.json.show_tags.sort().join(", ");
	};

	basicModal.show({
		body: setShowTagDialogBody,
		readyCB: initShowTagAlbumDialog,
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
			basicModal.focusError("title");
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

	const setAlbumTitleDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='title' type='text' maxlength='100'></div>
		</form>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSetAlbumTitleDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent =
			albumIDs.length === 1 ? lychee.locale["ALBUM_NEW_TITLE"] : sprintf(lychee.locale["ALBUMS_NEW_TITLE"], albumIDs.length);
		formElements.title.placeholder = lychee.locale["ALBUM_TITLE"];
		formElements.title.value = oldTitle;
	};

	basicModal.show({
		body: setAlbumTitleDialogBody,
		readyCB: initSetAlbumTitleDialog,
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

	const setAlbumDescriptionDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='description' type='text' maxlength='800'></div>
		</form>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSetAlbumDescriptionDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent = lychee.locale["ALBUM_NEW_DESCRIPTION"];
		formElements.description.placeholder = lychee.locale["ALBUM_DESCRIPTION"];
		formElements.description.value = album.json.description ? album.json.description : "";
	};

	basicModal.show({
		body: setAlbumDescriptionDialogBody,
		readyCB: initSetAlbumDescriptionDialog,
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

	const setAlbumLicenseDialogBody = `
		<form>
			<div class="input-group compact">
				<label for="license_dialog_license_select"></label>
				<div class="select"><select name="license" id="license_dialog_license_select">
					<option value="none"></option>
					<option value="reserved"></option>
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
				</select></div>
				<p><a href="https://creativecommons.org/choose/" target="_blank"></a></p>
			</div>
		</form>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSetAlbumLicenseDialog = function (formElements, dialog) {
		formElements.license.labels[0].textContent = lychee.locale["ALBUM_LICENSE"];
		formElements.license.item(0).textContent = lychee.locale["ALBUM_LICENSE_NONE"];
		formElements.license.item(1).textContent = lychee.locale["ALBUM_RESERVED"];
		formElements.license.value = album.json.license === "" ? "none" : album.json.license;
		dialog.querySelector("p a").textContent = lychee.locale["ALBUM_LICENSE_HELP"];
	};

	basicModal.show({
		body: setAlbumLicenseDialogBody,
		readyCB: initSetAlbumLicenseDialog,
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
	/** @param {{sorting_col: string, sorting_order: string}} data */
	const action = function (data) {
		basicModal.close();

		api.post(
			"Album::setSorting",
			{
				albumID: albumID,
				sorting_column: data.sorting_col,
				sorting_order: data.sorting_order,
			},
			function () {
				if (visible.album()) {
					album.reload();
				}
			}
		);
	};

	const setAlbumSortingDialogBody = `
		<form>
			<div class="input-group compact">
				<label for="sorting_dialog_column_select"></label>
				<div class="select"><select name="sorting_col" id="sorting_dialog_column_select">
					<option value=''>&mdash;</option>
					<option value='created_at'/>
					<option value='taken_at'/>
					<option value='title'/>
					<option value='description'/>
					<option value='is_public'/>
					<option value='is_starred'/>
					<option value='type'/>
				</select></div>
			</div>
			<div class="input-group compact">
				<label for="sorting_dialog_order_select"></label>
				<div class="select"><select name="sorting_order" id="sorting_dialog_order_select">
					<option value=''>&mdash;</option>
					<option value='ASC'/>
					<option value='DESC'/>
				</select></div>
			</div>
		</form>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSetAlbumSortingDialog = function (formElements, dialog) {
		formElements.sorting_col.labels[0].textContent = lychee.locale["SORT_DIALOG_ATTRIBUTE_LABEL"];
		formElements.sorting_col.item(1).textContent = lychee.locale["SORT_PHOTO_SELECT_1"];
		formElements.sorting_col.item(2).textContent = lychee.locale["SORT_PHOTO_SELECT_2"];
		formElements.sorting_col.item(3).textContent = lychee.locale["SORT_PHOTO_SELECT_3"];
		formElements.sorting_col.item(4).textContent = lychee.locale["SORT_PHOTO_SELECT_4"];
		formElements.sorting_col.item(5).textContent = lychee.locale["SORT_PHOTO_SELECT_5"];
		formElements.sorting_col.item(6).textContent = lychee.locale["SORT_PHOTO_SELECT_6"];
		formElements.sorting_col.item(7).textContent = lychee.locale["SORT_PHOTO_SELECT_7"];

		formElements.sorting_order.labels[0].textContent = lychee.locale["SORT_DIALOG_ORDER_LABEL"];
		formElements.sorting_order.item(1).textContent = lychee.locale["SORT_ASCENDING"];
		formElements.sorting_order.item(2).textContent = lychee.locale["SORT_DESCENDING"];

		if (album.json.sorting) {
			formElements.sorting_col.value = album.json.sorting.column;
			formElements.sorting_order.value = album.json.sorting.order;
		} else {
			formElements.sorting_col.value = "";
			formElements.sorting_order.value = "";
		}
	};

	basicModal.show({
		body: setAlbumSortingDialogBody,
		readyCB: initSetAlbumSortingDialog,
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
	/**
	 * @param {ModalDialogResult} data
	 */
	const action = function (data) {
		basicModal.close();
		albums.refresh();

		album.json.is_nsfw = data.is_nsfw;
		album.json.is_public = data.is_public;
		album.json.grants_full_photo = data.grants_full_photo;
		album.json.requires_link = data.requires_link;
		album.json.is_downloadable = data.is_downloadable;
		album.json.is_share_button_visible = data.is_share_button_visible;
		album.json.has_password = data.has_password;

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
			if (data.password) {
				// We send the password only if there's been a change; that way the
				// server will keep the current password if it wasn't changed.
				params.password = data.password;
			}
		} else {
			params.password = null;
		}

		api.post("Album::setProtectionPolicy", params);
	};

	const setAlbumProtectionPolicyBody = `
		<form>
			<div class='input-group compact-no-indent'>
				<label for="pp_dialog_public_check"></label>
				<input type='checkbox' class="slider" id='pp_dialog_public_check' name='is_public' />
				<p></p>
			</div>
			<div class='input-group compact-inverse'>
				<label for="pp_dialog_full_photo_check"></label>
				<input type='checkbox' id='pp_dialog_full_photo_check' name='grants_full_photo' />
				<p></p>
			</div>
			<div class='input-group compact-inverse'>
				<label for="pp_dialog_link_check"></label>
				<input type='checkbox' id='pp_dialog_link_check' name='requires_link' />
				<p></p>
			</div>
			<div class='input-group compact-inverse'>
				<label for="pp_dialog_downloadable_check"></label>
				<input type='checkbox' id='pp_dialog_downloadable_check' name='is_downloadable' />
				<p></p>
			</div>
			<div class='input-group compact-inverse'>
				<label for="pp_dialog_share_check"></label>
				<input type='checkbox' id='pp_dialog_share_check' name='is_share_button_visible' />
				<p></p>
			</div>
			<div class='input-group compact-inverse'>
				<label for="pp_dialog_password_check"></label>
				<input type='checkbox' id='pp_dialog_password_check' name='has_password'>
				<p></p>
				<div class="input-group stacked">
					<input class='text' id='pp_dialog_password_input' name='password' type='text'>
				</div>
			</div>
		</form>
		<hr/>
		<form>
			<div class='input-group compact-no-indent'>
				<label for='pp_dialog_nsfw_check'></label>
				<input type='checkbox' class="slider" id='pp_dialog_nsfw_check' name='is_nsfw'>
				<p></p>
			</div>
		</form>`;

	/**
	 * @typedef ProtectionPolicyDialogFormElements
	 * @property {HTMLInputElement} is_public
	 * @property {HTMLInputElement} grants_full_photo
	 * @property {HTMLInputElement} requires_link
	 * @property {HTMLInputElement} is_downloadable
	 * @property {HTMLInputElement} is_share_button_visible
	 * @property {HTMLInputElement} has_password
	 * @property {HTMLInputElement} password
	 * @property {HTMLInputElement} is_nsfw
	 */

	/**
	 * @param {ProtectionPolicyDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initAlbumProtectionPolicyDialog = function (formElements, dialog) {
		formElements.is_public.previousElementSibling.textContent = lychee.locale["ALBUM_PUBLIC"];
		formElements.is_public.nextElementSibling.textContent = lychee.locale["ALBUM_PUBLIC_EXPL"];
		formElements.grants_full_photo.previousElementSibling.textContent = lychee.locale["ALBUM_FULL"];
		formElements.grants_full_photo.nextElementSibling.textContent = lychee.locale["ALBUM_FULL_EXPL"];
		formElements.requires_link.previousElementSibling.textContent = lychee.locale["ALBUM_HIDDEN"];
		formElements.requires_link.nextElementSibling.textContent = lychee.locale["ALBUM_HIDDEN_EXPL"];
		formElements.is_downloadable.previousElementSibling.textContent = lychee.locale["ALBUM_DOWNLOADABLE"];
		formElements.is_downloadable.nextElementSibling.textContent = lychee.locale["ALBUM_DOWNLOADABLE_EXPL"];
		formElements.is_share_button_visible.previousElementSibling.textContent = lychee.locale["ALBUM_SHARE_BUTTON_VISIBLE"];
		formElements.is_share_button_visible.nextElementSibling.textContent = lychee.locale["ALBUM_SHARE_BUTTON_VISIBLE_EXPL"];
		formElements.has_password.previousElementSibling.textContent = lychee.locale["ALBUM_PASSWORD_PROT"];
		formElements.has_password.nextElementSibling.textContent = lychee.locale["ALBUM_PASSWORD_PROT_EXPL"];
		formElements.password.placeholder = lychee.locale["PASSWORD"];
		formElements.is_nsfw.previousElementSibling.textContent = lychee.locale["ALBUM_NSFW"];
		formElements.is_nsfw.nextElementSibling.textContent = lychee.locale["ALBUM_NSFW_EXPL"];

		formElements.is_public.checked = album.json.is_public;
		formElements.is_nsfw.checked = album.json.is_nsfw;

		/**
		 * Array of checkboxes which are enable/disabled wrt. the state of `is_public`
		 * @type {HTMLInputElement[]}
		 */
		const tristateCheckboxes = [
			formElements.grants_full_photo,
			formElements.requires_link,
			formElements.is_downloadable,
			formElements.is_share_button_visible,
			formElements.has_password,
		];

		if (album.json.is_public) {
			tristateCheckboxes.forEach(function (checkbox) {
				checkbox.parentElement.classList.remove("disabled");
				checkbox.disabled = false;
			});
			// Initialize options based on album settings.
			formElements.grants_full_photo.checked = album.json.grants_full_photo;
			formElements.requires_link.checked = album.json.requires_link;
			formElements.is_downloadable.checked = album.json.is_downloadable;
			formElements.is_share_button_visible.checked = album.json.is_share_button_visible;
			formElements.has_password.checked = album.json.has_password;
			if (album.json.has_password) {
				formElements.password.parentElement.classList.remove("hidden");
			} else {
				formElements.password.parentElement.classList.add("hidden");
			}
		} else {
			tristateCheckboxes.forEach(function (checkbox) {
				checkbox.parentElement.classList.add("disabled");
				checkbox.disabled = true;
			});
			// Initialize options based on global settings.
			formElements.grants_full_photo.checked = lychee.full_photo;
			formElements.requires_link.checked = false;
			formElements.is_downloadable.checked = lychee.downloadable;
			formElements.is_share_button_visible.checked = lychee.share_button_visible;
			formElements.has_password.checked = false;
			formElements.password.parentElement.classList.add("hidden");
		}

		formElements.is_public.addEventListener("change", function () {
			tristateCheckboxes.forEach(function (checkbox) {
				checkbox.parentElement.classList.toggle("disabled");
				checkbox.disabled = !formElements.is_public.checked;
			});
		});

		formElements.has_password.addEventListener("change", function () {
			if (formElements.has_password.checked) {
				formElements.password.parentElement.classList.remove("hidden");
				formElements.password.focus();
			} else {
				formElements.password.parentElement.classList.add("hidden");
			}
		});
	};

	basicModal.show({
		body: setAlbumProtectionPolicyBody,
		readyCB: initAlbumProtectionPolicyDialog,
		buttons: {
			action: {
				title: lychee.locale["SAVE"],
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
	/**
	 * @param {ModalDialogResult} data
	 */
	const action = function (data) {
		basicModal.close();

		/** @type {number[]} */
		const selectedUserIds = Object.entries(data)
			.filter(([userId, isChecked]) => isChecked)
			.map(([userId, isChecked]) => parseInt(userId, 10));

		api.post("Sharing::setByAlbum", {
			albumID: albumID,
			userIDs: selectedUserIds,
		});
	};

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSharingDialog = function (formElements, dialog) {
		/** @type {HTMLParagraphElement} */
		const p = dialog.querySelector("p");
		p.textContent = lychee.locale["WAIT_FETCH_DATA"];

		/** @param {SharingInfo} data */
		const successCallback = function (data) {
			if (data.users.length === 0) {
				p.textContent = lychee.locale["SHARING_ALBUM_USERS_NO_USERS"];
				return;
			}

			p.textContent = lychee.locale["SHARING_ALBUM_USERS_LONG_MESSAGE"];

			/** @type {HTMLFormElement} */
			const form = document.createElement("form");

			const existingShares = new Set(data.shared.map((value) => value.user_id));

			// Create a list with one checkbox per user
			data.users.forEach((user) => {
				const div = form.appendChild(document.createElement("div"));
				div.classList.add("input-group", "compact-inverse");
				const label = div.appendChild(document.createElement("label"));
				label.htmlFor = "share_dialog_user_" + user.id;
				label.textContent = user.username;
				const input = div.appendChild(document.createElement("input"));
				input.type = "checkbox";
				input.id = label.htmlFor;
				input.name = user.id.toString();
				input.checked = existingShares.has(user.id);
			});

			// Append the pre-constructed form to the dialog after the paragraph
			dialog.appendChild(form);
			basicModal.cacheFormElements();
		};

		api.post("Sharing::list", { albumID: albumID }, successCallback);
	};

	basicModal.show({
		body: `<p></p>`,
		readyCB: initSharingDialog,
		buttons: {
			action: {
				title: lychee.locale["SAVE"],
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
 * Toggles the NSFW attribute of the currently loaded album.
 *
 * @returns {void}
 */
album.toggleNSFW = function () {
	album.json.is_nsfw = !album.json.is_nsfw;

	view.album.nsfw();

	api.post(
		"Album::setNSFW",
		{
			albumID: album.json.id,
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
 * @returns {void}
 */
album.qrCode = function () {
	basicModal.show({
		body: "<div class='qr-code-canvas'></div>",
		classList: ["qr-code"],
		readyCB: function (formElements, dialog) {
			const qrcode = dialog.querySelector("div.qr-code-canvas");
			QrCreator.render(
				{
					text: location.href,
					radius: 0.0,
					ecLevel: "H",
					fill: "#000000",
					background: "#FFFFFF",
					size: qrcode.clientWidth,
				},
				qrcode
			);
		},
		buttons: {
			cancel: {
				title: lychee.locale["CLOSE"],
				fn: basicModal.close,
			},
		},
	});
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
 * @param {string} ops
 * @returns {string} the message
 */
album.buildMessage = function (albumIDs, albumID, op1, ops) {
	let targetTitle = lychee.locale["UNTITLED"];
	let sourceTitle = lychee.locale["UNTITLED"];
	let msg = "";

	// Get title of target album
	if (albumID === null) {
		targetTitle = lychee.locale["ROOT"];
	} else {
		const targetAlbum = albums.getByID(albumID) || album.getSubByID(albumID);
		if (targetAlbum) {
			targetTitle = targetAlbum.title;
		}
	}

	if (albumIDs.length === 1) {
		// Get title of the unique source album
		const sourceAlbum = albums.getByID(albumIDs[0]) || album.getSubByID(albumIDs[0]);
		if (sourceAlbum) {
			sourceTitle = sourceAlbum.title;
		}

		msg = sprintf(lychee.locale[op1], sourceTitle, targetTitle);
	} else {
		msg = sprintf(lychee.locale[ops], targetTitle);
	}

	return msg;
};

/**
 * @param {string[]} albumIDs
 * @returns {void}
 */
album.delete = function (albumIDs) {
	const isTagAlbum = albumIDs.length === 1 && albums.isTagAlbum(albumIDs[0]);

	const handleSuccessfulDeletion = function () {
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
	};

	const action = function () {
		basicModal.close();
		api.post("Album::delete", { albumIDs: albumIDs }, handleSuccessfulDeletion);
	};

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 */
	const initConfirmDeletionDialog = function (formElements, dialog) {
		/** @type {HTMLParagraphElement} */
		const p = dialog.querySelector("p");
		if (albumIDs.length === 1 && albumIDs[0] === SmartAlbumID.UNSORTED) {
			p.textContent = lychee.locale["DELETE_UNSORTED_CONFIRM"];
		} else if (albumIDs.length === 1) {
			let albumTitle = "";

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
			if (!albumTitle) albumTitle = lychee.locale["UNTITLED"];

			p.textContent = isTagAlbum
				? sprintf(lychee.locale["DELETE_TAG_ALBUM_CONFIRMATION"], albumTitle)
				: sprintf(lychee.locale["DELETE_ALBUM_CONFIRMATION"], albumTitle);
		} else {
			p.textContent = sprintf(lychee.locale["DELETE_ALBUMS_CONFIRMATION"], albumIDs.length);
		}
	};

	const actionButtonLabel =
		albumIDs.length === 1
			? albumIDs[0] === SmartAlbumID.UNSORTED
				? lychee.locale["CLEAR_UNSORTED"]
				: isTagAlbum
				? lychee.locale["DELETE_TAG_ALBUM_QUESTION"]
				: lychee.locale["DELETE_ALBUM_QUESTION"]
			: lychee.locale["DELETE_ALBUMS_QUESTION"];

	const cancelButtonLabel =
		albumIDs.length === 1
			? albumIDs[0] === SmartAlbumID.UNSORTED
				? lychee.locale["KEEP_UNSORTED"]
				: lychee.locale["KEEP_ALBUM"]
			: lychee.locale["KEEP_ALBUMS"];

	basicModal.show({
		body: "<p></p>",
		readyCB: initConfirmDeletionDialog,
		buttons: {
			action: {
				title: actionButtonLabel,
				fn: action,
				classList: ["red"],
			},
			cancel: {
				title: cancelButtonLabel,
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
			body: "<p></p>",
			readyCB: (formElements, dialog) =>
				(dialog.querySelector("p").textContent = album.buildMessage(albumIDs, albumID, "ALBUM_MERGE", "ALBUMS_MERGE")),
			buttons: {
				action: {
					title: lychee.locale["MERGE_ALBUM"],
					fn: action,
					classList: ["red"],
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
			body: "<p></p>",
			readyCB: (formElements, dialog) =>
				(dialog.querySelector("p").textContent = album.buildMessage(albumIDs, albumID, "ALBUM_MOVE", "ALBUMS_MOVE")),
			buttons: {
				action: {
					title: lychee.locale["MOVE_ALBUMS"],
					fn: action,
					classList: ["red"],
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
 * It is safe to call this method even if no album is loaded at all.
 * In this case, the method simply returns `false` (even for admin users).
 *
 * If no user is authenticated or the authenticated user has no upload
 * capabilities, the method returns `false` (even for albums owned by the
 * user).
 * For admin users the method returns `true`.
 *
 * For non-admin, authenticated users with the upload capability
 *
 *  - the method returns `true` for smart albums
 *  - the method returns `true` for regular albums if and only if the album is
 *    owned by the currently authenticated user.
 *
 * Note, for the time being this method contains a work-around in case
 * no album is loaded, but the root view is visible.
 * Currently, this is necessary, because this method is (erroneously) called
 * for the root view as well.
 * In order to determine whether the work-around for the root view needs to
 * be applied, this method checks if the root view is visible based on the
 * visibility of the corresponding headers.
 * Hence, the caller must ensure that the appropriate header is set first
 * in order to obtain a correct result from this method.
 *
 * @returns {boolean}
 */
album.isUploadable = function () {
	// Work-around in case this method is called for the root view
	if (visible.albums()) {
		return lychee.rights.is_admin || (lychee.user !== null && !lychee.publicMode && lychee.rights.may_upload);
	}

	// If no album is loaded, nobody (not even the admin) can upload photos.
	// We must check this first, before we test for the admin short-cut.
	//
	// Particular photo actions (such as starring/unstarring a photo) assume
	// that the corresponding album is loaded, because their code use
	// `album.getPhotoId` under the hood.
	// (Note, this is a bug on its own.)
	// In the special view mode for single photos no album is loaded, even if
	// the currently authenticated user had the right to load (and see) the
	// album.
	// Hence, invoking those actions without a properly loaded album, results
	// in exceptions.
	// The method `header.setMode` relies on this method to decide whether
	// particular action buttons shall be hidden in single photo view.
	// If the admin is authenticated and opens the view mode, those "buggy"
	// actions must be hidden.
	if (album.json === null) {
		return false;
	}

	if (lychee.rights.is_admin) {
		return true;
	}
	if (lychee.user === null || lychee.publicMode || !lychee.rights.may_upload) {
		return false;
	}

	// Smart albums are considered to be owned by everybody and hence get
	// a pass
	if (album.isSmartID(album.json.id)) {
		return true;
	}

	// TODO: Comparison of numeric user IDs (instead of names) should be more robust
	return album.json.owner_name === lychee.user.username;
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
			filesize: src.filesize,
		};
	};

	if (album.json && album.json.photos) {
		const photo = album.json.photos.find((p) => p.id === data.id);

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

/**
 * @returns {void}
 */
album.deleteTrack = function () {
	album.json.track_url = null;

	api.post("Album::deleteTrack", {
		albumID: album.json.id,
	});
};
