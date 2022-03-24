/**
 * @description Takes care of every action an album can handle and execute.
 */

let album = {
	json: null,
};

album.isSmartID = function (id) {
	return id === "unsorted" || id === "starred" || id === "public" || id === "recent";
};

album.isModelID = function (id) {
	return typeof id === "string" && id.length === 24;
};

album.getParentID = function () {
	if (album.json == null || album.isSmartID(album.json.id) === true || !album.json.parent_id) {
		return null;
	}
	return album.json.parent_id;
};

/**
 * @return {?string}
 */
album.getID = function () {
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

album.isTagAlbum = function () {
	return album.json && album.json.is_tag_album && album.json.is_tag_album === true;
};

album.getByID = function (photoID) {
	// Function returns the JSON of a photo

	if (photoID == null || !album.json || !album.json.photos) {
		lychee.error("Error: Album json not found !");
		return null;
	}

	let i = 0;
	while (i < album.json.photos.length) {
		if (album.json.photos[i].id === photoID) {
			return album.json.photos[i];
		}
		i++;
	}

	lychee.error("Error: photo " + photoID + " not found !");
	return null;
};

album.getSubByID = function (albumID) {
	// Function returns the JSON of a subalbum

	if (albumID == null || !album.json || !album.json.albums) {
		lychee.error("Error: Album json not found!");
		return undefined;
	}

	let i = 0;
	while (i < album.json.albums.length) {
		if (album.json.albums[i].id === albumID) {
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
		if (album.json.photos[i].id === photoID) {
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
		if (album.json.albums[i].id === albumID) {
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

	api.post(
		"Album::get",
		params,
		function (data) {
			processData(data);

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
		},
		null,
		function (jqXHR) {
			if (jqXHR.status === 403) {
				password.getDialog(albumID, function () {
					params.password = password.value;

					api.post("Album::get", params, function (_data) {
						albums.refresh();
						processData(_data);
					});
				});
				return true;
			}
			return false;
		}
	);
};

album.parse = function () {
	if (!album.json.title) album.json.title = lychee.locale["UNTITLED"];
};

album.add = function (IDs = null, callback = null) {
	const action = function (data) {
		// let title = data.title;

		const isModelID = (albumID) => typeof albumID === "string" && albumID.length === 24;

		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		let params = {
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

		api.post("Album::add", params, function (_data) {
			if (_data && isModelID(_data.id)) {
				if (IDs != null && callback != null) {
					callback(IDs, _data, false); // we do not confirm
				} else {
					albums.refresh();
					lychee.goto(_data.id);
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
			const isModelID = (albumID) => typeof albumID === "string" && albumID.length === 24;
			if (_data && isModelID(_data.id)) {
				albums.refresh();
				lychee.goto(_data.id);
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
			if (_data) {
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
			if (album.getID() === albumIDs[0]) {
				oldTitle = album.json.title;
			} else oldTitle = album.getSubByID(albumIDs[0]).title;
		}
		if (!oldTitle) {
			let a = albums.getByID(albumIDs[0]);
			if (a) oldTitle = a.title;
		}
	}

	const action = function (data) {
		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		let newTitle = data.title;

		if (visible.album()) {
			if (albumIDs.length === 1 && album.getID() === albumIDs[0]) {
				// Rename only one album

				album.json.title = newTitle;
				view.album.title();

				let a = albums.getByID(albumIDs[0]);
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
				let a = albums.getByID(id);
				if (a) a.title = newTitle;
				view.albums.content.title(id);
			});
		}

		let params = {
			albumIDs: albumIDs.join(),
			title: newTitle,
		};

		api.post("Album::setTitle", params, function (_data) {
			if (_data) {
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
	let oldDescription = album.json.description ? album.json.description : "";

	const action = function (data) {
		let description = data.description ? data.description : null;

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
			if (_data) {
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

	album.json.cover_id = album.json.cover_id === photoID ? null : photoID;

	let params = {
		albumID: album.json.id,
		photoID: album.json.cover_id,
	};

	api.post("Album::setCover", params, function (data) {
		if (data) {
			lychee.error(null, params, data);
		} else {
			view.album.content.cover(photoID);
			if (!album.getParentID()) {
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
			if (_data) {
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
		$("select#sortingOrder").val(album.json.sorting_order === null ? "ASC" : album.json.sorting_order);
		return false;
	};

	const action = function (data) {
		let sortingCol = data.sortingCol;
		let sortingOrder = data.sortingOrder;

		basicModal.close();

		let params = {
			albumID,
			sortingCol,
			sortingOrder,
		};

		api.post("Album::setSorting", params, function (_data) {
			if (visible.album()) {
				album.reload();
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
				<option value='created_at'>` +
		lychee.locale["SORT_PHOTO_SELECT_1"] +
		`</option>
				<option value='taken_at'>` +
		lychee.locale["SORT_PHOTO_SELECT_2"] +
		`</option>
				<option value='title'>` +
		lychee.locale["SORT_PHOTO_SELECT_3"] +
		`</option>
				<option value='description'>` +
		lychee.locale["SORT_PHOTO_SELECT_4"] +
		`</option>
				<option value='is_public'>` +
		lychee.locale["SORT_PHOTO_SELECT_5"] +
		`</option>
				<option value='is_starred'>` +
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

		$('.basicModal .switch input[name="is_public"]').on("click", function () {
			if ($(this).prop("checked") === true) {
				$(".basicModal .choice input").attr("disabled", false);

				if (album.json.is_public) {
					// Initialize options based on album settings.
					if (album.json.grants_full_photo) $('.basicModal .choice input[name="grants_full_photo"]').prop("checked", true);
					if (album.json.requires_link) $('.basicModal .choice input[name="requires_link"]').prop("checked", true);
					if (album.json.is_downloadable) $('.basicModal .choice input[name="is_downloadable"]').prop("checked", true);
					if (album.json.is_share_button_visible) $('.basicModal .choice input[name="is_share_button_visible"]').prop("checked", true);
					if (album.json.has_password) {
						$('.basicModal .choice input[name="has_password"]').prop("checked", true);
						$('.basicModal .choice input[name="passwordtext"]').show();
					}
				} else {
					// Initialize options based on global settings.
					if (lychee.grants_full_photo) {
						$('.basicModal .choice input[name="grants_full_photo"]').prop("checked", true);
					}
					if (lychee.is_downloadable) {
						$('.basicModal .choice input[name="is_downloadable"]').prop("checked", true);
					}
					if (lychee.is_share_button_visible) {
						$('.basicModal .choice input[name="is_share_button_visible"]').prop("checked", true);
					}
				}
			} else {
				$(".basicModal .choice input").prop("checked", false).attr("disabled", true);
				$('.basicModal .choice input[name="passwordtext"]').hide();
			}
		});

		if (album.json.is_nsfw) {
			$('.basicModal .switch input[name="is_nsfw"]').prop("checked", true);
		} else {
			$('.basicModal .switch input[name="is_nsfw"]').prop("checked", false);
		}

		if (album.json.is_public) {
			$('.basicModal .switch input[name="is_public"]').click();
		} else {
			$(".basicModal .choice input").attr("disabled", true);
		}

		$('.basicModal .choice input[name="has_password"]').on("change", function () {
			if ($(this).prop("checked") === true) $('.basicModal .choice input[name="passwordtext"]').show().focus();
			else $('.basicModal .choice input[name="passwordtext"]').hide();
		});

		return true;
	}

	albums.refresh();

	// Set public
	album.json.is_nsfw = $('.basicModal .switch input[name="is_nsfw"]:checked').length === 1;

	// Set public
	album.json.is_public = $('.basicModal .switch input[name="is_public"]:checked').length === 1;

	// Set full photo
	album.json.grants_full_photo = $('.basicModal .choice input[name="grants_full_photo"]:checked').length === 1;

	// Set visible
	album.json.requires_link = $('.basicModal .choice input[name="requires_link"]:checked').length === 1;

	// Set downloadable
	album.json.is_downloadable = $('.basicModal .choice input[name="is_downloadable"]:checked').length === 1;

	// Set share_button_visible
	album.json.is_share_button_visible = $('.basicModal .choice input[name="is_share_button_visible"]:checked').length === 1;

	// Set password
	let oldPassword = album.json.password;
	if ($('.basicModal .choice input[name="has_password"]:checked').length === 1) {
		password = $('.basicModal .choice input[name="passwordtext"]').val();
		album.json.has_password = true;
	} else {
		password = "";
		album.json.has_password = false;
	}

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

	let params = {
		albumID,
		grants_full_photo: album.json.grants_full_photo,
		is_public: album.json.is_public,
		is_nsfw: album.json.is_nsfw,
		requires_link: album.json.requires_link,
		is_downloadable: album.json.is_downloadable,
		is_share_button_visible: album.json.is_share_button_visible,
	};
	if (oldPassword !== album.json.password || password.length > 0) {
		// We send the password only if there's been a change; that way the
		// server will keep the current password if it wasn't changed.
		params.password = password;
	}

	api.post("Album::setPublic", params, null);
};

album.shareUsers = function (albumID, e) {
	if (!basicModal.visible()) {
		let msg = `<form id="sharing_people_form">
			<p>${lychee.locale["WAIT_FETCH_DATA"]}</p>
		</form>`;

		api.post("Sharing::List", {}, (data) => {
			const sharingForm = $("#sharing_people_form");
			sharingForm.empty();
			if (data !== undefined) {
				if (data.users !== undefined) {
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
					var sharingOfAlbum = data.shared !== undefined ? data.shared.filter((val) => val.album_id === albumID) : [];
					sharingOfAlbum.forEach((sharing) => {
						// Check all the shares who already exists, and store their sharing id on the element
						var elem = $(`.basicModal .choice input[name="${sharing.user_id}"]`);
						elem.prop("checked", true);
						elem.data("sharingId", sharing.id);
					});
				} else {
					sharingForm.append(`<p>${lychee.locale["SHARING_ALBUM_USERS_NO_USERS"]}</p>`);
				}
			}
		});

		basicModal.show({
			body: msg,
			buttons: {
				action: {
					title: lychee.locale["ALBUM_SHARING_CONFIRM"],
					fn: (data) => {
						album.shareUsers(albumID, e);
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

	basicModal.close();

	var sharingToAdd = [];
	var sharingToDelete = [];
	$(".basicModal .choice input").each((_, input) => {
		var $input = $(input);
		if ($input.is(":checked")) {
			if ($input.data("sharingId") === undefined) {
				// Input is checked but has no sharing id => new share to create
				sharingToAdd.push(input.name);
			}
		} else {
			var sharingId = $input.data("sharingId");
			if (sharingId !== undefined) {
				// Input is not checked but has a sharing id => existing share to remove
				sharingToDelete.push(sharingId);
			}
		}
	});

	if (sharingToDelete.length > 0) {
		var params = { ShareIDs: sharingToDelete.join(",") };
		api.post("Sharing::Delete", params, function (data) {
			if (data !== true) {
				loadingBar.show("error", data.description);
				lychee.error(null, params, data);
			}
		});
	}
	if (sharingToAdd.length > 0) {
		var params = {
			albumIDs: albumID,
			UserIDs: sharingToAdd.join(","),
		};
		api.post("Sharing::Add", params, (data) => {
			if (data !== true) {
				loadingBar.show("error", data.description);
				lychee.error(null, params, data);
			} else {
				loadingBar.show("success", "Sharing updated!");
			}
		});
	}

	return true;
};

album.setNSFW = function (albumID, e) {
	album.json.is_nsfw = !album.json.is_nsfw;

	view.album.nsfw();

	let params = {
		albumID: albumID,
	};

	api.post("Album::setNSFW", params, function (data) {
		if (data) {
			lychee.error(null, params, data);
		} else {
			albums.refresh();
		}
	});
};

album.share = function (service) {
	if (album.json.hasOwnProperty("is_share_button_visible") && !album.json.is_share_button_visible) {
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
	location.href = "api/Album::getArchive" + lychee.html`?albumIDs=${albumIDs.join()}`;
};

album.buildMessage = function (albumIDs, albumID, op1, op2, ops) {
	let title = "";
	let sTitle = "";
	let msg = "";

	if (!albumIDs) return false;
	if (!(albumIDs instanceof Array)) albumIDs = [albumIDs];

	// Get title of first album
	if (albumID === null) {
		title = lychee.locale["ROOT"];
	} else {
		album1 = albums.getByID(albumID);
		if (album1) {
			title = album1.title;
		}
	}

	// Fallback for first album without a title
	if (title === "") title = lychee.locale["UNTITLED"];

	if (albumIDs.length === 1) {
		// Get title of second album
		album2 = albums.getByID(albumIDs[0]);
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

album.delete = function (albumIDs) {
	let action = {};
	let cancel = {};
	let msg = "";

	if (!albumIDs) return false;
	if (!(albumIDs instanceof Array)) albumIDs = [albumIDs];

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
				if (albumIDs.toString() === "unsorted") {
					album.reload();
				} else {
					albums.refresh();
					if (albumIDs.length === 1 && album.getID() == albumIDs[0]) {
						lychee.goto(album.getParentID());
					} else {
						albumIDs.forEach(function (id) {
							album.deleteSubByID(id);
							view.album.content.deleteSub(id);
						});
					}
				}
			}

			if (typeof data !== "undefined") lychee.error(null, params, data);
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

album.merge = function (albumIDs, albumID, confirm = true) {
	const action = function () {
		basicModal.close();

		let params = {
			albumID: albumID,
			albumIDs: albumIDs.join(),
		};

		api.post("Album::merge", params, function (data) {
			if (data) {
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

		let params = {
			albumID: albumID,
			albumIDs: albumIDs.join(),
		};

		api.post("Album::move", params, function (data) {
			if (data) {
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
	if (lychee.publicMode || !lychee.may_upload) {
		return false;
	}

	// For special cases of no album / smart album / etc. we return true.
	// It's only for regular non-matching albums that we return false.
	if (album.json === null || !album.json.owner_name) {
		return true;
	}

	return album.json.owner_name === lychee.username;
};

album.updatePhoto = function (data) {
	let deepCopySizeVariant = function (src) {
		if (src === undefined || src === null) return null;
		let result = {};
		result.url = src.url;
		result.width = src.width;
		result.height = src.height;
		result.filesize = src.filesize;
		return result;
	};

	if (album.json) {
		$.each(album.json.photos, function () {
			if (this.id === data.id) {
				// Deep copy size variants
				this.size_variants = {
					thumb: null,
					thumb2x: null,
					small: null,
					small2x: null,
					medium: null,
					medium2x: null,
					original: null,
				};
				if (data.size_variants !== undefined && data.size_variants !== null) {
					this.size_variants.thumb = deepCopySizeVariant(data.size_variants.thumb);
					this.size_variants.thumb2x = deepCopySizeVariant(data.size_variants.thumb2x);
					this.size_variants.small = deepCopySizeVariant(data.size_variants.small);
					this.size_variants.small2x = deepCopySizeVariant(data.size_variants.small2x);
					this.size_variants.medium = deepCopySizeVariant(data.size_variants.medium);
					this.size_variants.medium2x = deepCopySizeVariant(data.size_variants.medium2x);
					this.size_variants.original = deepCopySizeVariant(data.size_variants.original);
				}
				view.album.content.updatePhoto(this);
				albums.refresh();
				return false;
			}
			return true;
		});
	}
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
