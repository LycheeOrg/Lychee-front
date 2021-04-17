/**
 * @description Lets you change settings.
 */

let settings = {};

settings.open = function () {
	view.settings.init();
};

settings.createConfig = function () {
	const action = function (data) {
		let dbName = data.dbName || "";
		let dbUser = data.dbUser || "";
		let dbPassword = data.dbPassword || "";
		let dbHost = data.dbHost || "";
		let dbTablePrefix = data.dbTablePrefix || "";

		if (dbUser.length < 1) {
			basicModal.error("dbUser");
			return false;
		}

		if (dbHost.length < 1) dbHost = "localhost";
		if (dbName.length < 1) dbName = "lychee";

		let params = {
			dbName,
			dbUser,
			dbPassword,
			dbHost,
			dbTablePrefix,
		};

		api.post("Config::create", params, function (_data) {
			if (_data !== true) {
				// Connection failed
				if (_data === "Warning: Connection failed!") {
					basicModal.show({
						body: "<p>" + lychee.locale["ERROR_DB_1"] + "</p>",
						buttons: {
							action: {
								title: lychee.locale["RETRY"],
								fn: settings.createConfig,
							},
						},
					});

					return false;
				}

				// Creation failed
				if (_data === "Warning: Creation failed!") {
					basicModal.show({
						body: "<p>" + lychee.locale["ERROR_DB_2"] + "</p>",
						buttons: {
							action: {
								title: lychee.locale["RETRY"],
								fn: settings.createConfig,
							},
						},
					});

					return false;
				}

				// Could not create file
				if (_data === "Warning: Could not create file!") {
					basicModal.show({
						body: "<p>" + lychee.locale["ERROR_CONFIG_FILE"] + "</p>",
						buttons: {
							action: {
								title: lychee.locale["RETRY"],
								fn: settings.createConfig,
							},
						},
					});

					return false;
				}

				// Something went wrong
				basicModal.show({
					body: "<p>" + lychee.locale["ERROR_UNKNOWN"] + "</p>",
					buttons: {
						action: {
							title: lychee.locale["RETRY"],
							fn: settings.createConfig,
						},
					},
				});

				return false;
			} else {
				// Configuration successful
				window.location.reload();

				return false;
			}
		});
	};

	let msg =
		`
			  <p>
				  ` +
		lychee.locale["DB_INFO_TITLE"] +
		`
				  <input name='dbHost' class='text' type='text' placeholder='` +
		lychee.locale["DB_INFO_HOST"] +
		`' value=''>
				  <input name='dbUser' class='text' type='text' placeholder='` +
		lychee.locale["DB_INFO_USER"] +
		`' value=''>
				  <input name='dbPassword' class='text' type='password' placeholder='` +
		lychee.locale["DB_INFO_PASSWORD"] +
		`' value=''>
			  </p>
			  <p>
				  ` +
		lychee.locale["DB_INFO_TEXT"] +
		`
				  <input name='dbName' class='text' type='text' placeholder='` +
		lychee.locale["DB_NAME"] +
		`' value=''>
				  <input name='dbTablePrefix' class='text' type='text' placeholder='` +
		lychee.locale["DB_PREFIX"] +
		`' value=''>
			  </p>
			  `;

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
	const action = function (data) {
		let username = data.username;
		let password = data.password;
		let confirm = data.confirm;

		if (!username.trim()) {
			basicModal.error("username");
			return false;
		}

		if (!password.trim()) {
			basicModal.error("password");
			return false;
		}

		if (password !== confirm) {
			basicModal.error("confirm");
			return false;
		}

		basicModal.close();

		let params = {
			username,
			password,
		};

		api.post("Settings::setLogin", params, function (_data) {
			if (_data !== true) {
				basicModal.show({
					body: "<p>" + lychee.locale["ERROR_LOGIN"] + "</p>",
					buttons: {
						action: {
							title: lychee.locale["RETRY"],
							fn: settings.createLogin,
						},
					},
				});
			}
			// else
			// {
			// 	window.location.reload()
			// }
		});
	};

	let msg =
		`
			  <p>
				  ` +
		lychee.locale["LOGIN_TITLE"] +
		`
				  <input name='username' class='text' type='text' placeholder='` +
		lychee.locale["LOGIN_USERNAME"] +
		`' value=''>
				  <input name='password' class='text' type='password' placeholder='` +
		lychee.locale["LOGIN_PASSWORD"] +
		`' value=''>
				  <input name='confirm' class='text' type='password' placeholder='` +
		lychee.locale["LOGIN_PASSWORD_CONFIRM"] +
		`' value=''>
			  </p>
			  `;

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

// from https://github.com/electerious/basicModal/blob/master/src/scripts/main.js
settings.getValues = function (form_name) {
	let values = {};
	let inputs_select = $(form_name + " input[name], " + form_name + " select[name]");

	// Get value from all inputs
	$(inputs_select).each(function () {
		let name = $(this).attr("name");
		// Store name and value of input
		values[name] = $(this).val();
	});
	return Object.keys(values).length === 0 ? null : values;
};

// from https://github.com/electerious/basicModal/blob/master/src/scripts/main.js
settings.bind = function (item, name, fn) {
	// if ($(item).length)
	// {
	//     console.log('found');
	// }
	// else
	// {
	//     console.log('not found: ' + item);
	// }
	// Action-button
	$(item).on("click", function () {
		fn(settings.getValues(name));
	});
};

settings.changeLogin = function (params) {
	if (params.username.length < 1) {
		loadingBar.show("error", "new username cannot be empty.");
		$("input[name=username]").addClass("error");
		return false;
	} else {
		$("input[name=username]").removeClass("error");
	}

	if (params.password.length < 1) {
		loadingBar.show("error", "new password cannot be empty.");
		$("input[name=password]").addClass("error");
		return false;
	} else {
		$("input[name=password]").removeClass("error");
	}

	if (params.password !== params.confirm) {
		loadingBar.show("error", "new password does not match.");
		$("input[name=confirm]").addClass("error");
		return false;
	} else {
		$("input[name=confirm]").removeClass("error");
	}

	api.post("Settings::setLogin", params, function (data) {
		if (data !== true) {
			loadingBar.show("error", data.description);
			lychee.error(null, datas, data);
		} else {
			$("input[name]").removeClass("error");
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LOGIN"]);
			view.settings.content.clearLogin();
		}
	});
};

settings.changeSorting = function (params) {
	api.post("Settings::setSorting", params, function (data) {
		if (data === true) {
			lychee.sortingAlbums = "ORDER BY " + params["typeAlbums"] + " " + params["orderAlbums"];
			lychee.sortingPhotos = "ORDER BY " + params["typePhotos"] + " " + params["orderPhotos"];
			albums.refresh();
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_SORT"]);
		} else lychee.error(null, params, data);
	});
};

settings.changeDropboxKey = function (params) {
	// if params.key == "" key is cleared
	api.post("Settings::setDropboxKey", params, function (data) {
		if (data === true) {
			lychee.dropboxKey = params.key;
			// if (callback) lychee.loadDropbox(callback)
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_DROPBOX"]);
		} else lychee.error(null, params, data);
	});
};

settings.changeLang = function (params) {
	api.post("Settings::setLang", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LANG"]);
			lychee.init();
		} else lychee.error(null, params, data);
	});
};

settings.setDefaultLicense = function (params) {
	api.post("Settings::setDefaultLicense", params, function (data) {
		if (data === true) {
			lychee.default_license = params.license;
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LICENSE"]);
		} else lychee.error(null, params, data);
	});
};

settings.setLayout = function (params) {
	api.post("Settings::setLayout", params, function (data) {
		if (data === true) {
			lychee.layout = params.layout;
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_LAYOUT"]);
		} else lychee.error(null, params, data);
	});
};

settings.changePublicSearch = function () {
	var params = {};
	if ($("#PublicSearch:checked").length === 1) {
		params.public_search = "1";
	} else {
		params.public_search = "0";
	}
	api.post("Settings::setPublicSearch", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_PUBLIC_SEARCH"]);
			lychee.public_search = params.public_search === "1";
		} else lychee.error(null, params, data);
	});
};

settings.setOverlayType = function () {
	// validate the input
	let params = {};
	let check = $("#ImageOverlay:checked") ? true : false;
	let type = $("#ImgOverlayType").val();
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

	api.post("Settings::setOverlayType", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_IMAGE_OVERLAY"]);
			lychee.image_overlay_type = params.image_overlay_type;
			lychee.image_overlay_type_default = params.image_overlay_type;
		} else lychee.error(null, params, data);
	});
};

settings.changeMapDisplay = function () {
	var params = {};
	if ($("#MapDisplay:checked").length === 1) {
		params.map_display = "1";
	} else {
		params.map_display = "0";
	}
	api.post("Settings::setMapDisplay", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
			lychee.map_display = params.map_display === "1";
		} else lychee.error(null, params, data);
	});
	// Map functionality is disabled
	// -> map for public albums also needs to be disabled
	if (lychee.map_display_public === true) {
		$("#MapDisplayPublic").click();
	}
};

settings.changeMapDisplayPublic = function () {
	var params = {};
	if ($("#MapDisplayPublic:checked").length === 1) {
		params.map_display_public = "1";

		// If public map functionality is enabled, but map in general is disabled
		// General map functionality needs to be enabled
		if (lychee.map_display === false) {
			$("#MapDisplay").click();
		}
	} else {
		params.map_display_public = "0";
	}
	api.post("Settings::setMapDisplayPublic", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY_PUBLIC"]);
			lychee.map_display_public = params.map_display_public === "1";
		} else lychee.error(null, params, data);
	});
};

settings.setMapProvider = function () {
	// validate the input
	let params = {};
	params.map_provider = $("#MapProvider").val();

	api.post("Settings::setMapProvider", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_PROVIDER"]);
			lychee.map_provider = params.map_provider;
		} else lychee.error(null, params, data);
	});
};

settings.changeMapIncludeSubalbums = function () {
	var params = {};
	if ($("#MapIncludeSubalbums:checked").length === 1) {
		params.map_include_subalbums = "1";
	} else {
		params.map_include_subalbums = "0";
	}
	api.post("Settings::setMapIncludeSubalbums", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
			lychee.map_include_subalbums = params.map_include_subalbums === "1";
		} else lychee.error(null, params, data);
	});
};

settings.changeLocationDecoding = function () {
	var params = {};
	if ($("#LocationDecoding:checked").length === 1) {
		params.location_decoding = "1";
	} else {
		params.location_decoding = "0";
	}
	api.post("Settings::setLocationDecoding", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
			lychee.location_decoding = params.location_decoding === "1";
		} else lychee.error(null, params, data);
	});
};

settings.changeNSFWVisible = function () {
	var params = {};
	if ($("#NSFWVisible:checked").length === 1) {
		params.nsfw_visible = "1";
	} else {
		params.nsfw_visible = "0";
	}
	api.post("Settings::setNSFWVisible", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_NSFW_VISIBLE"]);
			lychee.nsfw_visible = params.nsfw_visible === "1";
			lychee.nsfw_visible_saved = lychee.nsfw_visible;
		} else {
			lychee.error(null, params, data);
		}
	});
};

//TODO : later
// lychee.nsfw_blur = (data.config.nsfw_blur && data.config.nsfw_blur === '1') || false;
// lychee.nsfw_warning = (data.config.nsfw_warning && data.config.nsfw_warning === '1') || false;
// lychee.nsfw_warning_text = data.config.nsfw_warning_text || '<b>Sensitive content</b><br><p>This album contains sensitive content which some people may find offensive or disturbing.</p>';

settings.changeLocationShow = function () {
	var params = {};
	if ($("#LocationShow:checked").length === 1) {
		params.location_show = "1";
	} else {
		params.location_show = "0";
		// Don't show location
		// -> location for public albums also needs to be disabled
		if (lychee.location_show_public === true) {
			$("#LocationShowPublic").click();
		}
	}
	api.post("Settings::setLocationShow", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
			lychee.location_show = params.location_show === "1";
		} else lychee.error(null, params, data);
	});
};

settings.changeLocationShowPublic = function () {
	var params = {};
	if ($("#LocationShowPublic:checked").length === 1) {
		params.location_show_public = "1";
		// If public map functionality is enabled, but map in general is disabled
		// General map functionality needs to be enabled
		if (lychee.location_show === false) {
			$("#LocationShow").click();
		}
	} else {
		params.location_show_public = "0";
	}
	api.post("Settings::setLocationShowPublic", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_MAP_DISPLAY"]);
			lychee.location_show_public = params.location_show_public === "1";
		} else lychee.error(null, params, data);
	});
};

settings.changeCSS = function () {
	let params = {};
	params.css = $("#css").val();

	api.post("Settings::setCSS", params, function (data) {
		if (data === true) {
			lychee.css = params.css;
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_CSS"]);
		} else lychee.error(null, params, data);
	});
};

settings.save = function (params, exitview = true) {
	api.post("Settings::saveAll", params, function (data) {
		if (data === true) {
			loadingBar.show("success", lychee.locale["SETTINGS_SUCCESS_UPDATE"]);
			view.full_settings.init();
			// re-read settings
			lychee.init(exitview);
		} else lychee.error("Check the Logs", params, data);
	});
};

settings.save_enter = function (e) {
	if (e.which === 13) {
		// show confirmation box
		$(":focus").blur();

		let action = {};
		let cancel = {};

		action.title = lychee.locale["ENTER"];
		action.msg = lychee.html`<p style="color: #d92c34; font-size: 1.3em; font-weight: bold; text-transform: capitalize; text-align: center;">${lychee.locale["SAVE_RISK"]}</p>`;

		cancel.title = lychee.locale["CANCEL"];

		action.fn = function () {
			settings.save(settings.getValues("#fullSettings"), false);
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
	}
};
