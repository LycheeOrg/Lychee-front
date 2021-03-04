/**
 * @description This module is used for bindings.
 */

$(document).ready(function () {
	$("#sensitive_warning").hide();

	// Event Name
	let eventName = lychee.getEventName();

	// set CSRF protection (Laravel)
	csrf.bind();

	// Set API error handler
	api.onError = lychee.error;

	$("html").css("visibility", "visible");

	// Multiselect
	multiselect.bind();

	// Header
	header.bind();

	// Image View
	lychee.imageview
		.on(eventName, ".arrow_wrapper--previous", photo.previous)
		.on(eventName, ".arrow_wrapper--next", photo.next)
		.on(eventName, "img, #livephoto", photo.cycle_display_overlay);

	// Keyboard
	Mousetrap.addKeycodes({
		18: "ContextMenu",
		179: "play_pause",
		227: "rewind",
		228: "forward",
	});

	Mousetrap.bind(["l"], function () {
		lychee.loginDialog();
		return false;
	})
		.bind(["k"], function () {
			u2f.login();
			return false;
		})
		.bind(["left"], function () {
			if (
				visible.photo() &&
				(!visible.header() || $("img#image").is(":focus") || $("img#livephoto").is(":focus") || $(":focus").length === 0)
			) {
				$("#imageview a#previous").click();
				return false;
			}
			return true;
		})
		.bind(["right"], function () {
			if (
				visible.photo() &&
				(!visible.header() || $("img#image").is(":focus") || $("img#livephoto").is(":focus") || $(":focus").length === 0)
			) {
				$("#imageview a#next").click();
				return false;
			}
			return true;
		})
		.bind(["u"], function () {
			if (!visible.photo() && album.isUploadable()) {
				$("#upload_files").click();
				return false;
			}
		})
		.bind(["n"], function () {
			if (!visible.photo() && album.isUploadable()) {
				album.add();
				return false;
			}
		})
		.bind(["s"], function () {
			if (visible.photo() && album.isUploadable()) {
				header.dom("#button_star").click();
				return false;
			} else if (visible.albums()) {
				header.dom(".header__search").focus();
				return false;
			}
		})
		.bind(["r"], function () {
			if (album.isUploadable()) {
				if (visible.album()) {
					album.setTitle(album.getID());
					return false;
				} else if (visible.photo()) {
					photo.setTitle([photo.getID()]);
					return false;
				}
			}
		})
		.bind(["h"], album.toggle_nsfw_filter)
		.bind(["d"], function () {
			if (album.isUploadable()) {
				if (visible.photo()) {
					photo.setDescription(photo.getID());
					return false;
				} else if (visible.album()) {
					album.setDescription(album.getID());
					return false;
				}
			}
		})
		.bind(["t"], function () {
			if (visible.photo() && album.isUploadable()) {
				photo.editTags([photo.getID()]);
				return false;
			}
		})
		.bind(["i", "ContextMenu"], function () {
			if (!visible.multiselect()) {
				sidebar.toggle();
				return false;
			}
		})
		.bind(["command+backspace", "ctrl+backspace"], function () {
			if (album.isUploadable()) {
				if (visible.photo() && basicModal.visible() === false) {
					photo.delete([photo.getID()]);
					return false;
				} else if (visible.album() && basicModal.visible() === false) {
					album.delete([album.getID()]);
					return false;
				}
			}
		})
		.bind(["command+a", "ctrl+a"], function () {
			if (visible.album() && basicModal.visible() === false) {
				multiselect.selectAll();
				return false;
			} else if (visible.albums() && basicModal.visible() === false) {
				multiselect.selectAll();
				return false;
			}
		})
		.bind(["o"], function () {
			if (visible.photo()) {
				photo.cycle_display_overlay();
				return false;
			}
		})
		.bind(["f"], function () {
			if (visible.album() || visible.photo()) {
				lychee.fullscreenToggle();
				return false;
			}
		});

	Mousetrap.bind(["play_pause"], function () {
		// If it's a video, we toggle play/pause
		let video = $("video");

		if (video.length !== 0) {
			if (video[0].paused) {
				video[0].play();
			} else {
				video[0].pause();
			}
		}
	});

	Mousetrap.bindGlobal("enter", function () {
		if (basicModal.visible() === true) {
			// check if any of the input fields is focussed
			// apply action, other do nothing
			if ($(".basicModal__content input").is(":focus")) {
				basicModal.action();
				return false;
			}
		} else if (
			visible.photo() &&
			!lychee.header_auto_hide &&
			($("img#image").is(":focus") || $("img#livephoto").is(":focus") || $(":focus").length === 0)
		) {
			if (visible.header()) {
				header.hide();
			} else {
				header.show();
			}
			return false;
		}
		let clicked = false;
		$(":focus").each(function () {
			if (!$(this).is("input")) {
				$(this).click();
				clicked = true;
			}
		});
		if (clicked) {
			return false;
		}
	});

	// Prevent 'esc keyup' event to trigger 'go back in history'
	// and 'alt keyup' to show a webapp context menu for Fire TV
	Mousetrap.bindGlobal(
		["esc", "ContextMenu"],
		function () {
			return false;
		},
		"keyup"
	);

	Mousetrap.bindGlobal(["esc", "command+up"], function () {
		if (basicModal.visible() === true) basicModal.cancel();
		else if (visible.leftMenu()) leftMenu.close();
		else if (visible.contextMenu()) contextMenu.close();
		else if (visible.photo()) lychee.goto(album.getID());
		else if (visible.album() && !album.json.parent_id) lychee.goto();
		else if (visible.album()) lychee.goto(album.getParent());
		else if (visible.albums() && search.hash !== null) search.reset();
		else if (visible.mapview()) mapview.close();
		else if (visible.albums() && lychee.enable_close_tab_on_esc) {
			window.open("", "_self").close();
		}
		return false;
	});

	$(document)
		// Fullscreen on mobile
		.on("touchend", "#imageview #image", function (e) {
			// prevent triggering event 'mousemove'
			// why? this also prevents 'click' from firing which results in unexpected behaviour
			// unable to reproduce problems arising from 'mousemove' on iOS devices
			//			e.preventDefault();

			if (typeof swipe.obj === "undefined" || (Math.abs(swipe.offsetX) <= 5 && Math.abs(swipe.offsetY) <= 5)) {
				// Toggle header only if we're not moving to next/previous photo;
				// In this case, swipe.preventNextHeaderToggle is set to true
				if (typeof swipe.preventNextHeaderToggle === "undefined" || !swipe.preventNextHeaderToggle) {
					if (visible.header()) {
						header.hide(e);
					} else {
						header.show();
					}
				}

				// For next 'touchend', behave again as normal and toggle header
				swipe.preventNextHeaderToggle = false;
			}
		});
	$("#imageview")
		// Swipe on mobile
		.swipe()
		.on("swipeStart", function () {
			if (visible.photo()) swipe.start($("#imageview #image, #imageview #livephoto"));
		})
		.swipe()
		.on("swipeMove", function (e) {
			if (visible.photo()) swipe.move(e.swipe);
		})
		.swipe()
		.on("swipeEnd", function (e) {
			if (visible.photo()) swipe.stop(e.swipe, photo.previous, photo.next);
		});

	// Document
	$(document)
		// Navigation
		.on("click", ".album", function (e) {
			multiselect.albumClick(e, $(this));
		})
		.on("click", ".photo", function (e) {
			multiselect.photoClick(e, $(this));
		})
		// Context Menu
		.on("contextmenu", ".photo", function (e) {
			multiselect.photoContextMenu(e, $(this));
		})
		.on("contextmenu", ".album", function (e) {
			multiselect.albumContextMenu(e, $(this));
		})
		// Upload
		.on("change", "#upload_files", function () {
			basicModal.close();
			upload.start.local(this.files);
		})
		// Drag and Drop upload
		.on(
			"dragover",
			function () {
				return false;
			},
			false
		)
		.on("drop", function (e) {
			if (
				!album.isUploadable() ||
				visible.contextMenu() ||
				basicModal.visible() ||
				visible.leftMenu() ||
				!(visible.album() || visible.albums())
			) {
				return false;
			}

			// Detect if dropped item is a file or a link
			if (e.originalEvent.dataTransfer.files.length > 0) upload.start.local(e.originalEvent.dataTransfer.files);
			else if (e.originalEvent.dataTransfer.getData("Text").length > 3) upload.start.url(e.originalEvent.dataTransfer.getData("Text"));

			return false;
		})
		// click on thumbnail on map
		.on("click", ".image-leaflet-popup", function (e) {
			mapview.goto($(this));
		})
		// Paste upload
		.on("paste", function (e) {
			if (e.originalEvent.clipboardData.items) {
				const items = e.originalEvent.clipboardData.items;
				let filesToUpload = [];

				// Search clipboard items for an image
				for (let i = 0; i < items.length; i++) {
					if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("video") !== -1) {
						filesToUpload.push(items[i].getAsFile());
					}
				}

				if (filesToUpload.length > 0) {
					// We perform the check so deep because we don't want to
					// prevent the paste from working in text input fields, etc.
					if (
						album.isUploadable() &&
						!visible.contextMenu() &&
						!basicModal.visible() &&
						!visible.leftMenu() &&
						(visible.album() || visible.albums())
					) {
						upload.start.local(filesToUpload);
					}

					return false;
				}
			}
		})
		// Fullscreen
		.on("fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange", lychee.fullscreenUpdate);

	$("#sensitive_warning").on("click", view.album.nsfw_warning.next);

	const rememberScrollPage = function (scrollPos) {
		// only for albums with subalbums
		if (album && album.json && album.json.albums && album.json.albums.length > 0) {
			let urls = JSON.parse(localStorage.getItem("scroll"));
			if (urls == null || urls.length < 1) {
				urls = {};
			}

			let urlWindow = window.location.href;
			let urlScroll = scrollPos;

			urls[urlWindow] = urlScroll;

			if (urlScroll < 1) {
				delete urls[urlWindow];
			}

			localStorage.setItem("scroll", JSON.stringify(urls));
		}
	};

	$(window)
		// resize
		.on("resize", function () {
			if (visible.album() || visible.search()) view.album.content.justify();
			if (visible.photo()) view.photo.onresize();
		})
		// remember scroll positions
		.on("scroll", function () {
			let topScroll = $(window).scrollTop();
			rememberScrollPage(topScroll);
		});

	// Init
	lychee.init();
});
