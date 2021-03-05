/**
 * @description This module is used for the context menu.
 */

let contextMenu = {};

contextMenu.add = function (e) {
	let items = [
		{ title: build.iconic("image") + lychee.locale["UPLOAD_PHOTO"], fn: () => $("#upload_files").click() },
		{},
		{ title: build.iconic("link-intact") + lychee.locale["IMPORT_LINK"], fn: upload.start.url },
		{ title: build.iconic("dropbox", "ionicons") + lychee.locale["IMPORT_DROPBOX"], fn: upload.start.dropbox },
		{ title: build.iconic("terminal") + lychee.locale["IMPORT_SERVER"], fn: upload.start.server },
		{},
		{ title: build.iconic("folder") + lychee.locale["NEW_ALBUM"], fn: album.add },
	];

	if (visible.albums()) {
		items.push({ title: build.iconic("tags") + lychee.locale["NEW_TAG_ALBUM"], fn: album.addByTags });
	}

	if (lychee.api_V2 && !lychee.admin) {
		items.splice(3, 2);
	}

	basicContext.show(items, e.originalEvent);

	upload.notify();
};

contextMenu.album = function (albumID, e) {
	// Notice for 'Merge':
	// fn must call basicContext.close() first,
	// in order to keep the selection

	if (album.isSmartID(albumID)) return false;

	// Show merge-item when there's more than one album
	// Commented out because it doesn't consider subalbums or shared albums.
	// let showMerge = (albums.json && albums.json.albums && Object.keys(albums.json.albums).length>1);
	let showMerge = true;

	let items = [
		{ title: build.iconic("pencil") + lychee.locale["RENAME"], fn: () => album.setTitle([albumID]) },
		{
			title: build.iconic("collapse-left") + lychee.locale["MERGE"],
			visible: showMerge,
			fn: () => {
				basicContext.close();
				contextMenu.move([albumID], e, album.merge, "ROOT", false);
			},
		},
		{
			title: build.iconic("folder") + lychee.locale["MOVE"],
			visible: lychee.sub_albums,
			fn: () => {
				basicContext.close();
				contextMenu.move([albumID], e, album.setAlbum, "ROOT");
			},
		},
		// { title: build.iconic('cloud') + lychee.locale['SHARE_WITH'],    visible: lychee.api_V2 && lychee.upload,   fn: () => alert('ho')},
		{ title: build.iconic("trash") + lychee.locale["DELETE"], fn: () => album.delete([albumID]) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD"], fn: () => album.getArchive([albumID]) },
	];

	if (visible.album()) {
		// not top level
		let myalbum = album.getSubByID(albumID);
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

contextMenu.albumMulti = function (albumIDs, e) {
	multiselect.stopResize();

	// Automatically merge selected albums when albumIDs contains more than one album
	// Show list of albums otherwise
	let autoMerge = albumIDs.length > 1;

	// Show merge-item when there's more than one album
	// Commented out because it doesn't consider subalbums or shared albums.
	// let showMerge = (albums.json && albums.json.albums && Object.keys(albums.json.albums).length>1);
	let showMerge = true;

	let items = [
		{ title: build.iconic("pencil") + lychee.locale["RENAME_ALL"], fn: () => album.setTitle(albumIDs) },
		{
			title: build.iconic("collapse-left") + lychee.locale["MERGE_ALL"],
			visible: showMerge && autoMerge,
			fn: () => {
				let albumID = albumIDs.shift();
				album.merge(albumIDs, albumID);
			},
		},
		{
			title: build.iconic("collapse-left") + lychee.locale["MERGE"],
			visible: showMerge && !autoMerge,
			fn: () => {
				basicContext.close();
				contextMenu.move(albumIDs, e, album.merge, "ROOT", false);
			},
		},
		{
			title: build.iconic("folder") + lychee.locale["MOVE_ALL"],
			visible: lychee.sub_albums,
			fn: () => {
				basicContext.close();
				contextMenu.move(albumIDs, e, album.setAlbum, "ROOT");
			},
		},
		{ title: build.iconic("trash") + lychee.locale["DELETE_ALL"], fn: () => album.delete(albumIDs) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD_ALL"], fn: () => album.getArchive(albumIDs) },
	];

	if (!lychee.api_V2) {
		items.splice(-1);
	}

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

contextMenu.buildList = function (lists, exclude, action, parent = 0, layer = 0) {
	const find = function (excl, id) {
		for (let i = 0; i < excl.length; i++) {
			if (parseInt(excl[i], 10) === parseInt(id, 10)) return true;
		}
		return false;
	};

	let items = [];

	let i = 0;
	while (i < lists.length) {
		if ((layer === 0 && !lists[i].parent_id) || lists[i].parent_id === parent) {
			let item = lists[i];

			let thumb = "img/no_cover.svg";
			if (item.thumbs && item.thumbs[0]) {
				if (item.thumbs[0] === "uploads/thumb/" && item.types[0] && item.types[0].indexOf("video") > -1) {
					thumb = "img/play-icon.png";
				} else {
					thumb = item.thumbs[0];
				}
			} else if (item.thumbUrl) {
				if (item.thumbUrl === "uploads/thumb/" && item.type.indexOf("video") > -1) {
					thumb = "img/play-icon.png";
				} else {
					thumb = item.thumbUrl;
				}
			}

			if (item.title === "") item.title = lychee.locale["UNTITLED"];

			let prefix = layer > 0 ? "&nbsp;&nbsp;".repeat(layer - 1) + "└ " : "";

			let html = lychee.html`
			           ${prefix}
			           <img class='cover' width='16' height='16' src='${thumb}'>
			           <div class='title'>$${item.title}</div>
			           `;

			items.push({
				title: html,
				disabled: find(exclude, item.id),
				fn: () => action(item),
			});

			if (item.albums && item.albums.length > 0) {
				items = items.concat(contextMenu.buildList(item.albums, exclude, action, item.id, layer + 1));
			} else {
				// Fallback for flat tree representation.  Should not be
				// needed anymore but shouldn't hurt either.
				items = items.concat(contextMenu.buildList(lists, exclude, action, item.id, layer + 1));
			}
		}

		i++;
	}

	return items;
};

contextMenu.albumTitle = function (albumID, e) {
	api.post("Albums::tree", {}, function (data) {
		let items = [];

		items = items.concat({ title: lychee.locale["ROOT"], disabled: albumID === false, fn: () => lychee.goto() });

		if (data.albums && data.albums.length > 0) {
			items = items.concat({});
			items = items.concat(contextMenu.buildList(data.albums, albumID !== false ? [parseInt(albumID, 10)] : [], (a) => lychee.goto(a.id)));
		}

		if (data.shared_albums && data.shared_albums.length > 0) {
			items = items.concat({});
			items = items.concat(
				contextMenu.buildList(data.shared_albums, albumID !== false ? [parseInt(albumID, 10)] : [], (a) => lychee.goto(a.id))
			);
		}

		if (albumID !== false && !album.isSmartID(albumID) && album.isUploadable()) {
			if (items.length > 0) {
				items.unshift({});
			}

			items.unshift({ title: build.iconic("pencil") + lychee.locale["RENAME"], fn: () => album.setTitle([albumID]) });
		}

		basicContext.show(items, e.originalEvent, contextMenu.close);
	});
};

contextMenu.photo = function (photoID, e) {
	let coverActive = photoID === album.json.cover_id;

	let items = [
		{ title: build.iconic("star") + lychee.locale["STAR"], fn: () => photo.setStar([photoID]) },
		{ title: build.iconic("tag") + lychee.locale["TAGS"], fn: () => photo.editTags([photoID]) },
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
				contextMenu.move([photoID], e, photo.copyTo, "UNSORTED");
			},
		},
		// Notice for 'Move':
		// fn must call basicContext.close() first,
		// in order to keep the selection
		{
			title: build.iconic("folder") + lychee.locale["MOVE"],
			fn: () => {
				basicContext.close();
				contextMenu.move([photoID], e, photo.setAlbum, "UNSORTED");
			},
		},
		{ title: build.iconic("trash") + lychee.locale["DELETE"], fn: () => photo.delete([photoID]) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD"], fn: () => photo.getArchive([photoID]) },
	];

	$('.photo[data-id="' + photoID + '"]').addClass("active");

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

contextMenu.countSubAlbums = function (photoIDs) {
	let count = 0;

	let i, j;

	if (album.albums) {
		for (i = 0; i < photoIDs.length; i++) {
			for (j = 0; j < album.albums.length; j++) {
				if (album.albums[j].id === photoIDs[i]) {
					count++;
					break;
				}
			}
		}
	}

	return count;
};

contextMenu.photoMulti = function (photoIDs, e) {
	// Notice for 'Move All':
	// fn must call basicContext.close() first,
	// in order to keep the selection and multiselect
	let subcount = contextMenu.countSubAlbums(photoIDs);
	let photocount = photoIDs.length - subcount;

	if (subcount && photocount) {
		multiselect.deselect(".photo.active, .album.active");
		multiselect.close();
		lychee.error("Please select either albums or photos!");
		return;
	}
	if (subcount) {
		contextMenu.albumMulti(photoIDs, e);
		return;
	}

	multiselect.stopResize();

	let items = [
		{ title: build.iconic("star") + lychee.locale["STAR_ALL"], fn: () => photo.setStar(photoIDs) },
		{ title: build.iconic("tag") + lychee.locale["TAGS_ALL"], fn: () => photo.editTags(photoIDs) },
		{},
		{ title: build.iconic("pencil") + lychee.locale["RENAME_ALL"], fn: () => photo.setTitle(photoIDs) },
		{
			title: build.iconic("layers") + lychee.locale["COPY_ALL_TO"],
			fn: () => {
				basicContext.close();
				contextMenu.move(photoIDs, e, photo.copyTo, "UNSORTED");
			},
		},
		{
			title: build.iconic("folder") + lychee.locale["MOVE_ALL"],
			fn: () => {
				basicContext.close();
				contextMenu.move(photoIDs, e, photo.setAlbum, "UNSORTED");
			},
		},
		{ title: build.iconic("trash") + lychee.locale["DELETE_ALL"], fn: () => photo.delete(photoIDs) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD_ALL"], fn: () => photo.getArchive(photoIDs, "FULL") },
	];

	if (!lychee.api_V2) {
		items.splice(-1);
	}

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

contextMenu.photoTitle = function (albumID, photoID, e) {
	let items = [{ title: build.iconic("pencil") + lychee.locale["RENAME"], fn: () => photo.setTitle([photoID]) }];

	let data = album.json;

	if (data.photos !== false && data.photos.length > 0) {
		items.push({});

		items = items.concat(contextMenu.buildList(data.photos, [photoID], (a) => lychee.goto(albumID + "/" + a.id)));
	}

	if (!album.isUploadable()) {
		// Remove Rename and the spacer.
		items.splice(0, 2);
	}

	basicContext.show(items, e.originalEvent, contextMenu.close);
};

contextMenu.photoMore = function (photoID, e) {
	// Show download-item when
	// a) We are allowed to upload to the album
	// b) the photo is explicitly marked as downloadable (v4-only)
	// c) or, the album is explicitly marked as downloadable
	let showDownload =
		album.isUploadable() ||
		(photo.json.hasOwnProperty("downloadable")
			? photo.json.downloadable === "1"
			: album.json && album.json.downloadable && album.json.downloadable === "1");
	let showFull = photo.json.url && photo.json.url !== "";

	let items = [
		{ title: build.iconic("fullscreen-enter") + lychee.locale["FULL_PHOTO"], visible: !!showFull, fn: () => window.open(photo.getDirectLink()) },
		{ title: build.iconic("cloud-download") + lychee.locale["DOWNLOAD"], visible: !!showDownload, fn: () => photo.getArchive([photoID]) },
	];
	// prepend further buttons if menu bar is reduced on small screens
	let button_visibility = $("#button_visibility");
	if (button_visibility && button_visibility.css("display") === "none") {
		items.unshift({
			title: build.iconic("eye") + lychee.locale["VISIBILITY_PHOTO"],
			visible: lychee.enable_button_visibility,
			fn: (event) => photo.setPublic(photo.getID(), event),
		});
	}
	let button_trash = $("#button_trash");
	if (button_trash && button_trash.css("display") === "none") {
		items.unshift({
			title: build.iconic("trash") + lychee.locale["DELETE"],
			visible: lychee.enable_button_trash,
			fn: () => photo.delete([photo.getID()]),
		});
	}
	let button_move = $("#button_move");
	if (button_move && button_move.css("display") === "none") {
		items.unshift({
			title: build.iconic("folder") + lychee.locale["MOVE_ALBUM"],
			visible: lychee.enable_button_move,
			fn: (event) => contextMenu.move([photo.getID()], event, photo.setAlbum),
		});
	}
	let button_rotate_cwise = $("#button_rotate_cwise");
	if (button_rotate_cwise && button_rotate_cwise.css("display") === "none") {
		items.unshift({
			title: build.iconic("clockwise") + lychee.locale["PHOTO_EDIT_ROTATECWISE"],
			visible: lychee.enable_button_move,
			fn: () => photoeditor.rotate(photo.getID(), 1),
		});
	}
	let button_rotate_ccwise = $("#button_rotate_ccwise");
	if (button_rotate_ccwise && button_rotate_ccwise.css("display") === "none") {
		items.unshift({
			title: build.iconic("counterclockwise") + lychee.locale["PHOTO_EDIT_ROTATECCWISE"],
			visible: lychee.enable_button_move,
			fn: () => photoeditor.rotate(photo.getID(), -1),
		});
	}

	basicContext.show(items, e.originalEvent);
};

contextMenu.getSubIDs = function (albums, albumID) {
	let ids = [parseInt(albumID, 10)];
	let a;

	for (a = 0; a < albums.length; a++) {
		if (parseInt(albums[a].parent_id, 10) === parseInt(albumID, 10)) {
			ids = ids.concat(contextMenu.getSubIDs(albums, albums[a].id));
		}

		if (albums[a].albums && albums[a].albums.length > 0) {
			ids = ids.concat(contextMenu.getSubIDs(albums[a].albums, albumID));
		}
	}

	return ids;
};

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
					exclude.push(album.getID().toString());
				}
				if (IDs.length === 1 && IDs[0] === album.getID() && album.getParent() && callback === album.setAlbum) {
					// If moving the current album, exclude its parent.
					exclude.push(album.getParent().toString());
				}
			} else if (visible.photo()) {
				exclude.push(photo.json.album.toString());
			}
			items = items.concat(contextMenu.buildList(albums, exclude.concat(IDs), (a) => callback(IDs, a.id)));
		};

		if (data.albums && data.albums.length > 0) {
			// items = items.concat(contextMenu.buildList(data.albums, [ album.getID() ], (a) => callback(IDs, a.id))); //photo.setAlbum

			addItems(data.albums);
		}

		if (data.shared_albums && data.shared_albums.length > 0 && lychee.admin) {
			items = items.concat({});
			addItems(data.shared_albums);
		}

		// Show Unsorted when unsorted is not the current album
		if (display_root && album.getID() !== "0" && !visible.albums()) {
			items.unshift({});
			items.unshift({ title: lychee.locale[kind], fn: () => callback(IDs, 0) });
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

contextMenu.sharePhoto = function (photoID, e) {
	// v4+ only
	if (photo.json.hasOwnProperty("share_button_visible") && photo.json.share_button_visible !== "1") {
		return;
	}

	let iconClass = "ionicons";

	let items = [
		{ title: build.iconic("twitter", iconClass) + "Twitter", fn: () => photo.share(photoID, "twitter") },
		{ title: build.iconic("facebook", iconClass) + "Facebook", fn: () => photo.share(photoID, "facebook") },
		{ title: build.iconic("envelope-closed") + "Mail", fn: () => photo.share(photoID, "mail") },
		{ title: build.iconic("dropbox", iconClass) + "Dropbox", visible: lychee.admin === true, fn: () => photo.share(photoID, "dropbox") },
		{ title: build.iconic("link-intact") + lychee.locale["DIRECT_LINKS"], fn: () => photo.showDirectLinks(photoID) },
	];

	basicContext.show(items, e.originalEvent);
};

contextMenu.shareAlbum = function (albumID, e) {
	// v4+ only
	if (album.json.hasOwnProperty("share_button_visible") && album.json.share_button_visible !== "1") {
		return;
	}

	let iconClass = "ionicons";

	let items = [
		{ title: build.iconic("twitter", iconClass) + "Twitter", fn: () => album.share("twitter") },
		{ title: build.iconic("facebook", iconClass) + "Facebook", fn: () => album.share("facebook") },
		{ title: build.iconic("envelope-closed") + "Mail", fn: () => album.share("mail") },
		{
			title: build.iconic("link-intact") + lychee.locale["DIRECT_LINK"],
			fn: () => {
				let url = lychee.getBaseUrl() + "r/" + albumID;
				if (album.json.password === "1") {
					// Copy the url with prefilled password param
					url += "?password=";
				}
				if (lychee.clipboardCopy(url)) {
					loadingBar.show("success", lychee.locale["URL_COPIED_TO_CLIPBOARD"]);
				}
			},
		},
	];

	basicContext.show(items, e.originalEvent);
};

contextMenu.close = function () {
	if (!visible.contextMenu()) return false;

	basicContext.close();

	multiselect.clearSelection();
	if (visible.multiselect()) {
		multiselect.close();
	}
};
