//noinspection HtmlUnknownTarget

/**
 * @description This module is used to generate HTML-Code.
 */

const build = {};

/**
 * @param {string} icon
 * @param {string} [classes=""]
 *
 * @returns {string}
 */
build.iconic = function (icon, classes = "") {
	return lychee.html`<svg class='iconic ${classes}'><use xlink:href='#${icon}' /></svg>`;
};

/**
 * @param {string} title
 * @returns {string}
 */
build.divider = function (title) {
	return lychee.html`<div class='divider'><h1>${title}</h1></div>`;
};

/**
 * @param {string} id
 * @returns {string}
 */
build.editIcon = function (id) {
	return lychee.html`<div id='${id}' class='edit'>${build.iconic("pencil")}</div>`;
};

/**
 * @param {number} top
 * @param {number} left
 * @returns {string}
 */
build.multiselect = function (top, left) {
	return lychee.html`<div id='multiselect' style='top: ${top}px; left: ${left}px;'></div>`;
};

/**
 * Returns HTML for the thumb of an album.
 *
 * @param {(Album|TagAlbum)} data
 *
 * @returns {string}
 */
build.getAlbumThumb = function (data) {
	const isVideo = data.thumb.type && data.thumb.type.indexOf("video") > -1;
	const isRaw = data.thumb.type && data.thumb.type.indexOf("raw") > -1;
	const thumb = data.thumb.thumb;
	const thumb2x = data.thumb.thumb2x;

	if (thumb === "uploads/thumb/" && isVideo) {
		return `<span class="thumbimg"><img src='img/play-icon.png' alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false'></span>`;
	}
	if (thumb === "uploads/thumb/" && isRaw) {
		return `<span class="thumbimg"><img src='img/placeholder.png' alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false'></span>`;
	}

	return `<span class="thumbimg${isVideo ? " video" : ""}"><img class='lazyload' src='img/placeholder.png' data-src='${thumb}' ${
		thumb2x !== null ? "data-srcset='" + thumb2x + " 2x'" : ""
	} alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false'></span>`;
};

/**
 * @param {(Album|TagAlbum|SmartAlbum)} data
 * @param {boolean}                     disabled
 *
 * @returns {string} HTML for the album
 */
build.album = function (data, disabled = false) {
	const formattedCreationTs = lychee.locale.printMonthYear(data.created_at);
	const formattedMinTs = lychee.locale.printMonthYear(data.min_taken_at);
	const formattedMaxTs = lychee.locale.printMonthYear(data.max_taken_at);
	const disableDragDrop = !album.isUploadable() || disabled || album.isSmartID(data.id) || data.is_tag_album;
	let subtitle = formattedCreationTs;

	// check setting album_subtitle_type:
	// takedate: date range (min/max_takedate from EXIF; if missing defaults to creation)
	// creation: creation date of album
	// description: album description
	// default: any other type defaults to old style setting subtitles based of album sorting
	switch (lychee.album_subtitle_type) {
		case "description":
			subtitle = data.description ? data.description : "";
			break;
		case "takedate":
			if (formattedMinTs !== "" || formattedMaxTs !== "") {
				// either min_taken_at or max_taken_at is set
				subtitle = formattedMinTs === formattedMaxTs ? formattedMaxTs : formattedMinTs + " - " + formattedMaxTs;
				subtitle = `<span title='${lychee.locale["CAMERA_DATE"]}'>${build.iconic("camera-slr")}</span>${subtitle}`;
				break;
			}
		// fall through
		case "creation":
			break;
		case "oldstyle":
		default:
			if (lychee.sorting_albums && data.min_taken_at && data.max_taken_at) {
				if (lychee.sorting_albums.column === "max_taken_at" || lychee.sorting_albums.column === "min_taken_at") {
					if (formattedMinTs !== "" && formattedMaxTs !== "") {
						subtitle = formattedMinTs === formattedMaxTs ? formattedMaxTs : formattedMinTs + " - " + formattedMaxTs;
					} else if (formattedMinTs !== "" && lychee.sorting_albums.column === "min_taken_at") {
						subtitle = formattedMinTs;
					} else if (formattedMaxTs !== "" && lychee.sorting_albums.column === "max_taken_at") {
						subtitle = formattedMaxTs;
					}
				}
			}
	}

	let html = lychee.html`
			<div class='album ${disabled ? `disabled` : ``} ${data.is_nsfw && lychee.nsfw_blur ? `blurred` : ``}'
				data-id='${data.id}'
				data-nsfw='${data.is_nsfw ? `1` : `0`}'
				data-tabindex='${tabindex.get_next_tab_index()}'
				draggable='${disableDragDrop ? "false" : "true"}'
				${
					disableDragDrop
						? ``
						: `ondragstart='lychee.startDrag(event)'
				ondragover='lychee.overDrag(event)'
				ondragleave='lychee.leaveDrag(event)'
				ondragend='lychee.endDrag(event)'
				ondrop='lychee.finishDrag(event)'`
				}>
				  ${build.getAlbumThumb(data)}
				  ${build.getAlbumThumb(data)}
				  ${build.getAlbumThumb(data)}
				<div class='overlay'>
					<h1 title='$${data.title}'>$${data.title}</h1>
					<a>${subtitle}</a>
				</div>
			`;

	if (album.isUploadable() && !disabled) {
		let isCover = album.json && album.json.cover_id && data.thumb.id === album.json.cover_id;
		html += lychee.html`
				<div class='badges'>
					<a class='badge ${data.is_nsfw ? "badge--nsfw" : ""} icn-warning'>${build.iconic("warning")}</a>
					<a class='badge ${data.id === SmartAlbumID.STARRED ? "badge--star" : ""} icn-star'>${build.iconic("star")}</a>
					<a class='badge ${data.id === SmartAlbumID.RECENT ? "badge--visible badge--list" : ""}'>${build.iconic("clock")}</a>
					<a class='badge ${data.id === SmartAlbumID.PUBLIC || data.is_public ? "badge--visible" : ""} ${
			data.requires_link ? "badge--hidden" : "badge--not--hidden"
		} icn-share'>${build.iconic("eye")}</a>
					<a class='badge ${data.id === SmartAlbumID.UNSORTED ? "badge--visible" : ""}'>${build.iconic("list")}</a>
					<a class='badge ${data.has_password ? "badge--visible" : ""}'>${build.iconic("lock-locked")}</a>
					<a class='badge ${data.is_tag_album ? "badge--tag" : ""}'>${build.iconic("tag")}</a>
					<a class='badge ${isCover ? "badge--cover" : ""} icn-cover'>${build.iconic("folder-cover")}</a>
				</div>
				`;
	}

	if ((data.albums && data.albums.length > 0) || data.has_albums) {
		html += lychee.html`
				<div class='subalbum_badge'>
					<a class='badge badge--folder'>${build.iconic("layers")}</a>
				</div>`;
	}

	html += "</div>";

	return html;
};

/**
 * @param {Photo}   data
 * @param {boolean} disabled
 *
 * @returns {string} HTML for the photo
 */
build.photo = function (data, disabled = false) {
	let html = "";
	let thumbnail = "";
	let thumb2x = "";
	// Note, album.json might not be loaded, if
	//  a) the photo is a single public photo in a private album
	//  b) the photo is part of a search result
	const isCover = album.json && album.json.cover_id === data.id;

	const isVideo = data.type && data.type.indexOf("video") > -1;
	const isRaw = data.type && data.type.indexOf("raw") > -1;
	const isLivePhoto = data.live_photo_url !== "" && data.live_photo_url !== null;

	if (data.size_variants.thumb === null) {
		if (isLivePhoto) {
			thumbnail = `<span class="thumbimg"><img src='img/live-photo-icon.png' alt='${
				lychee.locale["PHOTO_THUMBNAIL"]
			}' data-overlay='false' draggable='false' data-tabindex='${tabindex.get_next_tab_index()}'></span>`;
		}
		if (isVideo) {
			thumbnail = `<span class="thumbimg"><img src='img/play-icon.png' alt='${
				lychee.locale["PHOTO_THUMBNAIL"]
			}' data-overlay='false' draggable='false' data-tabindex='${tabindex.get_next_tab_index()}'></span>`;
		} else if (isRaw) {
			thumbnail = `<span class="thumbimg"><img src='img/placeholder.png' alt='${
				lychee.locale["PHOTO_THUMBNAIL"]
			}' data-overlay='false' draggable='false' data-tabindex='${tabindex.get_next_tab_index()}'></span>`;
		}
	} else if (lychee.layout === 0) {
		if (data.size_variants.thumb2x !== null) {
			thumb2x = data.size_variants.thumb2x.url;
		}

		if (thumb2x !== "") {
			thumb2x = `data-srcset='${thumb2x} 2x'`;
		}

		thumbnail = `<span class="thumbimg${isVideo ? " video" : ""}${isLivePhoto ? " livephoto" : ""}">`;
		thumbnail +=
			`<img class='lazyload' src='img/placeholder.png' data-src='${data.size_variants.thumb.url}' ` +
			thumb2x +
			` alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false' >`;
		thumbnail += `</span>`;
	} else {
		if (data.size_variants.small !== null) {
			if (data.size_variants.small2x !== null) {
				thumb2x = `data-srcset='${data.size_variants.small.url} ${data.size_variants.small.width}w, ${data.size_variants.small2x.url} ${data.size_variants.small2x.width}w'`;
			}

			thumbnail = `<span class="thumbimg${isVideo ? " video" : ""}${isLivePhoto ? " livephoto" : ""}">`;
			thumbnail +=
				`<img class='lazyload' src='img/placeholder.png' data-src='${data.size_variants.small.url}' ` +
				thumb2x +
				` alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false' >`;
			thumbnail += `</span>`;
		} else if (data.size_variants.medium !== null) {
			if (data.size_variants.medium2x !== null) {
				thumb2x = `data-srcset='${data.size_variants.medium.url} ${data.size_variants.medium.width}w, ${data.size_variants.medium2x.url} ${data.size_variants.medium2x.width}w'`;
			}

			thumbnail = `<span class="thumbimg${isVideo ? " video" : ""}${isLivePhoto ? " livephoto" : ""}">`;
			thumbnail +=
				`<img class='lazyload' src='img/placeholder.png' data-src='${data.size_variants.medium.url}' ` +
				thumb2x +
				` alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false' >`;
			thumbnail += `</span>`;
		} else if (!isVideo) {
			// Fallback for images with no small or medium.
			thumbnail = `<span class="thumbimg${isLivePhoto ? " livephoto" : ""}">`;
			thumbnail += `<img class='lazyload' src='img/placeholder.png' data-src='${data.size_variants.original.url}' alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false' >`;
			thumbnail += `</span>`;
		} else {
			// Fallback for videos with no small (the case of no thumb is
			// handled at the top of this function).

			if (data.size_variants.thumb2x !== null) {
				thumb2x = data.size_variants.thumb2x.url;
			}

			if (thumb2x !== "") {
				thumb2x = `data-srcset='${data.size_variants.thumb.url} ${data.size_variants.thumb.width}w, ${thumb2x} ${data.size_variants.thumb2x.width}w'`;
			}

			thumbnail = `<span class="thumbimg video">`;
			thumbnail +=
				`<img class='lazyload' src='img/placeholder.png' data-src='${data.size_variants.thumb.url}' ` +
				thumb2x +
				` alt='${lychee.locale["PHOTO_THUMBNAIL"]}' data-overlay='false' draggable='false' >`;
			thumbnail += `</span>`;
		}
	}

	html += lychee.html`
			<div class='photo ${disabled ? `disabled` : ``}' data-album-id='${data.album_id}' data-id='${
		data.id
	}' data-tabindex='${tabindex.get_next_tab_index()}'
			draggable='${!album.isUploadable() || disabled ? "false" : "true"}'
			ondragstart='lychee.startDrag(event)'
			ondragend='lychee.endDrag(event)'>
				${thumbnail}
				<div class='overlay'>
					<h1 title='$${data.title}'>$${data.title}</h1>
			`;

	if (data.taken_at !== null)
		html += lychee.html`<a><span title='${lychee.locale["CAMERA_DATE"]}'>${build.iconic("camera-slr")}</span>${lychee.locale.printDateTime(
			data.taken_at
		)}</a>`;
	else html += lychee.html`<a>${lychee.locale.printDateTime(data.created_at)}</a>`;

	html += `</div>`;

	if (album.isUploadable()) {
		// Note, `album.json` might be null, if the photo is displayed as
		// part of a search result and therefore the actual parent album
		// is not loaded. (The "parent" album is the virtual "search album"
		// in this case).
		// This also means that the displayed variant of the public badge of
		// a photo depends on the availability of the parent album.
		// This seems to be an undesired but unavoidable side effect.
		html += lychee.html`
				<div class='badges'>
				<a class='badge ${data.is_starred ? "badge--star" : ""} icn-star'>${build.iconic("star")}</a>
				<a class='badge ${data.is_public && album.json && !album.json.is_public ? "badge--visible badge--hidden" : ""} icn-share'>${build.iconic("eye")}</a>
				<a class='badge ${isCover ? "badge--cover" : ""} icn-cover'>${build.iconic("folder-cover")}</a>
				</div>
				`;
	}

	html += `</div>`;

	return html;
};

/**
 * @param {Photo} data
 * @param {string} overlay_type
 * @param {boolean} [next=false]
 *
 * @returns {string}
 */
build.check_overlay_type = function (data, overlay_type, next = false) {
	let types = ["desc", "date", "exif", "none"];
	let idx = types.indexOf(overlay_type);
	if (idx < 0) return "none";
	if (next) idx++;
	let exifHash = data.make + data.model + data.shutter + data.iso + (data.type.indexOf("video") !== 0 ? data.aperture + data.focal : "");

	for (let i = 0; i < types.length; i++) {
		let type = types[(idx + i) % types.length];
		if (type === "date" || type === "none") return type;
		if (type === "desc" && data.description && data.description !== "") return type;
		if (type === "exif" && exifHash !== "") return type;
	}
};

/**
 * @param {Photo} data
 * @returns {string}
 */
build.overlay_image = function (data) {
	let overlay = "";
	switch (build.check_overlay_type(data, lychee.image_overlay_type)) {
		case "desc":
			overlay = data.description;
			break;
		case "date":
			if (data.taken_at != null)
				overlay = `<a><span title='${lychee.locale["CAMERA_DATE"]}'>${build.iconic("camera-slr")}</span>${lychee.locale.printDateTime(
					data.taken_at
				)}</a>`;
			else overlay = lychee.locale.printDateTime(data.created_at);
			break;
		case "exif":
			let exifHash = data.make + data.model + data.shutter + data.aperture + data.focal + data.iso;
			if (exifHash !== "") {
				if (data.shutter && data.shutter !== "") overlay = data.shutter.replace("s", "sec");
				if (data.aperture && data.aperture !== "") {
					if (overlay !== "") overlay += " at ";
					overlay += data.aperture.replace("f/", "&fnof; / ");
				}
				if (data.iso && data.iso !== "") {
					if (overlay !== "") overlay += ", ";
					overlay += sprintf(lychee.locale["PHOTO_ISO"], data.iso);
				}
				if (data.focal && data.focal !== "") {
					if (overlay !== "") overlay += "<br>";
					overlay += data.focal + (data.lens && data.lens !== "" ? " (" + data.lens + ")" : "");
				}
			}
			break;
		case "none":
		default:
			return "";
	}

	return (
		lychee.html`
		<div id="image_overlay">
		<h1>$${data.title ? data.title : lychee.locale["UNTITLED"]}</h1>
		` +
		(overlay !== "" ? `<p>${overlay}</p>` : ``) +
		`
		</div>
		`
	);
};

/**
 * @param {Photo} data
 * @param {boolean} areControlsVisible
 * @param {boolean} autoplay
 * @returns {{thumb: string, html: string}}
 */
build.imageview = function (data, areControlsVisible, autoplay) {
	let html = "";
	let thumb = "";

	if (data.type.indexOf("video") > -1) {
		html += lychee.html`<video width="auto" height="auto" id='image' controls class='${areControlsVisible ? "" : "full"}' autobuffer ${
			autoplay ? "autoplay" : ""
		} data-tabindex='${tabindex.get_next_tab_index()}'><source src='${
			data.size_variants.original.url
		}'>Your browser does not support the video tag.</video>`;
	} else if (data.type.indexOf("raw") > -1 && data.size_variants.medium === null) {
		html += lychee.html`<img id='image' class='${
			areControlsVisible ? "" : "full"
		}' src='img/placeholder.png' draggable='false' alt='big' data-tabindex='${tabindex.get_next_tab_index()}'>`;
	} else {
		let img = "";

		if (data.live_photo_url === "" || data.live_photo_url === null) {
			// It's normal photo

			// See if we have the thumbnail loaded...
			$(".photo").each(function () {
				if ($(this).attr("data-id") && $(this).attr("data-id") === data.id) {
					let thumbimg = $(this).find("img");
					if (thumbimg.length > 0) {
						thumb = thumbimg[0].currentSrc ? thumbimg[0].currentSrc : thumbimg[0].src;
						return false;
					}
				}
			});

			if (data.size_variants.medium !== null) {
				let medium = "";

				if (data.size_variants.medium2x !== null) {
					medium = `srcset='${data.size_variants.medium.url} ${data.size_variants.medium.width}w, ${data.size_variants.medium2x.url} ${data.size_variants.medium2x.width}w'`;
				}
				img =
					`<img id='image' class='${areControlsVisible ? "" : "full"}' src='${data.size_variants.medium.url}' ` +
					medium +
					`  draggable='false' alt='medium' data-tabindex='${tabindex.get_next_tab_index()}'>`;
			} else {
				img = `<img id='image' class='${areControlsVisible ? "" : "full"}' src='${
					data.size_variants.original.url
				}' draggable='false' alt='big' data-tabindex='${tabindex.get_next_tab_index()}'>`;
			}
		} else {
			if (data.size_variants.medium !== null) {
				let medium_width = data.size_variants.medium.width;
				let medium_height = data.size_variants.medium.height;
				// It's a live photo
				img = `<div id='livephoto' data-live-photo data-proactively-loads-video='true' data-photo-src='${
					data.size_variants.medium.url
				}' data-video-src='${
					data.live_photo_url
				}'  style='width: ${medium_width}px; height: ${medium_height}px' data-tabindex='${tabindex.get_next_tab_index()}'></div>`;
			} else {
				// It's a live photo
				img = `<div id='livephoto' data-live-photo data-proactively-loads-video='true' data-photo-src='${
					data.size_variants.original.url
				}' data-video-src='${data.live_photo_url}'  style='width: ${data.size_variants.original.width}px; height: ${
					data.size_variants.original.height
				}px' data-tabindex='${tabindex.get_next_tab_index()}'></div>`;
			}
		}

		html += lychee.html`${img}`;
	}

	html +=
		build.overlay_image(data) +
		`
			<div class='arrow_wrapper arrow_wrapper--previous'><a id='previous'>${build.iconic("caret-left")}</a></div>
			<div class='arrow_wrapper arrow_wrapper--next'><a id='next'>${build.iconic("caret-right")}</a></div>
			`;

	return { html, thumb };
};

/**
 * @param {string} type - either `"magnifying-glass"`, `"eye"`, `"cog"` or `"question-marks"`
 * @returns {string}
 */
build.no_content = function (type) {
	let html = "";

	html += lychee.html`<div class='no_content fadeIn'>${build.iconic(type)}`;

	switch (type) {
		case "magnifying-glass":
			html += lychee.html`<p>${lychee.locale["VIEW_NO_RESULT"]}</p>`;
			break;
		case "eye":
			html += lychee.html`<p>${lychee.locale["VIEW_NO_PUBLIC_ALBUMS"]}</p>`;
			break;
		case "cog":
			html += lychee.html`<p>${lychee.locale["VIEW_NO_CONFIGURATION"]}</p>`;
			break;
		case "question-mark":
			html += lychee.html`<p>${lychee.locale["VIEW_PHOTO_NOT_FOUND"]}</p>`;
			break;
	}

	html += `</div>`;

	return html;
};

/**
 * @param {string[]} tags
 * @returns {string}
 */
build.tags = function (tags) {
	let html = "";
	const editable = album.isUploadable();

	// Search is enabled if logged in (not publicMode) or public search is enabled
	const searchable = !lychee.publicMode || lychee.public_search;

	// build class_string for tag
	const a_class = searchable ? "tag search" : "tag";

	if (tags.length !== 0) {
		tags.forEach(function (tag, index) {
			if (editable) {
				html += lychee.html`<a class='${a_class}'>$${tag}<span data-index='${index}'>${build.iconic("x")}</span></a>`;
			} else {
				html += lychee.html`<a class='${a_class}'>$${tag}</a>`;
			}
		});
	} else {
		html = lychee.html`<div class='empty'>${lychee.locale["NO_TAGS"]}</div>`;
	}

	return html;
};

/**
 * @param {User} user
 * @returns {string}
 */
build.user = function (user) {
	return lychee.html`<div class="users_view_line">
			<p id="UserData${user.id}">
			<input name="id" type="hidden" inputmode="numeric" value="${user.id}" />
			<input class="text" name="username" type="text" value="$${user.username}" placeholder="${lychee.locale["USERNAME"]}" />
			<input class="text" name="password" type="text" placeholder="${lychee.locale["NEW_PASSWORD"]}" />
			<span class="choice" title="${lychee.locale["ALLOW_UPLOADS"]}">
			<label>
			<input type="checkbox" name="may_upload" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>
			<span class="choice" title="${lychee.locale["RESTRICTED_ACCOUNT"]}">
			<label>
			<input type="checkbox" name="is_locked" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>
			</p>
			<a id="UserUpdate${user.id}"  class="basicModal__button basicModal__button_OK">Save</a>
			<a id="UserDelete${user.id}"  class="basicModal__button basicModal__button_DEL">Delete</a>
		</div>
		`;
};

/**
 * @param {WebAuthnCredential} credential
 * @returns {string}
 */
build.u2f = function (credential) {
	return lychee.html`<div class="u2f_view_line">
			<p id="CredentialData${credential.id}">
			<input name="id" type="hidden" inputmode="numeric" value="${credential.id}" />
			<span class="text">${credential.id.slice(0, 30)}</span>
			<!--- <span class="choice" title="Allow uploads">
			<label>
			<input type="checkbox" name="may_upload" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>
			<span class="choice" title="Restricted account">
			<label>
			<input type="checkbox" name="is_locked" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>--->
			</p>
			<a id="CredentialDelete${credential.id}"  class="basicModal__button basicModal__button_DEL">Delete</a>
		</div>
		`;
};
