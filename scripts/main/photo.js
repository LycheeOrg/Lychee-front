/**
 * @description Takes care of every action a photo can handle and execute.
 */

const photo = {
	/** @type {?Photo} */
	json: null,
	cache: null,
	/** @type {?boolean} indicates whether the browser supports prefetching of images; `null` if support hasn't been determined yet */
	supportsPrefetch: null,
	/** @type {?LivePhotosKit.Player} */
	livePhotosObject: null,
};

/**
 * @returns {?string} - the photo ID
 */
photo.getID = function () {
	let id = photo.json ? photo.json.id : $(".photo:hover, .photo.active").attr("data-id");
	id = typeof id === "string" && /^[-_0-9a-zA-Z]{24}$/.test(id) ? id : null;

	return id;
};

/**
 *
 * @param {string} photoID
 * @param {string} albumID
 * @param {boolean} autoplay - automatically start playback, if the photo is a video or live photo
 *
 * @returns {void}
 */
photo.load = function (photoID, albumID, autoplay) {
	/**
	 * @param {Photo} data
	 * @returns {void}
	 */
	const successHandler = function (data) {
		photo.json = data;
		// TODO: `photo.json.original_album_id` is set only, but never read; do we need it?
		photo.json.original_album_id = photo.json.album_id;
		// TODO: Why do we overwrite the true album ID of a photo, by the externally provided one? I guess we need it, because the album which the user came from might also be a smart album or a tag album. However, in this case I would prefer to leave the `album_id  untouched (don't rename it to `original_album_id`) and call this one `effective_album_id` instead.
		photo.json.album_id = albumID;

		if (!visible.photo()) view.photo.show();
		view.photo.init(autoplay);
		lychee.imageview.show();

		if (!lychee.hide_content_during_imgview) {
			setTimeout(() => {
				lychee.content.show();
				tabindex.makeUnfocusable(lychee.content);
			}, 300);
		}
	};

	api.post(
		"Photo::get",
		{
			photoID: photoID,
		},
		successHandler
	);
};

/**
 * @returns {boolean}
 */
photo.hasExif = function () {
	return !!photo.json.make || !!photo.json.model || !!photo.json.shutter || !!photo.json.aperture || !!photo.json.focal || !!photo.json.iso;
};

/**
 * @returns {boolean}
 */
photo.hasTakestamp = function () {
	return !!photo.json.taken_at;
};

/**
 * @returns {boolean}
 */
photo.hasDesc = function () {
	return !!photo.json.description;
};

/**
 * @returns {boolean}
 */
photo.isLivePhoto = function () {
	return (
		!!photo.json && // In case it's called, but not initialized
		!!photo.json.live_photo_url
	);
};

/**
 * @returns {boolean}
 */
photo.isLivePhotoInitialized = function () {
	return !!photo.livePhotosObject;
};

/**
 * @returns {boolean}
 */
photo.isLivePhotoPlaying = function () {
	return photo.isLivePhotoInitialized() && photo.livePhotosObject.isPlaying;
};

/**
 * @returns {void}
 */
photo.cycle_display_overlay = function () {
	const oldType = build.check_overlay_type(photo.json, lychee.image_overlay_type);
	const newType = build.check_overlay_type(photo.json, oldType, true);
	if (oldType !== newType) {
		lychee.image_overlay_type = newType;
		$("#image_overlay").remove();
		const newOverlay = build.overlay_image(photo.json);
		if (newOverlay !== "") lychee.imageview.append(newOverlay);
	}
};

/**
 * Preloads the next and previous photos for better response time
 *
 * @param {string} photoID
 * @returns {void}
 */
photo.preloadNextPrev = function (photoID) {
	if (!album.json || !album.json.photos) return;

	const photo = album.getByID(photoID);
	if (!photo) return;

	const imgs = $("img#image");
	// TODO: consider replacing the test for "@2x." by a simple comparison to photo.size_variants.medium2x.url.
	const isUsing2xCurrently = imgs.length > 0 && imgs[0].currentSrc !== null && imgs[0].currentSrc.includes("@2x.");

	$("head [data-prefetch]").remove();

	/**
	 * @param {string} preloadID
	 * @returns {void}
	 */
	const preload = function (preloadID) {
		const preloadPhoto = album.getByID(preloadID);
		let href = "";

		if (preloadPhoto.size_variants.medium != null) {
			href = preloadPhoto.size_variants.medium.url;
			if (preloadPhoto.size_variants.medium2x != null && isUsing2xCurrently) {
				// If the currently displayed image uses the 2x variant,
				// chances are that so will the next one.
				href = preloadPhoto.size_variants.medium2x.url;
			}
		} else if (preloadPhoto.type && preloadPhoto.type.indexOf("video") === -1) {
			// Preload the original size, but only if it's not a video
			href = preloadPhoto.size_variants.original.url;
		}

		if (href !== "") {
			if (photo.supportsPrefetch === null) {
				/**
				 * Copied from https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/
				 *
				 * TODO: This method should not be defined dynamically, but defined and executed upon initialization once
				 *
				 * @param {DOMTokenList} tokenList
				 * @param {string} token
				 * @returns {boolean}
				 */
				const DOMTokenListSupports = function (tokenList, token) {
					try {
						if (!tokenList || !tokenList.supports) {
							return false;
						}
						return tokenList.supports(token);
					} catch (e) {
						if (e instanceof TypeError) {
							console.log("The DOMTokenList doesn't have a supported tokens list");
						} else {
							console.error("That shouldn't have happened");
						}
						return false;
					}
				};
				photo.supportsPrefetch = DOMTokenListSupports(document.createElement("link").relList, "prefetch");
			}

			if (photo.supportsPrefetch) {
				$("head").append(lychee.html`<link data-prefetch rel="prefetch" href="${href}">`);
			} else {
				// According to https://caniuse.com/#feat=link-rel-prefetch,
				// as of mid-2019 it's mainly Safari (both on desktop and mobile)
				new Image().src = href;
			}
		}
	};

	if (photo.next_photo_id) {
		preload(photo.next_photo_id);
	}
	if (photo.previous_photo_id) {
		preload(photo.previous_photo_id);
	}
};

/**
 * @param {number} [animationDuration=300]
 * @param {number} [pauseBetweenUpdated=10]
 * @returns {void}
 */
photo.updateSizeLivePhotoDuringAnimation = function (animationDuration = 300, pauseBetweenUpdated = 10) {
	// For the LivePhotoKit, we need to call the updateSize manually
	// during CSS animations
	//
	const interval = setInterval(function () {
		if (photo.isLivePhotoInitialized()) {
			photo.livePhotosObject.updateSize();
		}
	}, pauseBetweenUpdated);

	setTimeout(function () {
		clearInterval(interval);
	}, animationDuration);
};

/**
 * @param {boolean} animate
 * @returns {void}
 */
photo.previous = function (animate) {
	const curPhoto = photo.getID() !== null && album.json ? album.getByID(photo.getID()) : null;
	if (!curPhoto || !curPhoto.previous_photo_id) return;

	const delay = animate ? 200 : 0;

	if (animate) {
		$("#imageview #image").css({
			WebkitTransform: "translateX(100%)",
			MozTransform: "translateX(100%)",
			transform: "translateX(100%)",
			opacity: 0,
		});
	}

	setTimeout(() => {
		photo.livePhotosObject = null;
		lychee.goto(album.getID() + "/" + curPhoto.previous_photo_id, false);
	}, delay);
};

/**
 * @param {boolean} animate
 * @returns {void}
 */
photo.next = function (animate) {
	const curPhoto = photo.getID() !== null && album.json ? album.getByID(photo.getID()) : null;
	if (!curPhoto || !curPhoto.next_photo_id) return;

	const delay = animate ? 200 : 0;

	if (animate === true) {
		$("#imageview #image").css({
			WebkitTransform: "translateX(-100%)",
			MozTransform: "translateX(-100%)",
			transform: "translateX(-100%)",
			opacity: 0,
		});
	}

	setTimeout(() => {
		photo.livePhotosObject = null;
		lychee.goto(album.getID() + "/" + curPhoto.next_photo_id, false);
	}, delay);
};

/**
 * @param {string[]} photoIDs
 * @returns {boolean}
 */
photo.delete = function (photoIDs) {
	let action = {};
	let cancel = {};
	let msg = "";
	let photoTitle = "";

	if (photoIDs.length === 1) {
		// Get title if only one photo is selected
		if (visible.photo()) photoTitle = photo.json.title;
		else photoTitle = album.getByID(photoIDs[0]).title;

		// Fallback for photos without a title
		if (!photoTitle) photoTitle = lychee.locale["UNTITLED"];
	}

	action.fn = function () {
		let nextPhotoID = null;
		let previousPhotoID = null;

		basicModal.close();

		photoIDs.forEach(function (id, index) {
			// Change reference for the next and previous photo
			let curPhoto = album.getByID(id);
			if (curPhoto.next_photo_id !== null || curPhoto.previous_photo_id !== null) {
				nextPhotoID = curPhoto.next_photo_id;
				previousPhotoID = curPhoto.previous_photo_id;

				if (previousPhotoID !== null) {
					album.getByID(previousPhotoID).next_photo_id = nextPhotoID;
				}
				if (nextPhotoID !== null) {
					album.getByID(nextPhotoID).previous_photo_id = previousPhotoID;
				}
			}

			album.deleteByID(id);
			view.album.content.delete(id, index === photoIDs.length - 1);
		});

		albums.refresh();

		// Go to next photo if there is a next photo and
		// next photo is not the current one. Also try the previous one.
		// Show album otherwise.
		if (visible.photo()) {
			if (nextPhotoID !== null && nextPhotoID !== photo.getID()) {
				lychee.goto(album.getID() + "/" + nextPhotoID);
			} else if (previousPhotoID !== null && previousPhotoID !== photo.getID()) {
				lychee.goto(album.getID() + "/" + previousPhotoID);
			} else {
				lychee.goto(album.getID());
			}
		} else if (!visible.albums()) {
			lychee.goto(album.getID());
		}

		api.post("Photo::delete", { photoIDs: photoIDs });
	};

	if (photoIDs.length === 1) {
		action.title = lychee.locale["PHOTO_DELETE"];
		cancel.title = lychee.locale["PHOTO_KEEP"];

		msg = lychee.html`<p>${lychee.locale["PHOTO_DELETE_1"]} '${photoTitle}'${lychee.locale["PHOTO_DELETE_2"]}</p>`;
	} else {
		action.title = lychee.locale["PHOTO_DELETE"];
		cancel.title = lychee.locale["PHOTO_KEEP"];

		msg = lychee.html`<p>${lychee.locale["PHOTO_DELETE_ALL_1"]} ${photoIDs.length} ${lychee.locale["PHOTO_DELETE_ALL_2"]}</p>`;
	}

	basicModal.show({
		body: msg,
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

/**
 *
 * @param {string[]} photoIDs
 * @returns {void}
 */
photo.setTitle = function (photoIDs) {
	let oldTitle = "";
	let msg = "";

	if (photoIDs.length === 1) {
		// Get old title if only one photo is selected
		if (photo.json) oldTitle = photo.json.title;
		else if (album.json) oldTitle = album.getByID(photoIDs[0]).title;
	}

	/**
	 * @param {{title: string}} data
	 * @returns {void}
	 */
	const action = function (data) {
		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		const newTitle = data.title ? data.title : null;

		if (visible.photo()) {
			photo.json.title = newTitle;
			view.photo.title();
		}

		photoIDs.forEach(function (id) {
			// TODO: The line below looks suspicious: It is inconsistent to the code some lines above.
			album.getByID(id).title = newTitle;
			view.album.content.title(id);
		});

		api.post("Photo::setTitle", {
			photoIDs: photoIDs,
			title: newTitle,
		});
	};

	const input = lychee.html`<input class='text' name='title' type='text' maxlength='100' placeholder='Title' value='$${oldTitle}'>`;

	if (photoIDs.length === 1) msg = lychee.html`<p>${lychee.locale["PHOTO_NEW_TITLE"]} ${input}</p>`;
	else msg = lychee.html`<p>${lychee.locale["PHOTOS_NEW_TITLE_1"]} ${photoIDs.length} ${lychee.locale["PHOTOS_NEW_TITLE_2"]} ${input}</p>`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale["PHOTO_SET_TITLE"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 *
 * @param {string[]} photoIDs IDs of photos to be copied
 * @param {?string} albumID ID of destination album; `null` means root album
 * @returns {void}
 */
photo.copyTo = function (photoIDs, albumID) {
	api.post(
		"Photo::duplicate",
		{
			photoIDs: photoIDs,
			albumID: albumID,
		},
		() => album.reload()
	);
};

/**
 * @param {string[]} photoIDs
 * @param {string} albumID
 * @returns {void}
 */
photo.setAlbum = function (photoIDs, albumID) {
	let nextPhotoID = null;
	let previousPhotoID = null;

	photoIDs.forEach(function (id, index) {
		// Change reference for the next and previous photo
		let curPhoto = album.getByID(id);
		if (curPhoto.next_photo_id !== null || curPhoto.previous_photo_id !== null) {
			nextPhotoID = curPhoto.next_photo_id;
			previousPhotoID = curPhoto.previous_photo_id;

			if (previousPhotoID !== null) {
				album.getByID(previousPhotoID).next_photo_id = nextPhotoID;
			}
			if (nextPhotoID !== null) {
				album.getByID(nextPhotoID).previous_photo_id = previousPhotoID;
			}
		}

		album.deleteByID(id);
		view.album.content.delete(id, index === photoIDs.length - 1);
	});

	albums.refresh();

	// Go to next photo if there is a next photo and
	// next photo is not the current one. Also try the previous one.
	// Show album otherwise.
	if (visible.photo()) {
		if (nextPhotoID !== null && nextPhotoID !== photo.getID()) {
			lychee.goto(album.getID() + "/" + nextPhotoID);
		} else if (previousPhotoID !== null && previousPhotoID !== photo.getID()) {
			lychee.goto(album.getID() + "/" + previousPhotoID);
		} else {
			lychee.goto(album.getID());
		}
	}

	api.post(
		"Photo::setAlbum",
		{
			photoIDs: photoIDs,
			albumID: albumID,
		},
		function () {
			// We only really need to do anything here if the destination
			// is a (possibly nested) subalbum of the current album; but
			// since we have no way of figuring it out (albums.json is
			// null), we need to reload.
			if (visible.album()) {
				album.reload();
			}
		}
	);
};

/**
 * Toggles the star-property of the currently visible photo.
 *
 * @returns {void}
 */
photo.toggleStar = function () {
	photo.json.is_starred = !photo.json.is_starred;
	view.photo.star();
	albums.refresh();

	api.post("Photo::setStar", {
		photoIDs: [photo.json.id],
		is_starred: photo.json.is_starred,
	});
};

/**
 * Sets the star-property of the given photos.
 *
 * @param {string[]} photoIDs
 * @param {boolean} isStarred
 * @returns {void}
 */
photo.setStar = function (photoIDs, isStarred) {
	photoIDs.forEach(function (id) {
		album.getByID(id).is_starred = isStarred;
		view.album.content.star(id);
	});

	albums.refresh();

	api.post("Photo::setStar", {
		photoIDs: photoIDs,
		is_starred: isStarred,
	});
};

/**
 * Edits the protection policy of a photo.
 *
 * This method is a misnomer, it does not only set the policy, it also creates
 * and handles the edit dialog
 *
 * @param {string} photoID
 * @returns {void}
 */
photo.setProtectionPolicy = function (photoID) {
	const msg_switch = lychee.html`
		<div class='switch'>
			<label>
				<span class='label'>${lychee.locale["PHOTO_PUBLIC"]}:</span>
				<input type='checkbox' name='is_public'>
				<span class='slider round'></span>
			</label>
			<p>${lychee.locale["PHOTO_PUBLIC_EXPL"]}</p>
		</div>
	`;

	const msg_choices = lychee.html`
		<div class='choice'>
			<label>
				<input type='checkbox' name='grants_full_photo' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_FULL"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_FULL_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='requires_link' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_HIDDEN"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_HIDDEN_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='is_downloadable' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_DOWNLOADABLE"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_DOWNLOADABLE_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='is_share_button_visible' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_SHARE_BUTTON_VISIBLE"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_SHARE_BUTTON_VISIBLE_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='has_password' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_PASSWORD_PROT"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_PASSWORD_PROT_EXPL"]}</p>
		</div>
	`;

	if (photo.json.is_public === 2) {
		// Public album. We can't actually change anything, but we will
		// display the current settings.

		const msg = lychee.html`
			<p class='less'>${lychee.locale["PHOTO_NO_EDIT_SHARING_TEXT"]}</p>
			${msg_switch}
			${msg_choices}
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

		$('.basicModal .switch input[name="is_public"]').prop("checked", true);
		if (album.json) {
			if (album.json.grants_full_photo) {
				$('.basicModal .choice input[name="grants_full_photo"]').prop("checked", true);
			}
			// Photos in public albums are never hidden as such.  It's the
			// album that's hidden.  Or is that distinction irrelevant to end
			// users?
			if (album.json.is_downloadable) {
				$('.basicModal .choice input[name="is_downloadable"]').prop("checked", true);
			}
			if (album.json.has_password) {
				$('.basicModal .choice input[name="has_password"]').prop("checked", true);
			}
		}

		$(".basicModal .switch input").attr("disabled", true);
		$(".basicModal .switch .label").addClass("label--disabled");
	} else {
		// Private album -- each photo can be shared individually.

		const msg = lychee.html`
			${msg_switch}
			<p class='photoPublic'>${lychee.locale["PHOTO_EDIT_GLOBAL_SHARING_TEXT"]}</p>
			${msg_choices}
		`;

		// TODO: Actually, the action handler receives an object with values of all input fields. There is no need to run use a jQuery-selector
		const action = function () {
			/**
			 * Note: `newIsPublic` must be of type `number`, because `photo.is_public` is a number, too
			 * @type {number}
			 */
			const newIsPublic = $('.basicModal .switch input[name="is_public"]:checked').length;

			if (newIsPublic !== photo.json.is_public) {
				if (visible.photo()) {
					photo.json.is_public = newIsPublic;
					view.photo.public();
				}

				album.getByID(photoID).is_public = newIsPublic;
				view.album.content.public(photoID);

				albums.refresh();

				api.post("Photo::setPublic", {
					photoID: photoID,
					is_public: newIsPublic !== 0,
				});
			}

			basicModal.close();
		};

		basicModal.show({
			body: msg,
			buttons: {
				action: {
					title: lychee.locale["PHOTO_SHARING_CONFIRM"],
					fn: action,
				},
				cancel: {
					title: lychee.locale["CANCEL"],
					fn: basicModal.close,
				},
			},
		});

		$('.basicModal .switch input[name="is_public"]').on("click", function () {
			if ($(this).prop("checked") === true) {
				if (lychee.full_photo) {
					$('.basicModal .choice input[name="grants_full_photo"]').prop("checked", true);
				}
				if (lychee.public_photos_hidden) {
					$('.basicModal .choice input[name="requires_link"]').prop("checked", true);
				}
				if (lychee.downloadable) {
					$('.basicModal .choice input[name="is_downloadable"]').prop("checked", true);
				}
				if (lychee.share_button_visible) {
					$('.basicModal .choice input[name="is_share_button_visible"]').prop("checked", true);
				}
				// Photos shared individually can't be password-protected.
			} else {
				$(".basicModal .choice input").prop("checked", false);
			}
		});

		if (photo.json.is_public === 1) {
			$('.basicModal .switch input[name="is_public"]').click();
		}
	}
};

/**
 * Edits the description of a photo.
 *
 * This method is a misnomer, it does not only set the description, it also creates and handles the edit dialog
 *
 * @param {string} photoID
 * @returns {void}
 */
photo.setDescription = function (photoID) {
	const oldDescription = photo.json.description ? photo.json.description : "";

	/**
	 * @param {{description: string}} data
	 */
	const action = function (data) {
		basicModal.close();

		const description = data.description ? data.description : null;

		if (visible.photo()) {
			photo.json.description = description;
			view.photo.description();
		}

		api.post("Photo::setDescription", {
			photoID: photoID,
			description: description,
		});
	};

	basicModal.show({
		body: lychee.html`<p>${lychee.locale["PHOTO_NEW_DESCRIPTION"]} <input class='text' name='description' type='text' maxlength='800' placeholder='${lychee.locale["PHOTO_DESCRIPTION"]}' value='$${oldDescription}'></p>`,
		buttons: {
			action: {
				title: lychee.locale["PHOTO_SET_DESCRIPTION"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string[]} photoIDs
 * @returns {void}
 */
photo.editTags = function (photoIDs) {
	/** @type {string[]} */
	let oldTags = [];

	// Get tags
	if (visible.photo()) oldTags = photo.json.tags.sort();
	else if (visible.album() && photoIDs.length === 1) oldTags = album.getByID(photoIDs[0]).tags.sort();
	else if (visible.search() && photoIDs.length === 1) oldTags = album.getByID(photoIDs[0]).tags.sort();
	else if (visible.album() && photoIDs.length > 1) {
		oldTags = album.getByID(photoIDs[0]).tags.sort();
		const areIdentical = photoIDs.every(function (id) {
			const oldTags2 = album.getByID(id).tags.sort();
			if (oldTags.length !== oldTags2.length) return false;
			for (let tagIdx = 0; tagIdx !== oldTags.length; tagIdx++) {
				if (oldTags[tagIdx] !== oldTags2[tagIdx]) return false;
			}
			return true;
		});
		if (!areIdentical) oldTags = [];
	}

	/**
	 * @param {{tags: string}} data
	 * @returns {void}
	 */
	const action = function (data) {
		basicModal.close();
		const newTags = data.tags
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag !== "" && tag.indexOf(",") === -1)
			.sort();
		photo.setTags(photoIDs, newTags);
	};

	const input = lychee.html`<input class='text' name='tags' type='text' maxlength='800' placeholder='Tags' value='$${oldTags.join(", ")}'>`;

	const msg =
		photoIDs.length === 1
			? lychee.html`<p>${lychee.locale["PHOTO_NEW_TAGS"]} ${input}</p>`
			: lychee.html`<p>${lychee.locale["PHOTO_NEW_TAGS_1"]} ${photoIDs.length} ${lychee.locale["PHOTO_NEW_TAGS_2"]} ${input}</p>`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale["PHOTO_SET_TAGS"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string[]} photoIDs
 * @param {string[]} tags
 * @returns {void}
 */
photo.setTags = function (photoIDs, tags) {
	if (visible.photo()) {
		photo.json.tags = tags;
		view.photo.tags();
	}

	photoIDs.forEach(function (id) {
		album.getByID(id).tags = tags;
	});

	api.post(
		"Photo::setTags",
		{
			photoIDs: photoIDs,
			tags: tags,
		},
		function () {
			// If we have any tag albums, force a refresh.
			if (albums.json && albums.json.tag_albums.length !== 0) {
				albums.refresh();
			}
		}
	);
};

/**
 * Deletes the tag at the given index from the photo.
 *
 * @param {string} photoID
 * @param {number} index
 */
photo.deleteTag = function (photoID, index) {
	photo.json.tags.splice(index, 1);
	photo.setTags([photoID], photo.json.tags);
};

/**
 * @param {string} photoID
 * @param {string} service - one out of `"twitter"`, `"facebook"`, `"mail"` or `"dropbox"`
 * @returns {void}
 */
photo.share = function (photoID, service) {
	if (!photo.json.is_share_button_visible) {
		return;
	}

	const url = photo.getViewLink(photoID);

	switch (service) {
		case "twitter":
			window.open(`https://twitter.com/share?url=${encodeURI(url)}`);
			break;
		case "facebook":
			window.open(`https://www.facebook.com/sharer.php?u=${encodeURI(url)}&t=${encodeURI(photo.json.title)}`);
			break;
		case "mail":
			location.href = `mailto:?subject=${encodeURI(photo.json.title)}&body=${encodeURI(url)}`;
			break;
		case "dropbox":
			lychee.loadDropbox(function () {
				let filename = photo.json.title + "." + photo.getDirectLink().split(".").pop();
				Dropbox.save(photo.getDirectLink(), filename);
			});
			break;
	}
};

/**
 * @param {string} photoID
 * @returns {void}
 */
photo.setLicense = function (photoID) {
	/**
	 * @param {{license: string}} data
	 */
	const action = function (data) {
		basicModal.close();
		let license = data.license;

		let params = {
			photoID,
			license,
		};

		api.post("Photo::setLicense", params, function () {
			// update the photo JSON and reload the license in the sidebar
			photo.json.license = params.license;
			view.photo.license();
		});
	};

	const msg = lychee.html`
	<div>
		<p>${lychee.locale["PHOTO_LICENSE"]}
		<span class="select" style="width:270px">
			<select name="license" id="license">
				<option value="none">${lychee.locale["PHOTO_LICENSE_NONE"]}</option>
				<option value="reserved">${lychee.locale["PHOTO_RESERVED"]}</option>
				<option value="CC0">CC0 - Public Domain</option>
				<option value="CC-BY-1.0">CC Attribution 1.0</option>
				<option value="CC-BY-2.0">CC Attribution 2.0</option>
				<option value="CC-BY-2.5">CC Attribution 2.5</option>
				<option value="CC-BY-3.0">CC Attribution 3.0</option>
				<option value="CC-BY-4.0">CC Attribution 4.0</option>
				<option value="CC-BY-ND-1.0">CC Attribution-NoDerivatives 1.0</option>
				<option value="CC-BY-ND-2.0">CC Attribution-NoDerivatives 2.0</option>
				<option value="CC-BY-ND-2.5">CC Attribution-NoDerivatives 2.5</option>
				<option value="CC-BY-ND-3.0">CC Attribution-NoDerivatives 3.0</option>
				<option value="CC-BY-ND-4.0">CC Attribution-NoDerivatives 4.0</option>
				<option value="CC-BY-SA-1.0">CC Attribution-ShareAlike 1.0</option>
				<option value="CC-BY-SA-2.0">CC Attribution-ShareAlike 2.0</option>
				<option value="CC-BY-SA-2.5">CC Attribution-ShareAlike 2.5</option>
				<option value="CC-BY-SA-3.0">CC Attribution-ShareAlike 3.0</option>
				<option value="CC-BY-SA-4.0">CC Attribution-ShareAlike 4.0</option>
				<option value="CC-BY-NC-1.0">CC Attribution-NonCommercial 1.0</option>
				<option value="CC-BY-NC-2.0">CC Attribution-NonCommercial 2.0</option>
				<option value="CC-BY-NC-2.5">CC Attribution-NonCommercial 2.5</option>
				<option value="CC-BY-NC-3.0">CC Attribution-NonCommercial 3.0</option>
				<option value="CC-BY-NC-4.0">CC Attribution-NonCommercial 4.0</option>
				<option value="CC-BY-NC-ND-1.0">CC Attribution-NonCommercial-NoDerivatives 1.0</option>
				<option value="CC-BY-NC-ND-2.0">CC Attribution-NonCommercial-NoDerivatives 2.0</option>
				<option value="CC-BY-NC-ND-2.5">CC Attribution-NonCommercial-NoDerivatives 2.5</option>
				<option value="CC-BY-NC-ND-3.0">CC Attribution-NonCommercial-NoDerivatives 3.0</option>
				<option value="CC-BY-NC-ND-4.0">CC Attribution-NonCommercial-NoDerivatives 4.0</option>
				<option value="CC-BY-NC-SA-1.0">CC Attribution-NonCommercial-ShareAlike 1.0</option>
				<option value="CC-BY-NC-SA-2.0">CC Attribution-NonCommercial-ShareAlike 2.0</option>
				<option value="CC-BY-NC-SA-2.5">CC Attribution-NonCommercial-ShareAlike 2.5</option>
				<option value="CC-BY-NC-SA-3.0">CC Attribution-NonCommercial-ShareAlike 3.0</option>
				<option value="CC-BY-NC-SA-4.0">CC Attribution-NonCommercial-ShareAlike 4.0</option>
			</select>
		</span>
		<br />
		<a href="https://creativecommons.org/choose/" target="_blank">${lychee.locale["PHOTO_LICENSE_HELP"]}</a>
		</p>
	</div>`;

	basicModal.show({
		body: msg,
		callback: function () {
			$("select#license").val(photo.json.license === "" ? "none" : photo.json.license);
		},
		buttons: {
			action: {
				title: lychee.locale["PHOTO_SET_LICENSE"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @param {string[]} photoIDs
 * @param {?string} [kind=null] - the type of size variant; one out of
 *                                `"FULL"`, `"MEDIUM2X"`, `"MEDIUM"`,
 *                                `"SMALL2X"`, `"SMALL"`, `"THUMB2X"` or
 *                                `"THUMB"`,
 * @returns {void}
 */
photo.getArchive = function (photoIDs, kind = null) {
	if (photoIDs.length === 1 && kind === null) {
		// For a single photo, allow to pick the kind via a dialog box.

		let myPhoto;

		if (photo.json && photo.json.id === photoIDs[0]) {
			myPhoto = photo.json;
		} else {
			myPhoto = album.getByID(photoIDs[0]);
		}

		/**
		 * @param {string} id - the ID of the button, same semantics as "kind"
		 * @param {string} label - the caption on the button
		 * @returns {string} - HTML
		 */
		const buildButton = function (id, label) {
			return lychee.html`
				<a class='basicModal__button' id='${id}' title='${lychee.locale["DOWNLOAD"]}'>
					${build.iconic("cloud-download")}${label}
				</a>
			`;
		};

		let msg = lychee.html`
			<div class='downloads'>
		`;

		if (myPhoto.size_variants.original.url) {
			msg += buildButton(
				"FULL",
				`${lychee.locale["PHOTO_FULL"]} (${myPhoto.size_variants.original.width}x${myPhoto.size_variants.original.height},
				${lychee.locale.printFilesizeLocalized(myPhoto.size_variants.original.filesize)})`
			);
		}
		if (myPhoto.live_photo_url !== null) {
			msg += buildButton("LIVEPHOTOVIDEO", `${lychee.locale["PHOTO_LIVE_VIDEO"]}`);
		}
		if (myPhoto.size_variants.medium2x !== null) {
			msg += buildButton(
				"MEDIUM2X",
				`${lychee.locale["PHOTO_MEDIUM_HIDPI"]} (${myPhoto.size_variants.medium2x.width}x${myPhoto.size_variants.medium2x.height},
				${lychee.locale.printFilesizeLocalized(myPhoto.size_variants.medium2x.filesize)})`
			);
		}
		if (myPhoto.size_variants.medium !== null) {
			msg += buildButton(
				"MEDIUM",
				`${lychee.locale["PHOTO_MEDIUM"]} (${myPhoto.size_variants.medium.width}x${myPhoto.size_variants.medium.height},
				${lychee.locale.printFilesizeLocalized(myPhoto.size_variants.medium.filesize)})`
			);
		}
		if (myPhoto.size_variants.small2x !== null) {
			msg += buildButton(
				"SMALL2X",
				`${lychee.locale["PHOTO_SMALL_HIDPI"]} (${myPhoto.size_variants.small2x.width}x${myPhoto.size_variants.small2x.height},
				${lychee.locale.printFilesizeLocalized(myPhoto.size_variants.small2x.filesize)})`
			);
		}
		if (myPhoto.size_variants.small !== null) {
			msg += buildButton(
				"SMALL",
				`${lychee.locale["PHOTO_SMALL"]} (${myPhoto.size_variants.small.width}x${myPhoto.size_variants.small.height},
				${lychee.locale.printFilesizeLocalized(myPhoto.size_variants.small.filesize)})`
			);
		}
		if (myPhoto.size_variants.thumb2x !== null) {
			msg += buildButton(
				"THUMB2X",
				`${lychee.locale["PHOTO_THUMB_HIDPI"]} (${myPhoto.size_variants.thumb2x.width}x${myPhoto.size_variants.thumb2x.height},
				${lychee.locale.printFilesizeLocalized(myPhoto.size_variants.thumb2x.filesize)})`
			);
		}
		if (myPhoto.size_variants.thumb !== null) {
			msg += buildButton(
				"THUMB",
				`${lychee.locale["PHOTO_THUMB"]} (${myPhoto.size_variants.thumb.width}x${myPhoto.size_variants.thumb.height},
				${lychee.locale.printFilesizeLocalized(myPhoto.size_variants.thumb.filesize)})`
			);
		}

		msg += lychee.html`
			</div>
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

		$(".downloads .basicModal__button").on(lychee.getEventName(), function () {
			const kind = this.id;
			basicModal.close();
			photo.getArchive(photoIDs, kind);
		});
	} else {
		location.href = "api/Photo::getArchive?photoIDs=" + photoIDs.join() + "&kind=" + kind;
	}
};

/**
 * Shows a dialog to share the view URL via a QR code.
 *
 * @param {string} photoID
 * @returns {void}
 */
photo.qrCode = function (photoID) {
	let myPhoto;

	if (photo.json && photo.json.id === photoID) {
		myPhoto = photo.json;
	} else {
		myPhoto = album.getByID(photoID);
	}

	let msg = lychee.html`
		<div id='qr-code' class='downloads'></div>
	`;

	basicModal.show({
		body: msg,
		callback: function () {
			QrCreator.render(
				{
					text: photo.getViewLink(myPhoto.id),
					radius: 0.0,
					ecLevel: "H",
					fill: "#000000",
					background: "#FFFFFF",
					size: 440, // 500px (modal width) - 2*30px (padding)
				},
				document.getElementById("qr-code")
			);
		},
		buttons: {
			cancel: {
				title: lychee.locale["CLOSE"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * @returns {string}
 */
photo.getDirectLink = function () {
	return photo.json && photo.json.size_variants && photo.json.size_variants.original && photo.json.size_variants.original.url
		? photo.json.size_variants.original.url
		: "";
};

/**
 * @param {string} photoID
 * @returns {string}
 */
photo.getViewLink = function (photoID) {
	return lychee.getBaseUrl() + "view?p=" + photoID;
};

/**
 * @param photoID
 * @returns {void}
 */
photo.showDirectLinks = function (photoID) {
	if (!photo.json || photo.json.id !== photoID) {
		return;
	}

	/**
	 * @param {string} label
	 * @param {string} url
	 * @returns {string} - HTML
	 */
	const buildLine = function (label, url) {
		return lychee.html`
			<p>
				${label}
				<br />
				<input class='text' readonly value='${url}'>
				<a class='basicModal__button' title='${lychee.locale["URL_COPY_TO_CLIPBOARD"]}'>
					${build.iconic("copy", "ionicons")}
				</a>
			</p>
		`;
	};

	let msg = lychee.html`
		<div class='directLinks'>
			${buildLine(lychee.locale["PHOTO_VIEW"], photo.getViewLink(photoID))}
			<p class='less'>
				${lychee.locale["PHOTO_DIRECT_LINKS_TO_IMAGES"]}
			</p>
			<div class='imageLinks'>
	`;

	if (photo.json.size_variants.original.url) {
		msg += buildLine(
			`${lychee.locale["PHOTO_FULL"]} (${photo.json.size_variants.original.width}x${photo.json.size_variants.original.height})`,
			lychee.getBaseUrl() + photo.json.size_variants.original.url
		);
	}
	if (photo.json.size_variants.medium2x !== null) {
		msg += buildLine(
			`${lychee.locale["PHOTO_MEDIUM_HIDPI"]} (${photo.json.size_variants.medium2x.width}x${photo.json.size_variants.medium2x.height})`,
			lychee.getBaseUrl() + photo.json.size_variants.medium2x.url
		);
	}
	if (photo.json.size_variants.medium !== null) {
		msg += buildLine(
			`${lychee.locale["PHOTO_MEDIUM"]} (${photo.json.size_variants.medium.width}x${photo.json.size_variants.medium.height})`,
			lychee.getBaseUrl() + photo.json.size_variants.medium.url
		);
	}
	if (photo.json.size_variants.small2x !== null) {
		msg += buildLine(
			`${lychee.locale["PHOTO_SMALL_HIDPI"]} (${photo.json.size_variants.small2x.width}x${photo.json.size_variants.small2x.height})`,
			lychee.getBaseUrl() + photo.json.size_variants.small2x.url
		);
	}
	if (photo.json.size_variants.small !== null) {
		msg += buildLine(
			`${lychee.locale["PHOTO_SMALL"]} (${photo.json.size_variants.small.width}x${photo.json.size_variants.small.height})`,
			lychee.getBaseUrl() + photo.json.size_variants.small.url
		);
	}
	if (photo.json.size_variants.thumb2x !== null) {
		msg += buildLine(
			`${lychee.locale["PHOTO_THUMB_HIDPI"]} (${photo.json.size_variants.thumb2x.width}x${photo.json.size_variants.thumb2x.height})`,
			lychee.getBaseUrl() + photo.json.size_variants.thumb2x.url
		);
	}
	if (photo.json.size_variants.thumb !== null) {
		msg += buildLine(
			`${lychee.locale["PHOTO_THUMB"]} (${photo.json.size_variants.thumb.width}x${photo.json.size_variants.thumb.height})`,
			lychee.getBaseUrl() + photo.json.size_variants.thumb.url
		);
	}
	if (photo.json.live_photo_url) {
		msg += buildLine(` ${lychee.locale["PHOTO_LIVE_VIDEO"]} `, lychee.getBaseUrl() + photo.json.live_photo_url);
	}

	msg += lychee.html`
		</div>
		</div>
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

	// Ensure that no input line is selected on opening.
	$(".basicModal input:focus").blur();

	$(".directLinks .basicModal__button").on(lychee.getEventName(), function () {
		navigator.clipboard.writeText($(this).prev().val()).then(() => loadingBar.show("success", lychee.locale["URL_COPIED_TO_CLIPBOARD"]));
	});
};
