/**
 * @description Lets you change settings.
 */

let settings = {};

/**
 * @returns {void}
 */
settings.open = function () {
	view.settings.init();
};

/**
 * @returns {void}
 */
settings.createConfig = function () {
	/**
	 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
	 * @param {Object} params the original JSON parameters of the request
	 * @param {?LycheeException} lycheeException the Lychee exception
	 * @returns {boolean}
	 */
	const errorHandler = function (jqXHR, params, lycheeException) {
		const _data = lycheeException ? lycheeException.message : lychee.locale["ERROR_UNKNOWN"];

		// TODO: Where, when and how does the server throw these error messages?
		// Have these error message ever been used? The backend doesn't
		// define these message and had not even done so before the re-factoring.
		// Are these conditions legacy and probably never taken?
		if (_data === "Warning: Connection failed!") {
			// Connection failed
			basicModal.show({
				body: "<p>" + lychee.locale["ERROR_DB_1"] + "</p>",
				buttons: {
					action: {
						title: lychee.locale["RETRY"],
						fn: () => settings.createConfig(),
					},
				},
			});
		} else if (_data === "Warning: Creation failed!") {
			// Creation failed
			basicModal.show({
				body: "<p>" + lychee.locale["ERROR_DB_2"] + "</p>",
				buttons: {
					action: {
						title: lychee.locale["RETRY"],
						fn: () => settings.createConfig(),
					},
				},
			});
		} else if (_data === "Warning: Could not create file!") {
			// Could not create file
			basicModal.show({
				body: "<p>" + lychee.locale["ERROR_CONFIG_FILE"] + "</p>",
				buttons: {
					action: {
						title: lychee.locale["RETRY"],
						fn: () => settings.createConfig(),
					},
				},
			});
		} else {
			// Something else went wrong
			basicModal.show({
				body: "<p>" + _data + "</p>",
				buttons: {
					action: {
						title: lychee.locale["RETRY"],
						fn: () => settings.createConfig(),
					},
				},
			});
		}

		return true;
	};

	/**
	 * @typedef ConfigDialogResult
	 *
	 * @property {string} dbHost
	 * @property {string} dbUser
	 * @property {string} dbPassword
	 * @property {string} dbName
	 * @property {string} dbTablePrefix
	 */

	/**
	 * @param {ConfigDialogResult} data
	 * @returns {void}
	 */
	const action = function (data) {
		const dbName = data.dbName || "lychee";
		const dbUser = data.dbUser || "";
		const dbPassword = data.dbPassword || "";
		const dbHost = data.dbHost || "localhost";
		const dbTablePrefix = data.dbTablePrefix || "";

		if (dbUser.length < 1) {
			basicModal.error("dbUser");
			return;
		}

		basicModal.close();

		const params = {
			dbName,
			dbUser,
			dbPassword,
			dbHost,
			dbTablePrefix,
		};

		api.post(
			"Config::create",
			params,
			() => window.location.reload(),
			null,
			errorHandler
		);
	};

	const msg = `
		<p>
			${lychee.locale["DB_INFO_TITLE"]}
			<input name='dbHost' class='text' type='text' placeholder='${lychee.locale["DB_INFO_HOST"]}' value=''>
			<input name='dbUser' class='text' type='text' placeholder='${lychee.locale["DB_INFO_USER"]}' value=''>
			<input name='dbPassword' class='text' type='password' placeholder='${lychee.locale["DB_INFO_PASSWORD"]}' value=''>
		</p><p>
			${lychee.locale["DB_INFO_TEXT"]}
			<input name='dbName' class='text' type='text' placeholder='${lychee.locale["DB_NAME"]}' value=''>
			<input name='dbTablePrefix' class='text' type='text' placeholder='${lychee.locale["DB_PREFIX"]}' value=''>
		</p>`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale["DB_CONNECT"],
				fn: action,
			},
		},
	});
};

settings.createLogin = function () {
	/**
	 * @param {XMLHttpRequest} jqXHR the jQuery XMLHttpRequest object, see {@link https://api.jquery.com/jQuery.ajax/#jqXHR}.
	 * @param {Object} params the original JSON parameters of the request
	 * @param {?LycheeException} lycheeException the Lychee exception
	 * @returns {boolean}
	 */
	const errorHandler = function (jqXHR, params, lycheeException) {
		let htmlBody = "<p>" + lychee.locale["ERROR_LOGIN"] + "</p>";
		htmlBody += lycheeException ? "<p>" + lycheeException.message + "</p>" : "";
		basicModal.show({
			body: htmlBody,
			buttons: {
				action: {
					title: lychee.locale["RETRY"],
					fn: () => settings.createLogin(),
				},
			},
		});
		return true;
	};

	/**
	 * @typedef SetLoginDialogResult
	 *
	 * @property {string} username
	 * @property {string} password
	 * @property {string} confirm
	 */

	/**
	 * @param {SetLoginDialogResult} data
	 * @returns {void}
	 */
	const action = function (data) {
		const username = data.username;
		const password = data.password;
		const confirm = data.confirm;

		if (!username.trim()) {
			basicModal.error("username");
			return;
		}

		if (!password.trim()) {
			basicModal.error("password");
			return;
		}

		if (password !== confirm) {
			basicModal.error("confirm");
			return;
		}

		basicModal.close();

		let params = {
			username,
			password,
		};

		api.post("Settings::setLogin", params, null, null, errorHandler);
	};

	const msg = `
		<p>
			${lychee.locale["LOGIN_TITLE"]}
			<input name='username' class='text' type='text' placeholder='${lychee.locale["LOGIN_USERNAME"]}' value=''>
			<input name='password' class='text' type='password' placeholder='${lychee.locale["LOGIN_PASSWORD"]}' value=''>
			<input name='confirm' class='text' type='password' placeholder='${lychee.locale["LOGIN_PASSWORD_CONFIRM"]}' value=''>
		</p>`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale["LOGIN_CREATE"],
				fn: action,
			},
		},
	});
};

/**
 * A dictionary of (name,value)-pairs of the form.
 *
 * @typedef SettingsFormData
 *
 * @type {Object.<string, (string|number|Array)>}
 */

/**
 * From https://github.com/electerious/basicModal/blob/master/src/scripts/main.js
 *
 * @param {string} formSelector
 * @returns {SettingsFormData}
 */
settings.getValues = function (formSelector) {
	const values = {};
	const inputs_select = $(formSelector + " input[name], " + formSelector + " select[name]");

	// Get value from all inputs
	$(inputs_select).each(function () {
		const name = $(this).attr("name");
		// Store name and value of input
		values[name] = $(this).val();
	});
	return values;
};

/**
 * @callback SettingClickCB
 *
 * @param {SettingsFormData} formData
 * @returns {void}
 */

/**
 * From https://github.com/electerious/basicModal/blob/master/src/scripts/main.js.
 *
 * @param {string} inputSelector
 * @param {string} formSelector
 * @param {SettingClickCB} settingClickCB
 */
settings.bind = function (inputSelector, formSelector, settingClickCB) {
	$(inputSelector).on("click", function () {
		settingClickCB(settings.getValues(formSelector));
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeLogin = function (params) {
	if (params.username.length < 1) {
		loadingBar.show("error", "new username cannot be empty.");
		$("input[name=username]").addClass("error");
		return;
	} else {
		$("input[name=username]").removeClass("error");
	}

	if (params.password.length < 1) {
		loadingBar.show("error", "new password cannot be empty.");
		$("input[name=password]").addClass("error");
		return;
	} else {
		$("input[name=password]").removeClass("error");
	}

	if (params.password !== params.confirm) {
		loadingBar.show("error", "new password does not match.");
		$("input[name=confirm]").addClass("error");
		return;
	} else {
		$("input[name=confirm]").removeClass("error");
	}

	api.post("Settings::setLogin", params, function () {
		$("input[name]").removeClass("error");
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LOGIN"]);
		view.settings.content.clearLogin();
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeSorting = function (params) {
	api.post("Settings::setSorting", params, function () {
		lychee.sortingAlbums = "ORDER BY " + params["typeAlbums"] + " " + params["orderAlbums"];
		lychee.sortingPhotos = "ORDER BY " + params["typePhotos"] + " " + params["orderPhotos"];
		albums.refresh();
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_SORT"]);
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeDropboxKey = function (params) {
	// if params.key == "" key is cleared
	api.post("Settings::setDropboxKey", params, function () {
		lychee.dropboxKey = params.key;
		// if (callback) lychee.loadDropbox(callback)
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_DROPBOX"]);
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeLang = function (params) {
	api.post("Settings::setLang", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LANG"]);
		lychee.init();
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.setDefaultLicense = function (params) {
	api.post("Settings::setDefaultLicense", params, function () {
		lychee.default_license = params.license;
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LICENSE"]);
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.setLayout = function (params) {
	api.post("Settings::setLayout", params, function () {
		lychee.layout = params.layout;
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LAYOUT"]);
	});
};

/**
 * @returns {void}
 */
settings.changePublicSearch = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `PublicSearch: boolean`; in that case there is no need for an inefficient jQuery selector
		public_search: ($("#PublicSearch:checked").length === 1)
	};

	api.post("Settings::setPublicSearch", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_PUBLIC_SEARCH"]);
		lychee.public_search = params.public_search;
	});
};

/**
 * @returns {void}
 */
settings.setOverlayType = function () {
	// validate the input
	const params = {};
	// TODO: Presumably, the `SettingsFormData` also includes the properties `ImageOverlay: boolean` and `ImgOverlayType: string`; in that case there is no need for an inefficient jQuery selector
	const check = $("#ImageOverlay:checked") ? true : false;
	const type = $("#ImgOverlayType").val();
	if (check && type === "exif") {
		params.image_overlay_type = "exif";
	} else if (check && type === "desc") {
		params.image_overlay_type = "desc";
	} else if (check && type === "date") {
		params.image_overlay_type = "date";
	} else if (check && type === "none") {
		params.image_overlay_type = "none";
	} else {
		params.image_overlay_type = "exif";
		console.log("Error - default used");
	}

	api.post("Settings::setOverlayType", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_IMAGE_OVERLAY"]);
		lychee.image_overlay_type = params.image_overlay_type;
		lychee.image_overlay_type_default = params.image_overlay_type;
	});
};

/**
 * @returns {void}
 */
settings.changeMapDisplay = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `MapDisplay: boolean`; in that case there is no need for an inefficient jQuery selector
		map_display: ($("#MapDisplay:checked").length === 1)
	};

	api.post("Settings::setMapDisplay", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
		lychee.map_display = params.map_display;
		// Map functionality is disabled
		// -> map for public albums also needs to be disabled
		if (!lychee.map_display && lychee.map_display_public) {
			$("#MapDisplayPublic").click();
		}
	});
};

/**
 * @returns {void}
 */
settings.changeMapDisplayPublic = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `MapDisplayPublic: boolean`; in that case there is no need for an inefficient jQuery selector
		map_display_public: ($("#MapDisplayPublic:checked").length === 1)
	}

	api.post("Settings::setMapDisplayPublic", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY_PUBLIC"]);
		lychee.map_display_public = params.map_display_public;
		// If public map functionality is enabled, but map in general is disabled
		// General map functionality needs to be enabled
		if (lychee.map_display_public && !lychee.map_display) {
			$("#MapDisplay").click();
		}
	});
};

/**
 * @returns {void}
 */
settings.setMapProvider = function () {
	// TODO: Presumably, the `SettingsFormData` also includes a property `MapProvider: string`; in that case there is no need for an inefficient jQuery selector
	const params = {
		map_provider: $("#MapProvider").val()
	};

	api.post("Settings::setMapProvider", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_PROVIDER"]);
		lychee.map_provider = params.map_provider;
	});
};

/**
 * @returns {void}
 */
settings.changeMapIncludeSubalbums = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `MapIncludeSubalbums: boolean`; in that case there is no need for an inefficient jQuery selector
		map_include_subalbums: ($("#MapIncludeSubalbums:checked").length === 1),
	};
	api.post("Settings::setMapIncludeSubalbums", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
		lychee.map_include_subalbums = params.map_include_subalbums;
	});
};

/**
 * @returns {void}
 */
settings.changeLocationDecoding = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `LocationDecoding: boolean`; in that case there is no need for an inefficient jQuery selector
		location_decoding: ($("#LocationDecoding:checked").length === 1)
	};
	api.post("Settings::setLocationDecoding", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
		lychee.location_decoding = params.location_decoding;
	});
};

/**
 * @returns {void}
 */
settings.changeNSFWVisible = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `NSFWVisible: boolean`; in that case there is no need for an inefficient jQuery selector
		nsfw_visible: ($("#NSFWVisible:checked").length === 1),
	};
	api.post("Settings::setNSFWVisible", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_NSFW_VISIBLE"]);
		lychee.nsfw_visible = params.nsfw_visible;
		lychee.nsfw_visible_saved = lychee.nsfw_visible;
	});
};

//TODO : later
// lychee.nsfw_blur = (data.config.nsfw_blur && data.config.nsfw_blur === '1') || false;
// lychee.nsfw_warning = (data.config.nsfw_warning && data.config.nsfw_warning === '1') || false;
// lychee.nsfw_warning_text = data.config.nsfw_warning_text || '<b>Sensitive content</b><br><p>This album contains sensitive content which some people may find offensive or disturbing.</p>';

/**
 * @returns {void}
 */
settings.changeLocationShow = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `LocationShow: boolean`; in that case there is no need for an inefficient jQuery selector
		location_show: ($("#LocationShow:checked").length === 1)
	};
	api.post("Settings::setLocationShow", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
		lychee.location_show = params.location_show;
		// Don't show location
		// -> location for public albums also needs to be disabled
		if (!lychee.location_show && lychee.location_show_public) {
			$("#LocationShowPublic").click();
		}
	});
};

/**
 * @returns {void}
 */
settings.changeLocationShowPublic = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `LocationShowPublic: boolean`; in that case there is no need for an inefficient jQuery selector
		location_show_public: ($("#LocationShowPublic:checked").length === 1)
	};
	api.post("Settings::setLocationShowPublic", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
		lychee.location_show_public = params.location_show_public;
		// If public map functionality is enabled, but map in general is disabled
		// General map functionality needs to be enabled
		if (lychee.location_show_public && !lychee.location_show) {
			$("#LocationShow").click();
		}
	});
};

/**
 * @returns {void}
 */
settings.changeNewPhotosNotification = function () {
	const params = {
		// TODO: Presumably, the `SettingsFormData` also includes a property `NewPhotosNotification: boolean`; in that case there is no need for an inefficient jQuery selector
		new_photos_notification: ($("#NewPhotosNotification:checked").length === 1)
	};
	api.post("Settings::setNewPhotosNotification", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_NEW_PHOTOS_NOTIFICATION"]);
		lychee.new_photos_notification = params.new_photos_notification;
	});
};

/**
 * @returns {void}
 */
settings.changeCSS = function () {
	const params = {
		css: $("#css").val()
	};
	api.post("Settings::setCSS", params, function () {
		lychee.css = params.css;
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_CSS"]);
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.save = function (params) {
	api.post("Settings::saveAll", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_UPDATE"]);
		view.full_settings.init();
		// re-read settings
		lychee.init(false);
	});
};

/**
 * @param {jQuery.Event} e
 * @returns {void}
 */
settings.save_enter = function (e) {
	// We only handle "enter"
	if (e.which !== 13) return;

	// show confirmation box
	$(":focus").blur();

	let action = {};
	let cancel = {};

	action.title = lychee.locale["ENTER"];
	action.msg = lychee.html`<p style="color: #d92c34; font-size: 1.3em; font-weight: bold; text-transform: capitalize; text-align: center;">${lychee.locale["SAVE_RISK"]}</p>`;

	cancel.title = lychee.locale["CANCEL"];

	action.fn = function () {
		settings.save(settings.getValues("#fullSettings"));
		basicModal.close();
	};

	basicModal.show({
		body: action.msg,
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
