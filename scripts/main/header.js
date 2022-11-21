/**
 * @description This module takes care of the header.
 */

/**
 * @namespace
 * @property {jQuery} _dom
 */
const header = {
	_dom: $("#lychee_toolbar_container"),
};

/**
 * @param {?string} [selector=null]
 * @returns {jQuery}
 */
header.dom = function (selector) {
	if (selector == null || selector === "") return header._dom;
	return header._dom.find(selector);
};

/**
 * @returns {void}
 */
header.bind = function () {
	// Event Name
	const eventName = "click touchend";

	header.dom(".header__title").on(eventName, function (e) {
		if ($(this).hasClass("header__title--editable") === false) return false;

		if (lychee.enable_contextmenu_header === false) return false;

		if (visible.photo()) contextMenu.photoTitle(album.getID(), photo.getID(), e);
		else contextMenu.albumTitle(album.getID(), e);
	});

	header.dom("#button_visibility").on(eventName, function () {
		photo.setProtectionPolicy(photo.getID());
	});
	header.dom("#button_share").on(eventName, function (e) {
		contextMenu.sharePhoto(photo.getID(), e);
	});

	header.dom("#button_visibility_album").on(eventName, function () {
		album.setProtectionPolicy(album.getID());
	});

	header.dom("#button_sharing_album_users").on(eventName, function () {
		album.shareUsers(album.getID());
	});

	header.dom("#button_share_album").on(eventName, function (e) {
		contextMenu.shareAlbum(album.getID(), e);
	});

	header.dom("#button_signin").on(eventName, lychee.loginDialog);
	header.dom("#button_settings").on(eventName, function (e) {
		// Querying the CSS of an element is highly inefficient.
		// Instead, we should use the same media query here as in the CSS.
		// TODO: Fix this.
		if ($("#lychee_left_menu_container").css("display") === "none") {
			// left menu disabled on small screens
			contextMenu.config(e);
		} else {
			// standard left menu
			leftMenu.open();
		}
	});
	header.dom("#button_close_config").on(eventName, function () {
		tabindex.makeFocusable(header.dom());
		tabindex.makeFocusable(lychee.content);
		tabindex.makeUnfocusable(leftMenu._dom);
		multiselect.bind();
		lychee.load();
	});
	header.dom("#button_info_album").on(eventName, function () {
		sidebar.toggle(true);
	});
	header.dom("#button_info").on(eventName, function () {
		sidebar.toggle(true);
	});
	header.dom(".button--map-albums").on(eventName, function () {
		lychee.gotoMap();
	});
	header.dom("#button_map_album").on(eventName, function () {
		lychee.gotoMap(album.getID());
	});
	header.dom("#button_map").on(eventName, function () {
		lychee.gotoMap(album.getID());
	});
	header.dom(".button_add").on(eventName, contextMenu.add);
	header.dom("#button_more").on(eventName, function (e) {
		contextMenu.photoMore(photo.getID(), e);
	});
	header.dom("#button_move_album").on(eventName, function (e) {
		contextMenu.move([album.getID()], e, album.setAlbum, "ROOT", album.getParentID() != null);
	});
	header.dom("#button_nsfw_album").on(eventName, function () {
		album.toggleNSFW();
	});
	header.dom("#button_move").on(eventName, function (e) {
		contextMenu.move([photo.getID()], e, photo.setAlbum);
	});
	header.dom(".header__hostedwith").on(eventName, function () {
		window.open(lychee.website);
	});
	header.dom("#button_trash_album").on(eventName, function () {
		album.delete([album.getID()]);
	});
	header.dom("#button_trash").on(eventName, function () {
		photo.delete([photo.getID()]);
	});
	header.dom("#button_archive").on(eventName, function () {
		album.getArchive([album.getID()]);
	});
	header.dom("#button_star").on(eventName, function () {
		photo.toggleStar();
	});
	header.dom("#button_rotate_ccwise").on(eventName, function () {
		photoeditor.rotate(photo.getID(), -1);
	});
	header.dom("#button_rotate_cwise").on(eventName, function () {
		photoeditor.rotate(photo.getID(), 1);
	});
	header.dom("#button_back_home").on(eventName, function () {
		if (!album.json.parent_id) {
			lychee.goto();
		} else {
			lychee.goto(album.getParentID());
		}
	});
	header.dom("#button_back").on(eventName, function () {
		lychee.goto(album.getID());
	});
	header.dom("#button_back_map").on(eventName, function () {
		lychee.goto(album.getID());
	});
	header.dom("#button_fs_album_enter,#button_fs_enter").on(eventName, lychee.fullscreenEnter);
	header.dom("#button_fs_album_exit,#button_fs_exit").on(eventName, lychee.fullscreenExit).hide();

	header.dom(".header__search").on("keyup click", function () {
		if ($(this).val().length > 0) {
			lychee.goto(SearchAlbumIDPrefix + "/" + encodeURIComponent($(this).val()));
		} else if (search.json !== null) {
			search.reset();
		}
	});
	header.dom(".header__clear").on(eventName, function () {
		search.reset();
	});

	header.bind_back();
};

/**
 * @returns {void}
 */
header.bind_back = function () {
	header.dom(".header__title").on("click touchend", function () {
		if (lychee.landing_page_enable && visible.albums()) {
			window.location.href = ".";
		} else {
			return false;
		}
	});
};

/**
 * @returns {void}
 */
header.show = function () {
	lychee.imageview.removeClass("full");
	header.dom().removeClass("hidden");

	tabindex.restoreSettings(header.dom());
};

/**
 * @returns {void}
 */
header.hideIfLivePhotoNotPlaying = function () {
	// Hides the header, if current live photo is not playing
	if (!photo.isLivePhotoPlaying()) header.hide();
};

/**
 * @returns {void}
 */
header.hide = function () {
	if (visible.photo() && !visible.sidebar() && !visible.contextMenu() && basicModal.isVisible() === false) {
		tabindex.saveSettings(header.dom());
		tabindex.makeUnfocusable(header.dom());

		lychee.imageview.addClass("full");
		header.dom().addClass("hidden");
	}
};

/**
 * @param {string} title
 * @returns {void}
 */
header.setTitle = function (title) {
	let $title = header.dom(".header__title");
	let html = lychee.html`$${title}${build.iconic("caret-bottom")}`;

	$title.html(html);
};

/**
 * Applies the "mode" of the application to the header.
 *
 * Note, in contrast to {@link lychee.setMode} this method does **not**
 * support the mode "view".
 * Reminder: The mode "view" is used to display a single photo in Lychee's
 * special "view" mode which is somewhat similar to "public" for albums.
 * In lack of a dedicated "view" mode here, the method must be called with
 * `mode === "photo"` (even in "view" mode) and then this method internally
 * depends on {@link lychee.publicMode} being set to hide certain buttons.
 * Note: This strange design decision has (assumingly) been made, because
 * both the view and photo mode call {@link view.photo.show} which in turn
 * calls this method and passes `"photo"` as the parameter in both cases.
 *
 * @param {string} mode either one out of `"public"`, `"albums"`, `"album"`,
 *                      `"photo"`, `"map"` or `"config"`
 * @returns {void}
 */
header.setMode = function (mode) {
	if (mode === "albums" && lychee.publicMode === true) mode = "public";

	switch (mode) {
		case "public":
			header.dom(".toolbar").removeClass("visible");
			header.dom("#lychee_toolbar_public").addClass("visible");
			tabindex.makeUnfocusable(header.dom(".toolbar"));
			tabindex.makeFocusable(header.dom("#lychee_toolbar_public"));

			if (lychee.public_search) {
				const e = $(".header__search, .header__clear", "#lychee_toolbar_public");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $(".header__search, .header__clear", "#lychee_toolbar_public");
				e.hide();
				tabindex.makeUnfocusable(e);
			}

			// Set icon in Public mode
			if (lychee.map_display_public) {
				const e = $(".button--map-albums", "#lychee_toolbar_public");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $(".button--map-albums", "#lychee_toolbar_public");
				e.hide();
				tabindex.makeUnfocusable(e);
			}

			// Set focus on login button
			if (lychee.active_focus_on_page_load) {
				$("#button_signin").focus();
			}
			return;

		case "albums":
			header.dom(".toolbar").removeClass("visible");
			header.dom("#lychee_toolbar_albums").addClass("visible");
			tabindex.makeUnfocusable(header.dom(".toolbar"));
			tabindex.makeFocusable(header.dom("#lychee_toolbar_albums"));

			// If map is disabled, we should hide the icon
			if (lychee.map_display) {
				const e = $(".button--map-albums", "#lychee_toolbar_albums");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $(".button--map-albums", "#lychee_toolbar_albums");
				e.hide();
				tabindex.makeUnfocusable(e);
			}

			if (lychee.enable_button_add && lychee.rights.may_upload) {
				const e = $(".button_add", "#lychee_toolbar_albums");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $(".button_add", "#lychee_toolbar_albums");
				e.remove();
			}

			return;

		case "album":
			const albumID = album.getID();

			header.dom(".toolbar").removeClass("visible");
			header.dom("#lychee_toolbar_album").addClass("visible");
			tabindex.makeUnfocusable(header.dom(".toolbar"));
			tabindex.makeFocusable(header.dom("#lychee_toolbar_album"));

			// Hide download button when album empty or we are not allowed to
			// upload to it and it's not explicitly marked as downloadable.
			if (
				!album.json ||
				(album.json.photos.length === 0 && album.json.albums && album.json.albums.length === 0) ||
				(!album.isUploadable() && !album.json.is_downloadable)
			) {
				const e = $("#button_archive");
				e.hide();
				tabindex.makeUnfocusable(e);
			} else {
				const e = $("#button_archive");
				e.show();
				tabindex.makeFocusable(e);
			}

			if (
				album.json &&
				album.json.is_share_button_visible === false &&
				// The owner of an album (or the admin) shall always see
				// the share button and be unaffected by the settings of
				// the album
				(lychee.user === null || lychee.user.username !== album.json.owner_name) &&
				!lychee.rights.is_admin
			) {
				const e = $("#button_share_album");
				e.hide();
				tabindex.makeUnfocusable(e);
			} else {
				const e = $("#button_share_album");
				e.show();
				tabindex.makeFocusable(e);
			}

			// If map is disabled, we should hide the icon
			if (lychee.publicMode === true ? lychee.map_display_public : lychee.map_display) {
				const e = $("#button_map_album");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $("#button_map_album");
				e.hide();
				tabindex.makeUnfocusable(e);
			}

			if (albumID === SmartAlbumID.STARRED || albumID === SmartAlbumID.PUBLIC || albumID === SmartAlbumID.RECENT) {
				$(
					"#button_nsfw_album, #button_info_album, #button_trash_album, #button_visibility_album, #button_sharing_album_users, #button_move_album"
				).hide();
				if (album.isUploadable()) {
					$(".button_add, .header__divider", "#lychee_toolbar_album").show();
					tabindex.makeFocusable($(".button_add, .header__divider", "#lychee_toolbar_album"));
				} else {
					$(".button_add, .header__divider", "#lychee_toolbar_album").hide();
					tabindex.makeUnfocusable($(".button_add, .header__divider", "#lychee_toolbar_album"));
				}
				tabindex.makeUnfocusable(
					$(
						"#button_nsfw_album, #button_info_album, #button_trash_album, #button_visibility_album, #button_sharing_album_users, #button_move_album"
					)
				);
			} else if (albumID === SmartAlbumID.UNSORTED) {
				$("#button_nsfw_album, #button_info_album, #button_visibility_album, #button_sharing_album_users, #button_move_album").hide();
				$("#button_trash_album, .button_add, .header__divider", "#lychee_toolbar_album").show();
				tabindex.makeFocusable($("#button_trash_album, .button_add, .header__divider", "#lychee_toolbar_album"));
				tabindex.makeUnfocusable(
					$("#button_nsfw_album, #button_info_album, #button_visibility_album, #button_sharing_album_users, #button_move_album")
				);
			} else if (album.isTagAlbum()) {
				$("#button_info_album").show();
				if (sidebar.keepSidebarVisible() && !visible.sidebar()) sidebar.toggle(false);
				$("#button_move_album").hide();
				$(".button_add, .header__divider", "#lychee_toolbar_album").hide();
				tabindex.makeFocusable($("#button_info_album"));
				tabindex.makeUnfocusable($("#button_move_album"));
				tabindex.makeUnfocusable($(".button_add, .header__divider", "#lychee_toolbar_album"));
				if (album.isUploadable()) {
					$("#button_nsfw_album, #button_visibility_album, #button_sharing_album_users, #button_trash_album").show();
					tabindex.makeFocusable($("#button_nsfw_album, #button_visibility_album, #button_sharing_album_users, #button_trash_album"));
					if ($("#button_visibility_album").is(":hidden")) {
						// This can happen with narrow screens.  In that
						// case we re-enable the add button which will
						// contain the overflow items.
						$(".button_add, .header__divider", "#lychee_toolbar_album").show();
						tabindex.makeFocusable($(".button_add, .header__divider", "#lychee_toolbar_album"));
					}
				} else {
					$("#button_nsfw_album, #button_visibility_album, #button_sharing_album_users, #button_trash_album").hide();
					tabindex.makeUnfocusable($("#button_nsfw_album, #button_visibility_album, #button_sharing_album_users, #button_trash_album"));
				}
			} else {
				$("#button_info_album").show();
				if (sidebar.keepSidebarVisible() && !visible.sidebar()) sidebar.toggle(false);
				tabindex.makeFocusable($("#button_info_album"));
				if (album.isUploadable()) {
					$(
						"#button_nsfw_album, #button_trash_album, #button_move_album, #button_visibility_album, #button_sharing_album_users, .button_add, .header__divider",
						"#lychee_toolbar_album"
					).show();
					tabindex.makeFocusable(
						$(
							"#button_nsfw_album, #button_trash_album, #button_move_album, #button_visibility_album, #button_sharing_album_users, .button_add, .header__divider",
							"#lychee_toolbar_album"
						)
					);
				} else {
					$(
						"#button_nsfw_album, #button_trash_album, #button_move_album, #button_visibility_album, #button_sharing_album_users, .button_add, .header__divider",
						"#lychee_toolbar_album"
					).hide();
					tabindex.makeUnfocusable(
						$(
							"#button_nsfw_album, #button_trash_album, #button_move_album, #button_visibility_album, #button_sharing_album_users, .button_add, .header__divider",
							"#lychee_toolbar_album"
						)
					);
				}
			}

			// Remove buttons if needed
			if (!lychee.enable_button_visibility) {
				const e = $("#button_visibility_album", "#button_sharing_album_users", "#lychee_toolbar_album");
				e.remove();
			}
			if (!lychee.enable_button_share) {
				const e = $("#button_share_album", "#lychee_toolbar_album");
				e.remove();
			}
			if (!lychee.enable_button_archive) {
				const e = $("#button_archive", "#lychee_toolbar_album");
				e.remove();
			}
			if (!lychee.enable_button_move) {
				const e = $("#button_move_album", "#lychee_toolbar_album");
				e.remove();
			}
			if (!lychee.enable_button_trash) {
				const e = $("#button_trash_album", "#lychee_toolbar_album");
				e.remove();
			}
			if (!lychee.enable_button_fullscreen || !lychee.fullscreenAvailable()) {
				const e = $("#button_fs_album_enter", "#lychee_toolbar_album");
				e.remove();
			}
			if (!lychee.enable_button_add) {
				const e = $(".button_add", "#lychee_toolbar_album");
				e.remove();
			}

			return;

		case "photo":
			header.dom(".toolbar").removeClass("visible");
			header.dom("#lychee_toolbar_photo").addClass("visible");
			tabindex.makeUnfocusable(header.dom(".toolbar"));
			tabindex.makeFocusable(header.dom("#lychee_toolbar_photo"));
			// If map is disabled, we should hide the icon
			if (lychee.publicMode === true ? lychee.map_display_public : lychee.map_display) {
				const e = $("#button_map");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $("#button_map");
				e.hide();
				tabindex.makeUnfocusable(e);
			}

			if (lychee.enable_button_move && album.isUploadable()) {
				const e = $("#button_move");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $("#button_move");
				e.hide();
				tabindex.makeUnfocusable(e);
			}

			if (lychee.enable_button_trash && album.isUploadable()) {
				const e = $("#button_trash");
				e.show();
				tabindex.makeFocusable(e);
			} else {
				const e = $("#button_trash");
				e.hide();
				tabindex.makeUnfocusable(e);
			}

			if (lychee.enable_button_fullscreen && lychee.fullscreenAvailable()) {
				const e = $("#button_fs_enter");
				e.show();
			} else {
				const e = $("#button_fs_enter");
				e.hide();
			}

			// Hide More menu if
			// - empty (see contextMenu.photoMore)
			// - not enabled
			if (
				(!(
					album.isUploadable() ||
					(photo.json.hasOwnProperty("is_downloadable") ? photo.json.is_downloadable : album.json && album.json.is_downloadable)
				) &&
					!(photo.json.size_variants.original.url && photo.json.size_variants.original.url !== "")) ||
				!lychee.enable_button_more
			) {
				const e = $("#button_more");
				e.hide();
				tabindex.makeUnfocusable(e);
			} else {
				const e = $("#button_more");
				e.show();
				tabindex.makeFocusable(e);
			}

			// Hide buttons if needed
			if (lychee.publicMode) {
				const e = $("#button_star", "#lychee_toolbar_photo");
				e.hide();
				tabindex.makeUnfocusable(e);
			} else {
				const e = $("#button_star", "#lychee_toolbar_photo");
				e.show();
			}

			if (!lychee.enable_button_visibility || lychee.publicMode) {
				const e = $("#button_visibility", "#lychee_toolbar_photo");
				e.hide();
			} else {
				const e = $("#button_visibility", "#lychee_toolbar_photo");
				e.show();
			}
			if (!lychee.enable_button_share) {
				const e = $("#button_share", "#lychee_toolbar_photo");
				e.hide();
			} else {
				const e = $("#button_share", "#lychee_toolbar_photo");
				e.show();
			}
			if (!lychee.enable_button_move || lychee.publicMode) {
				const e = $("#button_move", "#lychee_toolbar_photo");
				e.hide();
			} else {
				const e = $("#button_move", "#lychee_toolbar_photo");
				e.show();
			}
			if (!lychee.enable_button_trash || lychee.publicMode) {
				const e = $("#button_trash", "#lychee_toolbar_photo");
				e.hide();
			} else {
				const e = $("#button_trash", "#lychee_toolbar_photo");
				e.show();
			}
			if (!lychee.enable_button_fullscreen || !lychee.fullscreenAvailable() || lychee.publicMode) {
				const e = $("#button_fs_enter", "#lychee_toolbar_photo");
				e.hide();
			} else {
				const e = $("#button_fs_enter", "#lychee_toolbar_photo");
				e.show();
			}
			if (!lychee.enable_button_rotate || lychee.publicMode) {
				let e = $("#button_rotate_cwise", "#lychee_toolbar_photo");
				e.hide();

				e = $("#button_rotate_ccwise", "#lychee_toolbar_photo");
				e.hide();
			} else {
				let e = $("#button_rotate_cwise", "#lychee_toolbar_photo");
				e.show();

				e = $("#button_rotate_ccwise", "#lychee_toolbar_photo");
				e.show();
				tabindex.makeFocusable(e);
			}
			return;
		case "map":
			header.dom(".toolbar").removeClass("visible");
			header.dom("#lychee_toolbar_map").addClass("visible");
			tabindex.makeUnfocusable(header.dom(".toolbar"));
			tabindex.makeFocusable(header.dom("#lychee_toolbar_map"));
			return;
		case "config":
			header.dom(".toolbar").removeClass("visible");
			header.dom("#lychee_toolbar_config").addClass("visible");
			return;
	}
};

/**
 * Note that the pull-down menu is now enabled not only for editable
 * items but for all of public/albums/album/photo views, so 'editable' is a
 * bit of a misnomer at this point...
 *
 * @param {boolean} editable
 * @returns {void}
 */
header.setEditable = function (editable) {
	const $title = header.dom(".header__title");

	if (editable && !lychee.publicMode) $title.addClass("header__title--editable");
	else $title.removeClass("header__title--editable");
};
