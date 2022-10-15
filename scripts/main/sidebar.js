/**
 * @description This module takes care of the sidebar.
 */

/**
 * @namespace
 */
let sidebar = {
	/** @type {jQuery} */
	_dom: $("#lychee_sidebar_container"),
	types: {
		DEFAULT: 0,
		TAGS: 1,
	},
	createStructure: {},
};

/**
 * @param {?string} [selector=null]
 * @returns {jQuery}
 */
sidebar.dom = function (selector) {
	if (selector == null || selector === "") return sidebar._dom;
	return sidebar._dom.find(selector);
};

/**
 * This function should be called after building and appending
 * the sidebars content to the DOM.
 * This function can be called multiple times, therefore
 * event handlers should be removed before binding a new one.
 *
 * @returns {void}
 */
sidebar.bind = function () {
	const eventName = "click touchend";

	sidebar
		.dom("#edit_title")
		.off(eventName)
		.on(eventName, function () {
			if (visible.photo()) photo.setTitle([photo.getID()]);
			else if (visible.album()) album.setTitle([album.getID()]);
		});

	sidebar
		.dom("#edit_description")
		.off(eventName)
		.on(eventName, function () {
			if (visible.photo()) photo.setDescription(photo.getID());
			else if (visible.album()) album.setDescription(album.getID());
		});

	sidebar
		.dom("#edit_showtags")
		.off(eventName)
		.on(eventName, function () {
			album.setShowTags(album.getID());
		});

	sidebar
		.dom("#edit_tags")
		.off(eventName)
		.on(eventName, function () {
			photo.editTags([photo.getID()]);
		});

	sidebar
		.dom("#tags .tag")
		.off(eventName)
		.on(eventName, function () {
			sidebar.triggerSearch($(this).text());
		});

	sidebar
		.dom("#tags .tag span")
		.off(eventName)
		.on(eventName, function () {
			photo.deleteTag(photo.getID(), $(this).data("index"));
		});

	sidebar
		.dom("#edit_license")
		.off(eventName)
		.on(eventName, function () {
			if (visible.photo()) photo.setLicense(photo.getID());
			else if (visible.album()) album.setLicense(album.getID());
		});

	sidebar
		.dom("#edit_sorting")
		.off(eventName)
		.on(eventName, function () {
			album.setSorting(album.getID());
		});

	sidebar
		.dom(".attr_location")
		.off(eventName)
		.on(eventName, function () {
			sidebar.triggerSearch($(this).text());
		});
};

/**
 * @param {string} search_string
 * @returns {void}
 */
sidebar.triggerSearch = function (search_string) {
	// If public search is disabled -> do nothing
	if (lychee.publicMode && !lychee.public_search) {
		// Do not display an error -> just do nothing to not confuse the user
		return;
	}

	search.json = null;
	// We're either logged in or public search is allowed
	lychee.goto(SearchAlbumIDPrefix + "/" + encodeURIComponent(search_string));
};

/**
 * @returns {boolean}
 */
sidebar.keepSidebarVisible = function () {
	const v = sessionStorage.getItem("keepSidebarVisible");
	return v !== null ? v === "true" : false;
};

/**
 * @param {boolean} is_user_initiated - indicates if the user requested to
 *                                      toggle and hence the new state shall
 *                                      be saved in session storage
 * @returns {void}
 */
sidebar.toggle = function (is_user_initiated) {
	if (visible.sidebar() || visible.sidebarbutton()) {
		header.dom(".button--info").toggleClass("active");
		sidebar.dom().toggleClass("active");
		if (is_user_initiated) sessionStorage.setItem("keepSidebarVisible", visible.sidebar() ? "true" : "false");
		if (photo.updateSizeLivePhotoDuringAnimation) photo.updateSizeLivePhotoDuringAnimation();
	}
};

/**
 * Attributes/Values inside the sidebar are selectable by default.
 * Selection needs to be deactivated to prevent an unwanted selection
 * while using multiselect.
 *
 * @param {boolean} [selectable=true]
 * @returns {void}
 */
sidebar.setSelectable = function (selectable = true) {
	if (selectable) sidebar.dom().removeClass("notSelectable");
	else sidebar.dom().addClass("notSelectable");
};

/**
 * @param {string} attr - selector of attribute without the `attr_` prefix
 * @param {?string} value - a `null` value is replaced by the empty string
 * @param {boolean} [dangerouslySetInnerHTML=false]
 *
 * @returns {void}
 */
sidebar.changeAttr = function (attr, value = "", dangerouslySetInnerHTML = false) {
	if (!attr) return;
	if (!value) value = "";

	// TODO: Don't use our home-brewed `escapeHTML` method; use `jQuery#text` instead
	// Escape value
	if (!dangerouslySetInnerHTML) value = lychee.escapeHTML(value);

	sidebar.dom(".attr_" + attr).html(value);
};

/**
 * @param {string} attr - selector of attribute without the `attr_` prefix
 * @returns {void}
 */
sidebar.hideAttr = function (attr) {
	sidebar
		.dom(".attr_" + attr)
		.closest("tr")
		.hide();
};

/**
 * Converts integer seconds into "hours:minutes:seconds".
 *
 * TODO: Consider to make this method part of `lychee.locale`.
 *
 * @param {(number|string)} d
 * @returns {string}
 */
sidebar.secondsToHMS = function (d) {
	d = Number(d);
	const h = Math.floor(d / 3600);
	const m = Math.floor((d % 3600) / 60);
	const s = Math.floor(d % 60);

	return (h > 0 ? h.toString() + "h" : "") + (m > 0 ? m.toString() + "m" : "") + (s > 0 || (h === 0 && m === 0) ? s.toString() + "s" : "");
};

/**
 * @typedef Section
 *
 * @property {string}       title
 * @property {number}       type
 * @property {SectionRow[]} rows
 */

/**
 * @typedef SectionRow
 *
 * @property {string}            title
 * @property {string}            kind
 * @property {(string|string[])} value
 * @property {boolean}           [editable]
 */

/**
 * @param {?Photo} data
 * @returns {Section[]}
 */
sidebar.createStructure.photo = function (data) {
	if (!data) return [];

	let editable = typeof album !== "undefined" ? album.isUploadable() : false;
	let hasExif = !!data.taken_at || !!data.make || !!data.model || !!data.shutter || !!data.aperture || !!data.focal || !!data.iso;
	// Attributes for geo-position are nullable floats.
	// The geo-position 0°00'00'', 0°00'00'' at zero altitude is very unlikely
	// but valid (it's south of the coast of Ghana in the Atlantic)
	// So we must not calculate the sum and compare for zero.
	let hasLocation = data.longitude !== null || data.latitude !== null || data.altitude !== null;
	let structure = {};
	let isPublic = "";
	let isVideo = data.type && data.type.indexOf("video") > -1;
	let license;

	// Set the license string for a photo
	switch (data.license) {
		// if the photo doesn't have a license
		case "none":
			license = "";
			break;
		// Localize All Rights Reserved
		case "reserved":
			license = lychee.locale["PHOTO_RESERVED"];
			break;
		// Display anything else that's set
		default:
			license = data.license;
			break;
	}

	// Set value for public
	switch (data.is_public) {
		case 0:
			isPublic = lychee.locale["PHOTO_SHR_NO"];
			break;
		case 1:
			isPublic = lychee.locale["PHOTO_SHR_PHT"];
			break;
		case 2:
			isPublic = lychee.locale["PHOTO_SHR_ALB"];
			break;
		default:
			isPublic = "-";
			break;
	}

	structure.basics = {
		title: lychee.locale["PHOTO_BASICS"],
		type: sidebar.types.DEFAULT,
		rows: [
			{ title: lychee.locale["PHOTO_TITLE"], kind: "title", value: data.title, editable },
			{ title: lychee.locale["PHOTO_UPLOADED"], kind: "uploaded", value: lychee.locale.printDateTime(data.created_at) },
			{ title: lychee.locale["PHOTO_DESCRIPTION"], kind: "description", value: data.description ? data.description : "", editable },
		],
	};

	structure.image = {
		title: lychee.locale[isVideo ? "PHOTO_VIDEO" : "PHOTO_IMAGE"],
		type: sidebar.types.DEFAULT,
		rows: [
			{ title: lychee.locale["PHOTO_SIZE"], kind: "size", value: lychee.locale.printFilesizeLocalized(data.size_variants.original.filesize) },
			{ title: lychee.locale["PHOTO_FORMAT"], kind: "type", value: data.type },
			{
				title: lychee.locale["PHOTO_RESOLUTION"],
				kind: "resolution",
				value: data.size_variants.original.width + " x " + data.size_variants.original.height,
			},
		],
	};

	if (isVideo) {
		if (data.size_variants.original.width === 0 || data.size_variants.original.height === 0) {
			// Remove the "Resolution" line if we don't have the data.
			structure.image.rows.splice(-1, 1);
		}

		// We overload the database, storing duration (in full seconds) in
		// "aperture" and frame rate (floating point with three digits after
		// the decimal point) in "focal".
		if (data.aperture) {
			structure.image.rows.push({ title: lychee.locale["PHOTO_DURATION"], kind: "duration", value: sidebar.secondsToHMS(data.aperture) });
		}
		if (data.focal) {
			structure.image.rows.push({ title: lychee.locale["PHOTO_FPS"], kind: "fps", value: data.focal + " fps" });
		}
	}

	// Always create tags section - behaviour for editing
	// tags handled when constructing the html code for tags

	// TODO: IDE warns, that `value` is not property and `rows` is missing; the tags should actually be stored in a row for consistency
	// TODO: Consider to NOT call `build.tags` here, but simply pass the plain JSON. `build.tags` should be called in `sidebar.render` below
	structure.tags = {
		title: lychee.locale["PHOTO_TAGS"],
		type: sidebar.types.TAGS,
		value: build.tags(data.tags),
		editable,
	};

	// Only create EXIF section when EXIF data available
	if (hasExif) {
		structure.exif = {
			title: lychee.locale["PHOTO_CAMERA"],
			type: sidebar.types.DEFAULT,
			rows: isVideo
				? [
						{ title: lychee.locale["PHOTO_CAPTURED"], kind: "takedate", value: lychee.locale.printDateTime(data.taken_at) },
						{ title: lychee.locale["PHOTO_MAKE"], kind: "make", value: data.make },
						{ title: lychee.locale["PHOTO_TYPE"], kind: "model", value: data.model },
				  ]
				: [
						{ title: lychee.locale["PHOTO_CAPTURED"], kind: "takedate", value: lychee.locale.printDateTime(data.taken_at) },
						{ title: lychee.locale["PHOTO_MAKE"], kind: "make", value: data.make },
						{ title: lychee.locale["PHOTO_TYPE"], kind: "model", value: data.model },
						{ title: lychee.locale["PHOTO_LENS"], kind: "lens", value: data.lens },
						{ title: lychee.locale["PHOTO_SHUTTER"], kind: "shutter", value: data.shutter },
						{ title: lychee.locale["PHOTO_APERTURE"], kind: "aperture", value: data.aperture },
						{ title: lychee.locale["PHOTO_FOCAL"], kind: "focal", value: data.focal },
						{ title: sprintf(lychee.locale["PHOTO_ISO"], ""), kind: "iso", value: data.iso },
				  ],
		};
	} else {
		structure.exif = {};
	}

	structure.sharing = {
		title: lychee.locale["PHOTO_SHARING"],
		type: sidebar.types.DEFAULT,
		rows: [{ title: lychee.locale["PHOTO_SHR_PUBLIC"], kind: "public", value: isPublic }],
	};

	structure.license = {
		title: lychee.locale["PHOTO_REUSE"],
		type: sidebar.types.DEFAULT,
		rows: [{ title: lychee.locale["PHOTO_LICENSE"], kind: "license", value: license, editable: editable }],
	};

	if (hasLocation) {
		structure.location = {
			title: lychee.locale["PHOTO_LOCATION"],
			type: sidebar.types.DEFAULT,
			rows: [
				{
					title: lychee.locale["PHOTO_LATITUDE"],
					kind: "latitude",
					value: data.latitude ? DecimalToDegreeMinutesSeconds(data.latitude, true) : "",
				},
				{
					title: lychee.locale["PHOTO_LONGITUDE"],
					kind: "longitude",
					value: data.longitude ? DecimalToDegreeMinutesSeconds(data.longitude, false) : "",
				},
				// No point in displaying sub-mm precision; 10cm is more than enough.
				{
					title: lychee.locale["PHOTO_ALTITUDE"],
					kind: "altitude",
					value: data.altitude ? (Math.round(data.altitude * 10) / 10).toString() + "m" : "",
				},
				{
					title: lychee.locale["PHOTO_LOCATION"],
					kind: "location",
					// Explode location string into an array to keep street, city etc. separate
					// TODO: We should consider to keep the components apart on the server-side and send an structured object to the front-end.
					value: data.location ? data.location.split(",").map((item) => item.trim()) : "",
				},
			],
		};
		if (data.img_direction !== null) {
			// No point in display sub-degree precision.
			structure.location.rows.push({
				title: lychee.locale["PHOTO_IMGDIRECTION"],
				kind: "imgDirection",
				value: Math.round(data.img_direction).toString() + "°",
			});
		}
	} else {
		structure.location = {};
	}

	// Construct all parts of the structure
	const structure_ret = [structure.basics, structure.image, structure.tags, structure.exif, structure.location, structure.license];

	if (!lychee.publicMode) {
		structure_ret.push(structure.sharing);
	}

	return structure_ret;
};

/**
 * @param {(Album|TagAlbum|SmartAlbum)} data
 * @returns {Section[]}
 */
sidebar.createStructure.album = function (data) {
	if (!data) return [];

	let editable = album.isUploadable();
	let structure = {};
	let isPublic = data.is_public ? lychee.locale["ALBUM_SHR_YES"] : lychee.locale["ALBUM_SHR_NO"];
	let requiresLink = data.requires_link ? lychee.locale["ALBUM_SHR_YES"] : lychee.locale["ALBUM_SHR_NO"];
	let isDownloadable = data.is_downloadable ? lychee.locale["ALBUM_SHR_YES"] : lychee.locale["ALBUM_SHR_NO"];
	let isShareButtonVisible = data.is_share_button_visible ? lychee.locale["ALBUM_SHR_YES"] : lychee.locale["ALBUM_SHR_NO"];
	let hasPassword = data.has_password ? lychee.locale["ALBUM_SHR_YES"] : lychee.locale["ALBUM_SHR_NO"];
	let license = "";
	let sorting = "";

	// Set license string
	switch (data.license) {
		case "none":
			license = ""; // consistency
			break;
		case "reserved":
			license = lychee.locale["ALBUM_RESERVED"];
			break;
		default:
			license = data.license;
			break;
	}

	if (!lychee.publicMode) {
		if (!data.sorting) {
			sorting = lychee.locale["DEFAULT"];
		} else {
			sorting = data.sorting.column + " " + data.sorting.order;
		}
	}

	structure.basics = {
		title: lychee.locale["ALBUM_BASICS"],
		type: sidebar.types.DEFAULT,
		rows: [
			{ title: lychee.locale["ALBUM_TITLE"], kind: "title", value: data.title, editable },
			{ title: lychee.locale["ALBUM_DESCRIPTION"], kind: "description", value: data.description ? data.description : "", editable },
		],
	};

	if (album.isTagAlbum()) {
		structure.basics.rows.push({ title: lychee.locale["ALBUM_SHOW_TAGS"], kind: "showtags", value: data.show_tags, editable });
	}

	const videoCount = data.photos.reduce((count, photo) => count + (photo.type.indexOf("video") > -1 ? 1 : 0), 0);

	structure.album = {
		title: lychee.locale["ALBUM_ALBUM"],
		type: sidebar.types.DEFAULT,
		rows: [{ title: lychee.locale["ALBUM_CREATED"], kind: "created", value: lychee.locale.printDateTime(data.created_at) }],
	};
	if (data.albums && data.albums.length > 0) {
		structure.album.rows.push({ title: lychee.locale["ALBUM_SUBALBUMS"], kind: "subalbums", value: data.albums.length });
	}
	if (data.photos) {
		if (data.photos.length - videoCount > 0) {
			structure.album.rows.push({ title: lychee.locale["ALBUM_IMAGES"], kind: "images", value: data.photos.length - videoCount });
		}
	}
	if (videoCount > 0) {
		structure.album.rows.push({ title: lychee.locale["ALBUM_VIDEOS"], kind: "videos", value: videoCount });
	}

	if (data.photos && sorting !== "") {
		structure.album.rows.push({ title: lychee.locale["ALBUM_ORDERING"], kind: "sorting", value: sorting, editable: editable });
	}

	structure.share = {
		title: lychee.locale["ALBUM_SHARING"],
		type: sidebar.types.DEFAULT,
		rows: [
			{ title: lychee.locale["ALBUM_PUBLIC"], kind: "public", value: isPublic },
			{ title: lychee.locale["ALBUM_HIDDEN"], kind: "hidden", value: requiresLink },
			{ title: lychee.locale["ALBUM_DOWNLOADABLE"], kind: "downloadable", value: isDownloadable },
			{ title: lychee.locale["ALBUM_SHARE_BUTTON_VISIBLE"], kind: "share_button_visible", value: isShareButtonVisible },
			{ title: lychee.locale["ALBUM_PASSWORD"], kind: "password", value: hasPassword },
		],
	};

	if (data.owner_name) {
		structure.share.rows.push({ title: lychee.locale["ALBUM_OWNER"], kind: "owner", value: data.owner_name });
	}

	structure.license = {
		title: lychee.locale["ALBUM_REUSE"],
		type: sidebar.types.DEFAULT,
		rows: [{ title: lychee.locale["ALBUM_LICENSE"], kind: "license", value: license, editable: editable }],
	};

	// Construct all parts of the structure
	let structure_ret = [structure.basics, structure.album, structure.license];
	if (!lychee.publicMode) {
		structure_ret.push(structure.share);
	}

	return structure_ret;
};

/**
 * @param {Section[]} structure
 * @returns {boolean} - true if the passed structure contains a "location" section
 */
sidebar.has_location = function (structure) {
	let _has_location = false;

	structure.forEach(function (section) {
		if (section.title === lychee.locale["PHOTO_LOCATION"]) {
			_has_location = true;
		}
	});

	return _has_location;
};

/**
 * @param {Section[]} structure
 * @returns {string} - HTML
 */
sidebar.render = function (structure) {
	/**
	 * @param {Section} section
	 * @returns {string}
	 */
	const renderDefault = function (section) {
		let _html = lychee.html`
				 <div class='sidebar__divider'>
					 <h1>$${section.title}</h1>
				 </div>
				 <table>
				 `;

		if (section.title === lychee.locale["PHOTO_LOCATION"]) {
			const _has_latitude = section.rows.findIndex((row) => row.kind === "latitude" && row.value) !== -1;
			const _has_longitude = section.rows.findIndex((row) => row.kind === "longitude" && row.value) !== -1;
			const idxLocation = section.rows.findIndex((row) => row.kind === "location");
			// Do not show location if not enabled
			if (idxLocation !== -1 && ((lychee.publicMode === true && !lychee.location_show_public) || !lychee.location_show)) {
				section.rows.splice(idxLocation, 1);
			}
			// Show map if we have coordinates
			if (_has_latitude && _has_longitude && lychee.map_display) {
				_html += `
						 <div id="leaflet_map_single_photo"></div>
						 `;
			}
		}

		section.rows.forEach(function (row) {
			const rawValue = row.value;

			// don't show rows which are empty and cannot be edited
			if ((rawValue === "" || rawValue == null) && row.editable === false) {
				return;
			}

			/** @type {string} */
			let htmlValue;
			// Wrap span-element around value for easier selecting on change
			if (Array.isArray(rawValue)) {
				htmlValue = rawValue.reduce(
					/**
					 * @param {string} prev
					 * @param {string} cur
					 */
					function (prev, cur) {
						// Add separator if needed
						if (prev !== "") {
							prev += lychee.html`<span class='attr_${row.kind}_separator'>, </span>`;
						}
						return prev + lychee.html`<span class='attr_${row.kind} search'>$${cur}</span>`;
					},
					""
				);
			} else {
				htmlValue = lychee.html`<span class='attr_${row.kind}'>$${rawValue}</span>`;
			}

			// Add edit-icon to the value when editable
			if (row.editable === true) htmlValue += " " + build.editIcon("edit_" + row.kind);

			_html += lychee.html`<tr><td>$${row.title}</td><td>${htmlValue}</td></tr>`;
		});

		_html += "</table>";

		return _html;
	};

	/**
	 * @param {Section} section
	 * @returns {string}
	 */
	const renderTags = function (section) {
		// TODO: IDE warns me that the `Section` has no properties `editable` nor `value`; cause of the problem is that the section `tags` is built differently, see above
		// Add edit-icon to the value when editable
		const htmlEditable = section.editable === true ? build.editIcon("edit_tags") : "";

		// Note: In case of tags `section.value` already contains proper
		// HTML (with each tag wrapped into a `<span>`-element), because
		// `section.value` is the result of `build.renderTags`.
		return lychee.html`
				 <div class='sidebar__divider'>
					 <h1>$${section.title}</h1>
				 </div>
				 <div id='tags'>
					 <div class='attr_${section.title.toLowerCase()}'>${section.value}</div>
					 ${htmlEditable}
				 </div>
				 `;
	};

	let html = "";

	structure.forEach(function (section) {
		if (section.type === sidebar.types.DEFAULT) html += renderDefault(section);
		else if (section.type === sidebar.types.TAGS) html += renderTags(section);
	});

	return html;
};

/**
 * Converts a decimal degree into integer degree, minutes and seconds.
 *
 * TODO: Consider to make this method part of `lychee.locale`.
 *
 * @param {number}  decimal
 * @param {boolean} type    - indicates if the passed decimal indicates a
 *                            latitude (`true`) or a longitude (`false`)
 * @returns {string}
 */
function DecimalToDegreeMinutesSeconds(decimal, type) {
	const d = Math.abs(decimal);
	let degrees = 0;
	let minutes = 0;
	let seconds = 0;
	let direction;

	// absolute value of decimal must be smaller than 180;
	if (d > 180) {
		return "";
	}

	// set direction; north assumed
	if (type && decimal < 0) {
		direction = "S";
	} else if (!type && decimal < 0) {
		direction = "W";
	} else if (!type) {
		direction = "E";
	} else {
		direction = "N";
	}

	//get degrees
	degrees = Math.floor(d);

	//get seconds
	seconds = (d - degrees) * 3600;

	//get minutes
	minutes = Math.floor(seconds / 60);

	//reset seconds
	seconds = Math.floor(seconds - minutes * 60);

	return degrees + "° " + minutes + "' " + seconds + '" ' + direction;
}
