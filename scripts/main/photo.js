/**
 * @description Takes care of every action a photo can handle and execute.
 */

let photo = {
	json: null,
	cache: null,
	supportsPrefetch: null,
	LivePhotosObject: null,
};

photo.getID = function () {
	let id = null;

	if (photo.json) id = photo.json.id;
	else id = $(".photo:hover, .photo.active").attr("data-id");

	if (typeof id === "string" && id.length === 24) return id;
	else return null;
};

photo.load = function (photoID, albumID, autoplay) {
	const checkContent = function () {
		if (album.json != null && album.json.photos) photo.load(photoID, albumID, autoplay);
		else setTimeout(checkContent, 100);
	};

	const checkPasswd = function () {
		if (password.value !== "") photo.load(photoID, albumID, autoplay);
		else setTimeout(checkPasswd, 200);
	};

	// we need to check the album.json.photos because otherwise the script is too fast and this raise an error.
	if (album.json == null || album.json.photos == null) {
		checkContent();
		return false;
	}

	let params = {
		photoID,
		password: password.value,
	};

	api.post("Photo::get", params, function (data) {
		photo.json = data;
		photo.json.original_album = photo.json.album;
		photo.json.album = albumID;

		if (!visible.photo()) view.photo.show();
		view.photo.init(autoplay);
		lychee.imageview.show();

		if (!lychee.hide_content_during_imgview) {
			setTimeout(() => {
				lychee.content.show();
				tabindex.makeUnfocusable(lychee.content);
			}, 300);
		}
	});
};

photo.hasExif = function () {
	let exifHash = photo.json.make + photo.json.model + photo.json.shutter + photo.json.aperture + photo.json.focal + photo.json.iso;

	return exifHash !== "";
};

photo.hasTakestamp = function () {
	return photo.json.taken_at !== null;
};

photo.hasDesc = function () {
	return photo.json.description && photo.json.description !== "";
};

photo.isLivePhoto = function () {
	if (!photo.json) return false; // In case it's called, but not initialized
	return photo.json.live_photo_url && photo.json.live_photo_url !== "";
};

photo.isLivePhotoInitizalized = function () {
	return photo.LivePhotosObject !== null;
};

photo.isLivePhotoPlaying = function () {
	if (photo.isLivePhotoInitizalized() === false) return false;
	return photo.LivePhotosObject.isPlaying;
};

photo.cycle_display_overlay = function () {
	let oldtype = build.check_overlay_type(photo.json, lychee.image_overlay_type);
	let newtype = build.check_overlay_type(photo.json, oldtype, true);
	if (oldtype !== newtype) {
		lychee.image_overlay_type = newtype;
		$("#image_overlay").remove();
		let newoverlay = build.overlay_image(photo.json);
		if (newoverlay !== "") lychee.imageview.append(newoverlay);
	}
};

// Preload the next and previous photos for better response time
photo.preloadNextPrev = function (photoID) {
	if (album.json && album.json.photos && album.getByID(photoID)) {
		let previousPhotoID = album.getByID(photoID).previous_photo_id;
		let nextPhotoID = album.getByID(photoID).next_photo_id;
		let imgs = $("img#image");
		let isUsing2xCurrently = imgs.length > 0 && imgs[0].currentSrc !== null && imgs[0].currentSrc.includes("@2x.");

		$("head [data-prefetch]").remove();

		let preload = function (preloadID) {
			let preloadPhoto = album.getByID(preloadID);
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
				href = preloadPhoto.url;
			}

			if (href !== "") {
				if (photo.supportsPrefetch === null) {
					// Copied from https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/
					let DOMTokenListSupports = function (tokenList, token) {
						if (!tokenList || !tokenList.supports) {
							return null;
						}
						try {
							return tokenList.supports(token);
						} catch (e) {
							if (e instanceof TypeError) {
								console.log("The DOMTokenList doesn't have a supported tokens list");
							} else {
								console.error("That shouldn't have happened");
							}
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

		if (nextPhotoID) {
			preload(nextPhotoID);
		}
		if (previousPhotoID) {
			preload(previousPhotoID);
		}
	}
};

photo.parse = function () {
	if (!photo.json.title) photo.json.title = lychee.locale["UNTITLED"];
};

photo.updateSizeLivePhotoDuringAnimation = function (animationDuraction = 300, pauseBetweenUpdated = 10) {
	// For the LivePhotoKit, we need to call the updateSize manually
	// during CSS animations
	//
	var interval = setInterval(function () {
		if (photo.isLivePhotoInitizalized()) {
			photo.LivePhotosObject.updateSize();
		}
	}, pauseBetweenUpdated);

	setTimeout(function () {
		clearInterval(interval);
	}, animationDuraction);
};

photo.previous = function (animate) {
	if (photo.getID() !== null && album.json && album.getByID(photo.getID()) && album.getByID(photo.getID()).previous_photo_id !== null) {
		let delay = 0;

		if (animate === true) {
			delay = 200;

			$("#imageview #image").css({
				WebkitTransform: "translateX(100%)",
				MozTransform: "translateX(100%)",
				transform: "translateX(100%)",
				opacity: 0,
			});
		}

		setTimeout(() => {
			if (photo.getID() === null) return false;
			photo.LivePhotosObject = null;
			lychee.goto(album.getID() + "/" + album.getByID(photo.getID()).previous_photo_id, false);
		}, delay);
	}
};

photo.next = function (animate) {
	if (photo.getID() !== null && album.json && album.getByID(photo.getID()) && album.getByID(photo.getID()).next_photo_id !== null) {
		let delay = 0;

		if (animate === true) {
			delay = 200;

			$("#imageview #image").css({
				WebkitTransform: "translateX(-100%)",
				MozTransform: "translateX(-100%)",
				transform: "translateX(-100%)",
				opacity: 0,
			});
		}

		setTimeout(() => {
			if (photo.getID() === null) return false;
			photo.LivePhotosObject = null;
			lychee.goto(album.getID() + "/" + album.getByID(photo.getID()).next_photo_id, false);
		}, delay);
	}
};

photo.delete = function (photoIDs) {
	let action = {};
	let cancel = {};
	let msg = "";
	let photoTitle = "";

	if (!photoIDs) return false;
	if (!(photoIDs instanceof Array)) photoIDs = [photoIDs];

	if (photoIDs.length === 1) {
		// Get title if only one photo is selected
		if (visible.photo()) photoTitle = photo.json.title;
		else photoTitle = album.getByID(photoIDs[0]).title;

		// Fallback for photos without a title
		if (photoTitle === "") photoTitle = lychee.locale["UNTITLED"];
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

		let params = {
			photoIDs: photoIDs.join(),
		};

		api.post("Photo::delete", params);
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

photo.setTitle = function (photoIDs) {
	let oldTitle = "";
	let msg = "";

	if (!photoIDs) return false;
	if (photoIDs instanceof Array === false) photoIDs = [photoIDs];

	if (photoIDs.length === 1) {
		// Get old title if only one photo is selected
		if (photo.json) oldTitle = photo.json.title;
		else if (album.json) oldTitle = album.getByID(photoIDs).title;
	}

	const action = function (data) {
		if (!data.title.trim()) {
			basicModal.error("title");
			return;
		}

		basicModal.close();

		let newTitle = data.title;

		if (visible.photo()) {
			photo.json.title = newTitle === "" ? "Untitled" : newTitle;
			view.photo.title();
		}

		photoIDs.forEach(function (id) {
			album.getByID(id).title = newTitle;
			view.album.content.title(id);
		});

		let params = {
			photoIDs: photoIDs.join(),
			title: newTitle,
		};

		api.post("Photo::setTitle", params);
	};

	let input = lychee.html`<input class='text' name='title' type='text' maxlength='100' placeholder='Title' value='$${oldTitle}'>`;

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

photo.copyTo = function (photoIDs, albumID) {
	if (!photoIDs) return false;
	if (photoIDs instanceof Array === false) photoIDs = [photoIDs];

	let params = {
		photoIDs: photoIDs.join(),
		albumID,
	};

	api.post("Photo::duplicate", params, () => album.reload());
};

photo.setAlbum = function (photoIDs, albumID) {
	let nextPhotoID = null;
	let previousPhotoID = null;

	if (!photoIDs) return false;
	if (!(photoIDs instanceof Array)) photoIDs = [photoIDs];

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

	let params = {
		photoIDs: photoIDs.join(),
		albumID,
	};

	api.post("Photo::setAlbum", params, function () {
		// We only really need to do anything here if the destination
		// is a (possibly nested) subalbum of the current album; but
		// since we have no way of figuring it out (albums.json is
		// null), we need to reload.
		if (visible.album()) {
			album.reload();
		}
	});
};

photo.setStar = function (photoIDs) {
	if (!photoIDs) return false;

	if (visible.photo()) {
		photo.json.is_starred = !photo.json.is_starred;
		view.photo.star();
	}

	photoIDs.forEach(function (id) {
		album.getByID(id).is_starred = !album.getByID(id).is_starred;
		view.album.content.star(id);
	});

	albums.refresh();

	let params = {
		photoIDs: photoIDs.join(),
	};

	api.post("Photo::setStar", params);
};

photo.setPublic = function (photoID, e) {
	let msg_switch = lychee.html`
		<div class='switch'>
			<label>
				<span class='label'>${lychee.locale["PHOTO_PUBLIC"]}:</span>
				<input type='checkbox' name='is_public'>
				<span class='slider round'></span>
			</label>
			<p>${lychee.locale["PHOTO_PUBLIC_EXPL"]}</p>
		</div>
	`;

	let msg_choices = lychee.html`
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

	if (photo.json.is_public == 2) {
		// Public album. We can't actually change anything but we will
		// display the current settings.

		let msg = lychee.html`
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

		let msg = lychee.html`
			${msg_switch}
			<p class='photoPublic'>${lychee.locale["PHOTO_EDIT_GLOBAL_SHARING_TEXT"]}</p>
			${msg_choices}
		`;

		const action = function () {
			let newIsPublic = $('.basicModal .switch input[name="is_public"]:checked').length === 1;

			if (newIsPublic !== photo.json.is_public) {
				if (visible.photo()) {
					photo.json.is_public = newIsPublic;
					view.photo.public();
				}

				album.getByID(photoID).is_public = newIsPublic;
				view.album.content.public(photoID);

				albums.refresh();

				// Photo::setPublic simply flips the current state.
				// Ugly API but effective...
				api.post("Photo::setPublic", { photoID });
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

		if (photo.json.is_public == 1) {
			$('.basicModal .switch input[name="is_public"]').click();
		}
	}

	return true;
};

photo.setDescription = function (photoID) {
	let oldDescription = photo.json.description;

	const action = function (data) {
		basicModal.close();

		let description = data.description === "" ? null : data.description;

		if (visible.photo()) {
			photo.json.description = description;
			view.photo.description();
		}

		let params = {
			photoID,
			description,
		};

		api.post("Photo::setDescription", params);
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

photo.editTags = function (photoIDs) {
	let oldTags = "";
	let msg = "";

	if (!photoIDs) return false;
	if (photoIDs instanceof Array === false) photoIDs = [photoIDs];

	// Get tags
	if (visible.photo()) oldTags = photo.json.tags;
	else if (visible.album() && photoIDs.length === 1) oldTags = album.getByID(photoIDs).tags;
	else if (visible.search() && photoIDs.length === 1) oldTags = album.getByID(photoIDs).tags;
	else if (visible.album() && photoIDs.length > 1) {
		let same = true;
		photoIDs.forEach(function (id) {
			same = album.getByID(id).tags === album.getByID(photoIDs[0]).tags && same === true;
		});
		if (same === true) oldTags = album.getByID(photoIDs[0]).tags;
	}

	// Improve tags
	if (typeof oldTags === "string" && oldTags !== "") {
		oldTags = oldTags.replace(/,/g, ", ");
	} else {
		oldTags = "";
	}

	const action = function (data) {
		basicModal.close();
		photo.setTags(photoIDs, data.tags);
	};

	let input = lychee.html`<input class='text' name='tags' type='text' maxlength='800' placeholder='Tags' value='$${oldTags}'>`;

	if (photoIDs.length === 1) msg = lychee.html`<p>${lychee.locale["PHOTO_NEW_TAGS"]} ${input}</p>`;
	else msg = lychee.html`<p>${lychee.locale["PHOTO_NEW_TAGS_1"]} ${photoIDs.length} ${lychee.locale["PHOTO_NEW_TAGS_2"]} ${input}</p>`;

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

photo.setTags = function (photoIDs, tags) {
	if (!photoIDs) return false;
	if (!(photoIDs instanceof Array)) photoIDs = [photoIDs];

	// Parse tags
	tags = tags.replace(/( , )|( ,)|(, )|(,+ *)|(,$|^,)/g, ",");
	tags = tags.replace(/,$|^,|( )*$/g, "");

	if (visible.photo()) {
		photo.json.tags = tags;
		view.photo.tags();
	}

	photoIDs.forEach(function (id, index, array) {
		album.getByID(id).tags = tags;
	});

	let params = {
		photoIDs: photoIDs.join(),
		tags,
	};

	api.post("Photo::setTags", params, function () {
		if (albums.json && albums.json.smart_albums) {
			$.each(Object.entries(albums.json.smart_albums), function () {
				if (this.length === 2 && this[1]["is_tag_album"] === true) {
					// If we have any tag albums, force a refresh.
					albums.refresh();
				}
			});
		}
	});
};

photo.deleteTag = function (photoID, index) {
	let tags;

	// Remove
	tags = photo.json.tags.split(",");
	tags.splice(index, 1);

	// Save
	photo.json.tags = tags.toString();
	photo.setTags([photoID], photo.json.tags);
};

photo.share = function (photoID, service) {
	if (photo.json.hasOwnProperty("is_share_button_visible") && !photo.json.is_share_button_visible) {
		return;
	}

	let url = photo.getViewLink(photoID);

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

photo.setLicense = function (photoID) {
	const callback = function () {
		$("select#license").val(photo.json.license === "" ? "none" : photo.json.license);
		return false;
	};

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

	let msg = lychee.html`
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
		callback: callback,
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

photo.getArchive = function (photoIDs, kind = null) {
	if (photoIDs.length === 1 && kind === null) {
		// For a single photo, allow to pick the kind via a dialog box.

		let myPhoto;

		if (photo.json && photo.json.id === photoIDs[0]) {
			myPhoto = photo.json;
		} else {
			myPhoto = album.getByID(photoIDs[0]);
		}

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
				`${lychee.locale["PHOTO_FULL"]} (${myPhoto.size_variants.original.width}x${
					myPhoto.size_variants.original.height
				}, ${lychee.locale.printFilesizeLocalized(myPhoto.filesize)})`
			);
		}
		if (myPhoto.live_photo_url !== null) {
			msg += buildButton("LIVEPHOTOVIDEO", `${lychee.locale["PHOTO_LIVE_VIDEO"]}`);
		}
		if (myPhoto.size_variants.medium2x !== null) {
			msg += buildButton(
				"MEDIUM2X",
				`${lychee.locale["PHOTO_MEDIUM_HIDPI"]} (${myPhoto.size_variants.medium2x.width}x${myPhoto.size_variants.medium2x.height})`
			);
		}
		if (myPhoto.size_variants.medium !== null) {
			msg += buildButton(
				"MEDIUM",
				`${lychee.locale["PHOTO_MEDIUM"]} (${myPhoto.size_variants.medium.width}x${myPhoto.size_variants.medium.height})`
			);
		}
		if (myPhoto.size_variants.small2x !== null) {
			msg += buildButton(
				"SMALL2X",
				`${lychee.locale["PHOTO_SMALL_HIDPI"]} (${myPhoto.size_variants.small2x.width}x${myPhoto.size_variants.small2x.height})`
			);
		}
		if (myPhoto.size_variants.small !== null) {
			msg += buildButton(
				"SMALL",
				`${lychee.locale["PHOTO_SMALL"]} (${myPhoto.size_variants.small.width}x${myPhoto.size_variants.small.height})`
			);
		}
		if (myPhoto.size_variants.thumb2x !== null) {
			msg += buildButton(
				"THUMB2X",
				`${lychee.locale["PHOTO_THUMB_HIDPI"]} (${myPhoto.size_variants.thumb2x.width}x${myPhoto.size_variants.thumb2x.height})`
			);
		}
		if (myPhoto.size_variants.thumb !== null) {
			msg += buildButton(
				"THUMB",
				`${lychee.locale["PHOTO_THUMB"]} (${myPhoto.size_variants.thumb.width}x${myPhoto.size_variants.thumb.height})`
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
			kind = this.id;
			basicModal.close();
			photo.getArchive(photoIDs, kind);
		});

		return true;
	}

	location.href = "api/Photo::getArchive" + lychee.html`?photoIDs=${photoIDs.join()}&kind=${kind}`;
};

photo.getDirectLink = function () {
	let url = "";

	if (
		photo.json &&
		photo.json.size_variants &&
		photo.json.size_variants.original &&
		photo.json.size_variants.original.url &&
		photo.json.size_variants.original.url !== ""
	)
		url = photo.json.size_variants.original.url;

	return url;
};

photo.getViewLink = function (photoID) {
	let url = "view?p=" + photoID;

	return lychee.getBaseUrl() + url;
};

photo.showDirectLinks = function (photoID) {
	if (!photo.json || photo.json.id != photoID) {
		return;
	}

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
	if (photo.json.live_photo_url !== "") {
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
		if (lychee.clipboardCopy($(this).prev().val())) {
			loadingBar.show("success", lychee.locale["URL_COPIED_TO_CLIPBOARD"]);
		}
	});
};
