/**
 * @description Takes care of every action an album can handle and execute.
 */

let album = {
	json: null,
};

album.isSmartID = function (id) {
	return id === "unsorted" || id === "starred" || id === "public" || id === "recent";
};

album.getParent = function () {
	if (album.json == null || album.isSmartID(album.json.id) === true || !album.json.parent_id || album.json.parent_id === 0) {
		return "";
	}
	return album.json.parent_id;
};

album.getID = function () {
	let id = null;

	// this is a Lambda
	let isID = (_id) => {
		if (album.isSmartID(_id)) {
			return true;
		}
		return $.isNumeric(_id);
	};

	if (photo.json) id = photo.json.album;
	else if (album.json) id = album.json.id;
	else if (mapview.albumID) id = mapview.albumID;

	// Search
	if (isID(id) === false) id = $(".album:hover, .album.active").attr("data-id");
	if (isID(id) === false) id = $(".photo:hover, .photo.active").attr("data-album-id");

	if (isID(id) === true) return id;
	else return false;
};

album.isTagAlbum = function () {
	return album.json && album.json.tag_album && album.json.tag_album === "1";
};

album.getByID = function (photoID) {
	// Function returns the JSON of a photo

	if (photoID == null || !album.json || !album.json.photos) {
		lychee.error("Error: Album json not found !");
		return undefined;
	}

	let i = 0;
	while (i < album.json.photos.length) {
		if (parseInt(album.json.photos[i].id) === parseInt(photoID)) {
			return album.json.photos[i];
		}
		i++;
	}

	lychee.error("Error: photo " + photoID + " not found !");
	return undefined;
};

album.getSubByID = function (albumID) {
	// Function returns the JSON of a subalbum

	if (albumID == null || !album.json || !album.json.albums) {
		lychee.error("Error: Album json not found!");
		return undefined;
	}

	let i = 0;
	while (i < album.json.albums.length) {
		if (parseInt(album.json.albums[i].id) === parseInt(albumID)) {
			return album.json.albums[i];
		}
		i++;
	}

	lychee.error("Error: album " + albumID + " not found!");
	return undefined;
};

// noinspection DuplicatedCode
album.deleteByID = function (photoID) {
	if (photoID == null || !album.json || !album.json.photos) {
		lychee.error("Error: Album json not found !");
		return false;
	}

	let deleted = false;

	$.each(album.json.photos, function (i) {
		if (parseInt(album.json.photos[i].id) === parseInt(photoID)) {
			album.json.photos.splice(i, 1);
			deleted = true;
			return false;
		}
	});

	return deleted;
};

// noinspection DuplicatedCode
album.deleteSubByID = function (albumID) {
	if (albumID == null || !album.json || !album.json.albums) {
		lychee.error("Error: Album json not found !");
		return false;
	}

	let deleted = false;

	$.each(album.json.albums, function (i) {
		if (parseInt(album.json.albums[i].id) === parseInt(albumID)) {
			album.json.albums.splice(i, 1);
			deleted = true;
			return false;
		}
	});

	return deleted;
};

album.load = function (albumID, refresh = false) {
	let params = {
		albumID,
		password: "",
	};

	const processData = function (data) {
		if (data === "Warning: Wrong password!") {
			// User hit Cancel at the password prompt
			return false;
		}

		if (data === "Warning: Album private!") {
			if (document.location.hash.replace("#", "").split("/")[1] !== undefined) {
				// Display photo only
				lychee.setMode("view");
				lychee.footer_hide();
			} else {
				// Album not public
				lychee.content.show();
				lychee.footer_show();
				if (!visible.albums() && !visible.album()) lychee.goto();
			}
			return false;
		}

		album.json = data;

		if (refresh === false) {
			lychee.animate(".content", "contentZoomOut");
		}
		let waitTime = 300;

		// Skip delay when refresh is true
		// Skip delay when opening a blank Lychee
		if (refresh === true) waitTime = 0;
		if (!visible.albums() && !visible.photo() && !visible.album()) waitTime = 0;

		setTimeout(() => {
			view.album.init();

			if (refresh === false) {
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
					first_photo = $(".photo:first");
					if (first_photo.length !== 0) {
						first_photo.focus();
					}
				}
			}
		}, waitTime);
	};

	api.post("Album::get", params, function (data) {
		if (data === "Warning: Wrong password!") {
			password.getDialog(albumID, function () {
				params.password = password.value;

				api.post("Album::get", params, function (_data) {
					albums.refresh();
					processData(_data);
				});
			});
		} else {
			processData(data);
			// save scroll position for this URL
			if (data && data.albums && data.albums.length > 0) {
				setTimeout(function () {
					let urls = JSON.parse(localStorage.getItem("scroll"));
					let urlWindow = window.location.href;

					if (urls != null && urls[urlWindow]) {
						$(window).scrollTop(urls[urlWindow]);
					}
				}, 500);
			}

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
		}
	});
};

album.parse = function () {
	if (!album.json.title) album.json.title = lychee.locale["UNTITLED"];
};

album.add = function (IDs = null, callback = null) {
	const action = function (data) {
		// let title = data.title;

		const isNumber = (n) => !isNaN(parseInt(n, 10)) && isFinite(n);

		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		let params = {
			title: data.title,
			parent_id: 0,
		};

		if (visible.albums() || album.isSmartID(album.json.id)) {
			params.parent_id = 0;
		} else if (visible.album()) {
			params.parent_id = album.json.id;
		} else if (visible.photo()) {
			params.parent_id = photo.json.album;
		}

		api.post("Album::add", params, function (_data) {
			if (_data !== false && isNumber(_data)) {
				if (IDs != null && callback != null) {
					callback(IDs, _data, false); // we do not confirm
				} else {
					albums.refresh();
					lychee.goto(_data);
				}
			} else {
				lychee.error(null, params, _data);
			}
		});
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

album.addByTags = function () {
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

		let params = {
			title: data.title,
			tags: data.tags,
		};

		api.post("Album::addByTags", params, function (_data) {
			const isNumber = (n) => !isNaN(parseInt(n, 10)) && isFinite(n);
			if (_data !== false && isNumber(_data)) {
				albums.refresh();
				lychee.goto(_data);
			} else {
				lychee.error(null, params, _data);
			}
		});
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

album.setShowTags = function (albumID) {
	let oldShowTags = album.json.show_tags;

	const action = function (data) {
		if (!data.show_tags.trim()) {
			basicModal.error("show_tags");
			return;
		}

		let show_tags = data.show_tags;
		basicModal.close();

		if (visible.album()) {
			album.json.show_tags = show_tags;
			view.album.show_tags();
		}
		let params = {
			albumID: albumID,
			show_tags: show_tags,
		};

		api.post("Album::setShowTags", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			} else {
				album.reload();
			}
		});
	};

	basicModal.show({
		body: lychee.html`<p>${lychee.locale["ALBUM_NEW_SHOWTAGS"]}
							<input class='text' name='show_tags' type='text' minlength='1' placeholder='Tags' value='$${oldShowTags}'>
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

album.setTitle = function (albumIDs) {
	let oldTitle = "";
	let msg = "";

	if (!albumIDs) return false;
	if (!(albumIDs instanceof Array)) {
		albumIDs = [albumIDs];
	}

	if (albumIDs.length === 1) {
		// Get old title if only one album is selected
		if (album.json) {
			if (parseInt(album.getID()) === parseInt(albumIDs[0])) {
				oldTitle = album.json.title;
			} else oldTitle = album.getSubByID(albumIDs[0]).title;
		}
		if (!oldTitle && albums.json) oldTitle = albums.getByID(albumIDs[0]).title;
	}

	const action = function (data) {
		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		let newTitle = data.title;

		if (visible.album()) {
			if (albumIDs.length === 1 && parseInt(album.getID()) === parseInt(albumIDs[0])) {
				// Rename only one album

				album.json.title = newTitle;
				view.album.title();

				if (albums.json) albums.getByID(albumIDs[0]).title = newTitle;
			} else {
				albumIDs.forEach(function (id) {
					album.getSubByID(id).title = newTitle;
					view.album.content.titleSub(id);

					if (albums.json) albums.getByID(id).title = newTitle;
				});
			}
		} else if (visible.albums()) {
			// Rename all albums

			albumIDs.forEach(function (id) {
				albums.getByID(id).title = newTitle;
				view.albums.content.title(id);
			});
		}

		let params = {
			albumIDs: albumIDs.join(),
			title: newTitle,
		};

		api.post("Album::setTitle", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			}
		});
	};

	let input = lychee.html`<input class='text' name='title' type='text' maxlength='100' placeholder='$${lychee.locale["ALBUM_TITLE"]}' value='$${oldTitle}'>`;

	if (albumIDs.length === 1) msg = lychee.html`<p>${lychee.locale["ALBUM_NEW_TITLE"]} ${input}</p>`;
	else msg = lychee.html`<p>${lychee.locale["ALBUMS_NEW_TITLE_1"]} $${albumIDs.length} ${lychee.locale["ALBUMS_NEW_TITLE_2"]} ${input}</p>`;

	basicModal.show({
		body: msg,
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

album.setDescription = function (albumID) {
	let oldDescription = album.json.description;

	const action = function (data) {
		let description = data.description;

		basicModal.close();

		if (visible.album()) {
			album.json.description = description;
			view.album.description();
		}

		let params = {
			albumID,
			description,
		};

		api.post("Album::setDescription", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			}
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

album.toggleCover = function (photoID) {
	if (!photoID) return false;

	album.json.cover_id = album.json.cover_id === photoID ? "" : photoID;

	let params = {
		albumID: album.json.id,
		photoID: album.json.cover_id,
	};

	api.post("Album::setCover", params, function (data) {
		if (data !== true) {
			lychee.error(null, params, data);
		} else {
			view.album.content.cover(photoID);
			if (!album.getParent()) {
				albums.refresh();
			}
		}
	});
};

album.setLicense = function (albumID) {
	const callback = function () {
		$("select#license").val(album.json.license === "" ? "none" : album.json.license);
		return false;
	};

	const action = function (data) {
		let license = data.license;

		basicModal.close();

		let params = {
			albumID,
			license,
		};

		api.post("Album::setLicense", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			} else {
				if (visible.album()) {
					album.json.license = params.license;
					view.album.license();
				}
			}
		});
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

album.setSorting = function (albumID) {
	const callback = function () {
		$("select#sortingCol").val(album.json.sorting_col);
		$("select#sortingOrder").val(album.json.sorting_order);
		return false;
	};

	const action = function (data) {
		let typePhotos = data.sortingCol;
		let orderPhotos = data.sortingOrder;

		basicModal.close();

		let params = {
			albumID,
			typePhotos,
			orderPhotos,
		};

		api.post("Album::setSorting", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			} else {
				if (visible.album()) {
					album.reload();
				}
			}
		});
	};

	let msg =
		lychee.html`
	<div>
		<p>` +
		lychee.locale["SORT_PHOTO_BY_1"] +
		`
		<span class="select">
			<select id="sortingCol" name="sortingCol">
				<option value=''>-</option>
				<option value='id'>` +
		lychee.locale["SORT_PHOTO_SELECT_1"] +
		`</option>
				<option value='takestamp'>` +
		lychee.locale["SORT_PHOTO_SELECT_2"] +
		`</option>
				<option value='title'>` +
		lychee.locale["SORT_PHOTO_SELECT_3"] +
		`</option>
				<option value='description'>` +
		lychee.locale["SORT_PHOTO_SELECT_4"] +
		`</option>
				<option value='public'>` +
		lychee.locale["SORT_PHOTO_SELECT_5"] +
		`</option>
				<option value='star'>` +
		lychee.locale["SORT_PHOTO_SELECT_6"] +
		`</option>
				<option value='type'>` +
		lychee.locale["SORT_PHOTO_SELECT_7"] +
		`</option>
			</select>
		</span>
		` +
		lychee.locale["SORT_PHOTO_BY_2"] +
		`
		<span class="select">
			<select id="sortingOrder" name="sortingOrder">
				<option value='ASC'>` +
		lychee.locale["SORT_ASCENDING"] +
		`</option>
				<option value='DESC'>` +
		lychee.locale["SORT_DESCENDING"] +
		`</option>
			</select>
		</span>
		` +
		lychee.locale["SORT_PHOTO_BY_3"] +
		`
		</p>
	</div>`;

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

album.setPublic = function (albumID, e) {
	let password = "";

	if (!basicModal.visible()) {
		let msg = lychee.html`
			<form>
				<div class='switch'>
					<label>
						${lychee.locale["ALBUM_PUBLIC"]}:&nbsp;
						<input type='checkbox' name='public'>
						<span class='slider round'></span>
					</label>
					<p>${lychee.locale["ALBUM_PUBLIC_EXPL"]}</p>
				</div>
				<div class='choice'>
					<label>
						<input type='checkbox' name='full_photo'>
						<span class='checkbox'>${build.iconic("check")}</span>
						<span class='label'>${lychee.locale["ALBUM_FULL"]}</span>
					</label>
					<p>${lychee.locale["ALBUM_FULL_EXPL"]}</p>
				</div>
				<div class='choice'>
					<label>
						<input type='checkbox' name='hidden'>
						<span class='checkbox'>${build.iconic("check")}</span>
						<span class='label'>${lychee.locale["ALBUM_HIDDEN"]}</span>
					</label>
					<p>${lychee.locale["ALBUM_HIDDEN_EXPL"]}</p>
				</div>
				<div class='choice'>
					<label>
						<input type='checkbox' name='downloadable'>
						<span class='checkbox'>${build.iconic("check")}</span>
						<span class='label'>${lychee.locale["ALBUM_DOWNLOADABLE"]}</span>
					</label>
					<p>${lychee.locale["ALBUM_DOWNLOADABLE_EXPL"]}</p>
				</div>
				<div class='choice'>
					<label>
						<input type='checkbox' name='share_button_visible'>
						<span class='checkbox'>${build.iconic("check")}</span>
						<span class='label'>${lychee.locale["ALBUM_SHARE_BUTTON_VISIBLE"]}</span>
					</label>
					<p>${lychee.locale["ALBUM_SHARE_BUTTON_VISIBLE_EXPL"]}</p>
				</div>
				<div class='choice'>
					<label>
						<input type='checkbox' name='password'>
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
						<input type='checkbox' name='nsfw'>
						<span class='slider round'></span>
					</label>
					<p>${lychee.locale["ALBUM_NSFW_EXPL"]}</p>
				</div>
			</form>
		`;

		basicModal.show({
			body: msg,
			buttons: {
				action: {
					title: lychee.locale["ALBUM_SHARING_CONFIRM"],
					// Call setPublic function without showing the modal
					fn: () => album.setPublic(albumID, e),
				},
				cancel: {
					title: lychee.locale["CANCEL"],
					fn: basicModal.close,
				},
			},
		});

		$('.basicModal .switch input[name="public"]').on("click", function () {
			if ($(this).prop("checked") === true) {
				$(".basicModal .choice input").attr("disabled", false);

				if (album.json.public === "1") {
					// Initialize options based on album settings.
					if (album.json.full_photo !== null && album.json.full_photo === "1")
						$('.basicModal .choice input[name="full_photo"]').prop("checked", true);
					if (album.json.visible === "0") $('.basicModal .choice input[name="hidden"]').prop("checked", true);
					if (album.json.downloadable === "1") $('.basicModal .choice input[name="downloadable"]').prop("checked", true);
					if (album.json.share_button_visible === "1") $('.basicModal .choice input[name="share_button_visible"]').prop("checked", true);
					if (album.json.password === "1") {
						$('.basicModal .choice input[name="password"]').prop("checked", true);
						$('.basicModal .choice input[name="passwordtext"]').show();
					}
				} else {
					// Initialize options based on global settings.
					if (lychee.full_photo) {
						$('.basicModal .choice input[name="full_photo"]').prop("checked", true);
					}
					if (lychee.downloadable) {
						$('.basicModal .choice input[name="downloadable"]').prop("checked", true);
					}
					if (lychee.share_button_visible) {
						$('.basicModal .choice input[name="share_button_visible"]').prop("checked", true);
					}
				}
			} else {
				$(".basicModal .choice input").prop("checked", false).attr("disabled", true);
				$('.basicModal .choice input[name="passwordtext"]').hide();
			}
		});

		if (album.json.nsfw === "1") {
			$('.basicModal .switch input[name="nsfw"]').prop("checked", true);
		} else {
			$('.basicModal .switch input[name="nsfw"]').prop("checked", false);
		}

		if (album.json.public === "1") {
			$('.basicModal .switch input[name="public"]').click();
		} else {
			$(".basicModal .choice input").attr("disabled", true);
		}

		$('.basicModal .choice input[name="password"]').on("change", function () {
			if ($(this).prop("checked") === true) $('.basicModal .choice input[name="passwordtext"]').show().focus();
			else $('.basicModal .choice input[name="passwordtext"]').hide();
		});

		return true;
	}

	albums.refresh();

	// Set public
	if ($('.basicModal .switch input[name="nsfw"]:checked').length === 1) {
		album.json.nsfw = "1";
	} else {
		album.json.nsfw = "0";
	}

	// Set public
	if ($('.basicModal .switch input[name="public"]:checked').length === 1) {
		album.json.public = "1";
	} else {
		album.json.public = "0";
	}

	// Set full photo
	if ($('.basicModal .choice input[name="full_photo"]:checked').length === 1) {
		album.json.full_photo = "1";
	} else {
		album.json.full_photo = "0";
	}

	// Set visible
	if ($('.basicModal .choice input[name="hidden"]:checked').length === 1) {
		album.json.visible = "0";
	} else {
		album.json.visible = "1";
	}

	// Set downloadable
	if ($('.basicModal .choice input[name="downloadable"]:checked').length === 1) {
		album.json.downloadable = "1";
	} else {
		album.json.downloadable = "0";
	}

	// Set share_button_visible
	if ($('.basicModal .choice input[name="share_button_visible"]:checked').length === 1) {
		album.json.share_button_visible = "1";
	} else {
		album.json.share_button_visible = "0";
	}

	// Set password
	let oldPassword = album.json.password;
	if ($('.basicModal .choice input[name="password"]:checked').length === 1) {
		password = $('.basicModal .choice input[name="passwordtext"]').val();
		album.json.password = "1";
	} else {
		password = "";
		album.json.password = "0";
	}

	// Modal input has been processed, now it can be closed
	basicModal.close();

	// Set data and refresh view
	if (visible.album()) {
		view.album.nsfw();
		view.album.public();
		view.album.hidden();
		view.album.downloadable();
		view.album.shareButtonVisible();
		view.album.password();
	}

	let params = {
		albumID,
		full_photo: album.json.full_photo,
		public: album.json.public,
		nsfw: album.json.nsfw,
		visible: album.json.visible,
		downloadable: album.json.downloadable,
		share_button_visible: album.json.share_button_visible,
	};
	if (oldPassword !== album.json.password || password.length > 0) {
		// We send the password only if there's been a change; that way the
		// server will keep the current password if it wasn't changed.
		params.password = password;
	}

	api.post("Album::setPublic", params, function (data) {
		if (data !== true) lychee.error(null, params, data);
	});
};

album.shareUsers = function (albumID, e) {

	if (!basicModal.visible()) {
		let msg = `<form id="sharing_people_form">
			<p>${lychee.locale["WAIT_FETCH_DATA"]}</p>
		</form>`

		api.post("User::List", {}, (users) => {
			$("#sharing_people_form").empty()
			if (users !== {}) {
				$.each(users, (_, user) => {
					$("#sharing_people_form").append(`<div class='choice'>
						<label>
							<input type='checkbox' name='${user.id}'>
							<span class='checkbox'>${build.iconic("check")}</span>
							<span class='label'>${user.username}</span>
						</label>
						<p></p>
					</div>`)
				});
				api.post("Sharing::List", {}, (data) => {
					if (data !== undefined && data.shared !== []) {
						var sharingOfAlbum = data.shared.filter(val => val.album_id == albumID)
						sharingOfAlbum.forEach(sharing => {
							$(`.basicModal .choice input[name="${sharing.user_id}"]`).prop('checked', true);
						})
					}
				});
			} else {
				$("#sharing_people_form").append(`<p>${lychee.locale["SHARING_ALBUM_USERS_NO_USERS"]}</p>`)
			}
		});

		basicModal.show({
			body: msg,
			buttons: {
				action: {
					title: lychee.locale["ALBUM_SHARING_CONFIRM"],
					fn: (data) => {
						console.log(data);
					},
				},
				cancel: {
					title: lychee.locale["CANCEL"],
					fn: basicModal.close,
				},
			},
		});
		return true;
	}

};

album.setNSFW = function (albumID, e) {
	album.json.nsfw = album.json.nsfw === "0" ? "1" : "0";

	view.album.nsfw();

	let params = {
		albumID: albumID,
	};

	api.post("Album::setNSFW", params, function (data) {
		if (data !== true) {
			lychee.error(null, params, data);
		} else {
			albums.refresh();
		}
	});
};

album.share = function (service) {
	if (album.json.hasOwnProperty("share_button_visible") && album.json.share_button_visible !== "1") {
		return;
	}

	let url = location.href;

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

album.getArchive = function (albumIDs) {
	let link = "";

	// double check with API_V2 this will not work...
	if (lychee.api_V2) {
		location.href = api.get_url("Album::getArchive") + lychee.html`?albumIDs=${albumIDs.join()}`;
	} else {
		let url = `${api.path}?function=Album::getArchive&albumID=${albumIDs[0]}`;

		if (location.href.indexOf("index.html") > 0) link = location.href.replace(location.hash, "").replace("index.html", url);
		else link = location.href.replace(location.hash, "") + url;

		if (lychee.publicMode === true) link += `&password=${encodeURIComponent(password.value)}`;

		location.href = link;
	}
};

album.buildMessage = function (albumIDs, albumID, op1, op2, ops) {
	let title = "";
	let sTitle = "";
	let msg = "";

	if (!albumIDs) return false;
	if (albumIDs instanceof Array === false) albumIDs = [albumIDs];

	// Get title of first album
	if (parseInt(albumID, 10) === 0) {
		title = lychee.locale["ROOT"];
	} else if (albums.json) {
		album1 = albums.getByID(albumID);
		if (album1) {
			title = album1.title;
		}
	}

	// Fallback for first album without a title
	if (title === "") title = lychee.locale["UNTITLED"];

	if (albumIDs.length === 1) {
		// Get title of second album
		if (albums.json) {
			album2 = albums.getByID(albumIDs[0]);
			if (album2) {
				sTitle = album2.title;
			}
		}

		// Fallback for second album without a title
		if (sTitle === "") sTitle = lychee.locale["UNTITLED"];

		msg = lychee.html`<p>${lychee.locale[op1]} '$${sTitle}' ${lychee.locale[op2]} '$${title}'?</p>`;
	} else {
		msg = lychee.html`<p>${lychee.locale[ops]} '$${title}'?</p>`;
	}

	return msg;
};

album.delete = function (albumIDs) {
	let action = {};
	let cancel = {};
	let msg = "";

	if (!albumIDs) return false;
	if (albumIDs instanceof Array === false) albumIDs = [albumIDs];

	action.fn = function () {
		basicModal.close();

		let params = {
			albumIDs: albumIDs.join(),
		};

		api.post("Album::delete", params, function (data) {
			if (visible.albums()) {
				albumIDs.forEach(function (id) {
					view.albums.content.delete(id);
					albums.deleteByID(id);
				});
			} else if (visible.album()) {
				albums.refresh();
				if (albumIDs.length === 1 && album.getID() == albumIDs[0]) {
					lychee.goto(album.getParent());
				} else {
					albumIDs.forEach(function (id) {
						album.deleteSubByID(id);
						view.album.content.deleteSub(id);
					});
				}
			}

			if (data !== true) lychee.error(null, params, data);
		});
	};

	if (albumIDs.toString() === "unsorted") {
		action.title = lychee.locale["CLEAR_UNSORTED"];
		cancel.title = lychee.locale["KEEP_UNSORTED"];

		msg = `<p>` + lychee.locale["DELETE_UNSORTED_CONFIRM"] + `</p>`;
	} else if (albumIDs.length === 1) {
		let albumTitle = "";

		action.title = lychee.locale["DELETE_ALBUM_QUESTION"];
		cancel.title = lychee.locale["KEEP_ALBUM"];

		// Get title
		if (album.json) {
			if (parseInt(album.getID()) === parseInt(albumIDs[0])) {
				albumTitle = album.json.title;
			} else albumTitle = album.getSubByID(albumIDs[0]).title;
		}
		if (!albumTitle && albums.json) albumTitle = albums.getByID(albumIDs).title;

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

album.merge = function (albumIDs, albumID, confirm = true) {
	const action = function () {
		basicModal.close();
		albumIDs.unshift(albumID);

		let params = {
			albumIDs: albumIDs.join(),
		};

		api.post("Album::merge", params, function (data) {
			if (data !== true) {
				lychee.error(null, params, data);
			} else {
				album.reload();
			}
		});
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

album.setAlbum = function (albumIDs, albumID, confirm = true) {
	const action = function () {
		basicModal.close();
		albumIDs.unshift(albumID);

		let params = {
			albumIDs: albumIDs.join(),
		};

		api.post("Album::move", params, function (data) {
			if (data !== true) {
				lychee.error(null, params, data);
			} else {
				album.reload();
			}
		});
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

album.apply_nsfw_filter = function () {
	if (lychee.nsfw_visible) {
		$('.album[data-nsfw="1"]').show();
	} else {
		$('.album[data-nsfw="1"]').hide();
	}
};

album.toggle_nsfw_filter = function () {
	lychee.nsfw_visible = !lychee.nsfw_visible;
	album.apply_nsfw_filter();
	return false;
};

album.isUploadable = function () {
	if (lychee.admin) {
		return true;
	}
	if (lychee.publicMode || !lychee.upload) {
		return false;
	}

	// For special cases of no album / smart album / etc. we return true.
	// It's only for regular non-matching albums that we return false.
	if (album.json === null || !album.json.owner) {
		return true;
	}

	return album.json.owner === lychee.username;
};

album.reload = function () {
	let albumID = album.getID();

	album.refresh();
	albums.refresh();

	if (visible.album()) lychee.goto(albumID);
	else lychee.goto();
};

album.refresh = function () {
	album.json = null;
};
