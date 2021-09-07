/**
 * @description This module is used to generate HTML-Code.
 */

let build = {};

build.iconic = function (icon, classes = "") {
	let html = "";

	html += lychee.html`<svg class='iconic ${classes}'><use xlink:href='#${icon}' /></svg>`;

	return html;
};

build.divider = function (title) {
	let html = "";

	html += lychee.html`<div class='divider'><h1>${title}</h1></div>`;

	return html;
};

build.editIcon = function (id) {
	let html = "";

	html += lychee.html`<div id='${id}' class='edit'>${build.iconic("pencil")}</div>`;

	return html;
};

build.multiselect = function (top, left) {
	return lychee.html`<div id='multiselect' style='top: ${top}px; left: ${left}px;'></div>`;
};

// two additional images that are barely visible seems a bit overkill - use same image 3 times
// if this simplification comes to pass data.types, data.thumbs and data.thumbs2x no longer need to be arrays
build.getAlbumThumb = function (data) {
	let isVideo;
	let isRaw;
	let thumb;

	isVideo = data.thumb.type && data.thumb.type.indexOf("video") > -1;
	isRaw = data.thumb.type && data.thumb.type.indexOf("raw") > -1;
	thumb = data.thumb.thumb;
	var thumb2x = "";

	if (thumb === "uploads/thumb/" && isVideo) {
		return `<span class="thumbimg"><img src='img/play-icon.png' alt='Photo thumbnail' data-overlay='false' draggable='false'></span>`;
	}
	if (thumb === "uploads/thumb/" && isRaw) {
		return `<span class="thumbimg"><img src='img/placeholder.png' alt='Photo thumbnail' data-overlay='false' draggable='false'></span>`;
	}

	thumb2x = data.thumb.thumb2x;

	return `<span class="thumbimg${isVideo ? " video" : ""}"><img class='lazyload' src='img/placeholder.png' data-src='${thumb}' ${
		thumb2x !== "" ? "data-srcset='" + thumb2x + " 2x'" : ""
	} alt='Photo thumbnail' data-overlay='false' draggable='false'></span>`;
};

build.album = function (data, disabled = false) {
	const formattedCreationTs = lychee.locale.printMonthYear(data.created_at);
	const formattedMinTs = lychee.locale.printMonthYear(data.min_taken_at);
	const formattedMaxTs = lychee.locale.printMonthYear(data.max_taken_at);
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
				subtitle = `<span title='Camera Date'>${build.iconic("camera-slr")}</span>${subtitle}`;
				break;
			}
		// fall through
		case "creation":
			break;
		case "oldstyle":
		default:
			if (lychee.sortingAlbums !== "" && data.min_taken_at && data.max_taken_at) {
				let sortingAlbums = lychee.sortingAlbums.replace("ORDER BY ", "").split(" ");
				if (sortingAlbums[0] === "max_taken_at" || sortingAlbums[0] === "min_taken_at") {
					if (formattedMinTs !== "" && formattedMaxTs !== "") {
						subtitle = formattedMinTs === formattedMaxTs ? formattedMaxTs : formattedMinTs + " - " + formattedMaxTs;
					} else if (formattedMinTs !== "" && sortingAlbums[0] === "min_taken_at") {
						subtitle = formattedMinTs;
					} else if (formattedMaxTs !== "" && sortingAlbums[0] === "max_taken_at") {
						subtitle = formattedMaxTs;
					}
				}
			}
	}

	let html = lychee.html`
			<div class='album ${disabled ? `disabled` : ``} ${data.nsfw && data.nsfw === "1" && lychee.nsfw_blur ? `blurred` : ``}'
				data-id='${data.id}'
				data-nsfw='${data.nsfw && data.nsfw === "1" ? `1` : `0`}'
				data-tabindex='${tabindex.get_next_tab_index()}'>
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
					<a class='badge ${data.nsfw === "1" ? "badge--nsfw" : ""} icn-warning'>${build.iconic("warning")}</a>
					<a class='badge ${data.star === "1" ? "badge--star" : ""} icn-star'>${build.iconic("star")}</a>
					<a class='badge ${data.recent === "1" ? "badge--visible badge--list" : ""}'>${build.iconic("clock")}</a>
					<a class='badge ${data.public === "1" ? "badge--visible" : ""} ${
			data.visible === "1" ? "badge--not--hidden" : "badge--hidden"
		} icn-share'>${build.iconic("eye")}</a>
					<a class='badge ${data.unsorted === "1" ? "badge--visible" : ""}'>${build.iconic("list")}</a>
					<a class='badge ${data.has_password ? "badge--visible" : ""}'>${build.iconic("lock-locked")}</a>
					<a class='badge ${data.tag_album ? "badge--tag" : ""}'>${build.iconic("tag")}</a>
					<a class='badge ${isCover ? "badge--cover" : ""} icn-cover'>${build.iconic("folder-cover")}</a>
				</div>
				`;
	}

	if ((data.albums && data.albums.length > 0) || (data.hasOwnProperty("has_albums") && data.has_albums === "1")) {
		html += lychee.html`
				<div class='subalbum_badge'>
					<a class='badge badge--folder'>${build.iconic("layers")}</a>
				</div>`;
	}

	html += "</div>";

	return html;
};

build.photo = function (data, disabled = false) {
	let html = "";
	let thumbnail = "";
	var thumb2x = "";
	let isCover = data.id === album.json.cover_id;

	let isVideo = data.type && data.type.indexOf("video") > -1;
	let isRaw = data.type && data.type.indexOf("raw") > -1;
	let isLivePhoto = data.live_photo_url !== "" && data.live_photo_url !== null;

	if (data.size_variants.thumb === null) {
		if (isLivePhoto) {
			thumbnail = `<span class="thumbimg"><img src='img/live-photo-icon.png' alt='Photo thumbnail' data-overlay='false' draggable='false' data-tabindex='${tabindex.get_next_tab_index()}'></span>`;
		}
		if (isVideo) {
			thumbnail = `<span class="thumbimg"><img src='img/play-icon.png' alt='Photo thumbnail' data-overlay='false' draggable='false' data-tabindex='${tabindex.get_next_tab_index()}'></span>`;
		} else if (isRaw) {
			thumbnail = `<span class="thumbimg"><img src='img/placeholder.png' alt='Photo thumbnail' data-overlay='false' draggable='false' data-tabindex='${tabindex.get_next_tab_index()}'></span>`;
		}
	} else if (lychee.layout === "0") {
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
			` alt='Photo thumbnail' data-overlay='false' draggable='false' >`;
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
				` alt='Photo thumbnail' data-overlay='false' draggable='false' >`;
			thumbnail += `</span>`;
		} else if (data.size_variants.medium !== null) {
			if (data.size_variants.medium2x !== null) {
				thumb2x = `data-srcset='${data.size_variants.medium.url} ${data.size_variants.medium.width}w, ${data.size_variants.medium2x.url} ${data.size_variants.medium2x.width}w'`;
			}

			thumbnail = `<span class="thumbimg${isVideo ? " video" : ""}${isLivePhoto ? " livephoto" : ""}">`;
			thumbnail +=
				`<img class='lazyload' src='img/placeholder.png' data-src='${data.size_variants.medium.url}' ` +
				thumb2x +
				` alt='Photo thumbnail' data-overlay='false' draggable='false' >`;
			thumbnail += `</span>`;
		} else if (!isVideo) {
			// Fallback for images with no small or medium.
			thumbnail = `<span class="thumbimg${isLivePhoto ? " livephoto" : ""}">`;
			thumbnail += `<img class='lazyload' src='img/placeholder.png' data-src='${data.size_variants.original.url}' alt='Photo thumbnail' data-overlay='false' draggable='false' >`;
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
				` alt='Photo thumbnail' data-overlay='false' draggable='false' >`;
			thumbnail += `</span>`;
		}
	}

	html += lychee.html`
			<div class='photo ${disabled ? `disabled` : ``}' data-album-id='${data.album}' data-id='${data.id}' data-tabindex='${tabindex.get_next_tab_index()}'>
				${thumbnail}
				<div class='overlay'>
					<h1 title='$${data.title}'>$${data.title}</h1>
			`;

	if (data.taken_at !== null)
		html += lychee.html`<a><span title='Camera Date'>${build.iconic("camera-slr")}</span>${lychee.locale.printDateTime(data.taken_at)}</a>`;
	else html += lychee.html`<a>${lychee.locale.printDateTime(data.created_at)}</a>`;

	html += `</div>`;

	if (album.isUploadable()) {
		html += lychee.html`
				<div class='badges'>
				<a class='badge ${data.star === "1" ? "badge--star" : ""} icn-star'>${build.iconic("star")}</a>
				<a class='badge ${data.public === "1" && album.json.public !== "1" ? "badge--visible badge--hidden" : ""} icn-share'>${build.iconic("eye")}</a>
				<a class='badge ${isCover ? "badge--cover" : ""} icn-cover'>${build.iconic("folder-cover")}</a>
				</div>
				`;
	}

	html += `</div>`;

	return html;
};

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

build.overlay_image = function (data) {
	let overlay = "";
	switch (build.check_overlay_type(data, lychee.image_overlay_type)) {
		case "desc":
			overlay = data.description;
			break;
		case "date":
			if (data.taken_at != null)
				overlay = `<a><span title='Camera Date'>${build.iconic("camera-slr")}</span>${lychee.locale.printDateTime(data.taken_at)}</a>`;
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
					overlay += lychee.locale["PHOTO_ISO"] + " " + data.iso;
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
		<h1>$${data.title}</h1>
		` +
		(overlay !== "" ? `<p>${overlay}</p>` : ``) +
		`
		</div>
		`
	);
};

build.imageview = function (data, visibleControls, autoplay) {
	let html = "";
	let thumb = "";

	if (data.type.indexOf("video") > -1) {
		html += lychee.html`<video width="auto" height="auto" id='image' controls class='${visibleControls === true ? "" : "full"}' autobuffer ${
			autoplay ? "autoplay" : ""
		} data-tabindex='${tabindex.get_next_tab_index()}'><source src='${
			data.size_variants.original.url
		}'>Your browser does not support the video tag.</video>`;
	} else if (data.type.indexOf("raw") > -1 && data.size_variants.medium === null) {
		html += lychee.html`<img id='image' class='${
			visibleControls === true ? "" : "full"
		}' src='img/placeholder.png' draggable='false' alt='big' data-tabindex='${tabindex.get_next_tab_index()}'>`;
	} else {
		let img = "";

		if (data.live_photo_url === "" || data.live_photo_url === null) {
			// It's normal photo

			// See if we have the thumbnail loaded...
			$(".photo").each(function () {
				if ($(this).attr("data-id") && $(this).attr("data-id") == data.id) {
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
					`<img id='image' class='${visibleControls === true ? "" : "full"}' src='${data.size_variants.medium.url}' ` +
					medium +
					`  draggable='false' alt='medium' data-tabindex='${tabindex.get_next_tab_index()}'>`;
			} else {
				img = `<img id='image' class='${visibleControls === true ? "" : "full"}' src='${
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

build.no_content = function (typ) {
	let html = "";

	html += lychee.html`<div class='no_content fadeIn'>${build.iconic(typ)}`;

	switch (typ) {
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

build.uploadModal = function (title, files) {
	let html = "";

	html += lychee.html`
			<h1>$${title}</h1>
			<div class='rows'>
			`;

	let i = 0;

	while (i < files.length) {
		let file = files[i];

		if (file.name.length > 40) file.name = file.name.substr(0, 17) + "..." + file.name.substr(file.name.length - 20, 20);

		html += lychee.html`
				<div class='row'>
					<a class='name'>${file.name}</a>
					<a class='status'></a>
					<p class='notice'></p>
				</div>
				`;

		i++;
	}

	html += `</div>`;

	return html;
};

build.uploadNewFile = function (name) {
	if (name.length > 40) {
		name = name.substr(0, 17) + "..." + name.substr(name.length - 20, 20);
	}

	return lychee.html`
		<div class='row'>
			<a class='name'>${name}</a>
			<a class='status'></a>
			<p class='notice'></p>
		</div>
		`;
};

build.tags = function (tags) {
	let html = "";
	let editable = typeof album !== "undefined" ? album.isUploadable() : false;

	// Search is enabled if logged in (not publicMode) or public seach is enabled
	let searchable = lychee.publicMode === false || lychee.public_search === true;

	// build class_string for tag
	let a_class = "tag";
	if (searchable) {
		a_class = a_class + " search";
	}

	if (tags !== "") {
		tags = tags.split(",");

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

build.user = function (user) {
	let html = lychee.html`<div class="users_view_line">
			<p id="UserData${user.id}">
			<input name="id" type="hidden" value="${user.id}" />
			<input class="text" name="username" type="text" value="$${user.username}" placeholder="username" />
			<input class="text" name="password" type="text" placeholder="new password" />
			<span class="choice" title="Allow uploads">
			<label>
			<input type="checkbox" name="upload" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>
			<span class="choice" title="Restricted account">
			<label>
			<input type="checkbox" name="lock" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>
			</p>
			<a id="UserUpdate${user.id}"  class="basicModal__button basicModal__button_OK">Save</a>
			<a id="UserDelete${user.id}"  class="basicModal__button basicModal__button_DEL">Delete</a>
		</div>
		`;

	return html;
};

build.u2f = function (credential) {
	return lychee.html`<div class="u2f_view_line">
			<p id="CredentialData${credential.id}">
			<input name="id" type="hidden" value="${credential.id}" />
			<span class="text">${credential.id.slice(0, 30)}</span>
			<!--- <span class="choice" title="Allow uploads">
			<label>
			<input type="checkbox" name="upload" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>
			<span class="choice" title="Restricted account">
			<label>
			<input type="checkbox" name="lock" />
			<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
			</label>
			</span>--->
			</p>
			<a id="CredentialDelete${credential.id}"  class="basicModal__button basicModal__button_DEL">Delete</a>
		</div>
		`;
};
