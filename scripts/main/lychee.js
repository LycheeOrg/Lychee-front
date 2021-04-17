/**
 * @description This module provides the basic functions of Lychee.
 */

let lychee = {
	title: document.title,
	version: "",
	versionCode: "", // not really needed anymore

	updatePath: "https://LycheeOrg.github.io/update.json",
	updateURL: "https://github.com/LycheeOrg/Lychee/releases",
	website: "https://LycheeOrg.github.io",

	publicMode: false,
	viewMode: false,
	full_photo: true,
	downloadable: false,
	public_photos_hidden: true,
	share_button_visible: false, // enable only v4+
	api_V2: false, // enable api_V2
	sub_albums: false, // enable sub_albums features
	admin: false, // enable admin mode (multi-user)
	upload: false, // enable possibility to upload (multi-user)
	lock: false, // locked user (multi-user)
	username: null,
	layout: "1", // 0: Use default, "square" layout. 1: Use Flickr-like "justified" layout. 2: Use Google-like "unjustified" layout
	public_search: false, // display Search in publicMode
	image_overlay_type: "exif", // current Overlay display type
	image_overlay_type_default: "exif", // image overlay type default type
	map_display: false, // display photo coordinates on map
	map_display_public: false, // display photos of public album on map (user not logged in)
	map_display_direction: true, // use the GPS direction data on displayed maps
	map_provider: "Wikimedia", // Provider of OSM Tiles
	map_include_subalbums: false, // include photos of subalbums on map
	location_decoding: false, // retrieve location name from GPS data
	location_decoding_caching_type: "Harddisk", // caching mode for GPS data decoding
	location_show: false, // show location name
	location_show_public: false, // show location name for public albums
	swipe_tolerance_x: 150, // tolerance for navigating when swiping images to the left and right on mobile
	swipe_tolerance_y: 250, // tolerance for navigating when swiping images up and down

	landing_page_enabled: false, // is landing page enabled ?
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
	hide_content_during_imageview: false,
	device_type: "desktop",

	checkForUpdates: "1",
	update_json: 0,
	update_available: false,
	sortingPhotos: "",
	sortingAlbums: "",
	location: "",

	lang: "",
	lang_available: {},

	dropbox: false,
	dropboxKey: "",

	content: $(".content"),
	imageview: $("#imageview"),
	footer: $("#footer"),

	locale: {},

	nsfw_unlocked_albums: [],
};

lychee.diagnostics = function () {
	if (lychee.api_V2) {
		return "/Diagnostics";
	} else {
		return "plugins/Diagnostics/";
	}
};

lychee.logs = function () {
	if (lychee.api_V2) {
		return "/Logs";
	} else {
		return "plugins/Log/";
	}
};

lychee.aboutDialog = function () {
	let msg = lychee.html`
				<h1>Lychee ${lychee.version}</h1>
				<div class='version'><span><a target='_blank' href='${lychee.updateURL}'>${lychee.locale["UPDATE_AVAILABLE"]}</a></span></div>
				<h1>${lychee.locale["ABOUT_SUBTITLE"]}</h1>
				<p><a target='_blank' href='${lychee.website}'>Lychee</a> ${lychee.locale["ABOUT_DESCRIPTION"]}</p>
			  `;

	basicModal.show({
		body: msg,
		buttons: {
			cancel: {
				title: lychee.locale["CLOSE"],
				fn: basicModal.close,
			},
		},
	});

	if (lychee.checkForUpdates === "1") lychee.getUpdate();
};

lychee.init = function (exitview = true) {
	lychee.adjustContentHeight();

	api.post("Session::init", {}, function (data) {
		lychee.api_V2 = data.api_V2 || false;

		if (data.status === 0) {
			// No configuration

			lychee.setMode("public");

			header.dom().hide();
			lychee.content.hide();
			$("body").append(build.no_content("cog"));
			settings.createConfig();

			return true;
		}

		lychee.sub_albums = data.sub_albums || false;
		lychee.update_json = data.update_json;
		lychee.update_available = data.update_available;
		lychee.landing_page_enable = (data.config.landing_page_enable && data.config.landing_page_enable === "1") || false;

		if (lychee.api_V2) {
			lychee.versionCode = data.config.version;
		} else {
			lychee.versionCode = data.config.version.slice(7, data.config.version.length);
		}
		if (lychee.versionCode !== "") {
			let digits = lychee.versionCode.match(/.{1,2}/g);
			lychee.version = parseInt(digits[0]).toString() + "." + parseInt(digits[1]).toString() + "." + parseInt(digits[2]).toString();
		}

		// we copy the locale that exists only.
		// This ensure forward and backward compatibility.
		// e.g. if the front localization is unfished in a language
		// or if we need to change some locale string
		for (let key in data.locale) {
			lychee.locale[key] = data.locale[key];
		}

		if (!lychee.api_V2) {
			// Apply translations to the header
			header.applyTranslations();
		}

		const validatedSwipeToleranceX =
			(data.config.swipe_tolerance_x && !isNaN(parseInt(data.config.swipe_tolerance_x)) && parseInt(data.config.swipe_tolerance_x)) || 150;
		const validatedSwipeToleranceY =
			(data.config.swipe_tolerance_y && !isNaN(parseInt(data.config.swipe_tolerance_y)) && parseInt(data.config.swipe_tolerance_y)) || 250;

		// Check status
		// 0 = No configuration
		// 1 = Logged out
		// 2 = Logged in
		if (data.status === 2) {
			// Logged in

			lychee.sortingPhotos = data.config.sorting_Photos || data.config.sortingPhotos || "";
			lychee.sortingAlbums = data.config.sorting_Albums || data.config.sortingAlbums || "";
			lychee.album_subtitle_type = data.config.album_subtitle_type || "oldstyle";
			lychee.dropboxKey = data.config.dropbox_key || data.config.dropboxKey || "";
			lychee.location = data.config.location || "";
			lychee.checkForUpdates = data.config.check_for_updates || data.config.checkForUpdates || "1";
			lychee.lang = data.config.lang || "";
			lychee.lang_available = data.config.lang_available || {};
			lychee.layout = data.config.layout || "1";
			lychee.public_search = (data.config.public_search && data.config.public_search === "1") || false;
			lychee.image_overlay_type = !data.config.image_overlay_type ? "exif" : data.config.image_overlay_type;
			lychee.image_overlay_type_default = lychee.image_overlay_type;
			lychee.map_display = (data.config.map_display && data.config.map_display === "1") || false;
			lychee.map_display_public = (data.config.map_display_public && data.config.map_display_public === "1") || false;
			lychee.map_display_direction = (data.config.map_display_direction && data.config.map_display_direction === "1") || false;
			lychee.map_provider = !data.config.map_provider ? "Wikimedia" : data.config.map_provider;
			lychee.map_include_subalbums = (data.config.map_include_subalbums && data.config.map_include_subalbums === "1") || false;
			lychee.location_decoding = (data.config.location_decoding && data.config.location_decoding === "1") || false;
			lychee.location_decoding_caching_type = !data.config.location_decoding_caching_type
				? "Harddisk"
				: data.config.location_decoding_caching_type;
			lychee.location_show = (data.config.location_show && data.config.location_show === "1") || false;
			lychee.location_show_public = (data.config.location_show_public && data.config.location_show_public === "1") || false;
			lychee.swipe_tolerance_x = validatedSwipeToleranceX;
			lychee.swipe_tolerance_y = validatedSwipeToleranceY;

			lychee.default_license = data.config.default_license || "none";
			lychee.css = data.config.css || "";
			lychee.full_photo = data.config.full_photo == null || data.config.full_photo === "1";
			lychee.downloadable = (data.config.downloadable && data.config.downloadable === "1") || false;
			lychee.public_photos_hidden = data.config.public_photos_hidden == null || data.config.public_photos_hidden === "1";
			lychee.share_button_visible = (data.config.share_button_visible && data.config.share_button_visible === "1") || false;
			lychee.delete_imported = data.config.delete_imported && data.config.delete_imported === "1";
			lychee.import_via_symlink = data.config.import_via_symlink && data.config.import_via_symlink === "1";
			lychee.skip_duplicates = data.config.skip_duplicates && data.config.skip_duplicates === "1";
			lychee.nsfw_visible = (data.config.nsfw_visible && data.config.nsfw_visible === "1") || false;
			lychee.nsfw_blur = (data.config.nsfw_blur && data.config.nsfw_blur === "1") || false;
			lychee.nsfw_warning = (data.config.nsfw_warning_admin && data.config.nsfw_warning_admin === "1") || false;

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

			lychee.editor_enabled = (data.config.editor_enabled && data.config.editor_enabled === "1") || false;

			lychee.upload = !lychee.api_V2;
			lychee.admin = !lychee.api_V2;
			lychee.nsfw_visible_saved = lychee.nsfw_visible;

			lychee.upload_processing_limit = parseInt(data.config.upload_processing_limit);
			// when null or any non stringified numeric value is sent from the server we get NaN.
			// we fix this.
			if (isNaN(lychee.upload_processing_limit)) lychee.upload_processing_limit = 4;

			// leftMenu
			leftMenu.build();
			leftMenu.bind();

			if (lychee.api_V2) {
				lychee.upload = data.admin || data.upload;
				lychee.admin = data.admin;
				lychee.lock = data.lock;
				lychee.username = data.username;
			}
			lychee.setMode("logged_in");

			// Show dialog when there is no username and password
			if (data.config.login === false) settings.createLogin();
		} else if (data.status === 1) {
			// Logged out

			// TODO remove sortingPhoto once the v4 is out
			lychee.sortingPhotos = data.config.sorting_Photos || data.config.sortingPhotos || "";
			lychee.sortingAlbums = data.config.sorting_Albums || data.config.sortingAlbums || "";
			lychee.album_subtitle_type = data.config.album_subtitle_type || "oldstyle";
			lychee.checkForUpdates = data.config.check_for_updates || data.config.checkForUpdates || "1";
			lychee.layout = data.config.layout || "1";
			lychee.public_search = (data.config.public_search && data.config.public_search === "1") || false;
			lychee.image_overlay_type = !data.config.image_overlay_type ? "exif" : data.config.image_overlay_type;
			lychee.image_overlay_type_default = lychee.image_overlay_type;
			lychee.map_display = (data.config.map_display && data.config.map_display === "1") || false;
			lychee.map_display_public = (data.config.map_display_public && data.config.map_display_public === "1") || false;
			lychee.map_display_direction = (data.config.map_display_direction && data.config.map_display_direction === "1") || false;
			lychee.map_provider = !data.config.map_provider ? "Wikimedia" : data.config.map_provider;
			lychee.map_include_subalbums = (data.config.map_include_subalbums && data.config.map_include_subalbums === "1") || false;
			lychee.location_show = (data.config.location_show && data.config.location_show === "1") || false;
			lychee.location_show_public = (data.config.location_show_public && data.config.location_show_public === "1") || false;
			lychee.swipe_tolerance_x = validatedSwipeToleranceX;
			lychee.swipe_tolerance_y = validatedSwipeToleranceY;

			lychee.nsfw_visible = (data.config.nsfw_visible && data.config.nsfw_visible === "1") || false;
			lychee.nsfw_blur = (data.config.nsfw_blur && data.config.nsfw_blur === "1") || false;
			lychee.nsfw_warning = (data.config.nsfw_warning && data.config.nsfw_warning === "1") || false;

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
			lychee.nsfw_visible_saved = lychee.nsfw_visible;

			// console.log(lychee.full_photo);
			lychee.setMode("public");
		} else {
			// should not happen.
		}

		if (exitview) {
			$(window).bind("popstate", lychee.load);
			lychee.load();
		}
	});
};

lychee.login = function (data) {
	let username = data.username;
	let password = data.password;

	if (!username.trim()) {
		basicModal.error("username");
		return;
	}
	if (!password.trim()) {
		basicModal.error("password");
		return;
	}

	let params = {
		username,
		password,
	};

	api.post("Session::login", params, function (_data) {
		if (_data === true) {
			window.location.reload();
		} else {
			// Show error and reactive button
			basicModal.error("password");
		}
	});
};

lychee.loginDialog = function () {
	// Make background make unfocusable
	tabindex.makeUnfocusable(header.dom());
	tabindex.makeUnfocusable(lychee.content);
	tabindex.makeUnfocusable(lychee.imageview);

	let msg = lychee.html`
			<a class='signInKeyLess' id='signInKeyLess'>${build.iconic("key")}</a>
			<form>
				<p class='signIn'>
					<input class='text' name='username' autocomplete='on' type='text' placeholder='$${
						lychee.locale["USERNAME"]
					}' autocapitalize='off' data-tabindex='${tabindex.get_next_tab_index()}'>
					<input class='text' name='password' autocomplete='current-password' type='password' placeholder='$${
						lychee.locale["PASSWORD"]
					}' data-tabindex='${tabindex.get_next_tab_index()}'>
				</p>
				<p class='version'>Lychee ${lychee.version}<span> &#8211; <a target='_blank' href='${lychee.updateURL}' data-tabindex='-1'>${
		lychee.locale["UPDATE_AVAILABLE"]
	}</a><span></p>
			</form>
			`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale["SIGN_IN"],
				fn: lychee.login,
				attributes: [["data-tabindex", tabindex.get_next_tab_index()]],
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
				attributes: [["data-tabindex", tabindex.get_next_tab_index()]],
			},
		},
	});
	$("#signInKeyLess").on("click", u2f.login);

	if (lychee.checkForUpdates === "1") lychee.getUpdate();

	tabindex.makeFocusable(basicModal.dom());
};

lychee.logout = function () {
	api.post("Session::logout", {}, function () {
		window.location.reload();
	});
};

lychee.goto = function (url = "", autoplay = true) {
	url = "#" + url;

	history.pushState(null, null, url);
	lychee.load(autoplay);
};

lychee.gotoMap = function (albumID = "", autoplay = true) {
	// If map functionality is disabled -> go to album
	if (!lychee.map_display) {
		loadingBar.show("error", lychee.locale["ERROR_MAP_DEACTIVATED"]);
		return;
	}
	lychee.goto("map/" + albumID, autoplay);
};

lychee.load = function (autoplay = true) {
	let albumID = "";
	let photoID = "";
	let hash = document.location.hash.replace("#", "").split("/");

	contextMenu.close();
	multiselect.close();
	tabindex.reset();

	if (hash[0] != null) albumID = hash[0];
	if (hash[1] != null) photoID = hash[1];

	if (albumID && photoID) {
		if (albumID == "map") {
			// If map functionality is disabled -> do nothing
			if (!lychee.map_display) {
				loadingBar.show("error", lychee.locale["ERROR_MAP_DEACTIVATED"]);
				return;
			}
			$(".no_content").remove();
			// show map
			// albumID has been stored in photoID due to URL format #map/albumID
			albumID = photoID;

			// Trash data
			photo.json = null;

			// Show Album -> it's below the map
			if (visible.photo()) view.photo.hide();
			if (visible.sidebar()) sidebar.toggle();
			if (album.json && albumID === album.json.id) {
				view.album.title();
			}
			mapview.open(albumID);
			lychee.footer_hide();
		} else if (albumID == "search") {
			// Search has been triggered
			const search_string = decodeURIComponent(photoID);

			if (search_string.trim() === "") {
				// do nothing on "only space" search strings
				return;
			}
			// If public search is diabled -> do nothing
			if (lychee.publicMode === true && !lychee.public_search) {
				loadingBar.show("error", lychee.locale["ERROR_SEARCH_DEACTIVATED"]);
				return;
			}

			header.dom(".header__search").val(search_string);
			search.find(search_string);

			lychee.footer_show();
		} else {
			$(".no_content").remove();
			// Show photo

			// Trash data
			photo.json = null;

			// Show Photo
			if (
				lychee.content.html() === "" ||
				album.json == null ||
				(header.dom(".header__search").length && header.dom(".header__search").val().length !== 0)
			) {
				lychee.content.hide();
				album.load(albumID, true);
			}
			photo.load(photoID, albumID, autoplay);

			// Make imageview focussable
			tabindex.makeFocusable(lychee.imageview);

			// Make thumbnails unfocusable and store which element had focus
			tabindex.makeUnfocusable(lychee.content, true);

			// hide contentview if requested
			if (lychee.hide_content_during_imgview) lychee.content.hide();

			lychee.footer_hide();
		}
	} else if (albumID) {
		if (albumID == "map") {
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
			if (visible.sidebar()) sidebar.toggle();
			mapview.open();
			lychee.footer_hide();
		} else if (albumID == "search") {
			// search string is empty -> do nothing
		} else {
			$(".no_content").remove();
			// Trash data
			photo.json = null;

			// Show Album
			if (visible.photo()) {
				view.photo.hide();
				tabindex.makeUnfocusable(lychee.imageview);
			}
			if (visible.mapview()) mapview.close();
			if (visible.sidebar() && album.isSmartID(albumID)) sidebar.toggle();
			$("#sensitive_warning").hide();
			if (album.json && albumID === album.json.id) {
				view.album.title();
				lychee.content.show();
				tabindex.makeFocusable(lychee.content, true);
			} else {
				album.load(albumID);
			}
			lychee.footer_show();
		}
	} else {
		$(".no_content").remove();
		// Trash albums.json when filled with search results
		if (search.hash != null) {
			albums.json = null;
			search.hash = null;
		}

		// Trash data
		album.json = null;
		photo.json = null;

		// Hide sidebar
		if (visible.sidebar()) sidebar.toggle();

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

lychee.getUpdate = function () {
	// console.log(lychee.update_available);
	// console.log(lychee.update_json);

	if (lychee.update_json !== 0) {
		if (lychee.update_available) {
			$(".version span").show();
		}
	} else {
		const success = function (data) {
			if (data.lychee.version > parseInt(lychee.versionCode)) $(".version span").show();
		};

		$.ajax({
			url: lychee.updatePath,
			success: success,
		});
	}
};

lychee.setTitle = function (title, editable) {
	if (lychee.title === title) {
		document.title = lychee.title + " - " + lychee.locale["ALBUMS"];
	} else {
		document.title = lychee.title + " - " + title;
	}

	header.setEditable(editable);
	header.setTitle(title);
};

lychee.setMode = function (mode) {
	if (lychee.lock) {
		$("#button_settings_open").remove();
	}
	if (!lychee.upload) {
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
	if (!lychee.admin) {
		$("#button_users, #button_logs, #button_diagnostics").remove();
	}

	if (mode === "logged_in") {
		// we are logged in, we do not need that short cut anymore. :)
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

lychee.animate = function (obj, animation) {
	let animations = [
		["fadeIn", "fadeOut"],
		["contentZoomIn", "contentZoomOut"],
	];

	if (!obj.jQuery) obj = $(obj);

	for (let i = 0; i < animations.length; i++) {
		for (let x = 0; x < animations[i].length; x++) {
			if (animations[i][x] == animation) {
				obj.removeClass(animations[i][0] + " " + animations[i][1]).addClass(animation);
				return true;
			}
		}
	}

	return false;
};

lychee.retinize = function (path = "") {
	let extention = path.split(".").pop();
	let isPhoto = extention !== "svg";

	if (isPhoto === true) {
		path = path.replace(/\.[^/.]+$/, "");
		path = path + "@2x" + "." + extention;
	}

	return {
		path,
		isPhoto,
	};
};

lychee.loadDropbox = function (callback) {
	if (lychee.dropbox === false && lychee.dropboxKey != null && lychee.dropboxKey !== "") {
		loadingBar.show();

		let g = document.createElement("script");
		let s = document.getElementsByTagName("script")[0];

		g.src = "https://www.dropbox.com/static/api/1/dropins.js";
		g.id = "dropboxjs";
		g.type = "text/javascript";
		g.async = "true";
		g.setAttribute("data-app-key", lychee.dropboxKey);
		g.onload = g.onreadystatechange = function () {
			let rs = this.readyState;
			if (rs && rs !== "complete" && rs !== "loaded") return;
			lychee.dropbox = true;
			loadingBar.hide();
			callback();
		};
		s.parentNode.insertBefore(g, s);
	} else if (lychee.dropbox === true && lychee.dropboxKey != null && lychee.dropboxKey !== "") {
		callback();
	} else {
		settings.setDropboxKey(callback);
	}
};

lychee.getEventName = function () {
	if (lychee.device_type === "mobile") {
		return "touchend";
	}
	return "click";
};

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

lychee.error = function (errorThrown, params = "", data = "") {
	loadingBar.show("error", errorThrown);

	if (errorThrown === "Session timed out.") {
		setTimeout(() => {
			lychee.goto();
			window.location.reload();
		}, 3000);
	} else {
		console.error({
			description: errorThrown,
			params: params,
			response: data,
		});
	}
};

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

lychee.fullscreenToggle = function () {
	if (lychee.fullscreenStatus()) {
		lychee.fullscreenExit();
	} else {
		lychee.fullscreenEnter();
	}
};

lychee.fullscreenStatus = function () {
	let elem = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	return elem ? true : false;
};

lychee.fullscreenAvailable = function () {
	return document.fullscreenEnabled || document.mozFullscreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
};

lychee.fullscreenUpdate = function () {
	if (lychee.fullscreenStatus()) {
		$("#button_fs_album_enter,#button_fs_enter").hide();
		$("#button_fs_album_exit,#button_fs_exit").show();
	} else {
		$("#button_fs_album_enter,#button_fs_enter").show();
		$("#button_fs_album_exit,#button_fs_exit").hide();
	}
};

lychee.footer_show = function () {
	setTimeout(function () {
		lychee.footer.removeClass("hide_footer");
	}, 200);
};

lychee.footer_hide = function () {
	lychee.footer.addClass("hide_footer");
};

// Because the height of the footer can vary, we need to set some
// dimensions dynamically, at startup.
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

lychee.getBaseUrl = function () {
	if (location.href.includes("index.html")) {
		return location.href.replace("index.html" + location.hash, "");
	} else if (location.href.includes("gallery#")) {
		return location.href.replace("gallery" + location.hash, "");
	} else {
		return location.href.replace(location.hash, "");
	}
};

// Copied from https://github.com/feross/clipboard-copy/blob/9eba597c774feed48301fef689099599d612387c/index.js
lychee.clipboardCopy = function (text) {
	// Use the Async Clipboard API when available. Requires a secure browsing
	// context (i.e. HTTPS)
	if (navigator.clipboard) {
		return navigator.clipboard.writeText(text).catch(function (err) {
			throw err !== undefined ? err : new DOMException("The request is not allowed", "NotAllowedError");
		});
	}

	// ...Otherwise, use document.execCommand() fallback

	// Put the text to copy into a <span>
	let span = document.createElement("span");
	span.textContent = text;

	// Preserve consecutive spaces and newlines
	span.style.whiteSpace = "pre";

	// Add the <span> to the page
	document.body.appendChild(span);

	// Make a selection object representing the range of text selected by the user
	let selection = window.getSelection();
	let range = window.document.createRange();
	selection.removeAllRanges();
	range.selectNode(span);
	selection.addRange(range);

	// Copy text to the clipboard
	let success = false;

	try {
		success = window.document.execCommand("copy");
	} catch (err) {
		console.log("error", err);
	}

	// Cleanup
	selection.removeAllRanges();
	window.document.body.removeChild(span);

	return success;
	// ? Promise.resolve()
	// : Promise.reject(new DOMException('The request is not allowed', 'NotAllowedError'))
};
