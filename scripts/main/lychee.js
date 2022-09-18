/**
 * @description This module provides the basic functions of Lychee.
 */

const lychee = {
	title: document.title,
	/**
	 * The version of the backend in human-readable, printable form, e.g. `'4.6.3'`.
	 *
	 * TODO: Make format of this attribute and {@link lychee.update_json} consistent.
	 *
	 * TODO: Let the backend report the version as a proper object with properties for major, minor and patch level
	 *
	 * @type {string}
	 */
	version: "",

	updatePath: "https://LycheeOrg.github.io/update.json",
	updateURL: "https://github.com/LycheeOrg/Lychee/releases",
	website: "https://LycheeOrg.github.io",

	publicMode: false,
	viewMode: false,
	full_photo: true,
	downloadable: false,
	public_photos_hidden: true,
	share_button_visible: false,
	/**
	 * The authenticated user or `null` if unauthenticated
	 * @type {?User}
	 */
	user: null,
	/**
	 * The rights granted by the backend
	 */
	rights: {
		/**
		 * Backend grants admin rights
		 * @type boolean
		 */
		is_admin: false,
		/**
		 * Backend grants upload rights
		 * @type boolean
		 */
		may_upload: false,
		/**
		 * Backend considers the user to be locked
		 * @type boolean
		 */
		is_locked: false,
	},
	/**
	 * Values:
	 *
	 *  - `0`: Use default, "square" layout.
	 *  - `1`: Use Flickr-like "justified" layout.
	 *  - `2`: Use Google-like "unjustified" layout
	 *
	 * @type {number}
	 */
	layout: 1,
	/**
	 * Display search in public mode.
	 * @type {boolean}
	 */
	public_search: false,
	/**
	 * Overlay display type
	 * @type {string}
	 */
	image_overlay_type: "exif",
	/**
	 * Image overlay type default type
	 * @type {string}
	 */
	image_overlay_type_default: "exif",
	/**
	 * Display photo coordinates on map
	 * @type {boolean}
	 */
	map_display: false,
	/**
	 * Display photos of public album on map (user not logged in)
	 * @type {boolean}
	 */
	map_display_public: false,
	/**
	 * Use the GPS direction data on displayed maps
	 * @type {boolean}
	 */
	map_display_direction: true,
	/**
	 * Provider of OSM Tiles
	 * @type {string}
	 */
	map_provider: "Wikimedia",
	/**
	 * Include photos of subalbums on map
	 * @type {boolean}
	 */
	map_include_subalbums: false,
	/**
	 * Retrieve location name from GPS data
	 * @type {boolean}
	 */
	location_decoding: false,
	/**
	 * Caching mode for GPS data decoding
	 * @type {string}
	 */
	location_decoding_caching_type: "Harddisk",
	/**
	 * Show location name
	 * @type {boolean}
	 */
	location_show: false,
	/**
	 * Show location name for public albums
	 * @type {boolean}
	 */
	location_show_public: false,
	/**
	 * Tolerance for navigating when swiping images to the left and right on mobile
	 * @type {number}
	 */
	swipe_tolerance_x: 150,
	/**
	 * Tolerance for navigating when swiping images up and down
	 * @type {number}
	 */
	swipe_tolerance_y: 250,

	/**
	 * Is landing page enabled?
	 * @type {boolean}
	 */
	landing_page_enabled: false,
	delete_imported: false,
	import_via_symlink: false,
	skip_duplicates: false,

	nsfw_visible: true,
	nsfw_visible_saved: true,
	nsfw_blur: false,
	nsfw_warning: false,

	album_subtitle_type: "oldstyle",

	upload_processing_limit: 4,

	// this is device specific config, in this case default is Desktop.
	header_auto_hide: true,
	active_focus_on_page_load: false,
	enable_button_visibility: true,
	enable_button_share: true,
	enable_button_archive: true,
	enable_button_move: true,
	enable_button_trash: true,
	enable_button_fullscreen: true,
	enable_button_download: true,
	enable_button_add: true,
	enable_button_more: true,
	enable_button_rotate: true,
	enable_close_tab_on_esc: false,
	enable_tabindex: false,
	enable_contextmenu_header: true,
	hide_content_during_imgview: false,
	device_type: "desktop",

	checkForUpdates: true,
	/**
	 * The most recent, available Lychee version encoded as an integer, e.g. 040506.
	 *
	 * TODO: Make format of this attribute and {@link lychee.version} consistent.
	 *
	 * TODO: Let the backend report the version as a proper object with properties for major, minor and patch level
	 *
	 * @type {number}
	 */
	update_json: 0,
	update_available: false,
	new_photos_notification: false,
	/** @type {?SortingCriterion} */
	sorting_photos: null,
	/** @type {?SortingCriterion} */
	sorting_albums: null,
	/**
	 * The absolute path of the server-side installation directory of Lychee, e.g. `/var/www/lychee`
	 * @type {string}
	 */
	location: "",

	lang: "",
	/** @type {string[]} */
	lang_available: [],

	dropbox: false,
	dropboxKey: "",

	content: $(".content"),
	imageview: $("#imageview"),
	footer: $("#footer"),

	/** @type {Locale} */
	locale: {},

	nsfw_unlocked_albums: [],
};

/**
 * @returns {string}
 */
lychee.diagnostics = function () {
	return "/Diagnostics";
};

/**
 * @returns {string}
 */
lychee.logs = function () {
	return "/Logs";
};

/**
 * @returns {void}
 */
lychee.aboutDialog = function () {
	const aboutDialogBody = `
		<h1>Lychee <span class="version-number"></span></h1>
		<p class="update-status up-to-date"><a target='_blank' href='${lychee.updateURL}'></a></p>
		<h2></h2>
		<p class="about-desc"></p>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initAboutDialog = function (formElements, dialog) {
		dialog.querySelector("span.version-number").textContent = lychee.version;
		const updClassList = dialog.querySelector("p.update-status").classList;
		if (lychee.update_available) {
			updClassList.remove("up-to-date");
		}
		dialog.querySelector("p a").textContent = lychee.locale["UPDATE_AVAILABLE"];
		dialog.querySelector("h2").textContent = lychee.locale["ABOUT_SUBTITLE"];
		// We should not use `innerHTML`, but either hard-code HTML or build it
		// programmatically.
		// Also, localized strings should not contain HTML tags.
		// TODO: Find a better solution for this.
		dialog.querySelector("p.about-desc").innerHTML = sprintf(lychee.locale["ABOUT_DESCRIPTION"], lychee.website);
	};

	basicModal.show({
		body: aboutDialogBody,
		readyCB: initAboutDialog,
		classList: ["about-dialog"],
		buttons: {
			cancel: {
				title: lychee.locale["CLOSE"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {boolean} isFirstInitialization must be set to `false` if called
 *                                        for re-initialization to prevent
 *                                        multiple registrations of global
 *                                        event handlers
 * @returns {void}
 */
lychee.init = function (isFirstInitialization = true) {
	lychee.adjustContentHeight();

	api.post(
		"Session::init",
		{},
		/** @param {InitializationData} data */
		function (data) {
			lychee.parseInitializationData(data);

			if (data.user !== null || data.rights.is_admin) {
				// Authenticated or no admin is registered
				leftMenu.build();
				leftMenu.bind();
				lychee.setMode("logged_in");

				// Show dialog to create admin account, if no user is
				// authenticated but admin rights are granted.
				// TODO: Refactor the whole logic, i.e. the initial user should be created as part of the installation routine.
				// In particular it is completely insane to build the UI as if the admin user was successfully authenticated.
				// This might leak confidential photos to anybody if the DB is filled
				// with photos and the admin password reset to `null`.
				if (data.user === null && data.rights.is_admin) settings.createLogin();
			} else {
				lychee.setMode("public");
			}

			if (isFirstInitialization) {
				$(window).on("popstate", function () {
					const autoplay = history.state && history.state.hasOwnProperty("autoplay") ? history.state.autoplay : true;
					lychee.load(autoplay);
				});
				lychee.load();
			}
		}
	);
};

/**
 * @param {InitializationData} data
 * @returns {void}
 */
lychee.parseInitializationData = function (data) {
	lychee.user = data.user;
	lychee.rights = data.rights;
	lychee.update_json = data.update_json;
	lychee.update_available = data.update_available;

	// Here we convert a version string with six digits but without dots
	// as reported by the backend, e.g. `'040603'`, into a dot-separated,
	// human-readable version string `'4.6.3'`.
	// It is ridiculous how many variants we have to represent a version
	// number.
	// At least there are the following three:
	//  - a string in human-readable format with dots: `'4.6.3'`
	//  - a string with six digits, zero-padded, without dots: `'040603'`
	//  - an integer: `40603`
	// TODO: Let the backend report the version as a proper object with properties for major, minor and patch level
	if (data.config.version !== "") {
		const digits = data.config.version.match(/.{1,2}/g);
		lychee.version = parseInt(digits[0]).toString() + "." + parseInt(digits[1]).toString() + "." + parseInt(digits[2]).toString();
	}

	// we copy the locale that exists only.
	// This ensures forward and backward compatibility.
	// e.g. if the front localization is unfinished in a language
	// or if we need to change some locale string
	for (let key in data.locale) {
		lychee.locale[key] = data.locale[key];
	}

	lychee.parsePublicInitializationData(data);
	if (lychee.user !== null || lychee.rights.is_admin) {
		lychee.parseProtectedInitializationData(data);
	}
};

/**
 * Parses the configuration settings which are always available.
 *
 * TODO: If configuration management is re-factored on the backend, remember to use proper types in the first place
 *
 * @param {InitializationData} data
 * @returns {void}
 */
lychee.parsePublicInitializationData = function (data) {
	lychee.sorting_photos = data.config.sorting_photos;
	lychee.sorting_albums = data.config.sorting_albums;
	lychee.album_subtitle_type = data.config.album_subtitle_type || "oldstyle";
	lychee.checkForUpdates = data.config.check_for_updates;
	lychee.layout = Number.parseInt(data.config.layout, 10);
	if (Number.isNaN(lychee.layout)) lychee.layout = 1;
	lychee.landing_page_enable = data.config.landing_page_enable === "1";
	lychee.public_search = data.config.public_search === "1";
	lychee.image_overlay_type = data.config.image_overlay_type || "exif";
	lychee.image_overlay_type_default = lychee.image_overlay_type;
	lychee.map_display = data.config.map_display === "1";
	lychee.map_display_public = data.config.map_display_public === "1";
	lychee.map_display_direction = data.config.map_display_direction === "1";
	lychee.map_provider = data.config.map_provider || "Wikimedia";
	lychee.map_include_subalbums = data.config.map_include_subalbums === "1";
	lychee.location_show = data.config.location_show === "1";
	lychee.location_show_public = data.config.location_show_public === "1";
	lychee.swipe_tolerance_x = Number.parseInt(data.config.swipe_tolerance_x, 10) || 150;
	lychee.swipe_tolerance_y = Number.parseInt(data.config.swipe_tolerance_y, 10) || 250;

	lychee.nsfw_visible = data.config.nsfw_visible === "1";
	lychee.nsfw_visible_saved = lychee.nsfw_visible;
	lychee.nsfw_blur = data.config.nsfw_blur === "1";
	lychee.nsfw_warning = data.config.nsfw_warning === "1";

	lychee.header_auto_hide = data.config_device.header_auto_hide;
	lychee.active_focus_on_page_load = data.config_device.active_focus_on_page_load;
	lychee.enable_button_visibility = data.config_device.enable_button_visibility;
	lychee.enable_button_share = data.config_device.enable_button_share;
	lychee.enable_button_archive = data.config_device.enable_button_archive;
	lychee.enable_button_move = data.config_device.enable_button_move;
	lychee.enable_button_trash = data.config_device.enable_button_trash;
	lychee.enable_button_fullscreen = data.config_device.enable_button_fullscreen;
	lychee.enable_button_download = data.config_device.enable_button_download;
	lychee.enable_button_add = data.config_device.enable_button_add;
	lychee.enable_button_more = data.config_device.enable_button_more;
	lychee.enable_button_rotate = data.config_device.enable_button_rotate;
	lychee.enable_close_tab_on_esc = data.config_device.enable_close_tab_on_esc;
	lychee.enable_tabindex = data.config_device.enable_tabindex;
	lychee.enable_contextmenu_header = data.config_device.enable_contextmenu_header;
	lychee.hide_content_during_imgview = data.config_device.hide_content_during_imgview;
	lychee.device_type = data.config_device.device_type || "desktop"; // we set default as Desktop
};

/**
 * Parses the configuration settings which are only available, if a user is authenticated.
 *
 * TODO: If configuration management is re-factored on the backend, remember to use proper types in the first place
 *
 * @param {InitializationData} data
 * @returns {void}
 */
lychee.parseProtectedInitializationData = function (data) {
	lychee.dropboxKey = data.config.dropbox_key || "";
	lychee.location = data.config.location || "";
	lychee.checkForUpdates = data.config.check_for_updates === "1";
	lychee.lang = data.config.lang || "";
	lychee.lang_available = data.config.lang_available || [];
	lychee.location_decoding = data.config.location_decoding === "1";
	lychee.default_license = data.config.default_license || "none";
	lychee.css = data.config.css || "";
	lychee.full_photo = data.config.full_photo === "1";
	lychee.downloadable = data.config.downloadable === "1";
	lychee.public_photos_hidden = data.config.public_photos_hidden === "1";
	lychee.share_button_visible = data.config.share_button_visible === "1";
	lychee.delete_imported = data.config.delete_imported === "1";
	lychee.import_via_symlink = data.config.import_via_symlink === "1";
	lychee.skip_duplicates = data.config.skip_duplicates === "1";
	lychee.editor_enabled = data.config.editor_enabled === "1";
	lychee.new_photos_notification = data.config.new_photos_notification === "1";
	lychee.upload_processing_limit = Number.parseInt(data.config.upload_processing_limit, 10) || 4;
};

/**
 * @param {{username: string, password: string}} data
 * @returns {void}
 */
lychee.login = function (data) {
	if (!data.username.trim()) {
		basicModal.error("username");
		return;
	}
	if (!data.password.trim()) {
		basicModal.error("password");
		return;
	}

	api.post(
		"Session::login",
		data,
		() => window.location.reload(),
		null,
		function (jqXHR) {
			if (jqXHR.status === 401) {
				basicModal.error("password");
				return true;
			} else {
				return false;
			}
		}
	);
};

/**
 * @returns {void}
 */
lychee.loginDialog = function () {
	const loginDialogBody = `
		<a id='signInKeyLess' class="button"><svg class='iconic'><use xlink:href='#key'/></svg></a>
		<form class="force-first-child">
			<div class="input-group stacked">
				<input class='text' name='username' autocomplete='username' type='text' autocapitalize='off' data-tabindex='${tabindex.get_next_tab_index()}'>
			</div>
			<div class="input-group stacked">
				<input class='text' name='password' autocomplete='current-password' type='password' data-tabindex='${tabindex.get_next_tab_index()}'>
			</div>
		</form>
		<p class='version'>Lychee <span class='version-number'></span><span class="update-status up-to-date"> &#8211; <a target='_blank' href='${
			lychee.updateURL
		}' data-tabindex='-1'></a></span></p>
		`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initLoginDialog = function (formElements, dialog) {
		tabindex.makeUnfocusable(header.dom());
		tabindex.makeUnfocusable(lychee.content);
		tabindex.makeUnfocusable(lychee.imageview);
		tabindex.makeFocusable($(dialog));

		formElements.username.placeholder = lychee.locale["USERNAME"];
		formElements.password.placeholder = lychee.locale["PASSWORD"];
		dialog.querySelector("span.version-number").textContent = lychee.version;
		const updClassList = dialog.querySelector("span.update-status").classList;
		if (lychee.update_available) {
			updClassList.remove("up-to-date");
		}
		dialog.querySelector("span.update-status a").textContent = lychee.locale["UPDATE_AVAILABLE"];

		// This feels awkward, because this hooks into the modal dialog in some
		// unpredictable way.
		// It would be better to have a checkbox for password-less login in the
		// dialog and then let the action handler of the modal dialog, i.e.
		// `lychee.login` handle both cases.
		// TODO: Refactor this.
		dialog.querySelector("#signInKeyLess").addEventListener("click", u2f.login);
	};

	basicModal.show({
		body: loginDialogBody,
		readyCB: initLoginDialog,
		classList: ["login"],
		buttons: {
			action: {
				title: lychee.locale["SIGN_IN"],
				fn: lychee.login,
				attributes: { "data-tabindex": tabindex.get_next_tab_index() },
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
				attributes: { "data-tabindex": tabindex.get_next_tab_index() },
			},
		},
	});
};

/**
 * @returns {void}
 */
lychee.logout = function () {
	api.post("Session::logout", {}, () => window.location.reload());
};

/**
 * @param {?string} [url=null]
 * @param {boolean} [autoplay=true]
 *
 * @returns {void}
 */
lychee.goto = function (url = null, autoplay = true) {
	url = "#" + (url !== null ? url : "");
	history.pushState({ autoplay: autoplay }, null, url);
	lychee.load(autoplay);
};

/**
 * @param {?string} [albumID=null]
 * @param {boolean} [autoplay=true]
 *
 * @returns {void}
 */
lychee.gotoMap = function (albumID = null, autoplay = true) {
	// If map functionality is disabled -> go to album
	if (!lychee.map_display) {
		loadingBar.show("error", lychee.locale["ERROR_MAP_DEACTIVATED"]);
		return;
	}
	lychee.goto("map/" + (albumID !== null ? albumID : ""), autoplay);
};

/**
 * Triggers a reload, if the given IDs are in legacy format.
 *
 * If any of the IDs is in legacy format, the method first translates the IDs
 * into the modern format via an AJAX call to the backend and then triggers
 * an asynchronous reloading of the page with the resolved, modern IDs.
 * The function returns `true` in this case.
 *
 * If the IDs are already in modern format (and thus neither a translation
 * nor a reloading is required), the function returns `false`.
 * In this case this function is basically a no-op.
 *
 * @param {?string} albumID  the album ID
 * @param {?string} photoID  the photo ID
 * @param {boolean} autoplay indicates whether playback should start
 *                           automatically, if the indicated photo is a video
 *
 * @returns {boolean} `true`, if any of the IDs has been in legacy format
 *                   and an asynchronous reloading has been scheduled
 */
lychee.reloadIfLegacyIDs = function (albumID, photoID, autoplay) {
	/** @param {?string} id the inspected ID */
	const isLegacyID = function (id) {
		// The legacy IDs were pure numeric values. We exclude values which
		// have 24 digits, because these could also be modern IDs.
		// A modern IDs is a 24 character long, base64 encoded value and thus
		// could also match 24 digits by accident.
		return id && id.length !== 24 && parseInt(id, 10).toString() === id;
	};

	if (!isLegacyID(albumID) && !isLegacyID(photoID)) {
		// this function is a no-op if neither ID is in legacy format
		return false;
	}

	/**
	 * Callback to be called asynchronously which executes the actual reloading.
	 *
	 * @param {?string} newAlbumID
	 * @param {?string} newPhotoID
	 *
	 * @returns {void}
	 */
	const reloadWithNewIDs = function (newAlbumID, newPhotoID) {
		let newUrl = "";
		if (newAlbumID) {
			newUrl += newAlbumID;
			newUrl += newPhotoID ? "/" + newPhotoID : "";
		}
		lychee.goto(newUrl, autoplay);
	};

	// We have to deal with three cases:
	//  1. the album and photo ID need to be translated
	//  2. only the album ID needs to be translated
	//  3. only the photo ID needs to be translated
	let params = {};
	if (isLegacyID(albumID)) params.albumID = parseInt(albumID, 10);
	if (isLegacyID(photoID)) params.photoID = parseInt(photoID, 10);
	api.post("Legacy::translateLegacyModelIDs", params, function (data) {
		reloadWithNewIDs(data.hasOwnProperty("albumID") ? data.albumID : albumID, data.hasOwnProperty("photoID") ? data.photoID : photoID);
	});

	return true;
};

/**
 * This is a "God method" that is used to load pretty much anything, based
 * on what's in the web browser's URL bar after the '#' character:
 *
 *  - (nothing): load root album, assign `null` to `albumID` and `photoID`
 *  - `{albumID}`: load the album; `albumID` equals the given ID, `photoID` is
 *    null
 *  - `{albumID}/{photoID}`: load album (if not already loaded) and then the
 *    corresponding photo, assign the respective values to `albumID` and
 *    `photoID`
 *  - `map`: load the map of all albums
 *  - `map/{albumID}`: load the map of the respective album
 *  - `search/{term}`: load or go back to "search" album for the given term,
 *     assign `search/{term}` as fictitious `albumID` and assign `null` to
 *     `photoID`
 *  - `search/{term}/{photoID}`: load photo within fictitious search album,
 *     assign `search/{term}` as fictitious `albumID` and assign the given ID
 *     to `photoID`
 *  - `view/{photoID}`: load the photo in "view" mode, i.e. a special photo
 *    view which displays the photo as standalone (not in an album carousel)
 *    which assumes that the user is always unauthenticated.
 *
 * @param {boolean} [autoplay=true]
 * @returns {void}
 */
lychee.load = function (autoplay = true) {
	let hash = document.location.hash.replace("#", "").split("/");
	let albumID = hash[0];
	if (albumID === SearchAlbumIDPrefix && hash.length > 1) {
		albumID += "/" + hash[1];
	}
	let photoID = hash[album.isSearchID(albumID) ? 2 : 1];

	contextMenu.close();
	multiselect.close();
	tabindex.reset();

	if (albumID && photoID) {
		if (albumID === "map") {
			// If map functionality is disabled -> do nothing
			if (!lychee.map_display) {
				loadingBar.show("error", lychee.locale["ERROR_MAP_DEACTIVATED"]);
				return;
			}
			$(".no_content").remove();
			// show map
			// albumID has been stored in photoID due to URL format #map/albumID
			albumID = photoID;
			photoID = null;

			// Trash data
			photo.json = null;

			// Show Album -> it's below the map
			if (visible.photo()) view.photo.hide();
			if (visible.sidebar()) sidebar.toggle(false);
			if (album.json && albumID === album.json.id) {
				view.album.title();
			}
			mapview.open(albumID);
			lychee.footer_hide();
		} else {
			if (lychee.reloadIfLegacyIDs(albumID, photoID, autoplay)) {
				return;
			}

			$(".no_content").remove();
			// Show photo

			// Trash data
			photo.json = null;

			/**
			 * @param {boolean} isParentAlbumAccessible
			 * @returns {void}
			 */
			const loadPhoto = function (isParentAlbumAccessible) {
				if (!isParentAlbumAccessible) {
					lychee.setMode("view");
				}
				photo.load(photoID, albumID, autoplay);

				// Make imageview focusable
				tabindex.makeFocusable(lychee.imageview);

				// Make thumbnails unfocusable and store which element had focus
				tabindex.makeUnfocusable(lychee.content, true);

				// hide contentview if requested
				if (lychee.hide_content_during_imgview) lychee.content.hide();

				lychee.footer_hide();
			};

			// Load Photo
			if (albumID === "view") {
				// If the photo shall be displayed in "view" mode, delete
				// any album which we possibly have and load the photo as
				// if the parent album was inaccessible (even if a user is
				// authenticated).
				albumID = null;
				album.refresh();
				lychee.content.empty();
				loadPhoto(false);
			} else if (lychee.content.html() === "" || album.json === null || album.json.id !== albumID) {
				// If we don't have an album or the wrong album load the album
				// first and let the album loader load the photo afterwards or
				// load the photo directly.
				lychee.content.hide();
				album.load(albumID, loadPhoto);
			} else {
				loadPhoto(true);
			}
		}
	} else if (albumID) {
		if (albumID === "map") {
			$(".no_content").remove();
			// Show map of all albums
			// If map functionality is disabled -> do nothing
			if (!lychee.map_display) {
				loadingBar.show("error", lychee.locale["ERROR_MAP_DEACTIVATED"]);
				return;
			}

			// Trash data
			photo.json = null;

			// Show Album -> it's below the map
			if (visible.photo()) view.photo.hide();
			if (visible.sidebar()) sidebar.toggle(false);
			mapview.open();
			lychee.footer_hide();
		} else {
			if (lychee.reloadIfLegacyIDs(albumID, photoID, autoplay)) {
				return;
			}

			$(".no_content").remove();
			// Trash data
			photo.json = null;

			// Show Album
			if (visible.photo()) {
				view.photo.hide();
				tabindex.makeUnfocusable(lychee.imageview);
			}
			if (visible.mapview()) mapview.close();
			if (visible.sidebar() && (album.isSmartID(albumID) || album.isSearchID(albumID))) sidebar.toggle(false);
			$("#sensitive_warning").hide();
			if (album.json && albumID === album.json.id) {
				if (album.isSearchID(albumID)) {
					// We are probably coming back to the search results from
					// viewing an image.  Because search results is not a
					// regular album, it needs to be treated a little
					// differently.
					header.setMode("albums");
					lychee.setTitle(lychee.locale["SEARCH_RESULTS"], false);
				} else {
					view.album.title();
				}
				lychee.content.show();
				tabindex.makeFocusable(lychee.content, true);
				// If the album was loaded in the background (when content is
				// hidden), scrolling may not have worked.
				view.album.content.restoreScroll();
			} else if (album.isSearchID(albumID)) {
				// Search has been triggered
				let search_string = decodeURIComponent(hash[1]).trim();

				if (search_string === "") {
					// do nothing on "only space" search strings
					return;
				}
				// If public search is disabled -> do nothing
				if (lychee.publicMode === true && !lychee.public_search) {
					loadingBar.show("error", lychee.locale["ERROR_SEARCH_DEACTIVATED"]);
					return;
				}

				header.dom(".header__search").val(search_string);
				search.find(search_string);
			} else if (visible.search()) {
				// Somebody clicked on an album in search results.  We
				// will alter the parent_id of that album once it's loaded
				// so that the back button sends us back to the search
				// results.
				// Trash data so that it's reloaded if needed (just as we
				// would for a regular parent album).
				search.json = null;
				album.load(albumID, null, album.getID());
			} else {
				album.load(albumID);
			}
			lychee.footer_show();
		}
	} else {
		$(".no_content").remove();

		// Trash data
		search.json = null;
		album.json = null;
		photo.json = null;

		// Hide sidebar
		if (visible.sidebar()) sidebar.toggle(false);

		// Show Albums
		if (visible.photo()) {
			view.photo.hide();
			tabindex.makeUnfocusable(lychee.imageview);
		}
		if (visible.mapview()) mapview.close();
		$("#sensitive_warning").hide();
		lychee.content.show();
		lychee.footer_show();
		albums.load();
	}
};

/**
 * Sets the title of the browser window and the title shown in the header bar.
 *
 * The window title is prefixed by the value of the configuration setting
 * `lychee.title`.
 *
 * If both, the prefix `lychee.title` and the given title, are not empty,
 * they are seperated by an en-dash.
 *
 * @param {string} [title=""]
 * @param {boolean} [editable=false]
 */
lychee.setTitle = function (title = "", editable = false) {
	document.title = lychee.title + (lychee.title && title ? " – " : "") + title;
	header.setEditable(editable);
	header.setTitle(title);
};

/**
 * @param {string} mode - one out of: `public`, `view`, `logged_in`
 */
lychee.setMode = function (mode) {
	if (lychee.rights.is_locked) {
		$("#button_settings_open").remove();
	}
	if (!lychee.rights.may_upload) {
		$("#button_sharing").remove();

		$(document)
			.off("click", ".header__title--editable")
			.off("touchend", ".header__title--editable")
			.off("contextmenu", ".photo")
			.off("contextmenu", ".album")
			.off("drop");

		Mousetrap.unbind(["u"])
			.unbind(["s"])
			.unbind(["n"])
			.unbind(["r"])
			.unbind(["d"])
			.unbind(["t"])
			.unbind(["command+backspace", "ctrl+backspace"])
			.unbind(["command+a", "ctrl+a"]);
	}
	if (!lychee.rights.is_admin) {
		$("#button_users, #button_logs, #button_diagnostics").remove();
	}

	if (mode === "logged_in") {
		// After login the keyboard short-cuts to login by password (l) and
		// by key (k) are not required anymore, so we unbind them.
		Mousetrap.unbind(["l"]).unbind(["k"]);

		// The code searches by class, so remove the other instance.
		$(".header__search, .header__clear", ".header__toolbar--public").remove();

		if (!lychee.editor_enabled) {
			$("#button_rotate_cwise").remove();
			$("#button_rotate_ccwise").remove();
		}
		return;
	} else {
		$(".header__search, .header__clear", ".header__toolbar--albums").remove();
		$("#button_rotate_cwise").remove();
		$("#button_rotate_ccwise").remove();
	}

	$("#button_settings, .header__divider, .leftMenu").remove();

	if (mode === "public") {
		lychee.publicMode = true;
	} else if (mode === "view") {
		Mousetrap.unbind(["esc", "command+up"]);

		$("#button_back, a#next, a#previous").remove();
		$(".no_content").remove();

		lychee.publicMode = true;
		lychee.viewMode = true;
	}

	// just mak
	header.bind_back();
};

/**
 * @param {jQuery} obj
 * @param {string} animation
 *
 * @returns {void}
 */
lychee.animate = function (obj, animation) {
	const animations = [
		["fadeIn", "fadeOut"],
		["contentZoomIn", "contentZoomOut"],
	];

	for (let i = 0; i < animations.length; i++) {
		for (let x = 0; x < animations[i].length; x++) {
			if (animations[i][x] === animation) {
				obj.removeClass(animations[i][0] + " " + animations[i][1]).addClass(animation);
				return;
			}
		}
	}
};

/**
 * @callback DropboxLoadedCB
 * @returns {void}
 */

/**
 * Ensures that the Dropbox Chooser JS component is loaded and calls the
 * provided callback after loading.
 *
 * See {@link Dropbox}
 *
 * @param {DropboxLoadedCB} callback
 */
lychee.loadDropbox = function (callback) {
	if (!lychee.dropboxKey) {
		loadingBar.show("error", lychee.locale["ERROR_DROPBOX_KEY"]);
		return;
	}

	// If the dropbox component has already been loaded, immediately call
	// the callback; otherwise load the component first and call callback
	// on success.
	if (lychee.dropbox) {
		callback();
	} else {
		loadingBar.show();

		let g = document.createElement("script");
		let s = document.getElementsByTagName("script")[0];

		g.src = "https://www.dropbox.com/static/api/1/dropins.js";
		g.id = "dropboxjs";
		g.type = "text/javascript";
		g.async = true;
		g.setAttribute("data-app-key", lychee.dropboxKey);
		g.onload = g.onreadystatechange = function () {
			let rs = this.readyState;
			if (rs && rs !== "complete" && rs !== "loaded") return;
			lychee.dropbox = true;
			loadingBar.hide();
			callback();
		};
		s.parentNode.insertBefore(g, s);
	}
};

/**
 * @returns {string}
 */
lychee.getEventName = function () {
	if (lychee.device_type === "mobile") {
		return "touchend";
	}
	return "click";
};

/**
 * DON'T USE THIS METHOD.
 *
 * TODO: Find all invocations of this method and nuke them.
 *
 * This method does not cover all potentially dangerous characters and this
 * method should not be required on the first place.
 * jQuery and even native JS has better methods for this in the year 2022!
 *
 * @param {string} [html=""]
 * @returns {string}
 */
lychee.escapeHTML = function (html = "") {
	// Ensure that html is a string
	html += "";

	// Escape all critical characters
	html = html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/`/g, "&#96;");

	return html;
};

/**
 * Creates a HTML string with some fancy variable substitution.
 *
 * Actually, this method should not be required in the year 2022.
 * jQuery and even native JS should probably provide a suitable alternative.
 * But this method is used so ubiquitous that it might be difficult to get
 * rid of it.
 *
 * TODO: Try it nonetheless.
 *
 * @param literalSections
 * @param substs
 * @returns {string}
 */
lychee.html = function (literalSections, ...substs) {
	// Use raw literal sections: we don’t want
	// backslashes (\n etc.) to be interpreted
	let raw = literalSections.raw;
	let result = "";

	substs.forEach((subst, i) => {
		// Retrieve the literal section preceding
		// the current substitution
		let lit = raw[i];

		// If the substitution is preceded by a dollar sign,
		// we escape special characters in it
		if (lit.slice(-1) === "$") {
			subst = lychee.escapeHTML(subst);
			lit = lit.slice(0, -1);
		}

		result += lit;
		result += subst;
	});

	// Take care of last literal section
	// (Never fails, because an empty template string
	// produces one literal section, an empty string)
	result += raw[raw.length - 1];

	return result;
};

/**
 * @param {XMLHttpRequest} jqXHR
 * @param {Object} params the original JSON parameters of the request
 * @param {?LycheeException} lycheeException the Lychee Exception
 * @returns {boolean}
 */
lychee.handleAPIError = function (jqXHR, params, lycheeException) {
	if (api.hasSessionExpired(jqXHR, lycheeException)) {
		loadingBar.show("error", lychee.locale["ERROR_SESSION"]);
		setTimeout(() => {
			lychee.goto();
			window.location.reload();
		}, 3000);
	} else {
		const msg = jqXHR.statusText + (lycheeException ? " - " + lycheeException.message : "");
		loadingBar.show("error", msg);
		console.error("The server returned an error response", {
			description: msg,
			params: params,
			response: lycheeException,
		});
	}
	return true;
};

/**
 * @returns {void}
 */
lychee.fullscreenEnter = function () {
	let elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		/* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		/* Chrome, Safari and Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) {
		/* IE/Edge */
		elem.msRequestFullscreen();
	}
};

/**
 * @returns {void}
 */
lychee.fullscreenExit = function () {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		/* Firefox */
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		/* Chrome, Safari and Opera */
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
		/* IE/Edge */
		document.msExitFullscreen();
	}
};

/**
 * @returns {void}
 */
lychee.fullscreenToggle = function () {
	if (lychee.fullscreenStatus()) {
		lychee.fullscreenExit();
	} else {
		lychee.fullscreenEnter();
	}
};

/**
 * @returns {boolean}
 */
lychee.fullscreenStatus = function () {
	let elem = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	return !!elem;
};

/**
 * @returns {boolean}
 */
lychee.fullscreenAvailable = function () {
	return document.fullscreenEnabled || document.mozFullscreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
};

/**
 * @returns {void}
 */
lychee.fullscreenUpdate = function () {
	if (lychee.fullscreenStatus()) {
		$("#button_fs_album_enter,#button_fs_enter").hide();
		$("#button_fs_album_exit,#button_fs_exit").show();
	} else {
		$("#button_fs_album_enter,#button_fs_enter").show();
		$("#button_fs_album_exit,#button_fs_exit").hide();
	}
};

/**
 * @returns {void}
 */
lychee.footer_show = function () {
	setTimeout(function () {
		lychee.footer.removeClass("hide_footer");
	}, 200);
};

/**
 * @returns {void}
 */
lychee.footer_hide = function () {
	lychee.footer.addClass("hide_footer");
};

/**
 * Sets the height of the content area.
 *
 * Because the height of the footer can vary, we need to set some
 * dimensions dynamically, at startup.
 *
 * @returns {void}
 */
lychee.adjustContentHeight = function () {
	if (lychee.footer.length > 0) {
		lychee.content.css(
			"min-height",
			"calc(100vh - " +
				lychee.content.css("padding-top") +
				" - " +
				lychee.content.css("padding-bottom") +
				" - " +
				lychee.footer.outerHeight() +
				"px)"
		);
		$("#container").css("padding-bottom", lychee.footer.outerHeight());
	} else {
		lychee.content.css("min-height", "calc(100vh - " + lychee.content.css("padding-top") + " - " + lychee.content.css("padding-bottom") + ")");
	}
};

/**
 * @returns {string}
 */
lychee.getBaseUrl = function () {
	if (location.href.includes("index.html")) {
		return location.href.replace("index.html" + location.hash, "");
	} else if (location.href.includes("gallery#")) {
		return location.href.replace("gallery" + location.hash, "");
	} else {
		return location.href.replace(location.hash, "");
	}
};

/**
 * drag album to another one
 * @param {DragEvent} ev
 * @returns {void}
 */
lychee.startDrag = function (ev) {
	/** @type ?HTMLDivElement */
	const div = ev.target.closest("div.album,div.photo");
	if (!div) return;
	const type = div.classList.contains("album") ? "album" : "photo";
	ev.dataTransfer.setData("text/plain", `${type}-${div.dataset.id}`);
};

/**
 * drop album
 * @param {DragEvent} ev
 * @returns {void}
 */
lychee.finishDrag = function (ev) {
	ev.preventDefault();

	/** @type string */
	const data = ev.dataTransfer.getData("text/plain");
	/** @type string */
	let targetId = ev.target.closest("div.album").dataset.id;
	if (!targetId || data.substring(6) === targetId) return;

	if (data.startsWith("photo-")) {
		// photo is dragged
		contextMenu.photoDrop(data.substring(6), targetId, ev);
	} else {
		// album is dragged
		contextMenu.albumDrop(data.substring(6), targetId, ev);
	}
};

/**
 * Album drag-over callback
 * @param {DragEvent} ev
 * @returns {void}
 */
lychee.overDrag = function (ev) {
	ev.preventDefault();
	/** @type ?HTMLDivElement */
	let div = ev.target.closest("div.album");
	if (div) {
		div.classList.add("album__dragover");
	}
};

/**
 * Album drag-leave callback
 * @param {DragEvent} ev
 * @returns {void}
 */
lychee.leaveDrag = function (ev) {
	/** @type ?HTMLDivElement */
	const div = ev.target.closest("div.album");
	if (div) {
		div.classList.remove("album__dragover");
	}
};

/**
 * drag-end callback
 * @param {DragEvent} ev
 * @returns {void}
 */
lychee.endDrag = function (ev) {
	$("div.album").removeClass("album__dragover");
};
