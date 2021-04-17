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

	if ($.isNumeric(id) === true) return id;
	else return false;
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
		if (data === "Warning: Photo private!") {
			lychee.content.show();
			lychee.goto();
			return false;
		}

		if (data === "Warning: Wrong password!") {
			checkPasswd();
			return false;
		}

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

photo.hasTakedate = function () {
	return photo.json.takedate && photo.json.takedate !== "";
};

photo.hasDesc = function () {
	return photo.json.description && photo.json.description !== "";
};

photo.isLivePhoto = function () {
	if (!photo.json) return false; // In case it's called, but not initialized
	return photo.json.livePhotoUrl && photo.json.livePhotoUrl !== "";
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
		let previousPhotoID = album.getByID(photoID).previousPhoto;
		let nextPhotoID = album.getByID(photoID).nextPhoto;
		let current2x = null;

		$("head [data-prefetch]").remove();

		let preload = function (preloadID) {
			let preloadPhoto = album.getByID(preloadID);
			let href = "";

			if (preloadPhoto.medium != null && preloadPhoto.medium !== "") {
				href = preloadPhoto.medium;

				if (preloadPhoto.medium2x && preloadPhoto.medium2x !== "") {
					if (current2x === null) {
						let imgs = $("img#image");
						current2x = imgs.length > 0 && imgs[0].currentSrc !== null && imgs[0].currentSrc.includes("@2x.");
					}
					if (current2x) {
						// If the currently displayed image uses the 2x variant,
						// chances are that so will the next one.
						href = preloadPhoto.medium2x;
					}
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

		if (nextPhotoID && nextPhotoID !== "") {
			preload(nextPhotoID);
		}
		if (previousPhotoID && previousPhotoID !== "") {
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
	if (photo.getID() !== false && album.json && album.getByID(photo.getID()) && album.getByID(photo.getID()).previousPhoto !== "") {
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
			if (photo.getID() === false) return false;
			photo.LivePhotosObject = null;
			lychee.goto(album.getID() + "/" + album.getByID(photo.getID()).previousPhoto, false);
		}, delay);
	}
};

photo.next = function (animate) {
	if (photo.getID() !== false && album.json && album.getByID(photo.getID()) && album.getByID(photo.getID()).nextPhoto !== "") {
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
			if (photo.getID() === false) return false;
			photo.LivePhotosObject = null;
			lychee.goto(album.getID() + "/" + album.getByID(photo.getID()).nextPhoto, false);
		}, delay);
	}
};

photo.delete = function (photoIDs) {
	let action = {};
	let cancel = {};
	let msg = "";
	let photoTitle = "";

	if (!photoIDs) return false;
	if (photoIDs instanceof Array === false) photoIDs = [photoIDs];

	if (photoIDs.length === 1) {
		// Get title if only one photo is selected
		if (visible.photo()) photoTitle = photo.json.title;
		else photoTitle = album.getByID(photoIDs).title;

		// Fallback for photos without a title
		if (photoTitle === "") photoTitle = lychee.locale["UNTITLED"];
	}

	action.fn = function () {
		let nextPhoto = "";
		let previousPhoto = "";

		basicModal.close();

		photoIDs.forEach(function (id, index) {
			// Change reference for the next and previous photo
			if (album.getByID(id).nextPhoto !== "" || album.getByID(id).previousPhoto !== "") {
				nextPhoto = album.getByID(id).nextPhoto;
				previousPhoto = album.getByID(id).previousPhoto;

				if (previousPhoto !== "") {
					album.getByID(previousPhoto).nextPhoto = nextPhoto;
				}
				if (nextPhoto !== "") {
					album.getByID(nextPhoto).previousPhoto = previousPhoto;
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
			if (nextPhoto !== "" && nextPhoto !== photo.getID()) {
				lychee.goto(album.getID() + "/" + nextPhoto);
			} else if (previousPhoto !== "" && previousPhoto !== photo.getID()) {
				lychee.goto(album.getID() + "/" + previousPhoto);
			} else {
				lychee.goto(album.getID());
			}
		} else if (!visible.albums()) {
			lychee.goto(album.getID());
		}

		let params = {
			photoIDs: photoIDs.join(),
		};

		api.post("Photo::delete", params, function (data) {
			if (data !== true) lychee.error(null, params, data);
		});
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

		api.post("Photo::setTitle", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			}
		});
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

	api.post("Photo::duplicate", params, function (data) {
		if (data !== true) {
			lychee.error(null, params, data);
		} else {
			if (lychee.api_V2 || albumID === album.getID()) {
				album.reload();
			} else {
				// Lychee v3 does not support the albumID argument to
				// Photo::duplicate so we need to do it manually, which is
				// imperfect, as it moves the source photos, not the duplicates.
				photo.setAlbum(photoIDs, albumID);
			}
		}
	});
};

photo.setAlbum = function (photoIDs, albumID) {
	let nextPhoto = "";
	let previousPhoto = "";

	if (!photoIDs) return false;
	if (photoIDs instanceof Array === false) photoIDs = [photoIDs];

	photoIDs.forEach(function (id, index) {
		// Change reference for the next and previous photo
		if (album.getByID(id).nextPhoto !== "" || album.getByID(id).previousPhoto !== "") {
			nextPhoto = album.getByID(id).nextPhoto;
			previousPhoto = album.getByID(id).previousPhoto;

			if (previousPhoto !== "") {
				album.getByID(previousPhoto).nextPhoto = nextPhoto;
			}
			if (nextPhoto !== "") {
				album.getByID(nextPhoto).previousPhoto = previousPhoto;
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
		if (nextPhoto !== "" && nextPhoto !== photo.getID()) {
			lychee.goto(album.getID() + "/" + nextPhoto);
		} else if (previousPhoto !== "" && previousPhoto !== photo.getID()) {
			lychee.goto(album.getID() + "/" + previousPhoto);
		} else {
			lychee.goto(album.getID());
		}
	}

	let params = {
		photoIDs: photoIDs.join(),
		albumID,
	};

	api.post("Photo::setAlbum", params, function (data) {
		if (data !== true) {
			lychee.error(null, params, data);
		} else {
			// We only really need to do anything here if the destination
			// is a (possibly nested) subalbum of the current album; but
			// since we have no way of figuring it out (albums.json is
			// null), we need to reload.
			if (visible.album()) {
				album.reload();
			}
		}
	});
};

photo.setStar = function (photoIDs) {
	if (!photoIDs) return false;

	if (visible.photo()) {
		photo.json.star = photo.json.star === "0" ? "1" : "0";
		view.photo.star();
	}

	photoIDs.forEach(function (id) {
		album.getByID(id).star = album.getByID(id).star === "0" ? "1" : "0";
		view.album.content.star(id);
	});

	albums.refresh();

	let params = {
		photoIDs: photoIDs.join(),
	};

	api.post("Photo::setStar", params, function (data) {
		if (data !== true) lychee.error(null, params, data);
	});
};

photo.setPublic = function (photoID, e) {
	let msg_switch = lychee.html`
		<div class='switch'>
			<label>
				<span class='label'>${lychee.locale["PHOTO_PUBLIC"]}:</span>
				<input type='checkbox' name='public'>
				<span class='slider round'></span>
			</label>
			<p>${lychee.locale["PHOTO_PUBLIC_EXPL"]}</p>
		</div>
	`;

	let msg_choices = lychee.html`
		<div class='choice'>
			<label>
				<input type='checkbox' name='full_photo' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_FULL"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_FULL_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='hidden' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_HIDDEN"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_HIDDEN_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='downloadable' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_DOWNLOADABLE"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_DOWNLOADABLE_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='share_button_visible' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_SHARE_BUTTON_VISIBLE"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_SHARE_BUTTON_VISIBLE_EXPL"]}</p>
		</div>
		<div class='choice'>
			<label>
				<input type='checkbox' name='password' disabled>
				<span class='checkbox'>${build.iconic("check")}</span>
				<span class='label'>${lychee.locale["PHOTO_PASSWORD_PROT"]}</span>
			</label>
			<p>${lychee.locale["PHOTO_PASSWORD_PROT_EXPL"]}</p>
		</div>
	`;

	if (photo.json.public === "2") {
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

		$('.basicModal .switch input[name="public"]').prop("checked", true);
		if (album.json) {
			if (album.json.full_photo !== null && album.json.full_photo === "1") {
				$('.basicModal .choice input[name="full_photo"]').prop("checked", true);
			}
			// Photos in public albums are never hidden as such.  It's the
			// album that's hidden.  Or is that distinction irrelevant to end
			// users?
			if (album.json.downloadable === "1") {
				$('.basicModal .choice input[name="downloadable"]').prop("checked", true);
			}
			if (album.json.password === "1") {
				$('.basicModal .choice input[name="password"]').prop("checked", true);
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
			let newPublic = $('.basicModal .switch input[name="public"]:checked').length === 1 ? "1" : "0";

			if (newPublic !== photo.json.public) {
				if (visible.photo()) {
					photo.json.public = newPublic;
					view.photo.public();
				}

				album.getByID(photoID).public = newPublic;
				view.album.content.public(photoID);

				albums.refresh();

				// Photo::setPublic simply flips the current state.
				// Ugly API but effective...
				api.post("Photo::setPublic", { photoID }, function (data) {
					if (data !== true) lychee.error(null, params, data);
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

		$('.basicModal .switch input[name="public"]').on("click", function () {
			if ($(this).prop("checked") === true) {
				if (lychee.full_photo) {
					$('.basicModal .choice input[name="full_photo"]').prop("checked", true);
				}
				if (lychee.public_photos_hidden) {
					$('.basicModal .choice input[name="hidden"]').prop("checked", true);
				}
				if (lychee.downloadable) {
					$('.basicModal .choice input[name="downloadable"]').prop("checked", true);
				}
				if (lychee.share_button_visible) {
					$('.basicModal .choice input[name="share_button_visible"]').prop("checked", true);
				}
				// Photos shared individually can't be password-protected.
			} else {
				$(".basicModal .choice input").prop("checked", false);
			}
		});

		if (photo.json.public === "1") {
			$('.basicModal .switch input[name="public"]').click();
		}
	}

	return true;
};

photo.setDescription = function (photoID) {
	let oldDescription = photo.json.description;

	const action = function (data) {
		basicModal.close();

		let description = data.description;

		if (visible.photo()) {
			photo.json.description = description;
			view.photo.description();
		}

		let params = {
			photoID,
			description,
		};

		api.post("Photo::setDescription", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			}
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
	oldTags = oldTags.replace(/,/g, ", ");

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
	if (photoIDs instanceof Array === false) photoIDs = [photoIDs];

	// Parse tags
	tags = tags.replace(/(\ ,\ )|(\ ,)|(,\ )|(,{1,}\ {0,})|(,$|^,)/g, ",");
	tags = tags.replace(/,$|^,|(\ ){0,}$/g, "");

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

	api.post("Photo::setTags", params, function (data) {
		if (data !== true) {
			lychee.error(null, params, data);
		} else if (albums.json && albums.json.smartalbums) {
			$.each(Object.entries(albums.json.smartalbums), function () {
				if (this.length == 2 && this[1]["tag_album"] === "1") {
					// If we have any tag albums, force a refresh.
					albums.refresh();
					return false;
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
	if (photo.json.hasOwnProperty("share_button_visible") && photo.json.share_button_visible !== "1") {
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

		api.post("Photo::setLicense", params, function (_data) {
			if (_data !== true) {
				lychee.error(null, params, _data);
			} else {
				// update the photo JSON and reload the license in the sidebar
				photo.json.license = params.license;
				view.photo.license();
			}
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

		if (myPhoto.url) {
			msg += buildButton("FULL", `${lychee.locale["PHOTO_FULL"]} (${myPhoto.width}x${myPhoto.height}, ${myPhoto.size})`);
		}
		if (myPhoto.livePhotoUrl !== null) {
			msg += buildButton("LIVEPHOTOVIDEO", `${lychee.locale["PHOTO_LIVE_VIDEO"]}`);
		}
		if (myPhoto.hasOwnProperty("medium2x") && myPhoto.medium2x !== "") {
			msg += buildButton("MEDIUM2X", `${lychee.locale["PHOTO_MEDIUM_HIDPI"]} (${myPhoto.medium2x_dim})`);
		}
		if (myPhoto.medium !== "") {
			msg += buildButton(
				"MEDIUM",
				`${lychee.locale["PHOTO_MEDIUM"]} ${myPhoto.hasOwnProperty("medium_dim") ? "(" + myPhoto.medium_dim + ")" : ""}`
			);
		}
		if (myPhoto.hasOwnProperty("small2x") && myPhoto.small2x !== "") {
			msg += buildButton("SMALL2X", `${lychee.locale["PHOTO_SMALL_HIDPI"]} (${myPhoto.small2x_dim})`);
		}
		if (myPhoto.small !== "") {
			msg += buildButton(
				"SMALL",
				`${lychee.locale["PHOTO_SMALL"]} ${myPhoto.hasOwnProperty("small_dim") ? "(" + myPhoto.small_dim + ")" : ""}`
			);
		}
		if (lychee.api_V2) {
			if (myPhoto.hasOwnProperty("thumb2x") && myPhoto.thumb2x !== "") {
				msg += buildButton("THUMB2X", `${lychee.locale["PHOTO_THUMB_HIDPI"]} (400x400)`);
			}
			if (myPhoto.thumbUrl !== "") {
				msg += buildButton("THUMB", `${lychee.locale["PHOTO_THUMB"]} (200x200)`);
			}
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

	let link;

	if (lychee.api_V2) {
		location.href = api.get_url("Photo::getArchive") + lychee.html`?photoIDs=${photoIDs.join()}&kind=${kind}`;
	} else {
		let url = `${api.path}?function=Photo::getArchive&photoID=${photoIDs[0]}&kind=${kind}`;

		link = lychee.getBaseUrl() + url;

		if (lychee.publicMode === true) link += `&password=${encodeURIComponent(password.value)}`;

		location.href = link;
	}
};

photo.getDirectLink = function () {
	let url = "";

	if (photo.json && photo.json.url && photo.json.url !== "") url = photo.json.url;

	return url;
};

photo.getViewLink = function (photoID) {
	let url = "view.php?p=" + photoID;
	if (lychee.api_V2) {
		url = "view?p=" + photoID;
	}

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

	if (photo.json.url) {
		msg += buildLine(`${lychee.locale["PHOTO_FULL"]} (${photo.json.width}x${photo.json.height})`, lychee.getBaseUrl() + photo.json.url);
	}
	if (photo.json.hasOwnProperty("medium2x") && photo.json.medium2x !== "") {
		msg += buildLine(`${lychee.locale["PHOTO_MEDIUM_HIDPI"]} (${photo.json.medium2x_dim})`, lychee.getBaseUrl() + photo.json.medium2x);
	}
	if (photo.json.medium !== "") {
		msg += buildLine(
			`${lychee.locale["PHOTO_MEDIUM"]} ${photo.json.hasOwnProperty("medium_dim") ? "(" + photo.json.medium_dim + ")" : ""}`,
			lychee.getBaseUrl() + photo.json.medium
		);
	}
	if (photo.json.hasOwnProperty("small2x") && photo.json.small2x !== "") {
		msg += buildLine(`${lychee.locale["PHOTO_SMALL_HIDPI"]} (${photo.json.small2x_dim})`, lychee.getBaseUrl() + photo.json.small2x);
	}
	if (photo.json.small !== "") {
		msg += buildLine(
			`${lychee.locale["PHOTO_SMALL"]} ${photo.json.hasOwnProperty("small_dim") ? "(" + photo.json.small_dim + ")" : ""}`,
			lychee.getBaseUrl() + photo.json.small
		);
	}
	if (photo.json.hasOwnProperty("thumb2x") && photo.json.thumb2x !== "") {
		msg += buildLine(`${lychee.locale["PHOTO_THUMB_HIDPI"]} (400x400)`, lychee.getBaseUrl() + photo.json.thumb2x);
	} else if (!lychee.api_V2) {
		var { path: thumb2x } = lychee.retinize(photo.json.thumbUrl);
		msg += buildLine(`${lychee.locale["PHOTO_THUMB_HIDPI"]} (400x400)`, lychee.getBaseUrl() + thumb2x);
	}
	if (photo.json.thumbUrl !== "") {
		msg += buildLine(` ${lychee.locale["PHOTO_THUMB"]} (200x200)`, lychee.getBaseUrl() + photo.json.thumbUrl);
	}
	if (photo.json.livePhotoUrl !== "") {
		msg += buildLine(` ${lychee.locale["PHOTO_LIVE_VIDEO"]} `, lychee.getBaseUrl() + photo.json.livePhotoUrl);
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
