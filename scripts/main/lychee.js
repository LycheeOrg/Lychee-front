/**
 * @description This module provides the basic functions of Lychee.
 */

const lychee = {
	/**
	 * The version of the backend in human-readable
	 * @type {Version}
	 */
	version: null,

	updateGit: "https://github.com/LycheeOrg/Lychee",
	updateURL: "https://github.com/LycheeOrg/Lychee/releases",
	website: "https://LycheeOrg.github.io",

	publicMode: false,
	viewMode: false,
	grants_full_photo_access: true,
	grants_download: false,
	public_photos_hidden: true,
	share_button_visible: false,
	/**
	 * The authenticated user or `null` if unauthenticated
	 * @type {?User}
	 */
	user: null,
	/**
	 * The rights granted by the backend
	 * @type {?GlobalRightsDTO}
	 */
	rights: null,
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
	/** @type {string} */
	nsfw_banner_override: "",

	album_subtitle_type: "oldstyle",
	album_decoration: "layers",
	album_decoration_orientation: "row",

	upload_processing_limit: 4,

	/**
	 * Allow users to change their username
	 * @type {boolean}
	 */
	allow_username_change: true,

	/**
	 * The URL to the Facebook page related to this site
	 * @type {string}
	 */
	sm_facebook_url: "",
	/**
	 * The URL to the Flickr page related to this site
	 * @type {string}
	 */
	sm_flickr_url: "",
	/**
	 * The URL to the Instagram page related to this site
	 * @type {string}
	 */
	sm_instagram_url: "",
	/**
	 * The URL to the Twitter page related to this site
	 * @type {string}
	 */
	sm_twitter_url: "",
	/**
	 * The URL to the YouTube channel related to this site
	 * @type {string}
	 */
	sm_youtube_url: "",
	/**
	 * Indicates whether RSS feeds are enabled or not
	 * @type {boolean}
	 */
	rss_enable: false,
	/**
	 * An array of RSS feeds provided by the site
	 * @type {Feed[]}
	 */
	rss_feeds: [],
	/**
	 * The site title.
	 * @type {string}
	 */
	site_title: "",
	/**
	 * The name of the site owner.
	 * @type {string}
	 */
	site_owner: "",
	/**
	 * Begin of copyright.
	 * @type {string}
	 */
	site_copyright_begin: "",
	/**
	 * End of copyright.
	 * @type {string}
	 */
	site_copyright_end: "",

	/**
	 * Determines if social media links are shown in footer.
	 * @type {boolean}
	 */
	footer_show_social_media: false,
	/**
	 * Determines if copyright notice is shown in footer.
	 * @type {boolean}
	 */
	footer_show_copyright: false,
	/**
	 * An optional line of text to be shown in the footer.
	 * @type {string}
	 */
	footer_additional_text: "",

	/**
	 * Determines whether frame mode is enabled or not
	 * @type {boolean}
	 */
	mod_frame_enabled: false,
	/**
	 * Refresh rate in seconds for the frame mode.
	 * @type {number}
	 */
	mod_frame_refresh: 30,

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

	checkForUpdates: true,
	update_json: false,
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

	/**
	 * The visibility status of recent, starred, on_this_day
	 */
	smart_album_visibilty: [],

	dropbox: false,
	dropboxKey: "",

	content: $("#lychee_view_content"),
	imageview: $("#imageview"),
	footer: $("#lychee_footer"),

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
		<p class="update-status up-to-date-release"><a target='_blank' href='${lychee.updateURL}'></a></p>
		<p class="update-status up-to-date-git"><a target='_blank' href='${lychee.updateGit}'></a></p>
		<h2></h2>
		<p class="about-desc"></p>`;

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initAboutDialog = function (formElements, dialog) {
		dialog.querySelector("span.version-number").textContent = lychee.version.major + "." + lychee.version.minor + "." + lychee.version.patch;
		// If Release is available : show release
		// If Git is available : show git
		if (lychee.update_available) {
			dialog.querySelector("p.up-to-date-release a").textContent = lychee.locale["UPDATE_AVAILABLE"];
			dialog.querySelector("p.up-to-date-release").classList.remove("up-to-date-release");
		} else if (lychee.update_json) {
			dialog.querySelector("p.up-to-date-git a").textContent = lychee.locale["UPDATE_AVAILABLE"];
			dialog.querySelector("p.up-to-date-git").classList.remove("up-to-date-git");
		}

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
	api.post(
		"Session::init",
		{},
		/** @param {InitializationData} data */
		function (data) {
			lychee.parseInitializationData(data);

			if (data.user !== null || data.rights.settings.can_edit) {
				// Authenticated or no admin is registered
				leftMenu.build();
				leftMenu.bind();
				lychee.setMode("logged_in");
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
	lychee.version = data.config.version;

	// we copy the locale that exists only.
	// This ensures forward and backward compatibility.
	// e.g. if the front localization is unfinished in a language
	// or if we need to change some locale string
	for (let key in data.locale) {
		lychee.locale[key] = data.locale[key];
	}

	lychee.parsePublicInitializationData(data);
	if (lychee.user !== null || lychee.rights.settings.can_edit) {
		lychee.parseProtectedInitializationData(data);
	}

	lychee.initHtmlHeader();
	lychee.localizeStaticGuiElements();
};

/**
 * Initializes the HTML header of the page according to the loaded
 * configuration.
 *
 * This method is comparable to {@link lychee.setMetaData} except that this
 * method sets data in the HTML header which does not change for each page
 * but is static for the entire site.
 */
lychee.initHtmlHeader = function () {
	// General Meta Data
	document.querySelector('meta[name="author"]').content = lychee.site_owner;
	document.querySelector('meta[name="publisher"]').content = lychee.site_owner;
	// RSS feeds
	if (lychee.rss_enable) {
		const head = document.querySelector("head");
		lychee.rss_feeds.forEach(function (feed) {
			const link = document.createElement("link");
			link.rel = "alternate";
			link.type = feed.mimetype;
			link.href = feed.url;
			link.title = feed.title;
			head.appendChild(link);
		});
	}
};

/**
 * Applies the current `lychee.locale` to those GUI elements which are
 * static part of the HTML.
 *
 * Note, `lychee.setMode` removes some elements (e.g. the input element
 * for search) depending on the mode.
 * Hence, we must take some precautions as some elements might be `null`.
 * TODO: Fix that.
 *
 * @return {void}
 */
lychee.localizeStaticGuiElements = function () {
	// Toolbars in the header
	const tbPublic = document.querySelector("div#lychee_toolbar_public");
	tbPublic.querySelector("a#button_signin").title = lychee.locale["SIGN_IN"];
	const tbPublicSearch = tbPublic.querySelector("input.header__search");
	if (tbPublicSearch instanceof HTMLInputElement) {
		// See remark about `lychee.setMode` in the jsDoc comment of this method.
		tbPublicSearch.placeholder = lychee.locale["SEARCH"];
	}
	tbPublic.querySelector("a.button--map-albums").title = lychee.locale["DISPLAY_FULL_MAP"];

	const tbAlbums = document.querySelector("div#lychee_toolbar_albums");
	tbAlbums.querySelector("a#button_settings").title = lychee.locale["SETTINGS"];
	const tbAlbumsSearch = tbAlbums.querySelector("input.header__search");
	if (tbAlbumsSearch instanceof HTMLInputElement) {
		// See remark about `lychee.setMode` in the jsDoc comment of this method.
		tbAlbumsSearch.placeholder = lychee.locale["SEARCH"];
	}
	tbAlbums.querySelector("a.button--map-albums").title = lychee.locale["DISPLAY_FULL_MAP"];
	tbAlbums.querySelector("a.button_add").title = lychee.locale["ADD"];

	const tbAlbum = document.querySelector("div#lychee_toolbar_album");
	tbAlbum.querySelector("a#button_back_home").title = lychee.locale["CLOSE_ALBUM"];
	tbAlbum.querySelector("a#button_visibility_album").title = lychee.locale["VISIBILITY_ALBUM"];
	tbAlbum.querySelector("a#button_sharing_album_users").title = lychee.locale["SHARING_ALBUM_USERS"];
	tbAlbum.querySelector("a#button_nsfw_album").title = lychee.locale["ALBUM_MARK_NSFW"];
	tbAlbum.querySelector("a#button_share_album").title = lychee.locale["SHARE_ALBUM"];
	tbAlbum.querySelector("a#button_archive").title = lychee.locale["DOWNLOAD_ALBUM"];
	tbAlbum.querySelector("a#button_info_album").title = lychee.locale["ABOUT_ALBUM"];
	tbAlbum.querySelector("a#button_map_album").title = lychee.locale["DISPLAY_FULL_MAP"];
	tbAlbum.querySelector("a#button_move_album").title = lychee.locale["MOVE_ALBUM"];
	tbAlbum.querySelector("a#button_trash_album").title = lychee.locale["DELETE_ALBUM"];
	tbAlbum.querySelector("a#button_fs_album_enter").title = lychee.locale["FULLSCREEN_ENTER"];
	tbAlbum.querySelector("a#button_fs_album_exit").title = lychee.locale["FULLSCREEN_EXIT"];
	tbAlbum.querySelector("a.button_add").title = lychee.locale["ADD"];

	const tbPhoto = document.querySelector("div#lychee_toolbar_photo");
	tbPhoto.querySelector("a#button_back").title = lychee.locale["CLOSE_PHOTO"];
	tbPhoto.querySelector("a#button_star").title = lychee.locale["STAR_PHOTO"];
	tbPhoto.querySelector("a#button_visibility").title = lychee.locale["VISIBILITY_PHOTO"];
	tbPhoto.querySelector("a#button_rotate_ccwise").title = lychee.locale["PHOTO_EDIT_ROTATECCWISE"];
	tbPhoto.querySelector("a#button_rotate_cwise").title = lychee.locale["PHOTO_EDIT_ROTATECWISE"];
	tbPhoto.querySelector("a#button_share").title = lychee.locale["SHARE_PHOTO"];
	tbPhoto.querySelector("a#button_info").title = lychee.locale["ABOUT_PHOTO"];
	tbPhoto.querySelector("a#button_map").title = lychee.locale["DISPLAY_FULL_MAP"];
	tbPhoto.querySelector("a#button_move").title = lychee.locale["MOVE"];
	tbPhoto.querySelector("a#button_trash").title = lychee.locale["DELETE"];
	tbPhoto.querySelector("a#button_fs_enter").title = lychee.locale["FULLSCREEN_ENTER"];
	tbPhoto.querySelector("a#button_fs_exit").title = lychee.locale["FULLSCREEN_EXIT"];
	tbPhoto.querySelector("a#button_more").title = lychee.locale["MORE"];

	const tbMap = document.querySelector("div#lychee_toolbar_map");
	tbMap.querySelector("a#button_back_map").title = lychee.locale["CLOSE_MAP"];

	const tbConfig = document.querySelector("div#lychee_toolbar_config");
	tbConfig.querySelector("a#button_close_config").title = lychee.locale["CLOSE"];

	// Sidebar
	document.querySelector("#lychee_sidebar_header h1").textContent = lychee.locale["PHOTO_ABOUT"];

	// NSFW Warning Banner
	/** @type {HTMLDivElement} */
	const nsfwBanner = document.querySelector("#sensitive_warning");
	nsfwBanner.innerHTML = lychee.nsfw_banner_override ? lychee.nsfw_banner_override : lychee.locale["NSFW_BANNER"];

	// Footer
	const footer = document.querySelector("#lychee_footer");
	footer.querySelector("p.home_copyright").textContent = lychee.footer_show_copyright
		? sprintf(
				lychee.locale["FOOTER_COPYRIGHT"],
				lychee.site_owner,
				lychee.site_copyright_begin === lychee.site_copyright_end
					? lychee.site_copyright_begin
					: lychee.site_copyright_begin + "–" + lychee.site_copyright_end
		  )
		: "";
	footer.querySelector("p.personal_text").textContent = lychee.footer_additional_text;
	footer.querySelector("p.hosted_by a").textContent = lychee.locale["HOSTED_WITH_LYCHEE"];
	/** @type {HTMLDivElement} */
	const footerSocialMedia = footer.querySelector("div#home_socials");
	if (lychee.footer_show_social_media) {
		footerSocialMedia.style.display = null;
		footerSocialMedia.querySelector("a#facebook").href = lychee.sm_facebook_url;
		footerSocialMedia.querySelector("a#flickr").href = lychee.sm_flickr_url;
		footerSocialMedia.querySelector("a#instagram").href = lychee.sm_instagram_url;
		footerSocialMedia.querySelector("a#twitter").href = lychee.sm_twitter_url;
		footerSocialMedia.querySelector("a#youtube").href = lychee.sm_youtube_url;
	} else {
		footerSocialMedia.style.display = "none";
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
	lychee.share_button_visible = data.config.share_button_visible;
	lychee.album_subtitle_type = data.config.album_subtitle_type || "oldstyle";
	lychee.album_decoration = data.config.album_decoration || "layers";
	lychee.album_decoration_orientation = data.config.album_decoration_orientation || "row";
	lychee.checkForUpdates = data.config.check_for_updates;
	lychee.layout = Number.parseInt(data.config.layout, 10);
	if (Number.isNaN(lychee.layout)) lychee.layout = 1;
	lychee.landing_page_enable = data.config.landing_page_enable;
	lychee.public_search = data.config.public_search;
	lychee.image_overlay_type = data.config.image_overlay_type || "exif";
	lychee.image_overlay_type_default = lychee.image_overlay_type;
	lychee.map_display = data.config.map_display;
	lychee.map_display_public = data.config.map_display_public;
	lychee.map_display_direction = data.config.map_display_direction === "1";
	lychee.map_provider = data.config.map_provider || "Wikimedia";
	lychee.map_include_subalbums = data.config.map_include_subalbums;
	lychee.location_show = data.config.location_show;
	lychee.location_show_public = data.config.location_show_public;
	lychee.swipe_tolerance_x = Number.parseInt(data.config.swipe_tolerance_x, 10) || 150;
	lychee.swipe_tolerance_y = Number.parseInt(data.config.swipe_tolerance_y, 10) || 250;

	lychee.nsfw_visible = data.config.nsfw_visible;
	lychee.nsfw_visible_saved = lychee.nsfw_visible;
	lychee.nsfw_blur = data.config.nsfw_blur;
	lychee.nsfw_warning = data.config.nsfw_warning;
	lychee.nsfw_banner_override = data.config.nsfw_banner_override || "";

	lychee.sm_facebook_url = data.config.sm_facebook_url;
	lychee.sm_flickr_url = data.config.sm_flickr_url;
	lychee.sm_instagram_url = data.config.sm_instagram_url;
	lychee.sm_twitter_url = data.config.sm_twitter_url;
	lychee.sm_youtube_url = data.config.sm_youtube_url;

	lychee.rss_enable = data.config.rss_enable;
	lychee.rss_feeds = data.config.rss_feeds;

	lychee.site_title = data.config.site_title;
	lychee.site_owner = data.config.site_owner;
	lychee.site_copyright_begin = data.config.site_copyright_begin;
	lychee.site_copyright_end = data.config.site_copyright_end;

	lychee.footer_show_social_media = data.config.footer_show_social_media;
	lychee.footer_show_copyright = data.config.footer_show_copyright;
	lychee.footer_additional_text = data.config.footer_additional_text;

	lychee.mod_frame_enabled = data.config.mod_frame_enabled;
	lychee.mod_frame_refresh = Number.parseInt(data.config.mod_frame_refresh, 10) || 30;

	const isTv = window.matchMedia("tv").matches;

	lychee.header_auto_hide = !isTv;
	lychee.active_focus_on_page_load = isTv;
	lychee.enable_button_visibility = !isTv;
	lychee.enable_button_share = !isTv;
	lychee.enable_button_archive = !isTv;
	lychee.enable_button_move = !isTv;
	lychee.enable_button_trash = !isTv;
	lychee.enable_button_fullscreen = !isTv;
	lychee.enable_button_download = !isTv;
	lychee.enable_button_add = !isTv;
	lychee.enable_button_more = !isTv;
	lychee.enable_button_rotate = !isTv;
	lychee.enable_close_tab_on_esc = isTv;
	lychee.enable_tabindex = isTv;
	lychee.enable_contextmenu_header = !isTv;
	lychee.hide_content_during_imgview = isTv;
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
	lychee.allow_username_change = data.config.allow_username_change;
	lychee.dropboxKey = data.config.dropbox_key || "";
	lychee.location = data.config.location || "";
	lychee.checkForUpdates = data.config.check_for_updates;
	lychee.lang = data.config.lang || "";
	lychee.lang_available = data.config.lang_available || [];
	lychee.location_decoding = data.config.location_decoding;
	lychee.default_license = data.config.default_license || "none";
	lychee.css = data.config.css || "";
	lychee.grants_full_photo_access = data.config.grants_full_photo_access;
	lychee.grants_download = data.config.grants_download;
	lychee.public_photos_hidden = data.config.public_photos_hidden;
	lychee.delete_imported = data.config.delete_imported;
	lychee.import_via_symlink = data.config.import_via_symlink;
	lychee.skip_duplicates = data.config.skip_duplicates;
	lychee.editor_enabled = data.config.editor_enabled;
	lychee.new_photos_notification = data.config.new_photos_notification;
	lychee.upload_processing_limit = Number.parseInt(data.config.upload_processing_limit, 10) || 4;
	lychee.smart_album_visibilty = data.config.smart_album_visibilty;
};

/**
 * @param {{username: string, password: string}} data
 * @returns {void}
 */
lychee.login = function (data) {
	if (!data.username.trim()) {
		basicModal.focusError("username");
		return;
	}
	if (!data.password.trim()) {
		basicModal.focusError("password");
		return;
	}

	api.post(
		"Session::login",
		data,
		() => window.location.reload(),
		null,
		function (jqXHR) {
			if (jqXHR.status === 401) {
				basicModal.focusError("password");
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
		<p class='version'>Lychee <span class='version-number'></span>
			<span class="update-status up-to-date-release"> &#8211; <a target='_blank' href='${lychee.updateURL}' data-tabindex='-1'></a></span>
			<span class="update-status up-to-date-git"> &#8211; <a target='_blank' href='${lychee.updateGit}' data-tabindex='-1'></a></span>
		</p>
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
		if (!!lychee.version) {
			dialog.querySelector("span.version-number").textContent = lychee.version.major + "." + lychee.version.minor + "." + lychee.version.patch;
		} else {
			dialog.querySelector("span.version-number").textContent = "";
		}
		// If Release is available : show release
		// If Git is available : show git
		if (lychee.update_available) {
			dialog.querySelector("span.up-to-date-release a").textContent = lychee.locale["UPDATE_AVAILABLE"];
			dialog.querySelector("span.up-to-date-release").classList.remove("up-to-date-release");
		} else if (lychee.update_json) {
			dialog.querySelector("span.up-to-date-git a").textContent = lychee.locale["UPDATE_AVAILABLE"];
			dialog.querySelector("span.up-to-date-git").classList.remove("up-to-date-git");
		}

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
	url = "gallery#" + (url !== null ? url : "");
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
 * on what's in the web browser's URL.
 *
 * Traditionally, Lychee has been using client-side navigation based on
 * URL fragments (i.e. based on the part after the '#' character)
 * Fragments can match one of the following cases:
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
 *  - `frame`: shows random, starred photos in a kiosk mode
 *
 * Additionally, Lychee supports the following proper paths:
 *
 *  - `/view/{photoID}` and `/view?p={photoID}`: See `view/{photoID}` above
 *    for the fragment-based approach
 *  - `/frame`: See `frame` above for the fragment-based approach.
 *
 * @param {boolean} [autoplay=true]
 * @returns {void}
 */
lychee.load = function (autoplay = true) {
	let albumID = "";
	let photoID = "";

	const viewMatch = document.location.href.match(/\/view(?:\/|(\?p=))(?<photoID>[-_0-9A-Za-z]+)$/);
	const hashMatch = document.location.hash.replace("#", "").split("/");

	if (/\/frame\/?$/.test(document.location.href)) {
		albumID = "frame";
		photoID = "";
	} else if (viewMatch !== null && viewMatch.groups.photoID) {
		albumID = "view";
		photoID = viewMatch.groups.photoID;
	} else {
		albumID = hashMatch[0];
		if (albumID === SearchAlbumIDPrefix && hashMatch.length > 1) {
			albumID += "/" + hashMatch[1];
		}
		photoID = hashMatch[album.isSearchID(albumID) ? 2 : 1];
	}

	contextMenu.close();
	multiselect.close();
	tabindex.reset();

	// If Lychee is currently in frame or view mode, we need to re-initialize.
	// Note, this is a temporary nasty hack.
	// In an optimal world, we would simply call `lychee.setMode` to leave
	// view or frame mode and to enter gallery or public mode.
	// However, `lychee.setMode` does not support that direction (see comment
	// here).
	// Hence, in order to get back to a "full" mode, we need to re-initialize
	// completely.
	const bodyClasses = document.querySelector("body").classList;
	if (bodyClasses.contains("mode-frame") || bodyClasses.contains("mode-view")) {
		lychee.init(false);
		return;
	}

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
		} else if (albumID === "frame") {
			if (lychee.mod_frame_enabled) {
				frame.initAndStart();
			} else {
				loadingBar.show("error", "Frame mode disabled");
			}
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
			$("#sensitive_warning").removeClass("active");
			if (album.json && albumID === album.json.id) {
				if (album.isSearchID(albumID)) {
					if ($(".settings_view, .users_view, .sharing_view, .logs_diagnostics_view, .u2f_view").length > 0) {
						search.reset();
						history.back();
					} else {
						// We are probably coming back to the search results from
						// viewing an image.  Because search results is not a
						// regular album, it needs to be treated a little
						// differently.
						header.setMode("albums");
						lychee.setMetaData(lychee.locale["SEARCH_RESULTS"]);
					}
				} else {
					if ($(".settings_view, .users_view, .sharing_view, .logs_diagnostics_view, .u2f_view").length > 0) {
						album.load(albumID);
					} else {
						view.album.title();
					}
				}
				lychee.content.show();
				tabindex.makeFocusable(lychee.content, true);
				// If the album was loaded in the background (when content is
				// hidden), scrolling may not have worked.
				view.album.content.restoreScroll();
			} else if (album.isSearchID(albumID)) {
				// Search has been triggered
				let search_string = decodeURIComponent(hashMatch[1]).trim();

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
		$("#sensitive_warning").removeClass("active");
		lychee.content.show();
		lychee.footer_show();
		albums.load();
	}
};

/**
 * Sets the title and various other meta for the current page.
 *
 * The title is shown in the browser window and in the header bar.
 * The window title is prefixed by the value of the configuration setting
 * `lychee.site_title`.
 * If both, the prefix `lychee.site_title` and the given title, are not empty,
 * they are seperated by an en-dash.
 *
 * The description is postfixed with `" – via Lychee"` if not empty.
 *
 * @param {string=""} title
 * @param {boolean=false} isTitleEditable
 * @param {string=""} description
 * @param {string=""} photoUrl
 */
lychee.setMetaData = function (title = "", isTitleEditable = false, description = "", photoUrl = "") {
	const pageTitle = lychee.site_title + (lychee.site_title && title ? " – " : "") + title;
	const pageDescription = description ? description + " – via Lychee" : "";

	// General Meta Data
	document.title = pageTitle;
	document.querySelector('meta[name="description"]').content = pageDescription;

	// Twitter Meta Data
	document.querySelector('meta[name="twitter:title"]').content = pageTitle;
	document.querySelector('meta[name="twitter:description"]').content = pageDescription;
	document.querySelector('meta[name="twitter:image"]').content = photoUrl;

	// OpenGraph Meta Data (e.g. used by Facebook)
	document.querySelector('meta[property="og:title"]').content = pageTitle;
	document.querySelector('meta[property="og:description"]').content = pageDescription;
	document.querySelector('meta[property="og:image"]').content = photoUrl;
	document.querySelector('meta[property="og:url"]').content = window.location.href;

	header.setEditable(isTitleEditable);
	header.setTitle(title);
};

/**
 * Sets the "view mode" of the application.
 *
 * Note, this method is asymmetric and therewith causes a major problem.
 * It assumes that it is only called once and that the new mode is always
 * more restrictive than the previous mode.
 * This method only hides elements and unbinds events, but does not support
 * to show elements and bind events.
 * This method relies on {@link lychee.init} to have bound particular events
 * which can be unbound here.
 * TODO: Refactor this. There should be one (or several) methods to change modes, but each of the methods should be symmetric.
 *
 * TODO: FIX ME WITH NEW RIGHTS
 *
 * @param {string} mode - one out of: `public`, `view`, `logged_in`, `frame`
 */
lychee.setMode = function (mode) {
	if ((!lychee.rights.settings.can_edit && !lychee.rights.user.can_edit) || mode === "view" || mode === "frame") {
		$("#button_settings_open").hide();
	}

	if (!lychee.rights.root_album.can_upload || mode === "view" || mode === "frame") {
		$("#button_sharing").hide();

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
	if (!lychee.rights.user_management.can_list || mode === "view" || mode === "frame") {
		$("#button_users").hide();
	}
	if (!lychee.rights.settings.can_see_diagnostics || mode === "view" || mode === "frame") {
		$("#button_diagnostics").hide();
	}
	if (!lychee.rights.settings.can_see_logs || mode === "view" || mode === "frame") {
		$("#button_logs").hide();
	}

	const bodyClasses = document.querySelector("body").classList;

	if (mode === "logged_in") {
		if (!bodyClasses.contains("mode-gallery")) {
			bodyClasses.replace("mode-none", "mode-gallery");
			bodyClasses.replace("mode-frame", "mode-gallery");
			bodyClasses.replace("mode-view", "mode-gallery");
		}
		// After login the keyboard short-cuts to login by password (l) and
		// by key (k) are not required anymore, so we unbind them.
		Mousetrap.unbind(["l"]).unbind(["k"]);

		// The code searches by class, so remove the other instance.
		$(".header__search, .header__clear", "#lychee_toolbar_public").hide();

		if (!lychee.editor_enabled) {
			$("#button_rotate_cwise").hide();
			$("#button_rotate_ccwise").hide();
		}
		return;
	}
	$(".header__search, .header__clear", "#lychee_toolbar_albums").hide();
	$("#button_rotate_cwise").hide();
	$("#button_rotate_ccwise").hide();

	$("#button_settings, .header__divider, #lychee_left_menu_container").hide();

	if (mode === "public") {
		if (!bodyClasses.contains("mode-gallery")) {
			bodyClasses.replace("mode-none", "mode-gallery");
			bodyClasses.replace("mode-frame", "mode-gallery");
			bodyClasses.replace("mode-view", "mode-gallery");
		}
		lychee.publicMode = true;
	} else if (mode === "view") {
		if (!bodyClasses.contains("mode-view")) {
			bodyClasses.replace("mode-none", "mode-view");
			bodyClasses.replace("mode-frame", "mode-view");
			bodyClasses.replace("mode-gallery", "mode-view");
		}
		Mousetrap.unbind(["esc", "command+up"]);

		$("#button_back, a#next, a#previous").hide();
		$(".no_content").hide();

		lychee.publicMode = true;
		lychee.viewMode = true;
	} else if (mode === "frame") {
		if (!bodyClasses.contains("mode-frame")) {
			bodyClasses.replace("mode-none", "mode-frame");
			bodyClasses.replace("mode-view", "mode-frame");
			bodyClasses.replace("mode-gallery", "mode-frame");
		}
		Mousetrap.unbind(["esc", "command+up"]);

		$("#button_back, a#next, a#previous").hide();
		$(".no_content").hide();

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

/**
 * Adds the given event listener to the event target for both a `"click"` and
 * `"touchend"` event.
 *
 * @param {Element} eventTarget
 * @param {EventListenerOrEventListenerObject} listener
 * @param {boolean|AddEventListenerOptions} [options]
 * @return {void}
 */
lychee.addClickOrTouchListener = function (eventTarget, listener, options) {
	eventTarget.addEventListener("click", listener, options);
	eventTarget.addEventListener("touchend", listener, options);
};
