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

	/** @type {?NodeListOf<HTMLInputElement>} */
	const inputElements = document.querySelectorAll(formSelector + " input[name]");

	// Get value from all inputs
	inputElements.forEach(function (inputElement) {
		switch (inputElement.type) {
			case "checkbox":
			case "radio":
				values[inputElement.name] = inputElement.checked;
				break;
			case "number":
			case "range":
				values[inputElement.name] = parseInt(inputElement.value, 10);
				break;
			case "file":
				values[inputElement.name] = inputElement.files;
				break;
			default:
				switch (inputElement.getAttribute("inputmode")) {
					case "numeric":
						values[inputElement.name] = parseInt(inputElement.value, 10);
						break;
					case "decimal":
						values[inputElement.name] = parseFloat(inputElement.value);
						break;
					default:
						values[inputElement.name] = inputElement.value;
				}
		}
	});

	/** @type {?NodeListOf<HTMLSelectElement>} */
	const selectElements = document.querySelectorAll(formSelector + " select[name]");

	// Get name of selected option from all selects
	selectElements.forEach(function (selectElement) {
		values[selectElement.name] = selectElement.selectedIndex !== -1 ? selectElement.options[selectElement.selectedIndex].value : null;
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
	if (params.username === "") {
		params.username = null;
	}

	if (params.password.length < 1) {
		loadingBar.show("error", lychee.locale["ERROR_EMPTY_PASSWORD"]);
		$("input[name=password]").addClass("error");
		return;
	} else {
		$("input[name=password]").removeClass("error");
	}

	if (params.password !== params.confirm) {
		loadingBar.show("error", lychee.locale["ERROR_PASSWORD_DOES_NOT_MATCH"]);
		$("input[name=confirm]").addClass("error");
		return;
	} else {
		$("input[name=confirm]").removeClass("error");
	}

	api.post(
		"User::updateLogin",
		params,
		/** @param {User} updatedUser */ function (updatedUser) {
			$("input[name]").removeClass("error");
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LOGIN"]);
			view.settings.content.clearLogin();
			lychee.user = updatedUser;
		}
	);
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeSorting = function (params) {
	api.post("Settings::setSorting", params, function () {
		lychee.sorting_albums.column = params["sorting_albums_column"];
		lychee.sorting_albums.order = params["sorting_albums_order"];
		lychee.sorting_photos.column = params["sorting_photos_column"];
		lychee.sorting_photos.order = params["sorting_photos_order"];
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
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changePublicSearch = function (params) {
	api.post("Settings::setPublicSearch", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_PUBLIC_SEARCH"]);
		lychee.public_search = params.public_search;
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.setAlbumDecoration = function (params) {
	api.post("Settings::setAlbumDecoration", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_ALBUM_DECORATION"]);
		albums.refresh();
		lychee.album_decoration = params.album_decoration;
		lychee.album_decoration_orientation = params.album_decoration_orientation;
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.setOverlayType = function (params) {
	api.post("Settings::setOverlayType", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_IMAGE_OVERLAY"]);
		lychee.image_overlay_type = params.image_overlay_type;
		lychee.image_overlay_type_default = params.image_overlay_type;
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeMapDisplay = function (params) {
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
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeMapDisplayPublic = function (params) {
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
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.setMapProvider = function (params) {
	api.post("Settings::setMapProvider", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_PROVIDER"]);
		lychee.map_provider = params.map_provider;
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeMapIncludeSubAlbums = function (params) {
	api.post("Settings::setMapIncludeSubAlbums", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
		lychee.map_include_subalbums = params.map_include_subalbums;
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeLocationDecoding = function (params) {
	api.post("Settings::setLocationDecoding", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
		lychee.location_decoding = params.location_decoding;
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeNSFWVisible = function (params) {
	api.post("Settings::setNSFWVisible", params, function () {
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_NSFW_VISIBLE"]);
		lychee.nsfw_visible = params.nsfw_visible;
		lychee.nsfw_visible_saved = lychee.nsfw_visible;
	});
};

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeSmartAlbumVisibility = function (params) {
	api.post("Settings::setSmartAlbumVisibility", params, function () {
		loadingBar.show("success", lychee.locale["SUCCESS"]);
		const albumId = params.albumID;
		lychee.smart_album_visibilty[albumId] = params.is_public;
	});
};

//TODO : later
// lychee.nsfw_blur = (data.config.nsfw_blur && data.config.nsfw_blur === '1') || false;
// lychee.nsfw_warning = (data.config.nsfw_warning && data.config.nsfw_warning === '1') || false;
// lychee.nsfw_warning_text = data.config.nsfw_warning_text || '<b>Sensitive content</b><br><p>This album contains sensitive content which some people may find offensive or disturbing.</p>';

/**
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeLocationShow = function (params) {
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
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeLocationShowPublic = function (params) {
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
 * @param {SettingsFormData} params
 * @returns {void}
 */
settings.changeNewPhotosNotification = function (params) {
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
		css: $("#css").val(),
	};
	api.post("Settings::setCSS", params, function () {
		lychee.css = params.css;
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_CSS"]);
	});
};

/**
 * @returns {void}
 */
settings.changeJS = function () {
	const params = {
		js: $("#js").val(),
	};
	api.post("Settings::setJS", params, function () {
		lychee.js = params.js;
		loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_JS"]);
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

	const saveSettingsConfirmationDialogBody =
		// TODO: move the style to the style file, where it belongs.
		'<p style="color: #d92c34; font-size: 1.3em; font-weight: bold; text-transform: capitalize; text-align: center;"></p>';

	basicModal.show({
		body: saveSettingsConfirmationDialogBody,
		readyCB: function (formElements, dialog) {
			dialog.querySelector("p").textContent = lychee.locale["SETTINGS_ADVANCED_SAVE"];
		},
		buttons: {
			action: {
				title: lychee.locale["ENTER"],
				fn: function () {
					settings.save(settings.getValues("#fullSettings"));
					basicModal.close();
				},
				classList: ["red"],
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
settings.openTokenDialog = function () {
	/** @type {string} */
	let tokenValue = "";
	/** @type {?HTMLAnchorElement} */
	let resetTokenButton = null;
	/** @type {?HTMLAnchorElement} */
	let copyTokenButton = null;
	/** @type {?HTMLAnchorElement} */
	let disableTokenButton = null;
	/** @type {?HTMLInputElement} */
	let tokenInputElement = null;

	const bodyHtml = `
		<form class="token">
			<div class="input-group stacked">
				<label for="token-dialog-token"></label>
				<input id="token-dialog-token" name="token" type="text" readonly="readonly" />
				<div class="button-group">
					<a id="button_reset_token" class='button'><svg class='iconic ionicons'><use xlink:href='#reload' /></svg></a>
					<a id="button_copy_token" class='button'><svg class='iconic ionicons'><use xlink:href='#copy' /></svg></a>
					<a id="button_disable_token" class='button'><svg class='iconic ionicons'><use xlink:href='#ban' /></svg></a>
				</div>
			</div>
		</form>`;

	/**
	 * @returns {void}
	 */
	const updateTokenDialog = function () {
		if (lychee.user.has_token) {
			disableTokenButton.style.display = null;

			if (!!tokenValue) {
				tokenInputElement.value = tokenValue;
				tokenInputElement.disabled = false;
				copyTokenButton.style.display = null;
			} else {
				tokenInputElement.value = lychee.locale["TOKEN_NOT_AVAILABLE"];
				tokenInputElement.disabled = true;
				copyTokenButton.style.display = "none";
			}
		} else {
			tokenInputElement.value = lychee.locale["DISABLED_TOKEN_STATUS_MSG"];
			tokenInputElement.disabled = true;
			copyTokenButton.style.display = "none";
			disableTokenButton.style.display = "none";
		}
	};

	/**
	 * @param {MouseEvent|TouchEvent} ev
	 */
	const onCopyToken = function (ev) {
		navigator.clipboard.writeText(tokenValue);
		ev.stopPropagation();
	};

	/**
	 * @param {MouseEvent|TouchEvent} ev
	 */
	const onResetToken = function (ev) {
		tokenInputElement.value = "";
		ev.stopPropagation();
		api.post(
			"User::resetToken",
			{},
			/**
			 * @param {{token: string}} data
			 */
			function (data) {
				tokenValue = data.token;
				lychee.user.has_token = true;
				updateTokenDialog();
			}
		);
	};

	/**
	 * @param {MouseEvent|TouchEvent} ev
	 */
	const onDisableToken = function (ev) {
		tokenInputElement.value = "";
		ev.stopPropagation();
		api.post("User::unsetToken", {}, function () {
			tokenValue = "";
			lychee.user.has_token = false;
			updateTokenDialog();
		});
	};

	/**
	 * @param {ModalDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initTokenDialog = function (formElements, dialog) {
		resetTokenButton = dialog.querySelector("a#button_reset_token");
		resetTokenButton.title = lychee.locale["RESET"];
		copyTokenButton = dialog.querySelector("a#button_copy_token");
		copyTokenButton.title = lychee.locale["URL_COPY_TO_CLIPBOARD"];
		disableTokenButton = dialog.querySelector("a#button_disable_token");
		disableTokenButton.title = lychee.locale["DISABLE_TOKEN_TOOLTIP"];
		tokenInputElement = formElements.token;
		tokenInputElement.placeholder = lychee.locale["TOKEN_WAIT"];
		// console.log(tokenInputElement)
		tokenInputElement.labels.textContent = "Token";
		tokenInputElement.blur();

		updateTokenDialog();

		lychee.addClickOrTouchListener(copyTokenButton, onCopyToken);
		lychee.addClickOrTouchListener(resetTokenButton, onResetToken);
		lychee.addClickOrTouchListener(disableTokenButton, onDisableToken);
	};

	basicModal.show({
		body: bodyHtml,
		readyCB: initTokenDialog,
		buttons: {
			cancel: {
				title: lychee.locale["CLOSE"],
				fn: basicModal.close,
			},
		},
	});
};
