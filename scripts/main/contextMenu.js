/**
 * @description This module is used for the context menu.
 */

const contextMenu = {};

/**
 * @param {jQuery.Event} e
 */
contextMenu.add = function (e) {
	let items = [
		{ title: build.iconic("image") + lychee.locale["UPLOAD_PHOTO"], fn: () => $("#upload_files").click() },
		{},
		{ title: build.iconic("link-intact") + lychee.locale["IMPORT_LINK"], fn: () => upload.start.url() },
		{ title: build.iconic("dropbox", "ionicons") + lychee.locale["IMPORT_DROPBOX"], fn: () => upload.start.dropbox() },
		{ title: build.iconic("terminal") + lychee.locale["IMPORT_SERVER"], fn: () => upload.start.server() },
		{},
		{ title: build.iconic("folder") + lychee.locale["NEW_ALBUM"], fn: () => album.add() },
	];

	if (visible.albums()) {
		items.push({ title: build.iconic("tags") + lychee.locale["NEW_TAG_ALBUM"], fn: () => album.addByTags() });
	} else if (album.isSmartID(album.getID()) || album.isSearchID(album.getID())) {
		// remove Import and New album if smart album or search results
		items.splice(1);
	}

	if (!lychee.rights.is_admin) {
		// remove import from dropbox and server if not admin
		items.splice(3, 2);
	} else if (!lychee.dropboxKey || lychee.dropboxKey === "") {
		// remove import from dropbox if dropboxKey not set
		items.splice(3, 1);
	}

	if (visible.album() && album.isUploadable()) {
		// prepend further buttons if menu bar is reduced on small screens
		let albumID = album.getID();
		if (album.isTagAlbum()) {
			// For tag albums the context menu is normally not used.
			items = [];
		}
		if (albumID.length === 24 || albumID === SmartAlbumID.UNSORTED) {
			if (albumID !== SmartAlbumID.UNSORTED) {
				let button_visibility_album = $("#button_visibility_album");
				if (button_visibility_album && button_visibility_album.css("display") === "none") {
					items.unshift({
						title: build.iconic("eye") + lychee.locale["VISIBILITY_ALBUM"],
						visible: lychee.enable_button_visibility,
						fn: () => album.setProtectionPolicy(albumID),
					});
				}
			}
			let button_trash_album = $("#button_trash_album");
			if (button_trash_album && button_trash_album.css("display") === "none") {
				items.unshift({
					title: build.iconic("trash") + lychee.locale["DELETE_ALBUM"],
					visible: lychee.enable_button_trash,
					fn: () => album.delete([albumID]),
				});
			}
			if (albumID !== SmartAlbumID.UNSORTED) {
				if (!album.isTagAlbum()) {
					let button_move_album = $("#button_move_album");
					if (button_move_album && button_move_album.css("display") === "none") {
						items.unshift({
							title: build.iconic("folder") + lychee.locale["MOVE_ALBUM"],
							visible: lychee.enable_button_move,
							fn: (event) => contextMenu.move([albumID], event, album.setAlbum, "ROOT", album.getParentID() !== null),
						});
					}
				}
				let button_nsfw_album = $("#button_nsfw_album");
				if (button_nsfw_album && button_nsfw_album.css("display") === "none") {
					items.unshift({
						title: build.iconic("warning") + lychee.locale["ALBUM_MARK_NSFW"],
						visible: true,
						fn: () => album.toggleNSFW(),
					});
				}
			}
			if (!album.isSmartID(albumID) && lychee.map_display) {
				// display track add button if it's a regular album
				items.push({}, { title: build.iconic("location") + lychee.locale["UPLOAD_TRACK"], fn: () => $("#upload_track_file").click() });
				if (album.json.track_url) {
					items.push({ title: build.iconic("trash") + lychee.locale["DELETE_TRACK"], fn: album.deleteTrack });
				}
			}
		}
	}

	basicContext.show(items, e.originalEvent);

	upload.notify();
};

/**
 * @param {string} albumID
 * @param {jQuery.Event} e
 *
 * @returns {void}
 */
contextMenu.album = function (albumID, e) {
	// Notice for 'Merge':
	// fn must call basicContext.close() first,
	// in order to keep the selection

	if (album.isSmartID(albumID) || album.isSearchID(albumID)) return;

	const showMergeMove = !albums.isTagAlbum(albumID);

	const items = [
		{ title: build.iconic("pencil") + lychee.locale["RENAME"], fn: () => album.setTitle([albumID]) },
		{
			title: build.iconic("collapse-left") + lychee.locale["MERGE"],
			visible: showMergeMove,
			fn: () => {
				basicContext.close();
				contextMenu.move([albumID], e, album.merge, "ROOT", false);
			},
		},
		{
			title: build.iconic("folder") + lychee.locale["MOVE"],
			visible: showMergeMove,
			fn: () => {
				basicContext.close();
				contextMenu.move([albumID], e, album.setAlbum, "ROOT");
			},
		},
		{ title: build.iconic("trash") + lychee.locale["DELETE"], fn: () => album.delete([albumID]) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD"], fn: () => album.getArchive([albumID]) },
	];

	if (visible.album()) {
		// not top level
		const myalbum = album.getSubByID(albumID);
		if (myalbum.thumb.id) {
			let coverActive = myalbum.thumb.id === album.json.cover_id;
			// prepend context menu item
			items.unshift({
				title: build.iconic("folder-cover", coverActive ? "active" : "") + lychee.locale[coverActive ? "REMOVE_COVER" : "SET_COVER"],
				fn: () => album.toggleCover(myalbum.thumb.id),
			});
		}
	}

	$('.album[data-id="' + albumID + '"]').addClass("active");

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

/**
 * Handles drop event of an album onto an album and shows context menu to let the user pick the actions.
 *
 * @param {string} sourceAlbumID source album (which is being dragged)
 * @param {string} targetAlbumID target album (where it is dropped)
 * @param {DragEvent} e
 *
 * @returns {void}
 */
contextMenu.albumDrop = function (sourceAlbumID, targetAlbumID, e) {
	const items = [
		{
			title: build.iconic("collapse-left") + lychee.locale["MERGE"],
			fn: () => {
				album.merge([sourceAlbumID], targetAlbumID);
			},
		},
		{
			title: build.iconic("folder") + lychee.locale["MOVE"],
			visible: true,
			fn: () => {
				basicContext.close();
				album.setAlbum([sourceAlbumID], targetAlbumID);
			},
		},
	];

	basicContext.show(items, e, contextMenu.close);
};

/**
 * @param {string[]} albumIDs
 * @param {jQuery.Event} e
 *
 * @returns {void}
 */
contextMenu.albumMulti = function (albumIDs, e) {
	multiselect.stopResize();

	// Automatically merge selected albums when albumIDs contains more than one album
	// Show list of albums otherwise
	const autoMerge = albumIDs.length > 1;

	const showMergeMove = albumIDs.every((albumID) => !albums.isTagAlbum(albumID));

	let items = [
		{ title: build.iconic("pencil") + lychee.locale["RENAME_ALL"], fn: () => album.setTitle(albumIDs) },
		{
			title: build.iconic("collapse-left") + lychee.locale["MERGE_ALL"],
			visible: showMergeMove && autoMerge,
			fn: () => {
				let albumID = albumIDs.shift();
				album.merge(albumIDs, albumID);
			},
		},
		{
			title: build.iconic("collapse-left") + lychee.locale["MERGE"],
			visible: showMergeMove && !autoMerge,
			fn: () => {
				basicContext.close();
				contextMenu.move(albumIDs, e, album.merge, "ROOT", false);
			},
		},
		{
			title: build.iconic("folder") + lychee.locale["MOVE_ALL"],
			visible: showMergeMove,
			fn: () => {
				basicContext.close();
				contextMenu.move(albumIDs, e, album.setAlbum, "ROOT");
			},
		},
		{ title: build.iconic("trash") + lychee.locale["DELETE_ALL"], fn: () => album.delete(albumIDs) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD_ALL"], fn: () => album.getArchive(albumIDs) },
	];

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

/**
 * @callback ContextMenuActionCB
 *
 * @param {(Photo|Album)} entity
 */

/**
 * @callback ContextMenuEventCB
 *
 * @param {jQuery.Event} [e]
 * @returns {void}
 */

/**
 * @param {(Photo|Album)[]} lists
 * @param {string[]} exclude list of IDs to exclude
 * @param {ContextMenuActionCB} action
 * @param {?string} [parentID=null] parentID
 * @param {number} [layer=0]
 *
 * @returns {{title: string, disabled: boolean, fn: ContextMenuEventCB}[]}
 */
contextMenu.buildList = function (lists, exclude, action, parentID = null, layer = 0) {
	let items = [];

	lists.forEach(function (item) {
		if ((layer !== 0 || item.parent_id) && item.parent_id !== parentID) return;

		let thumb = "img/no_cover.svg";
		if (item.thumb && item.thumb.thumb) {
			if (item.thumb.thumb === "uploads/thumb/") {
				if (item.thumb.type && item.thumb.type.indexOf("video") > -1) {
					thumb = "img/play-icon.png";
				}
			} else {
				thumb = item.thumb.thumb;
			}
		} else if (item.size_variants) {
			if (item.size_variants.thumb === null) {
				if (item.type && item.type.indexOf("video") > -1) {
					thumb = "img/play-icon.png";
				}
			} else {
				thumb = item.size_variants.thumb.url;
			}
		}

		if (!item.title) item.title = lychee.locale["UNTITLED"];

		let prefix = layer > 0 ? "&nbsp;&nbsp;".repeat(layer - 1) + "└ " : "";

		let html = lychee.html`
			           ${prefix}
			           <img class='cover' width='16' height='16' src='${thumb}' alt="thumbnail">
			           <div class='title'>$${item.title}</div>
			           `;

		items.push({
			title: html,
			disabled: exclude.findIndex((id) => id === item.id) !== -1,
			fn: () => action(item),
		});

		if (item.albums && item.albums.length > 0) {
			items = items.concat(contextMenu.buildList(item.albums, exclude, action, item.id, layer + 1));
		} else {
			// Fallback for flat tree representation.  Should not be
			// needed anymore but shouldn't hurt either.
			items = items.concat(contextMenu.buildList(lists, exclude, action, item.id, layer + 1));
		}
	});

	return items;
};

/**
 * @param {?string} albumID
 * @param {jQuery.Event} e
 *
 * @returns {void}
 */
contextMenu.albumTitle = function (albumID, e) {
	api.post("Albums::tree", {}, function (data) {
		let items = [];

		items = items.concat({ title: lychee.locale["ROOT"], disabled: albumID === null, fn: () => lychee.goto() });

		if (data.albums && data.albums.length > 0) {
			items = items.concat({});
			items = items.concat(contextMenu.buildList(data.albums, albumID !== null ? [albumID] : [], (a) => lychee.goto(a.id)));
		}

		if (data.shared_albums && data.shared_albums.length > 0) {
			items = items.concat({});
			items = items.concat(contextMenu.buildList(data.shared_albums, albumID !== null ? [albumID] : [], (a) => lychee.goto(a.id)));
		}

		if (albumID !== null && !album.isSmartID(albumID) && !album.isSearchID(albumID) && album.isUploadable()) {
			if (items.length > 0) {
				items.unshift({});
			}

			items.unshift({ title: build.iconic("pencil") + lychee.locale["RENAME"], fn: () => album.setTitle([albumID]) });
		}

		basicContext.show(items, e.originalEvent, contextMenu.close);
	});
};

/**
 * @param {string} photoID
 * @param {jQuery.Event} e
 *
 * @returns {void}
 */
contextMenu.photo = function (photoID, e) {
	const coverActive = photoID === album.json.cover_id;

	const isPhotoStarred = album.getByID(photoID).is_starred;

	const items = [
		{
			title: build.iconic("star") + (isPhotoStarred ? lychee.locale["UNSTAR"] : lychee.locale["STAR"]),
			fn: () => photo.setStar([photoID], !isPhotoStarred),
		},
		{ title: build.iconic("tag") + lychee.locale["TAG"], fn: () => photo.editTags([photoID]) },
		// for future work, use a list of all the ancestors.
		{
			title: build.iconic("folder-cover", coverActive ? "active" : "") + lychee.locale[coverActive ? "REMOVE_COVER" : "SET_COVER"],
			fn: () => album.toggleCover(photoID),
		},
		{},
		{ title: build.iconic("pencil") + lychee.locale["RENAME"], fn: () => photo.setTitle([photoID]) },
		{
			title: build.iconic("layers") + lychee.locale["COPY_TO"],
			fn: () => {
				basicContext.close();
				contextMenu.move([photoID], e, photo.copyTo);
			},
		},
		// Notice for 'Move':
		// fn must call basicContext.close() first,
		// in order to keep the selection
		{
			title: build.iconic("folder") + lychee.locale["MOVE"],
			fn: () => {
				basicContext.close();
				contextMenu.move([photoID], e, photo.setAlbum);
			},
		},
		{ title: build.iconic("trash") + lychee.locale["DELETE"], fn: () => photo.delete([photoID]) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD"], fn: () => photo.getArchive([photoID]) },
	];
	if (album.isSmartID(album.getID()) || album.isSearchID(album.getID()) || album.isTagAlbum()) {
		// Cover setting not supported for smart or tag albums and search results.
		items.splice(2, 1);
	}

	$('.photo[data-id="' + photoID + '"]').addClass("active");

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

/**
 * @param {string} photoID
 * @param {string} albumID
 * @param {DragEvent} e
 *
 * @returns {void}
 */
contextMenu.photoDrop = function (photoID, albumID, e) {
	const items = [
		{
			title: build.iconic("folder") + lychee.locale["MOVE"],
			fn: () => {
				photo.setAlbum([photoID], albumID);
			},
		},
	];

	$('.photo[data-id="' + photoID + '"]').addClass("active");

	basicContext.show(items, e, contextMenu.close);
};

/**
 * @param {string[]} photoIDs
 * @param {jQuery.Event} e
 */
contextMenu.photoMulti = function (photoIDs, e) {
	multiselect.stopResize();

	let arePhotosStarred = false;
	let arePhotosNotStarred = false;
	photoIDs.forEach(function (id) {
		if (album.getByID(id).is_starred) {
			arePhotosStarred = true;
		} else {
			arePhotosNotStarred = true;
		}
	});

	let items = [
		// Only show the star/unstar menu item when the selected photos are
		// consistently either all starred or all not starred.
		{
			title: build.iconic("star") + (arePhotosNotStarred ? lychee.locale["STAR_ALL"] : lychee.locale["UNSTAR_ALL"]),
			visible: !(arePhotosStarred && arePhotosNotStarred),
			fn: () => photo.setStar(photoIDs, arePhotosNotStarred),
		},
		{ title: build.iconic("tag") + lychee.locale["TAG_ALL"], fn: () => photo.editTags(photoIDs) },
		{},
		{ title: build.iconic("pencil") + lychee.locale["RENAME_ALL"], fn: () => photo.setTitle(photoIDs) },
		{
			title: build.iconic("layers") + lychee.locale["COPY_ALL_TO"],
			fn: () => {
				basicContext.close();
				contextMenu.move(photoIDs, e, photo.copyTo);
			},
		},
		{
			title: build.iconic("folder") + lychee.locale["MOVE_ALL"],
			fn: () => {
				basicContext.close();
				contextMenu.move(photoIDs, e, photo.setAlbum);
			},
		},
		{ title: build.iconic("trash") + lychee.locale["DELETE_ALL"], fn: () => photo.delete(photoIDs) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD_ALL"], fn: () => photo.getArchive(photoIDs, "FULL") },
	];

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

/**
 * @param {string} albumID
 * @param {string} photoID
 * @param {jQuery.Event} e
 */
contextMenu.photoTitle = function (albumID, photoID, e) {
	let items = [{ title: build.iconic("pencil") + lychee.locale["RENAME"], fn: () => photo.setTitle([photoID]) }];

	// Note: We can also have a photo without its parent album being loaded
	// if the photo is a public photo within a private album
	const photos = album.json ? album.json.photos : [];

	if (photos.length > 0) {
		items.push({});

		items = items.concat(contextMenu.buildList(photos, [photoID], (a) => lychee.goto(albumID + "/" + a.id)));
	}

	if (!album.isUploadable()) {
		// Remove Rename and the spacer.
		items.splice(0, 2);
	}

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

/**
 * @param {string} photoID
 * @param {jQuery.Event} e
 */
contextMenu.photoMore = function (photoID, e) {
	// Show download-item when
	// a) We are allowed to upload to the album
	// b) the photo is explicitly marked as downloadable (v4-only)
	// c) or, the album is explicitly marked as downloadable

	const showDownload = album.isUploadable() || photo.json.is_downloadable;
	const showFull = !!(photo.json.size_variants.original.url && photo.json.size_variants.original.url !== "");

	const items = [
		{ title: build.iconic("fullscreen-enter") + lychee.locale["FULL_PHOTO"], visible: showFull, fn: () => window.open(photo.getDirectLink()) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD"], visible: showDownload, fn: () => photo.getArchive([photoID]) },
	];
	if (album.isUploadable()) {
		// prepend further buttons if menu bar is reduced on small screens
		const button_visibility = $("#button_visibility");
		if (button_visibility && button_visibility.css("display") === "none") {
			items.unshift({
				title: build.iconic("eye") + lychee.locale["VISIBILITY_PHOTO"],
				visible: lychee.enable_button_visibility,
				fn: () => photo.setProtectionPolicy(photo.getID()),
			});
		}
		const button_trash = $("#button_trash");
		if (button_trash && button_trash.css("display") === "none") {
			items.unshift({
				title: build.iconic("trash") + lychee.locale["DELETE"],
				visible: lychee.enable_button_trash,
				fn: () => photo.delete([photo.getID()]),
			});
		}
		const button_move = $("#button_move");
		if (button_move && button_move.css("display") === "none") {
			items.unshift({
				title: build.iconic("folder") + lychee.locale["MOVE"],
				visible: lychee.enable_button_move,
				fn: (event) => contextMenu.move([photo.getID()], event, photo.setAlbum),
			});
		}
		/* The condition below is copied from view.photo.header() */
		if (
			!(
				(photo.json.type && (photo.json.type.indexOf("video") === 0 || photo.json.type === "raw")) ||
				(photo.json.live_photo_url !== "" && photo.json.live_photo_url !== null)
			)
		) {
			const button_rotate_cwise = $("#button_rotate_cwise");
			if (button_rotate_cwise && button_rotate_cwise.css("display") === "none") {
				items.unshift({
					title: build.iconic("clockwise") + lychee.locale["PHOTO_EDIT_ROTATECWISE"],
					visible: lychee.enable_button_move,
					fn: () => photoeditor.rotate(photo.getID(), 1),
				});
			}
			const button_rotate_ccwise = $("#button_rotate_ccwise");
			if (button_rotate_ccwise && button_rotate_ccwise.css("display") === "none") {
				items.unshift({
					title: build.iconic("counterclockwise") + lychee.locale["PHOTO_EDIT_ROTATECCWISE"],
					visible: lychee.enable_button_move,
					fn: () => photoeditor.rotate(photo.getID(), -1),
				});
			}
		}
	}

	basicContext.show(items, e.originalEvent);
};

/**
 * @param {Album[]} albums
 * @param {string} albumID
 *
 * @returns {string[]}
 */
contextMenu.getSubIDs = function (albums, albumID) {
	let ids = [albumID];

	albums.forEach(function (album) {
		if (album.parent_id === albumID) {
			ids = ids.concat(contextMenu.getSubIDs(albums, album.id));
		}

		if (album.albums && album.albums.length > 0) {
			ids = ids.concat(contextMenu.getSubIDs(album.albums, albumID));
		}
	});

	return ids;
};

/**
 * @callback TargetAlbumSelectedCB
 *
 * Called by {@link contextMenu.move} after the user has selected a target ID.
 * In most cases, {@link album.setAlbum} or {@link photo.setAlbum} are
 * directly used as the callback.
 * This design decision is the only reason, why this callback gets more
 * parameters than the selected target ID.
 * The parameter signature of this callback matches {@link album.setAlbum}.
 *
 * However, the callback should actually enclose all other parameters it
 * needs and only receive the target ID.
 *
 * TODO: Re-factor callbacks.
 *
 * @param {string[]} IDs      the source IDs
 * @param {?string} targetID  the ID of the target album
 * @param {boolean} [confirm] indicates whether the callback shall show a
 *                            confirmation dialog to the user for whatever to
 *                            callback is going to do
 * @returns {void}
 */

/**
 * Shows the context menu with the album tree and allows the user to select a target album.
 *
 * **ATTENTION:** The name `move` of this method is very badly chosen.
 * The method does not move anything, but only shows the menu and reports
 * the selected album.
 * In particular, the method is used by any operation which needs a target
 * album (i.e. merge, copy-to, etc.)
 *
 * TODO: Find a better name for this function.
 *
 * The method calls the provided callback after the user has selected a
 * target album and passes the ID of the target album together with the
 * source `IDs` and the event `e` to the callback.
 *
 * TODO: Actually the callbacks should enclose all additional parameters (e.g., `IDs`) they need. Refactor the callbacks.
 *
 * The name of the root node in the context menu may be provided by the caller
 * depending on the use-case.
 * Keep in mind, that the root album is not visible to the user during normal
 * browsing.
 * Photos on the root level are stashed away into a virtual album called
 * "Unsorted".
 * Albums on the root level are shown as siblings, but the root node itself
 * is invisible.
 * So the user actually sees a forest.
 * Hence, the root node should be named differently to meet the user's
 * expectations.
 * When the user moves/copies/merges photos, then the root node should be
 * called "Unsorted".
 * When the user moves/copies/merges albums, then the root node should be
 * called "Root".
 *
 * @param {string[]} IDs - IDs of source objects (either album or photo IDs)
 * @param {jQuery.Event} e - Some (?) event
 * @param {TargetAlbumSelectedCB} callback - to be called after the user has selected a target ID
 * @param {string} [kind=UNSORTED] - Name of root album; either "UNSORTED" or "ROOT"
 * @param {boolean} [display_root=true] - Whether the root (aka unsorted) album shall be shown
 */
contextMenu.move = function (IDs, e, callback, kind = "UNSORTED", display_root = true) {
	let items = [];

	api.post("Albums::tree", {}, function (data) {
		const addItems = function (albums) {
			// Disable all children
			// It's not possible to move us into them
			let i, s;
			let exclude = [];
			for (i = 0; i < IDs.length; i++) {
				let sub = contextMenu.getSubIDs(albums, IDs[i]);
				for (s = 0; s < sub.length; s++) exclude.push(sub[s]);
			}
			if (visible.album()) {
				// For merging, don't exclude the parent.
				// For photo copy, don't exclude the current album.
				if (callback !== album.merge && callback !== photo.copyTo) {
					exclude.push(album.getID());
				}
				if (IDs.length === 1 && IDs[0] === album.getID() && album.getParentID() && callback === album.setAlbum) {
					// If moving the current album, exclude its parent.
					exclude.push(album.getParentID());
				}
			} else if (visible.photo()) {
				exclude.push(photo.json.album_id);
			}
			items = items.concat(contextMenu.buildList(albums, exclude.concat(IDs), (a) => callback(IDs, a.id)));
		};

		if (data.albums && data.albums.length > 0) {
			// items = items.concat(contextMenu.buildList(data.albums, [ album.getID() ], (a) => callback(IDs, a.id))); //photo.setAlbum

			addItems(data.albums);
		}

		if (data.shared_albums && data.shared_albums.length > 0 && lychee.rights.is_admin) {
			items = items.concat({});
			addItems(data.shared_albums);
		}

		// Show Unsorted when unsorted is not the current album
		if (display_root && album.getID() !== "unsorted" && !visible.albums()) {
			items.unshift({});
			items.unshift({ title: lychee.locale[kind], fn: () => callback(IDs, null) });
		}

		// Don't allow to move the current album to a newly created subalbum
		// (creating a cycle).
		if (IDs.length !== 1 || IDs[0] !== (album.json ? album.json.id : null) || callback !== album.setAlbum) {
			items.unshift({});
			items.unshift({ title: lychee.locale["NEW_ALBUM"], fn: () => album.add(IDs, callback) });
		}

		basicContext.show(items, e.originalEvent, contextMenu.close);
	});
};

/**
 * @param {string} photoID
 * @param {jQuery.Event} e
 *
 * @returns {void}
 */
contextMenu.sharePhoto = function (photoID, e) {
	const iconClass = "ionicons";

	const items = [
		{ title: build.iconic("twitter", iconClass) + "Twitter", fn: () => photo.share(photoID, "twitter") },
		{ title: build.iconic("facebook", iconClass) + "Facebook", fn: () => photo.share(photoID, "facebook") },
		{ title: build.iconic("envelope-closed") + "Mail", fn: () => photo.share(photoID, "mail") },
		{
			title: build.iconic("dropbox", iconClass) + "Dropbox",
			visible: lychee.rights.is_admin === true,
			fn: () => photo.share(photoID, "dropbox"),
		},
		{ title: build.iconic("link-intact") + lychee.locale["DIRECT_LINKS"], fn: () => photo.showDirectLinks(photoID) },
		{ title: build.iconic("grid-two-up") + lychee.locale["QR_CODE"], fn: () => photo.qrCode(photoID) },
	];

	basicContext.show(items, e.originalEvent);
};

/**
 * @param {string} albumID
 * @param {jQuery.Event} e
 *
 * @returns {void}
 */
contextMenu.shareAlbum = function (albumID, e) {
	const iconClass = "ionicons";

	const items = [
		{ title: build.iconic("twitter", iconClass) + "Twitter", fn: () => album.share("twitter") },
		{ title: build.iconic("facebook", iconClass) + "Facebook", fn: () => album.share("facebook") },
		{ title: build.iconic("envelope-closed") + "Mail", fn: () => album.share("mail") },
		{
			title: build.iconic("link-intact") + lychee.locale["DIRECT_LINK"],
			fn: () => {
				let url = lychee.getBaseUrl() + "r/" + albumID;
				if (album.json.has_password) {
					// Copy the url with prefilled password param
					url += "?password=";
				}
				navigator.clipboard.writeText(url).then(() => loadingBar.show("success", lychee.locale["URL_COPIED_TO_CLIPBOARD"]));
			},
		},
		{ title: build.iconic("grid-two-up") + lychee.locale["QR_CODE"], fn: () => album.qrCode() },
	];

	basicContext.show(items, e.originalEvent);
};

/**
 * @returns {void}
 */
contextMenu.close = function () {
	if (!visible.contextMenu()) return;

	basicContext.close();

	multiselect.clearSelection();
	if (visible.multiselect()) {
		multiselect.close();
	}
};

/**
 * @param {jQuery.Event} e
 * @returns {void}
 */
contextMenu.config = function (e) {
	let items = [{ title: build.iconic("cog") + lychee.locale["SETTINGS"], fn: settings.open }];
	if (lychee.new_photos_notification) {
		items.push({ title: build.iconic("bell") + lychee.locale["NOTIFICATIONS"], fn: notifications.load });
	}
	if (lychee.rights.is_admin) {
		items.push({ title: build.iconic("person") + lychee.locale["USERS"], fn: users.list });
	}
	items.push({ title: build.iconic("key") + lychee.locale["U2F"], fn: u2f.list });
	items.push({ title: build.iconic("cloud") + lychee.locale["SHARING"], fn: sharing.list });
	if (lychee.rights.is_admin) {
		items.push({
			title: build.iconic("align-left") + lychee.locale["LOGS"],
			fn: function () {
				view.logs.init();
			},
		});
		items.push({
			title: build.iconic("wrench") + lychee.locale["DIAGNOSTICS"],
			fn: function () {
				view.diagnostics.init();
			},
		});
		if (lychee.update_available) {
			items.push({ title: build.iconic("timer") + lychee.locale["UPDATE_AVAILABLE"], fn: view.update.init });
		}
	}
	items.push({ title: build.iconic("info") + lychee.locale["ABOUT_LYCHEE"], fn: lychee.aboutDialog });
	items.push({ title: build.iconic("account-logout") + lychee.locale["SIGN_OUT"], fn: lychee.logout });

	basicContext.show(items, e.originalEvent);
};
