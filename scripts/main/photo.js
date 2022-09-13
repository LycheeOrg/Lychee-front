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

		view.photo.show();
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
	const deletePhotos = function () {
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
				lychee.goto(album.getID() + "/" + nextPhotoID, false);
			} else if (previousPhotoID !== null && previousPhotoID !== photo.getID()) {
				lychee.goto(album.getID() + "/" + previousPhotoID, false);
			} else {
				lychee.goto(album.getID());
			}
		} else if (!visible.albums()) {
			lychee.goto(album.getID());
		}

		api.post("Photo::delete", { photoIDs: photoIDs });
	};

	/**
	 * @param {ModelDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initDeletePhotoDialog = function (formElements, dialog) {
		if (photoIDs.length === 1) {
			const photoTitle = (visible.photo() ? photo.json.title : album.getByID(photoIDs[0]).title) || lychee.locale["UNTITLED"];
			dialog.querySelector("p").textContent = sprintf(lychee.locale["PHOTO_DELETE_CONFIRMATION"], photoTitle);
		} else {
			dialog.querySelector("p").textContent = sprintf(lychee.locale["PHOTO_DELETE_ALL"], photoIDs.length);
		}
	};

	basicModal.show({
		body: "<p></p>",
		readyCB: initDeletePhotoDialog,
		buttons: {
			action: {
				title: lychee.locale["PHOTO_DELETE"],
				fn: deletePhotos,
				classList: ["red"],
			},
			cancel: {
				title: lychee.locale["PHOTO_KEEP"],
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
	/**
	 * @param {{title: string}} data
	 * @returns {void}
	 */
	const action = function (data) {
		if (!data.title.trim()) {
			basicModal.focusError("title");
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

	const setPhotoTitleDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='title' type='text' maxlength='100'></div>
		</form>`;

	/**
	 * @param {ModelDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSetPhotoTitleDialog = function (formElements, dialog) {
		const oldTitle = photoIDs.length === 1 ? (photo.json ? photo.json.title : album.getByID(photoIDs[0]).title) : "";
		dialog.querySelector("p").textContent =
			photoIDs.length === 1 ? lychee.locale["PHOTO_NEW_TITLE"] : sprintf(lychee.locale["PHOTOS_NEW_TITLE"], photoIDs.length);
		formElements.title.placeholder = "Title";
		formElements.title.value = oldTitle;
	};

	basicModal.show({
		body: setPhotoTitleDialogBody,
		readyCB: initSetPhotoTitleDialog,
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

	album.getByID(photo.json.id).is_starred = photo.json.is_starred;
	view.album.content.star(photo.json.id);

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
	/**
	 * @param {{is_public: boolean}} data
	 */
	const action = function (data) {
		/**
		 * Note: `newIsPublic` must be `0` or `1` and no boolean, because
		 * `photo.is_public` is an integer between `0` and `2`.
		 */
		const newIsPublic = data.is_public ? 1 : 0;

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

	const setPhotoProtectionPolicyBody = `
		<p id="ppp_dialog_no_edit_expl"></p>
		<form>
			<div class='input-group compact-no-indent'>
				<label for="ppp_dialog_public_check"></label>
				<input type='checkbox' class="slider" id='ppp_dialog_public_check' name='is_public' />
				<p></p>
			</div>
			<p id="ppp_dialog_global_expl"></p>
			<div class='input-group compact-inverse disabled'>
				<label for="ppp_dialog_full_photo_check"></label>
				<input type='checkbox' id='ppp_dialog_full_photo_check' name='grants_full_photo' disabled="disabled" />
				<p></p>
			</div>
			<div class='input-group compact-inverse disabled'>
				<label for="ppp_dialog_link_check"></label>
				<input type='checkbox' id='ppp_dialog_link_check' name='requires_link' disabled="disabled" />
				<p></p>
			</div>
			<div class='input-group compact-inverse disabled'>
				<label for="ppp_dialog_downloadable_check"></label>
				<input type='checkbox' id='ppp_dialog_downloadable_check' name='is_downloadable' disabled="disabled" />
				<p></p>
			</div>
			<div class='input-group compact-inverse disabled'>
				<label for="ppp_dialog_share_check"></label>
				<input type='checkbox' id='ppp_dialog_share_check' name='is_share_button_visible' disabled="disabled" />
				<p></p>
			</div>
			<div class='input-group compact-inverse disabled'>
				<label for="ppp_dialog_password_check"></label>
				<input type='checkbox' id='ppp_dialog_password_check' name='has_password' disabled="disabled">
				<p></p>
			</div>
		</form>`;

	/**
	 * @typedef PhotoProtectionPolicyDialogFormElements
	 * @property {HTMLInputElement} is_public
	 * @property {HTMLInputElement} grants_full_photo
	 * @property {HTMLInputElement} requires_link
	 * @property {HTMLInputElement} is_downloadable
	 * @property {HTMLInputElement} is_share_button_visible
	 * @property {HTMLInputElement} has_password
	 */

	/**
	 * @param {PhotoProtectionPolicyDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initPhotoProtectionPolicyDialog = function (formElements, dialog) {
		formElements.is_public.previousElementSibling.textContent = lychee.locale["PHOTO_PUBLIC"];
		formElements.is_public.nextElementSibling.textContent = lychee.locale["PHOTO_PUBLIC_EXPL"];
		formElements.grants_full_photo.previousElementSibling.textContent = lychee.locale["PHOTO_FULL"];
		formElements.grants_full_photo.nextElementSibling.textContent = lychee.locale["PHOTO_FULL_EXPL"];
		formElements.requires_link.previousElementSibling.textContent = lychee.locale["PHOTO_HIDDEN"];
		formElements.requires_link.nextElementSibling.textContent = lychee.locale["PHOTO_HIDDEN_EXPL"];
		formElements.is_downloadable.previousElementSibling.textContent = lychee.locale["PHOTO_DOWNLOADABLE"];
		formElements.is_downloadable.nextElementSibling.textContent = lychee.locale["PHOTO_DOWNLOADABLE_EXPL"];
		formElements.is_share_button_visible.previousElementSibling.textContent = lychee.locale["PHOTO_SHARE_BUTTON_VISIBLE"];
		formElements.is_share_button_visible.nextElementSibling.textContent = lychee.locale["PHOTO_SHARE_BUTTON_VISIBLE_EXPL"];
		formElements.has_password.previousElementSibling.textContent = lychee.locale["PHOTO_PASSWORD_PROT"];
		formElements.has_password.nextElementSibling.textContent = lychee.locale["PHOTO_PASSWORD_PROT_EXPL"];

		if (photo.json.is_public === 2) {
			// Public album.
			dialog.querySelector("p#ppp_dialog_no_edit_expl").textContent = lychee.locale["PHOTO_NO_EDIT_SHARING_TEXT"];
			dialog.querySelector("p#ppp_dialog_global_expl").remove();
			// Initialize values of detailed settings according to album
			// settings and hide action button as we can't actually change
			// anything.
			formElements.is_public.checked = true;
			formElements.is_public.disabled = true;
			formElements.is_public.parentElement.classList.add("disabled");
			if (album.json) {
				formElements.grants_full_photo.checked = album.json.grants_full_photo;
				// Photos in public albums are never hidden as such.  It's the
				// album that's hidden.  Or is that distinction irrelevant to end
				// users?
				formElements.requires_link.checked = false;
				formElements.is_downloadable.checked = album.json.is_downloadable;
				formElements.is_share_button_visible = album.json.is_share_button_visible;
				formElements.has_password.checked = album.json.has_password;
			}
			basicModal.hideActionButton();
		} else {
			// Private album
			dialog.querySelector("p#ppp_dialog_no_edit_expl").remove();
			dialog.querySelector("p#ppp_dialog_global_expl").textContent = lychee.locale["PHOTO_EDIT_GLOBAL_SHARING_TEXT"];
			// Initialize values of detailed settings according to global
			// configuration.
			formElements.is_public.checked = photo.json.is_public !== 0;
			formElements.grants_full_photo.checked = lychee.full_photo;
			formElements.requires_link.checked = lychee.public_photos_hidden;
			formElements.is_downloadable.checked = !!album.downloadable;
			formElements.is_share_button_visible = lychee.share_button_visible;
			formElements.has_password.checked = false;
		}
	};

	basicModal.show({
		body: setPhotoProtectionPolicyBody,
		readyCB: initPhotoProtectionPolicyDialog,
		buttons: {
			action: {
				title: lychee.locale["SAVE"],
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
 * Edits the description of a photo.
 *
 * This method is a misnomer, it does not only set the description, it also creates and handles the edit dialog
 *
 * @param {string} photoID
 * @returns {void}
 */
photo.setDescription = function (photoID) {
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

	const setPhotoDescriptionDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='description' type='text' maxlength='800'></div>
		</form>`;

	/**
	 * @param {ModelDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSetPhotoDescriptionDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent = lychee.locale["PHOTO_NEW_DESCRIPTION"];
		formElements.description.placeholder = lychee.locale["PHOTO_DESCRIPTION"];
		formElements.description.value = photo.json.description ? photo.json.description : "";
	};

	basicModal.show({
		body: setPhotoDescriptionDialogBody,
		readyCB: initSetPhotoDescriptionDialog,
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

	const setTagDialogBody = `
		<p></p>
		<form>
			<div class="input-group stacked"><input class='text' name='tags' type='text' minlength='1'></div>
		</form>`;

	/**
	 * @param {ModelDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initSetTagAlbumDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent =
			photoIDs.length === 1 ? lychee.locale["PHOTO_NEW_TAGS"] : sprintf(lychee.locale["PHOTOS_NEW_TAGS"], photoIDs.length);
		formElements.tags.placeholder = "Tags";
		formElements.tags.value = oldTags.join(", ");
	};

	basicModal.show({
		body: setTagDialogBody,
		readyCB: initSetTagAlbumDialog,
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
	if (photoIDs.length !== 1 || kind !== null) {
		location.href = "api/Photo::getArchive?photoIDs=" + photoIDs.join() + "&kind=" + kind;
		return;
	}

	// For a single photo without a specified kind, allow to pick the kind
	// via a dialog box and re-call this method later on.

	const myPhoto = photo.json && photo.json.id === photoIDs[0] ? photo.json : album.getByID(photoIDs[0]);

	const kind2VariantAndLocalizedLabel = {
		FULL: ["original", lychee.locale["PHOTO_FULL"]],
		MEDIUM2X: ["medium2x", lychee.locale["PHOTO_MEDIUM_HIDPI"]],
		MEDIUM: ["medium", lychee.locale["PHOTO_MEDIUM"]],
		SMALL2X: ["small2x", lychee.locale["PHOTO_SMALL_HIDPI"]],
		SMALL: ["small", lychee.locale["PHOTO_SMALL"]],
		THUMB2X: ["thumb2x", lychee.locale["PHOTO_THUMB_HIDPI"]],
		THUMB: ["thumb", lychee.locale["PHOTO_THUMB"]],
	};

	/**
	 * @param {string} kind - the kind this button is for, used to construct the ID
	 * @returns {string} - HTML
	 */
	const buildButton = function (kind) {
		return `
				<a class='button' data-photo-kind="${kind}">
					<svg class='iconic ionicons'><use xlink:href='#cloud-download' /></svg>
					<span></span>
				</a>
			`;
	};

	const getPhotoArchiveDialogBody =
		Object.entries(kind2VariantAndLocalizedLabel).reduce((html, [kind]) => html + buildButton(kind), "") + buildButton("LIVEPHOTOVIDEO");

	/** @param {TouchEvent|MouseEvent} ev */
	const onClickOrTouch = function (ev) {
		if (ev.currentTarget instanceof HTMLAnchorElement) {
			basicModal.close();
			photo.getArchive(photoIDs, ev.currentTarget.dataset.photoKind);
			ev.stopPropagation();
		}
	};

	/**
	 * @param {ModelDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 */
	const initGetPhotoArchiveDialog = function (formElements, dialog) {
		Object.entries(kind2VariantAndLocalizedLabel).forEach(function ([kind, [variant, lLabel]]) {
			/** @type {HTMLAnchorElement} */
			const button = dialog.querySelector('a[data-photo-kind="' + kind + '"]');
			/** @type {?SizeVariant} */
			const sv = myPhoto.size_variants[variant];
			if (!!sv) {
				button.title = lychee.locale["DOWNLOAD"];
				button.addEventListener(lychee.getEventName(), onClickOrTouch);
				button.lastElementChild.textContent =
					lLabel + "(" + sv.width + "×" + sv.height + ", " + lychee.locale.printFilesizeLocalized(sv.filesize) + ")";
			} else {
				button.remove();
			}
		});
		/** @type {HTMLAnchorElement} */
		const liveButton = dialog.querySelector('a[data-photo-kind="LIVEPHOTOVIDEO"]');
		if (myPhoto.live_photo_url !== null) {
			liveButton.title = lychee.locale["DOWNLOAD"];
			liveButton.addEventListener(lychee.getEventName(), onClickOrTouch);
			liveButton.lastElementChild.textContent = lychee.locale["PHOTO_LIVE_VIDEO"];
		} else {
			liveButton.remove();
		}
	};

	basicModal.show({
		body: getPhotoArchiveDialogBody,
		readyCB: initGetPhotoArchiveDialog,
		classList: ["downloads"],
		buttons: {
			cancel: {
				title: lychee.locale["CLOSE"],
				fn: basicModal.close,
			},
		},
	});
};

/**
 * Shows a dialog to share the view URL via a QR code.
 *
 * @param {string} photoID
 * @returns {void}
 */
photo.qrCode = function (photoID) {
	/** @type {?Photo} */
	const myPhoto = photo.json && photo.json.id === photoID ? photo.json : album.getByID(photoID);

	if (myPhoto == null) {
		lychee.error(sprintf(lychee.locale["ERROR_PHOTO_NOT_FOUND"], photoID));
		return;
	}

	basicModal.show({
		body: "<div class='qr-code-canvas'></div>",
		classList: ["qr-code"],
		readyCB: function (formElements, dialog) {
			const qrcode = dialog.querySelector("div.qr-code-canvas");
			QrCreator.render(
				{
					text: photo.getViewLink(myPhoto.id),
					radius: 0.0,
					ecLevel: "H",
					fill: "#000000",
					background: "#FFFFFF",
					size: qrcode.clientWidth,
				},
				qrcode
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
	 * @param {string} name - name of the HTML input element
	 * @returns {string} - HTML
	 */
	const buildLine = function (name) {
		return `
			<div class="input-group stacked">
				<label for="${"dialog-direct-links-input-" + name}"></label>
				<input id="${"dialog-direct-links-input-" + name}" name="${name}" type='text' readonly />
				<a class='button'><svg class='iconic ionicons'><use xlink:href='#copy' /></svg></a>
			</div>`;
	};

	const localizations = {
		original: lychee.locale["PHOTO_FULL"],
		medium2x: lychee.locale["PHOTO_MEDIUM_HIDPI"],
		medium: lychee.locale["PHOTO_MEDIUM"],
		small2x: lychee.locale["PHOTO_SMALL_HIDPI"],
		small: lychee.locale["PHOTO_SMALL"],
		thumb2x: lychee.locale["PHOTO_THUMB_HIDPI"],
		thumb: lychee.locale["PHOTO_THUMB"],
	};

	const showDirectLinksDialogBody =
		'<form class="photo-links">' +
		buildLine("view") +
		'</form><p></p><form class="photo-links">' +
		Object.entries(localizations).reduce((html, [type]) => html + buildLine(type), "") +
		buildLine("live") +
		"</form>";

	/**
	 * @param {ModelDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 */
	const initShowDirectLinksDialog = function (formElements, dialog) {
		formElements.view.value = photo.getViewLink(photoID);
		formElements.view.previousElementSibling.textContent = lychee.locale["PHOTO_VIEW"];
		formElements.view.nextElementSibling.title = "Copy to clipboard";
		dialog.querySelector("p").textContent = lychee.locale["PHOTO_DIRECT_LINKS_TO_IMAGES"];

		for (const type in localizations) {
			/** @type {?SizeVariant} */
			const sv = photo.json.size_variants[type];
			if (sv !== null) {
				formElements[type].value = lychee.getBaseUrl() + sv.url;
				formElements[type].previousElementSibling.textContent = localizations[type] + " (" + sv.width + "×" + sv.height + ")";
				formElements[type].nextElementSibling.title = "Copy to clipboard";
			} else {
				// The form element is the `<input>` element, the parent
				// element is the `<div>` which binds the label, the input
				// and the button together.
				// We remove that `<div>` for non-existing variants.
				formElements[type].parentElement.remove();
			}
		}

		if (photo.json.live_photo_url !== null) {
			formElements.live.value = lychee.getBaseUrl() + photo.json.live_photo_url;
			formElements.live.previousElementSibling.textContent = lychee.locale["PHOTO_LIVE_VIDEO"];
			formElements.live.nextElementSibling.title = "Copy to clipboard";
		} else {
			formElements.live.parentElement.remove();
		}

		/** @param {TouchEvent|MouseEvent} ev */
		const onClickOrTouch = function (ev) {
			navigator.clipboard
				.writeText(ev.currentTarget.previousElementSibling.value)
				.then(() => loadingBar.show("success", lychee.locale["URL_COPIED_TO_CLIPBOARD"]));
			ev.stopPropagation();
		};
		dialog.querySelectorAll("a.button").forEach(function (a) {
			a.addEventListener(lychee.getEventName(), onClickOrTouch);
		});
	};

	basicModal.show({
		body: showDirectLinksDialogBody,
		readyCB: initShowDirectLinksDialog,
		buttons: {
			cancel: {
				title: lychee.locale["CLOSE"],
				fn: basicModal.close,
			},
		},
	});

	$(".directLinks .basicModal__button").on(lychee.getEventName(), function () {
		navigator.clipboard.writeText($(this).prev().val()).then(() => loadingBar.show("success", lychee.locale["URL_COPIED_TO_CLIPBOARD"]));
	});
};
