/**
 * @description Responsible to reflect data changes to the UI.
 */

let view = {};

view.albums = {
	init: function () {
		multiselect.clearSelection();

		view.albums.title();
		view.albums.content.init();
	},

	title: function () {
		if (lychee.landing_page_enable) {
			if (lychee.title !== "Lychee v4") {
				lychee.setTitle(lychee.title, false);
			} else {
				lychee.setTitle(lychee.locale["ALBUMS"], false);
			}
		} else {
			lychee.setTitle(lychee.locale["ALBUMS"], false);
		}
	},

	content: {
		init: function () {
			let smartData = "";
			let albumsData = "";
			let sharedData = "";

			// Smart Albums
			if (albums.json.smart_albums != null) {
				if (lychee.publicMode === false) {
					smartData = build.divider(lychee.locale["SMART_ALBUMS"]);
				}
				if (albums.json.smart_albums.unsorted) {
					albums.parse(albums.json.smart_albums.unsorted);
					smartData += build.album(albums.json.smart_albums.unsorted);
				}
				if (albums.json.smart_albums.public) {
					albums.parse(albums.json.smart_albums.public);
					smartData += build.album(albums.json.smart_albums.public);
				}
				if (albums.json.smart_albums.starred) {
					albums.parse(albums.json.smart_albums.starred);
					smartData += build.album(albums.json.smart_albums.starred);
				}
				if (albums.json.smart_albums.recent) {
					albums.parse(albums.json.smart_albums.recent);
					smartData += build.album(albums.json.smart_albums.recent);
				}

				Object.entries(albums.json.smart_albums).forEach(([, albumData]) => {
					if (albumData["is_tag_album"]) {
						albums.parse(albumData);
						smartData += build.album(albumData);
					}
				});
			}

			// Albums
			if (albums.json.albums && albums.json.albums.length !== 0) {
				$.each(albums.json.albums, function () {
					if (!this.parent_id) {
						albums.parse(this);
						albumsData += build.album(this);
					}
				});

				// Add divider
				if (lychee.publicMode === false) albumsData = build.divider(lychee.locale["ALBUMS"]) + albumsData;
			}

			let current_owner = "";
			let i;
			// Shared
			if (albums.json.shared_albums && albums.json.shared_albums.length !== 0) {
				for (i = 0; i < albums.json.shared_albums.length; ++i) {
					let alb = albums.json.shared_albums[i];
					if (!alb.parent_id) {
						albums.parse(alb);
						if (current_owner !== alb.owner_name && lychee.publicMode === false) {
							sharedData += build.divider(alb.owner_name);
							current_owner = alb.owner_name;
						}
						sharedData += build.album(alb, !lychee.admin);
					}
				}
			}

			if (smartData === "" && albumsData === "" && sharedData === "") {
				lychee.content.html("");
				$("body").append(build.no_content("eye"));
			} else {
				lychee.content.html(smartData + albumsData + sharedData);
			}

			album.apply_nsfw_filter();

			// Restore scroll position
			let urls = JSON.parse(localStorage.getItem("scroll"));
			let urlWindow = window.location.href;
			$(window).scrollTop(urls != null && urls[urlWindow] ? urls[urlWindow] : 0);
		},

		title: function (albumID) {
			let title = albums.getByID(albumID).title;

			title = lychee.escapeHTML(title);

			$('.album[data-id="' + albumID + '"] .overlay h1')
				.html(title)
				.attr("title", title);
		},

		delete: function (albumID) {
			$('.album[data-id="' + albumID + '"]')
				.css("opacity", 0)
				.animate(
					{
						width: 0,
						marginLeft: 0,
					},
					300,
					function () {
						$(this).remove();
						if (albums.json.albums.length <= 0) lychee.content.find(".divider:last-child").remove();
					}
				);
		},
	},
};

view.album = {
	init: function () {
		multiselect.clearSelection();

		album.parse();

		view.album.sidebar();
		view.album.title();
		view.album.public();
		view.album.nsfw();
		view.album.nsfw_warning.init();
		view.album.content.init();

		album.json.init = 1;
	},

	title: function () {
		if ((visible.album() || !album.json.init) && !visible.photo()) {
			switch (album.getID()) {
				case "starred":
					lychee.setTitle(lychee.locale["STARRED"], true);
					break;
				case "public":
					lychee.setTitle(lychee.locale["PUBLIC"], true);
					break;
				case "recent":
					lychee.setTitle(lychee.locale["RECENT"], true);
					break;
				case "unsorted":
					lychee.setTitle(lychee.locale["UNSORTED"], true);
					break;
				default:
					if (album.json.init) sidebar.changeAttr("title", album.json.title);
					lychee.setTitle(album.json.title, true);
					break;
			}
		}
	},

	nsfw_warning: {
		init: function () {
			if (!lychee.nsfw_warning) {
				$("#sensitive_warning").hide();
				return;
			}

			if (album.json.is_nsfw && !lychee.nsfw_unlocked_albums.includes(album.json.id)) {
				$("#sensitive_warning").show();
			} else {
				$("#sensitive_warning").hide();
			}
		},

		next: function () {
			lychee.nsfw_unlocked_albums.push(album.json.id);
			$("#sensitive_warning").hide();
		},
	},

	content: {
		init: function () {
			let photosData = "";
			let albumsData = "";
			let html = "";

			if (album.json.albums && album.json.albums !== false) {
				$.each(album.json.albums, function () {
					albums.parse(this);
					albumsData += build.album(this, !album.isUploadable());
				});
			}
			if (album.json.photos && album.json.photos !== false) {
				// Build photos
				$.each(album.json.photos, function () {
					photosData += build.photo(this, !album.isUploadable());
				});
			}

			if (photosData !== "") {
				if (lychee.layout === "1") {
					photosData = '<div class="justified-layout">' + photosData + "</div>";
				} else if (lychee.layout === "2") {
					photosData = '<div class="unjustified-layout">' + photosData + "</div>";
				}
			}

			if (albumsData !== "" && photosData !== "") {
				html = build.divider(lychee.locale["ALBUMS"]);
			}
			html += albumsData;
			if (albumsData !== "" && photosData !== "") {
				html += build.divider(lychee.locale["PHOTOS"]);
			}
			html += photosData;

			// Add photos to view
			lychee.content.html(html);
			album.apply_nsfw_filter();

			view.album.content.justify();

			// Restore scroll position
			let urls = JSON.parse(localStorage.getItem("scroll"));
			let urlWindow = window.location.href;
			$(window).scrollTop(urls != null && urls[urlWindow] ? urls[urlWindow] : 0);
		},

		title: function (photoID) {
			let title = album.getByID(photoID).title;

			title = lychee.escapeHTML(title);

			$('.photo[data-id="' + photoID + '"] .overlay h1')
				.html(title)
				.attr("title", title);
		},

		titleSub: function (albumID) {
			let title = album.getSubByID(albumID).title;

			title = lychee.escapeHTML(title);

			$('.album[data-id="' + albumID + '"] .overlay h1')
				.html(title)
				.attr("title", title);
		},

		star: function (photoID) {
			let $badge = $('.photo[data-id="' + photoID + '"] .icn-star');

			if (album.getByID(photoID).is_starred) $badge.addClass("badge--star");
			else $badge.removeClass("badge--star");
		},

		public: function (photoID) {
			let $badge = $('.photo[data-id="' + photoID + '"] .icn-share');

			if (album.getByID(photoID).is_public === 1) $badge.addClass("badge--visible badge--hidden");
			else $badge.removeClass("badge--visible badge--hidden");
		},

		cover: function (photoID) {
			$(".album .icn-cover").removeClass("badge--cover");
			$(".photo .icn-cover").removeClass("badge--cover");

			if (album.json.cover_id === photoID) {
				let badge = $('.photo[data-id="' + photoID + '"] .icn-cover');
				if (badge.length > 0) {
					badge.addClass("badge--cover");
				} else {
					$.each(album.json.albums, function () {
						if (this.thumb.id === photoID) {
							$('.album[data-id="' + this.id + '"] .icn-cover').addClass("badge--cover");
							return false;
						}
					});
				}
			}
		},

		updatePhoto: function (data) {
			let src,
				srcset = "";

			// This mimicks the structure of build.photo
			if (lychee.layout === "0") {
				src = data.size_variants.thumb.url;
				if (data.size_variants.thumb2x !== null) {
					srcset = `${data.size_variants.thumb2x.url} 2x`;
				}
			} else {
				if (data.size_variants.small !== null) {
					src = data.size_variants.small.url;
					if (data.size_variants.small2x !== null) {
						srcset = `${data.size_variants.small.url} ${data.size_variants.small.width}w, ${data.size_variants.small2x.url} ${data.size_variants.small2x.width}w`;
					}
				} else if (data.size_variants.medium !== null) {
					src = data.size_variants.medium.url;
					if (data.size_variants.medium2x !== null) {
						srcset = `${data.size_variants.medium.url} ${data.size_variants.medium.width}w, ${data.size_variants.medium2x.url} ${data.size_variants.medium2x.width}w`;
					}
				} else if (!data.type || data.type.indexOf("video") !== 0) {
					src = data.size_variants.original.url;
				} else {
					src = data.size_variants.thumb.url;
					if (data.size_variants.thumb2x !== null) {
						srcset = `${data.size_variants.thumb.url} ${data.size_variants.thumb.width}w, ${data.size_variants.thumb2x.url} ${data.size_variants.thumb2x.width}w`;
					}
				}
			}

			$('.photo[data-id="' + data.id + '"] > span.thumbimg > img')
				.attr("data-src", src)
				.attr("data-srcset", srcset)
				.addClass("lazyload");

			view.album.content.justify();
		},

		delete: function (photoID, justify = false) {
			$('.photo[data-id="' + photoID + '"]')
				.css("opacity", 0)
				.animate(
					{
						width: 0,
						marginLeft: 0,
					},
					300,
					function () {
						$(this).remove();
						// Only when search is not active
						if (album.json) {
							if (visible.sidebar()) {
								let videoCount = 0;
								$.each(album.json.photos, function () {
									if (this.type && this.type.indexOf("video") > -1) {
										videoCount++;
									}
								});
								if (album.json.photos.length - videoCount > 0) {
									sidebar.changeAttr("images", album.json.photos.length - videoCount);
								} else {
									sidebar.hideAttr("images");
								}
								if (videoCount > 0) {
									sidebar.changeAttr("videos", videoCount);
								} else {
									sidebar.hideAttr("videos");
								}
							}
							if (album.json.photos.length <= 0) {
								lychee.content.find(".divider").remove();
							}
							if (justify) {
								view.album.content.justify();
							}
						}
					}
				);
		},

		deleteSub: function (albumID) {
			$('.album[data-id="' + albumID + '"]')
				.css("opacity", 0)
				.animate(
					{
						width: 0,
						marginLeft: 0,
					},
					300,
					function () {
						$(this).remove();
						if (album.json) {
							if (album.json.albums.length <= 0) {
								lychee.content.find(".divider").remove();
							}
							if (visible.sidebar()) {
								if (album.json.albums.length > 0) {
									sidebar.changeAttr("subalbums", album.json.albums.length);
								} else {
									sidebar.hideAttr("subalbums");
								}
							}
						}
					}
				);
		},

		justify: function () {
			if (!album.json || !album.json.photos || album.json.photos === false) return;
			if (lychee.layout === "1") {
				let containerWidth = parseFloat($(".justified-layout").width(), 10);
				if (containerWidth === 0) {
					// Triggered on Reload in photo view.
					containerWidth =
						$(window).width() -
						parseFloat($(".justified-layout").css("margin-left"), 10) -
						parseFloat($(".justified-layout").css("margin-right"), 10) -
						parseFloat($(".content").css("padding-right"), 10);
				}
				let ratio = [];
				$.each(album.json.photos, function (i) {
					let height = this.size_variants.original.height;
					let width = this.size_variants.original.width;
					ratio[i] = height > 0 ? width / height : 1;

					if (this.type && this.type.indexOf("video") > -1) {
						// Video.  If there's no small and medium, we have
						// to fall back to the square thumb.
						if (this.size_variants.small === null && this.size_variants.medium === null) {
							ratio[i] = 1;
						}
					}
				});
				let layoutGeometry = require("justified-layout")(ratio, {
					containerWidth: containerWidth,
					containerPadding: 0,
					// boxSpacing: {
					//     horizontal: 42,
					//     vertical: 150
					// },
					targetRowHeight: parseFloat($(".photo").css("--lychee-default-height"), 10),
				});
				// if (lychee.admin) console.log(layoutGeometry);
				$(".justified-layout").css("height", layoutGeometry.containerHeight + "px");
				$(".justified-layout > div").each(function (i) {
					if (!layoutGeometry.boxes[i]) {
						// Race condition in search.find -- window content
						// and album.json can get out of sync as search
						// query is being modified.
						return false;
					}
					$(this).css("top", layoutGeometry.boxes[i].top);
					$(this).css("width", layoutGeometry.boxes[i].width);
					$(this).css("height", layoutGeometry.boxes[i].height);
					$(this).css("left", layoutGeometry.boxes[i].left);

					let imgs = $(this).find(".thumbimg > img");
					if (imgs.length > 0 && imgs[0].getAttribute("data-srcset")) {
						imgs[0].setAttribute("sizes", layoutGeometry.boxes[i].width + "px");
					}
				});
			} else if (lychee.layout === "2") {
				let containerWidth = parseFloat($(".unjustified-layout").width(), 10);
				if (containerWidth === 0) {
					// Triggered on Reload in photo view.
					containerWidth =
						$(window).width() -
						parseFloat($(".unjustified-layout").css("margin-left"), 10) -
						parseFloat($(".unjustified-layout").css("margin-right"), 10) -
						parseFloat($(".content").css("padding-right"), 10);
				}
				// For whatever reason, the calculation of margin is
				// super-slow in Firefox (tested with 68), so we make sure to
				// do it just once, outside the loop.  Height doesn't seem to
				// be affected, but we do it the same way for consistency.
				let margin = parseFloat($(".photo").css("margin-right"), 10);
				let origHeight = parseFloat($(".photo").css("max-height"), 10);
				$(".unjustified-layout > div").each(function (i) {
					if (!album.json.photos[i]) {
						// Race condition in search.find -- window content
						// and album.json can get out of sync as search
						// query is being modified.
						return false;
					}
					let ratio =
						album.json.photos[i].size_variants.original.height > 0
							? album.json.photos[i].size_variants.original.width / album.json.photos[i].size_variants.original.height
							: 1;
					if (album.json.photos[i].type && album.json.photos[i].type.indexOf("video") > -1) {
						// Video.  If there's no small and medium, we have
						// to fall back to the square thumb.
						if (album.json.photos[i].size_variants.small === null && album.json.photos[i].size_variants.medium === null) {
							ratio = 1;
						}
					}

					let height = origHeight;
					let width = height * ratio;
					let imgs = $(this).find(".thumbimg > img");

					if (width > containerWidth - margin) {
						width = containerWidth - margin;
						height = width / ratio;
					}

					$(this).css("width", width + "px");
					$(this).css("height", height + "px");
					if (imgs.length > 0 && imgs[0].getAttribute("data-srcset")) {
						imgs[0].setAttribute("sizes", width + "px");
					}
				});
			}
		},
	},

	description: function () {
		sidebar.changeAttr("description", album.json.description ? album.json.description : "");
	},

	show_tags: function () {
		sidebar.changeAttr("show_tags", album.json.show_tags);
	},

	license: function () {
		let license;
		switch (album.json.license) {
			case "none":
				license = ""; // none is displayed as - thus is empty.
				break;
			case "reserved":
				license = lychee.locale["ALBUM_RESERVED"];
				break;
			default:
				license = album.json.license;
				// console.log('default');
				break;
		}

		sidebar.changeAttr("license", license);
	},

	public: function () {
		$("#button_visibility_album, #button_sharing_album_users").removeClass("active--not-hidden active--hidden");

		if (album.json.is_public) {
			if (album.json.requires_link) {
				$("#button_visibility_album, #button_sharing_album_users").addClass("active--hidden");
			} else {
				$("#button_visibility_album, #button_sharing_album_users").addClass("active--not-hidden");
			}

			$(".photo .iconic-share").remove();

			if (album.json.init) sidebar.changeAttr("public", lychee.locale["ALBUM_SHR_YES"]);
		} else {
			if (album.json.init) sidebar.changeAttr("public", lychee.locale["ALBUM_SHR_NO"]);
		}
	},

	requiresLink: function () {
		if (album.json.requires_link) sidebar.changeAttr("hidden", lychee.locale["ALBUM_SHR_YES"]);
		else sidebar.changeAttr("hidden", lychee.locale["ALBUM_SHR_NO"]);
	},

	nsfw: function () {
		if (album.json.is_nsfw) {
			// Sensitive
			$("#button_nsfw_album").addClass("active").attr("title", lychee.locale["ALBUM_UNMARK_NSFW"]);
		} else {
			// Not Sensitive
			$("#button_nsfw_album").removeClass("active").attr("title", lychee.locale["ALBUM_MARK_NSFW"]);
		}
	},

	downloadable: function () {
		if (album.json.is_downloadable) sidebar.changeAttr("downloadable", lychee.locale["ALBUM_SHR_YES"]);
		else sidebar.changeAttr("downloadable", lychee.locale["ALBUM_SHR_NO"]);
	},

	shareButtonVisible: () => {
		if (album.json.is_share_button_visible) sidebar.changeAttr("share_button_visible", lychee.locale["ALBUM_SHR_YES"]);
		else sidebar.changeAttr("share_button_visible", lychee.locale["ALBUM_SHR_NO"]);
	},

	password: function () {
		if (album.json.has_password) sidebar.changeAttr("password", lychee.locale["ALBUM_SHR_YES"]);
		else sidebar.changeAttr("password", lychee.locale["ALBUM_SHR_NO"]);
	},

	sidebar: function () {
		if ((visible.album() || (album.json && !album.json.init)) && !visible.photo()) {
			let structure = sidebar.createStructure.album(album);
			let html = sidebar.render(structure);

			sidebar.dom(".sidebar__wrapper").html(html);
			sidebar.bind();
		}
	},
};

view.photo = {
	init: function (autoplay) {
		multiselect.clearSelection();

		photo.parse();

		view.photo.sidebar();
		view.photo.title();
		view.photo.star();
		view.photo.public();
		view.photo.header();
		view.photo.photo(autoplay);

		photo.json.init = 1;
	},

	show: function () {
		// Change header
		lychee.content.addClass("view");
		header.setMode("photo");

		// Make body not scrollable
		// use bodyScrollLock package to enable locking on iOS
		// Simple overflow: hidden not working on iOS Safari
		// Only the info pane needs scrolling
		// Touch event for swiping of photo still work

		scrollLock.disablePageScroll($(".sidebar__wrapper").get());

		// Fullscreen
		let timeout = null;
		$(document).bind("mousemove", function () {
			clearTimeout(timeout);
			// For live Photos: header animtion only if LivePhoto is not playing
			if (!photo.isLivePhotoPlaying() && lychee.header_auto_hide) {
				header.show();
				timeout = setTimeout(header.hideIfLivePhotoNotPlaying, 2500);
			}
		});

		// we also put this timeout to enable it by default when you directly click on a picture.
		if (lychee.header_auto_hide) {
			setTimeout(header.hideIfLivePhotoNotPlaying, 2500);
		}

		lychee.animate(lychee.imageview, "fadeIn");
	},

	hide: function () {
		header.show();

		lychee.content.removeClass("view");
		header.setMode("album");

		// Make body scrollable
		scrollLock.enablePageScroll($(".sidebar__wrapper").get());

		// Disable Fullscreen
		$(document).unbind("mousemove");
		if ($("video").length) {
			$("video")[$("video").length - 1].pause();
		}

		// Hide Photo
		lychee.animate(lychee.imageview, "fadeOut");
		setTimeout(() => {
			lychee.imageview.hide();
			view.album.sidebar();
		}, 300);
	},

	title: function () {
		if (photo.json.init) sidebar.changeAttr("title", photo.json.title);
		lychee.setTitle(photo.json.title, true);
	},

	description: function () {
		if (photo.json.init) sidebar.changeAttr("description", photo.json.description ? photo.json.description : "");
	},

	license: function () {
		let license;

		// Process key to display correct string
		switch (photo.json.license) {
			case "none":
				license = ""; // none is displayed as - thus is empty (uniformity of the display).
				break;
			case "reserved":
				license = lychee.locale["PHOTO_RESERVED"];
				break;
			default:
				license = photo.json.license;
				break;
		}

		// Update the sidebar if the photo is visible
		if (photo.json.init) sidebar.changeAttr("license", license);
	},

	star: function () {
		if (photo.json.is_starred) {
			// Starred
			$("#button_star").addClass("active").attr("title", lychee.locale["UNSTAR_PHOTO"]);
		} else {
			// Unstarred
			$("#button_star").removeClass("active").attr("title", lychee.locale["STAR_PHOTO"]);
		}
	},

	public: function () {
		$("#button_visibility").removeClass("active--hidden active--not-hidden");

		if (photo.json.is_public === 1 || photo.json.is_public === 2) {
			// Photo public
			if (photo.json.is_public === 1) {
				$("#button_visibility").addClass("active--hidden");
			} else {
				$("#button_visibility").addClass("active--not-hidden");
			}

			if (photo.json.init) sidebar.changeAttr("public", lychee.locale["PHOTO_SHR_YES"]);
		} else {
			// Photo private
			if (photo.json.init) sidebar.changeAttr("public", "No");
		}
	},

	tags: function () {
		sidebar.changeAttr("tags", build.tags(photo.json.tags), true);
		sidebar.bind();
	},

	photo: function (autoplay) {
		let ret = build.imageview(photo.json, visible.header(), autoplay);
		lychee.imageview.html(ret.html);
		tabindex.makeFocusable(lychee.imageview);

		// Init Live Photo if needed
		if (photo.isLivePhoto()) {
			// Package gives warning that function will be remove and
			// shoud be replaced by LivePhotosKit.augementElementAsPlayer
			// But, LivePhotosKit.augementElementAsPlayer is not yet available
			photo.LivePhotosObject = LivePhotosKit.Player(document.getElementById("livephoto"));
		}

		view.photo.onresize();

		let $nextArrow = lychee.imageview.find("a#next");
		let $previousArrow = lychee.imageview.find("a#previous");
		let photoID = photo.getID();
		let photoInAlbum = album.json && album.json.photos ? album.getByID(photoID) : null;
		let hasNext = photoInAlbum !== null && photoInAlbum.hasOwnProperty("next_photo_id") && photoInAlbum.next_photo_id !== null;
		let hasPrevious = photoInAlbum !== null && photoInAlbum.hasOwnProperty("previous_photo_id") && photoInAlbum.previous_photo_id !== null;

		let img = $("img#image");
		if (img.length > 0) {
			if (!img[0].complete || (img[0].currentSrc !== null && img[0].currentSrc === "")) {
				// Image is still loading.  Display the thumb version in the
				// background.
				if (ret.thumb !== "") {
					img.css("background-image", lychee.html`url("${ret.thumb}")`);
				}

				// Don't preload next/prev until the requested image is
				// fully loaded.
				img.on("load", function () {
					photo.preloadNextPrev(photo.getID());
				});
			} else {
				photo.preloadNextPrev(photo.getID());
			}
		}

		if (hasNext === false || lychee.viewMode === true) {
			$nextArrow.hide();
		} else {
			let nextPhotoID = photoInAlbum.next_photo_id;
			let nextPhoto = album.getByID(nextPhotoID);

			// Check if thumbUrl exists (for videos w/o ffmpeg, we add a play-icon)
			let thumbUrl = "img/placeholder.png";
			if (nextPhoto.size_variants.thumb !== null) {
				thumbUrl = nextPhoto.size_variants.thumb.url;
			} else if (nextPhoto.type.indexOf("video") > -1) {
				thumbUrl = "img/play-icon.png";
			}
			$nextArrow.css("background-image", lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${thumbUrl}")`);
		}

		if (hasPrevious === false || lychee.viewMode === true) {
			$previousArrow.hide();
		} else {
			let previousPhotoID = photoInAlbum.previous_photo_id;
			let previousPhoto = album.getByID(previousPhotoID);

			// Check if thumbUrl exists (for videos w/o ffmpeg, we add a play-icon)
			let thumbUrl = "img/placeholder.png";
			if (previousPhoto.size_variants.thumb !== null) {
				thumbUrl = previousPhoto.size_variants.thumb.url;
			} else if (previousPhoto.type.indexOf("video") > -1) {
				thumbUrl = "img/play-icon.png";
			}
			$previousArrow.css("background-image", lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${thumbUrl}")`);
		}
	},

	sidebar: function () {
		let structure = sidebar.createStructure.photo(photo.json);
		let html = sidebar.render(structure);
		let has_location = !!(photo.json.latitude && photo.json.longitude);

		sidebar.dom(".sidebar__wrapper").html(html);
		sidebar.bind();

		if (has_location && lychee.map_display) {
			// Leaflet seaches for icon in same directoy as js file -> paths needs
			// to be overwritten
			delete L.Icon.Default.prototype._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: "img/marker-icon-2x.png",
				iconUrl: "img/marker-icon.png",
				shadowUrl: "img/marker-shadow.png",
			});

			var mymap = L.map("leaflet_map_single_photo").setView([photo.json.latitude, photo.json.longitude], 13);

			L.tileLayer(map_provider_layer_attribution[lychee.map_provider].layer, {
				attribution: map_provider_layer_attribution[lychee.map_provider].attribution,
			}).addTo(mymap);

			if (!lychee.map_display_direction || !photo.json.img_direction) {
				// Add Marker to map, direction is not set
				L.marker([photo.json.latitude, photo.json.longitude]).addTo(mymap);
			} else {
				// Add Marker, direction has been set
				let viewDirectionIcon = L.icon({
					iconUrl: "img/view-angle-icon.png",
					iconRetinaUrl: "img/view-angle-icon-2x.png",
					iconSize: [100, 58], // size of the icon
					iconAnchor: [50, 49], // point of the icon which will correspond to marker's location
				});
				let marker = L.marker([photo.json.latitude, photo.json.longitude], { icon: viewDirectionIcon }).addTo(mymap);
				marker.setRotationAngle(photo.json.img_direction);
			}
		}
	},

	header: function () {
		/* Note: the condition below is duplicated in contextMenu.photoMore() */
		if (
			(photo.json.type && (photo.json.type.indexOf("video") === 0 || photo.json.type === "raw")) ||
			(photo.json.live_photo_url !== "" && photo.json.live_photo_url !== null)
		) {
			$("#button_rotate_cwise, #button_rotate_ccwise").hide();
		} else {
			$("#button_rotate_cwise, #button_rotate_ccwise").show();
		}
	},

	onresize: function () {
		if (!photo.json || photo.json.size_variants.medium === null || photo.json.size_variants.medium2x === null) return;

		// Calculate the width of the image in the current window without
		// borders and set 'sizes' to it.
		let imgWidth = photo.json.size_variants.medium.width;
		let imgHeight = photo.json.size_variants.medium.height;
		let containerWidth = $(window).outerWidth();
		let containerHeight = $(window).outerHeight();

		// Image can be no larger than its natural size, but it can be
		// smaller depending on the size of the window.
		let width = imgWidth < containerWidth ? imgWidth : containerWidth;
		let height = (width * imgHeight) / imgWidth;
		if (height > containerHeight) {
			width = (containerHeight * imgWidth) / imgHeight;
		}

		$("img#image").attr("sizes", width + "px");
	},
};

view.settings = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.settings.title();
		header.setMode("config");
		view.settings.content.init();
	},

	title: function () {
		lychee.setTitle(lychee.locale["SETTINGS"], false);
	},

	clearContent: function () {
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {
		init: function () {
			view.settings.clearContent();
			view.settings.content.setLogin();
			if (lychee.admin) {
				view.settings.content.setSorting();
				view.settings.content.setDropboxKey();
				view.settings.content.setLang();
				view.settings.content.setDefaultLicense();
				view.settings.content.setLayout();
				view.settings.content.setPublicSearch();
				view.settings.content.setOverlayType();
				view.settings.content.setMapDisplay();
				view.settings.content.setNSFWVisible();
				view.settings.content.setNotification();
				view.settings.content.setCSS();
				view.settings.content.moreButton();
			}
		},

		setLogin: function () {
			let msg = lychee.html`
			<div class="setLogin">
			  <p>$${lychee.locale["PASSWORD_TITLE"]}
				  <input name='oldUsername' class='text' type='text' placeholder='$${lychee.locale["USERNAME_CURRENT"]}' value=''>
				  <input name='oldPassword' class='text' type='password' placeholder='$${lychee.locale["PASSWORD_CURRENT"]}' value=''>
			  </p>
			  <p>$${lychee.locale["PASSWORD_TEXT"]}
				  <input name='username' class='text' type='text' placeholder='$${lychee.locale["LOGIN_USERNAME"]}' value=''>
				  <input name='password' class='text' type='password' placeholder='$${lychee.locale["LOGIN_PASSWORD"]}' value=''>
				  <input name='confirm' class='text' type='password' placeholder='$${lychee.locale["LOGIN_PASSWORD_CONFIRM"]}' value=''>
			  </p>
			<div class="basicModal__buttons">
				<!--<a id="basicModal__cancel" class="basicModal__button ">Cancel</a>-->
				<a id="basicModal__action_password_change" class="basicModal__button ">$${lychee.locale["PASSWORD_CHANGE"]}</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);

			settings.bind("#basicModal__action_password_change", ".setLogin", settings.changeLogin);
		},

		clearLogin: function () {
			$("input[name=oldUsername], input[name=oldPassword], input[name=username], input[name=password], input[name=confirm]").val("");
		},

		setSorting: function () {
			let sortingPhotos = [];
			let sortingAlbums = [];

			let msg = lychee.html`
				<div class="setSorting">
					<p>
						$${lychee.locale["SORT_ALBUM_BY_1"]}
						<span class="select">
							<select id="settings_albums_type" name="typeAlbums">
								<option value='created_at'>$${lychee.locale["SORT_ALBUM_SELECT_1"]}</option>
								<option value='title'>$${lychee.locale["SORT_ALBUM_SELECT_2"]}</option>
								<option value='description'>$${lychee.locale["SORT_ALBUM_SELECT_3"]}</option>
								<option value='is_public'>$${lychee.locale["SORT_ALBUM_SELECT_4"]}</option>
								<option value='max_taken_at'>$${lychee.locale["SORT_ALBUM_SELECT_5"]}</option>
								<option value='min_taken_at'>$${lychee.locale["SORT_ALBUM_SELECT_6"]}</option>
							</select>
						</span>
						$${lychee.locale["SORT_ALBUM_BY_2"]}
						<span class="select">
							<select id="settings_albums_order" name="orderAlbums">
								<option value='ASC'>$${lychee.locale["SORT_ASCENDING"]}</option>
								<option value='DESC'>$${lychee.locale["SORT_DESCENDING"]}</option>
							</select>
						</span>
						$${lychee.locale["SORT_ALBUM_BY_3"]}
					</p>
					<p>
						$${lychee.locale["SORT_PHOTO_BY_1"]}
						<span class="select">
							<select id="settings_photos_type" name="typePhotos">
								<option value='created_at'>$${lychee.locale["SORT_PHOTO_SELECT_1"]}</option>
								<option value='taken_at'>$${lychee.locale["SORT_PHOTO_SELECT_2"]}</option>
								<option value='title'>$${lychee.locale["SORT_PHOTO_SELECT_3"]}</option>
								<option value='description'>$${lychee.locale["SORT_PHOTO_SELECT_4"]}</option>
								<option value='is_public'>$${lychee.locale["SORT_PHOTO_SELECT_5"]}</option>
								<option value='is_starred'>$${lychee.locale["SORT_PHOTO_SELECT_6"]}</option>
								<option value='type'>$${lychee.locale["SORT_PHOTO_SELECT_7"]}</option>
							</select>
				  		</span>
						$${lychee.locale["SORT_PHOTO_BY_2"]}
				  		<span class="select">
							<select id="settings_photos_order" name="orderPhotos">
								<option value='ASC'>$${lychee.locale["SORT_ASCENDING"]}</option>
								<option value='DESC'>$${lychee.locale["SORT_DESCENDING"]}</option>
							</select>
						</span>
						$${lychee.locale["SORT_PHOTO_BY_3"]}
					</p>
					<div class="basicModal__buttons">
						<!--<a id="basicModal__cancel" class="basicModal__button ">Cancel</a>-->
						<a id="basicModal__action_sorting_change" class="basicModal__button ">$${lychee.locale["SORT_CHANGE"]}</a>
					</div>
				</div>
			`;

			$(".settings_view").append(msg);

			if (lychee.sortingAlbums !== "") {
				sortingAlbums = lychee.sortingAlbums.replace("ORDER BY ", "").split(" ");

				$(".setSorting select#settings_albums_type").val(sortingAlbums[0]);
				$(".setSorting select#settings_albums_order").val(sortingAlbums[1]);
			}

			if (lychee.sortingPhotos !== "") {
				sortingPhotos = lychee.sortingPhotos.replace("ORDER BY ", "").split(" ");

				$(".setSorting select#settings_photos_type").val(sortingPhotos[0]);
				$(".setSorting select#settings_photos_order").val(sortingPhotos[1]);
			}

			settings.bind("#basicModal__action_sorting_change", ".setSorting", settings.changeSorting);
		},

		setDropboxKey: function () {
			let msg = `
			<div class="setDropBox">
			  <p>${lychee.locale["DROPBOX_TEXT"]}
			  <input class='text' name='key' type='text' placeholder='Dropbox API Key' value='${lychee.dropboxKey}'>
			  </p>
				<div class="basicModal__buttons">
					<a id="basicModal__action_dropbox_change" class="basicModal__button">${lychee.locale["DROPBOX_TITLE"]}</a>
				</div>
			  </div>
			  `;

			$(".settings_view").append(msg);
			settings.bind("#basicModal__action_dropbox_change", ".setDropBox", settings.changeDropboxKey);
		},

		setLang: function () {
			let msg = `
			<div class="setLang">
			<p>${lychee.locale["LANG_TEXT"]}
			  <span class="select">
				  <select id="settings_photos_order" name="lang">`;
			let i = 0;
			while (i < lychee.lang_available.length) {
				let lang_av = lychee.lang_available[i];
				msg += `<option ` + (lychee.lang === lang_av ? "selected" : "") + `>` + lang_av + `</option>`;
				i += 1;
			}
			msg += `
				  </select>
			  </span>
			</p>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_lang" class="basicModal__button">${lychee.locale["LANG_TITLE"]}</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);
			settings.bind("#basicModal__action_set_lang", ".setLang", settings.changeLang);
		},

		setDefaultLicense: function () {
			let msg = `
			<div class="setDefaultLicense">
			<p>${lychee.locale["DEFAULT_LICENSE"]}
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
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_license" class="basicModal__button">${lychee.locale["SET_LICENSE"]}</a>
			</div>
			</div>
			`;
			$(".settings_view").append(msg);
			$("select#license").val(lychee.default_license === "" ? "none" : lychee.default_license);
			settings.bind("#basicModal__action_set_license", ".setDefaultLicense", settings.setDefaultLicense);
		},

		setLayout: function () {
			let msg = `
			<div class="setLayout">
			<p>${lychee.locale["LAYOUT_TYPE"]}
			<span class="select" style="width:270px">
				<select name="layout" id="layout">
					<option value="0">${lychee.locale["LAYOUT_SQUARES"]}</option>
					<option value="1">${lychee.locale["LAYOUT_JUSTIFIED"]}</option>
					<option value="2">${lychee.locale["LAYOUT_UNJUSTIFIED"]}</option>
				</select>
			</span>
			</p>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_layout" class="basicModal__button">${lychee.locale["SET_LAYOUT"]}</a>
			</div>
			</div>
			`;
			$(".settings_view").append(msg);
			$("select#layout").val(lychee.layout);
			settings.bind("#basicModal__action_set_layout", ".setLayout", settings.setLayout);
		},

		setPublicSearch: function () {
			let msg = `
			<div class="setPublicSearch">
			<p>${lychee.locale["PUBLIC_SEARCH_TEXT"]}
			<label class="switch">
			  <input id="PublicSearch" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.public_search) $("#PublicSearch").click();

			settings.bind("#PublicSearch", ".setPublicSearch", settings.changePublicSearch);
		},

		setNSFWVisible: function () {
			let msg = `
			<div class="setNSFWVisible">
			<p>${lychee.locale["NSFW_VISIBLE_TEXT_1"]}
			<label class="switch">
			  <input id="NSFWVisible" type="checkbox">
			  <span class="slider round"></span>
			</label></p>
			<p>${lychee.locale["NSFW_VISIBLE_TEXT_2"]}
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.nsfw_visible_saved) {
				$("#NSFWVisible").click();
			}

			settings.bind("#NSFWVisible", ".setNSFWVisible", settings.changeNSFWVisible);
		},
		// TODO: extend to the other settings.

		setOverlayType: function () {
			let msg = `
			<div class="setOverlayType">
			<p>${lychee.locale["OVERLAY_TYPE"]}
			<span class="select" style="width:270px">
				<select name="OverlayType" id="ImgOverlayType">
					<option value="exif">${lychee.locale["OVERLAY_EXIF"]}</option>
					<option value="desc">${lychee.locale["OVERLAY_DESCRIPTION"]}</option>
					<option value="date">${lychee.locale["OVERLAY_DATE"]}</option>
					<option value="none">${lychee.locale["OVERLAY_NONE"]}</option>
				</select>
			</span>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_overlay_type" class="basicModal__button">${lychee.locale["SET_OVERLAY_TYPE"]}</a>
			</div>
			</div>
			`;

			$(".settings_view").append(msg);

			$("select#ImgOverlayType").val(!lychee.image_overlay_type_default ? "exif" : lychee.image_overlay_type_default);
			settings.bind("#basicModal__action_set_overlay_type", ".setOverlayType", settings.setOverlayType);
		},

		setMapDisplay: function () {
			let msg = `
			<div class="setMapDisplay">
			<p>${lychee.locale["MAP_DISPLAY_TEXT"]}
			<label class="switch">
			  <input id="MapDisplay" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.map_display) $("#MapDisplay").click();

			settings.bind("#MapDisplay", ".setMapDisplay", settings.changeMapDisplay);

			msg = `
			<div class="setMapDisplayPublic">
			<p>${lychee.locale["MAP_DISPLAY_PUBLIC_TEXT"]}
			<label class="switch">
				<input id="MapDisplayPublic" type="checkbox">
				<span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.map_display_public) $("#MapDisplayPublic").click();

			settings.bind("#MapDisplayPublic", ".setMapDisplayPublic", settings.changeMapDisplayPublic);

			msg = `
			<div class="setMapProvider">
			<p>${lychee.locale["MAP_PROVIDER"]}
			<span class="select" style="width:270px">
				<select name="MapProvider" id="MapProvider">
					<option value="Wikimedia">${lychee.locale["MAP_PROVIDER_WIKIMEDIA"]}</option>
					<option value="OpenStreetMap.org">${lychee.locale["MAP_PROVIDER_OSM_ORG"]}</option>
					<option value="OpenStreetMap.de">${lychee.locale["MAP_PROVIDER_OSM_DE"]}</option>
					<option value="OpenStreetMap.fr">${lychee.locale["MAP_PROVIDER_OSM_FR"]}</option>
					<option value="RRZE">${lychee.locale["MAP_PROVIDER_RRZE"]}</option>
				</select>
			</span>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_map_provider" class="basicModal__button">${lychee.locale["SET_MAP_PROVIDER"]}</a>
			</div>
			</div>
			`;

			$(".settings_view").append(msg);

			$("select#MapProvider").val(!lychee.map_provider ? "Wikimedia" : lychee.map_provider);
			settings.bind("#basicModal__action_set_map_provider", ".setMapProvider", settings.setMapProvider);

			msg = `
			<div class="setMapIncludeSubalbums">
			<p>${lychee.locale["MAP_INCLUDE_SUBALBUMS_TEXT"]}
			<label class="switch">
			  <input id="MapIncludeSubalbums" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.map_include_subalbums) $("#MapIncludeSubalbums").click();

			settings.bind("#MapIncludeSubalbums", ".setMapIncludeSubalbums", settings.changeMapIncludeSubalbums);

			msg = `
			<div class="setLocationDecoding">
			<p>${lychee.locale["LOCATION_DECODING"]}
			<label class="switch">
			  <input id="LocationDecoding" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.location_decoding) $("#LocationDecoding").click();

			settings.bind("#LocationDecoding", ".setLocationDecoding", settings.changeLocationDecoding);

			msg = `
			<div class="setLocationShow">
			<p>${lychee.locale["LOCATION_SHOW"]}
			<label class="switch">
			  <input id="LocationShow" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.location_show) $("#LocationShow").click();

			settings.bind("#LocationShow", ".setLocationShow", settings.changeLocationShow);

			msg = `
			<div class="setLocationShowPublic">
			<p>${lychee.locale["LOCATION_SHOW_PUBLIC"]}
			<label class="switch">
				<input id="LocationShowPublic" type="checkbox">
				<span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.location_show_public) $("#LocationShowPublic").click();

			settings.bind("#LocationShowPublic", ".setLocationShowPublic", settings.changeLocationShowPublic);
		},

		setNotification: function () {
			msg = `
			<div class="setNewPhotosNotification">
			<p>${lychee.locale["NEW_PHOTOS_NOTIFICATION"]}
			<label class="switch">
				<input id="NewPhotosNotification" type="checkbox">
				<span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.new_photos_notification) $("#NewPhotosNotification").click();

			settings.bind("#NewPhotosNotification", ".setNewPhotosNotification", settings.changeNewPhotosNotification);
		},

		setCSS: function () {
			let msg = `
			<div class="setCSS">
			<p>${lychee.locale["CSS_TEXT"]}</p>
			<textarea id="css"></textarea>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_css" class="basicModal__button">${lychee.locale["CSS_TITLE"]}</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);

			let css_addr = $($("link")[1]).attr("href");

			api.getCSS(css_addr, function (data) {
				$("#css").html(data);
			});

			settings.bind("#basicModal__action_set_css", ".setCSS", settings.changeCSS);
		},

		moreButton: function () {
			let msg = lychee.html`
			<div class="setCSS">
				<a id="basicModal__action_more" class="basicModal__button basicModal__button_MORE">${lychee.locale["MORE"]}</a>
			</div>
			`;

			$(".settings_view").append(msg);

			$("#basicModal__action_more").on("click", view.full_settings.init);
		},
	},
};

view.full_settings = {
	init: function () {
		multiselect.clearSelection();

		view.full_settings.title();
		view.full_settings.content.init();
	},

	title: function () {
		lychee.setTitle("Full Settings", false);
	},

	clearContent: function () {
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {
		init: function () {
			view.full_settings.clearContent();

			api.post("Settings::getAll", {}, function (data) {
				let msg = lychee.html`
				<div id="fullSettings">
				<div class="setting_line">
				<p class="warning">
				${lychee.locale["SETTINGS_WARNING"]}
				</p>
				</div>
				`;

				let prev = "";
				$.each(data, function () {
					if (this.cat && prev !== this.cat) {
						msg += lychee.html`
						<div class="setting_category">
						<p>
						$${this.cat}
						</p>
						</div>`;
						prev = this.cat;
					}
					// prevent 'null' string for empty values
					let val = this.value ? this.value : "";
					msg += lychee.html`
			<div class="setting_line">
				<p>
				<span class="text">$${this.key}</span>
				<input class="text" name="$${this.key}" type="text" value="$${val}" placeholder="" />
				</p>
			</div>
		`;
				});

				msg += lychee.html`
			<a id="FullSettingsSave_button"  class="basicModal__button basicModal__button_SAVE">${lychee.locale["SAVE_RISK"]}</a>
		</div>
			`;
				$(".settings_view").append(msg);

				settings.bind("#FullSettingsSave_button", "#fullSettings", settings.save);

				$("#fullSettings").on("keypress", function (e) {
					settings.save_enter(e);
				});
			});
		},
	},
};

view.notifications = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.notifications.title();
		header.setMode("config");
		view.notifications.content.init();
	},

	title: function () {
		lychee.setTitle("Notifications", false);
	},

	clearContent: function () {
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {
		init: function () {
			view.notifications.clearContent();

			$(".settings_view").append('<div class="setting_line"><p>' + `${lychee.locale["USER_EMAIL_INSTRUCTION"]}` + "</p></div>");

			let html = "";

			html +=
				'<div class="setLogin"><p id="UserUpdate">' +
				"Enter your email address:" +
				'<input name="email" class="text" type="text" placeholder="email@example.com" value="' +
				notifications.json +
				'">' +
				'</p><div class="basicModal__buttons">' +
				'<a id="UserUpdate_button" class="basicModal__button">Save</a>' +
				"</div></div>";

			$(".settings_view").append(html);
			settings.bind("#UserUpdate_button", "#UserUpdate", notifications.update);
		},
	},
};

view.users = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.users.title();
		header.setMode("config");
		view.users.content.init();
	},

	title: function () {
		lychee.setTitle("Users", false);
	},

	clearContent: function () {
		lychee.content.html('<div class="users_view"></div>');
	},

	content: {
		init: function () {
			view.users.clearContent();

			if (users.json.length === 0) {
				$(".users_view").append(
					'<div class="users_view_line" style="margin-bottom: 50px;"><p style="text-align: center">User list is empty!</p></div>'
				);
			}

			let html = "";

			html +=
				'<div class="users_view_line">' +
				"<p>" +
				'<span class="text">username</span>' +
				'<span class="text">new password</span>' +
				'<span class="text_icon" title="Allow uploads">' +
				build.iconic("data-transfer-upload") +
				"</span>" +
				'<span class="text_icon" title="Restricted account">' +
				build.iconic("lock-locked") +
				"</span>" +
				"</p>" +
				"</div>";

			$(".users_view").append(html);

			$.each(users.json, function () {
				$(".users_view").append(build.user(this));
				settings.bind("#UserUpdate" + this.id, "#UserData" + this.id, users.update);
				settings.bind("#UserDelete" + this.id, "#UserData" + this.id, users.delete);
				if (this.may_upload) {
					$("#UserData" + this.id + ' .choice input[name="upload"]').click();
				}
				if (this.is_locked) {
					$("#UserData" + this.id + ' .choice input[name="lock"]').click();
				}
			});

			html = '<div class="users_view_line"';

			if (users.json.length === 0) {
				html += ' style="padding-top: 0px;"';
			}
			html +=
				">" +
				'<p id="UserCreate">' +
				'<input class="text" name="username" type="text" value="" placeholder="new username" /> ' +
				'<input class="text" name="password" type="text" placeholder="new password" /> ' +
				'<span class="choice" title="Allow uploads">' +
				"<label>" +
				'<input type="checkbox" name="upload" />' +
				'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
				"</label>" +
				"</span> " +
				'<span class="choice" title="Restricted account">' +
				"<label>" +
				'<input type="checkbox" name="lock" />' +
				'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
				"</label>" +
				"</span>" +
				"</p> " +
				'<a id="UserCreate_button"  class="basicModal__button basicModal__button_CREATE">Create</a>' +
				"</div>";
			$(".users_view").append(html);
			settings.bind("#UserCreate_button", "#UserCreate", users.create);
		},
	},
};

view.sharing = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.sharing.title();
		header.setMode("config");
		view.sharing.content.init();
	},

	title: function () {
		lychee.setTitle("Sharing", false);
	},

	clearContent: function () {
		lychee.content.html('<div class="sharing_view"></div>');
	},

	content: {
		init: function () {
			view.sharing.clearContent();

			if (sharing.json.shared.length === 0) {
				$(".sharing_view").append(
					'<div class="sharing_view_line" style="margin-bottom: 50px;"><p style="text-align: center">Sharing list is empty!</p></div>'
				);
			}

			let html = "";

			html += `
			<div class="sharing_view_line"><p>Share</p></div>
			<div class="sharing_view_line">
				<div class="col-xs-5">
					<select name="from" id="albums_list" class="form-control select" size="13" multiple="multiple">`;

			$.each(sharing.json.albums, function () {
				html += `<option value="` + this.id + `">` + this.title + `</option>`;
			});

			html +=
				`</select>
				</div>

				<div class="col-xs-2">
					<!--<button type="button" id="albums_list_undo" class="btn btn-primary btn-block">undo</button>-->
					<button type="button" id="albums_list_rightAll" class="btn btn-default btn-block blue">` +
				build.iconic("media-skip-forward") +
				`</button>
					<button type="button" id="albums_list_rightSelected" class="btn btn-default btn-block blue">` +
				build.iconic("chevron-right") +
				`</button>
					<button type="button" id="albums_list_leftSelected" class="btn btn-default btn-block grey">` +
				build.iconic("chevron-left") +
				`</button>
					<button type="button" id="albums_list_leftAll" class="btn btn-default btn-block grey">` +
				build.iconic("media-skip-backward") +
				`</button>
					<!--<button type="button" id="albums_list_redo" class="btn btn-warning btn-block">redo</button>-->
				</div>

				<div class="col-xs-5">
					<select name="to" id="albums_list_to" class="form-control select" size="13" multiple="multiple"></select>
				</div>
			</div>`;

			html += `
			<div class="sharing_view_line"><p class="with">with</p></div>
			<div class="sharing_view_line">
				<div class="col-xs-5">
					<select name="from" id="user_list" class="form-control select" size="13" multiple="multiple">`;

			$.each(sharing.json.users, function () {
				html += `<option value="` + this.id + `">` + this.username + `</option>`;
			});

			html +=
				`</select>
				</div>

				<div class="col-xs-2">
					<!--<button type="button" id="user_list_undo" class="btn btn-primary btn-block">undo</button>-->
					<button type="button" id="user_list_rightAll" class="btn btn-default btn-block blue">` +
				build.iconic("media-skip-forward") +
				`</button>
					<button type="button" id="user_list_rightSelected" class="btn btn-default btn-block blue">` +
				build.iconic("chevron-right") +
				`</button>
					<button type="button" id="user_list_leftSelected" class="btn btn-default btn-block grey">` +
				build.iconic("chevron-left") +
				`</button>
					<button type="button" id="user_list_leftAll" class="btn btn-default btn-block grey">` +
				build.iconic("media-skip-backward") +
				`</button>
					<!--<button type="button" id="user_list_redo" class="btn btn-warning btn-block">redo</button>-->
				</div>

				<div class="col-xs-5">
					<select name="to" id="user_list_to" class="form-control select" size="13" multiple="multiple"></select>
				</div>
			</div>`;
			html += `<div class="sharing_view_line"><a id="Share_button"  class="basicModal__button">Share</a></div>`;
			html += '<div class="sharing_view_line">';

			$.each(sharing.json.shared, function () {
				html +=
					`<p><span class="text">` +
					this.title +
					`</span><span class="text">` +
					this.username +
					'</span><span class="choice">' +
					"<label>" +
					'<input type="checkbox" name="remove_id" value="' +
					this.id +
					'"/>' +
					'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
					"</label>" +
					"</span></p>" +
					``;
			});

			html += "</div>";
			if (sharing.json.shared.length !== 0) {
				html += `<div class="sharing_view_line"><a id="Remove_button"  class="basicModal__button">Remove</a></div>`;
			}

			$(".sharing_view").append(html);

			$("#albums_list").multiselect();
			$("#user_list").multiselect();
			$("#Share_button")
				.on("click", sharing.add)
				.on("mouseenter", function () {
					$("#albums_list_to, #user_list_to").addClass("borderBlue");
				})
				.on("mouseleave", function () {
					$("#albums_list_to, #user_list_to").removeClass("borderBlue");
				});

			$("#Remove_button").on("click", sharing.delete);
		},
	},
};

view.logs = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.logs.title();
		header.setMode("config");
		view.logs.content.init();
	},

	title: function () {
		lychee.setTitle("Logs", false);
	},

	clearContent: function () {
		let html = "";
		html += lychee.html`<div class="clear_logs_update"><a id="Clean_Noise" class="basicModal__button">${lychee.locale["CLEAN_LOGS"]}</a></div>`;
		html += '<pre class="logs_diagnostics_view"></pre>';
		lychee.content.html(html);

		$("#Clean_Noise").on("click", function () {
			api.post("Logs::clearNoise", {}, function () {
				view.logs.init();
			});
		});
	},

	content: {
		init: function () {
			view.logs.clearContent();
			api.post(
				"Logs::list",
				{},
				/** @param {{id: number, created_at: string, updated_at: string, type: string, function: string, line: number, text: string}[]} logEntries */
				function (logEntries) {
					let html = "<pre>";
					/** @param {Date} datetime */
					const formatDateTime = function (datetime) {
						return (
							"" +
							datetime.getUTCFullYear() +
							"-" +
							String(datetime.getUTCMonth()).padStart(2, "0") +
							"-" +
							String(datetime.getUTCDay()).padStart(2, "0") +
							" " +
							String(datetime.getUTCHours()).padStart(2, "0") +
							":" +
							String(datetime.getUTCMinutes()).padStart(2, "0") +
							":" +
							String(datetime.getUTCSeconds()).padStart(2, "0") +
							" UTC"
						);
					};
					logEntries.forEach(function (logEntry) {
						html += formatDateTime(new Date(logEntry.created_at)) + " -- ";
						html += logEntry.type.padEnd(7) + " -- ";
						html += logEntry.function + " -- ";
						html += logEntry.line + " -- ";
						html += logEntry.text + "\n";
					});
					html += "</pre>";
					$(".logs_diagnostics_view").html(html);
				}
			);
		},
	},
};

view.diagnostics = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.diagnostics.title("Diagnostics");
		header.setMode("config");
		view.diagnostics.content.init();
	},

	title: function () {
		lychee.setTitle("Diagnostics", false);
	},

	clearContent: function (update) {
		let html = "";

		if (update === 2) {
			html += view.diagnostics.button("", lychee.locale["UPDATE_AVAILABLE"]);
		} else if (update === 3) {
			html += view.diagnostics.button("", lychee.locale["MIGRATION_AVAILABLE"]);
		} else if (update > 0) {
			html += view.diagnostics.button("Check_", lychee.locale["CHECK_FOR_UPDATE"]);
		}

		html += '<pre class="logs_diagnostics_view"></pre>';
		lychee.content.html(html);
	},

	button: function (type, locale) {
		let html = "";
		html += '<div class="clear_logs_update">';
		html += lychee.html`<a id="${type}Update_Lychee" class="basicModal__button">${locale}</a>`;
		html += "</div>";

		return html;
	},

	bind: function () {
		$("#Update_Lychee").on("click", view.diagnostics.call_apply_update);
		$("#Check_Update_Lychee").on("click", view.diagnostics.call_check_update);
	},

	content: {
		init: function () {
			view.diagnostics.clearContent(false);

			view.diagnostics.content.v_2();
		},

		v_2: function () {
			api.post("Diagnostics::get", {}, function (data) {
				view.diagnostics.clearContent(data.update);
				let html = "";

				html += view.diagnostics.content.block("error", "Diagnostics", data.errors);
				html += view.diagnostics.content.block("sys", "System Information", data.infos);
				html += '<a id="Get_Size_Lychee" class="basicModal__button button_left">';
				html += '<svg class="iconic"><use xlink:href="#reload"></use></svg>';
				html += lychee.html`${lychee.locale["DIAGNOSTICS_GET_SIZE"]}`;
				html += "</a>";
				html += view.diagnostics.content.block("conf", "Config Information", data.configs);

				$(".logs_diagnostics_view").html(html);

				view.diagnostics.bind();

				$("#Get_Size_Lychee").on("click", view.diagnostics.call_get_size);
			});
		},

		print_array: function (arr) {
			let html = "";
			let i;

			for (i = 0; i < arr.length; i++) {
				html += "    " + arr[i] + "\n";
			}
			return html;
		},

		block: function (id, title, arr) {
			let html = "";
			html += '<pre id="content_diag_' + id + '">\n\n\n\n';
			html += "    " + title + "\n";
			html += "    ".padEnd(title.length, "-") + "\n";
			html += view.diagnostics.content.print_array(arr);
			html += "</pre>\n";
			return html;
		},
	},

	call_check_update: function () {
		api.post("Update::check", [], function (data) {
			loadingBar.show("success", data);
			$("#Check_Update_Lychee").remove();
		});
	},

	call_apply_update: function () {
		api.post("Update::apply", [], function (data) {
			let html = view.preify(data, "");
			$("#Update_Lychee").remove();
			$(html).prependTo(".logs_diagnostics_view");
		});
	},

	call_get_size: function () {
		api.post("Diagnostics::getSize", [], function (data) {
			let html = view.preify(data, "");
			$("#Get_Size_Lychee").remove();
			$(html).appendTo("#content_diag_sys");
		});
	},
};

view.update = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.update.title();
		header.setMode("config");
		view.update.content.init();
	},

	title: function () {
		lychee.setTitle("Update", false);
	},

	clearContent: function () {
		let html = "";
		html += '<pre class="logs_diagnostics_view"></pre>';
		lychee.content.html(html);
	},

	content: {
		init: function () {
			view.update.clearContent();

			// code duplicate
			api.post("Update::apply", [], function (data) {
				let html = view.preify(data, "logs_diagnostics_view");
				lychee.content.html(html);
			});
		},
	},
};

view.preify = function (data, css) {
	let html = '<pre class="' + css + '">';
	if (Array.isArray(data)) {
		for (let i = 0; i < data.length; i++) {
			html += "    " + data[i] + "\n";
		}
	} else {
		html += "    " + data;
	}
	html += "</pre>";

	return html;
};

view.u2f = {
	init: function () {
		multiselect.clearSelection();

		view.photo.hide();
		view.u2f.title();
		header.setMode("config");
		view.u2f.content.init();
	},

	title: function () {
		lychee.setTitle(lychee.locale["U2F"], false);
	},

	clearContent: function () {
		lychee.content.html('<div class="u2f_view"></div>');
	},

	content: {
		init: function () {
			view.u2f.clearContent();

			let html = "";

			if (u2f.json.length === 0) {
				$(".u2f_view").append('<div class="u2f_view_line"><p class="single">Credentials list is empty!</p></div>');
			} else {
				html +=
					'<div class="u2f_view_line">' +
					"<p>" +
					'<span class="text">' +
					lychee.locale["U2F_CREDENTIALS"] +
					"</span>" +
					// '<span class="text_icon" title="Allow uploads">' + build.iconic('data-transfer-upload') + '</span>' +
					// '<span class="text_icon" title="Restricted account">' + build.iconic('lock-locked') + '</span>' +
					"</p>" +
					"</div>";

				$(".u2f_view").append(html);

				$.each(u2f.json, function () {
					$(".u2f_view").append(build.u2f(this));
					settings.bind("#CredentialDelete" + this.id, "#CredentialData" + this.id, u2f.delete);
					// if (this.may_upload) {
					//     $('#UserData' + this.id + ' .choice input[name="upload"]').click();
					// }
					// if (this.is_locked) {
					//     $('#UserData' + this.id + ' .choice input[name="lock"]').click();
					// }
				});
			}

			html = '<div class="u2f_view_line"';

			// if (u2f.json.length === 0) {
			//     html += ' style="padding-top: 0px;"';
			// }
			html +=
				">" +
				'<a id="RegisterU2FButton"  class="basicModal__button basicModal__button_CREATE">' +
				lychee.locale["U2F_REGISTER_KEY"] +
				"</a>" +
				"</div>";
			$(".u2f_view").append(html);
			$("#RegisterU2FButton").on("click", u2f.register);
		},
	},
};
