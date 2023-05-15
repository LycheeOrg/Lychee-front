/**
 * @description Responsible to reflect data changes to the UI.
 */

const view = {
	/** @type {ResizeObserver} */
	resizeObserver: (function () {
		/**
		 * @type {HTMLDivElement}
		 */
		const viewContainer = document.getElementById("lychee_view_container");

		const resizeHandler = (function () {
			let viewContainerWidth = 0;

			return function () {
				// Avoid infinite loops
				// The layout method `view.album.content.justify()` below will
				// change the height of the container as the height depends on
				// the amount of content.
				// Hence, `view.album.content.justify()` re-triggers the
				// event handler.
				// However, we are only interested into changes of the width,
				// which is independent of content but solely depends on
				// window size.
				// We bail out early if the width has not changed since last
				// time.
				if (viewContainer.clientWidth === viewContainerWidth) return;
				viewContainerWidth = viewContainer.clientWidth;
				view.album.content.justify();
				if (photo.isLivePhotoInitialized()) {
					photo.livePhotosObject.updateSize();
				}
			};
		})();

		const observer = new ResizeObserver(resizeHandler);
		observer.observe(viewContainer);

		return observer;
	})(),
};

view.albums = {
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		view.albums.title();
		view.albums.content.init();
	},

	/** @returns {void} */
	title: function () {
		if (lychee.landing_page_enable) {
			lychee.setMetaData();
		} else {
			lychee.setMetaData(lychee.locale["ALBUMS"]);
		}
	},

	content: {
		/** @returns {void} */
		init: function () {
			let smartData = "";
			let tagAlbumsData = "";
			let albumsData = "";
			let sharedData = "";

			// Smart Albums
			if (
				lychee.publicMode === false &&
				(albums.json.smart_albums.public ||
					albums.json.smart_albums.recent ||
					albums.json.smart_albums.starred ||
					albums.json.smart_albums.unsorted ||
					albums.json.smart_albums.on_this_day ||
					albums.json.tag_albums.length > 0)
			) {
				smartData = build.divider(lychee.locale["SMART_ALBUMS"]);
			}
			if (albums.json.smart_albums.unsorted) {
				albums.parse(albums.json.smart_albums.unsorted);
				smartData += build.album(albums.json.smart_albums.unsorted, !lychee.rights.root_album.can_edit);
			}
			if (albums.json.smart_albums.public) {
				albums.parse(albums.json.smart_albums.public);
				smartData += build.album(albums.json.smart_albums.public, !lychee.rights.root_album.can_edit);
			}
			if (albums.json.smart_albums.starred) {
				albums.parse(albums.json.smart_albums.starred);
				smartData += build.album(albums.json.smart_albums.starred, !lychee.rights.root_album.can_edit);
			}
			if (albums.json.smart_albums.recent) {
				albums.parse(albums.json.smart_albums.recent);
				smartData += build.album(albums.json.smart_albums.recent, !lychee.rights.root_album.can_edit);
			}
			if (albums.json.smart_albums.on_this_day) {
				albums.parse(albums.json.smart_albums.on_this_day);
				smartData += build.album(albums.json.smart_albums.on_this_day);
			}

			// Tag albums
			tagAlbumsData += albums.json.tag_albums.reduce(function (html, tagAlbum) {
				albums.parse(tagAlbum);
				return html + build.album(tagAlbum, !lychee.rights.root_album.can_edit);
			}, "");

			// Albums
			if (lychee.publicMode === false && albums.json.albums.length > 0) albumsData = build.divider(lychee.locale["ALBUMS"]);
			albumsData += albums.json.albums.reduce(function (html, album) {
				albums.parse(album);
				return html + build.album(album, !lychee.rights.root_album.can_edit);
			}, "");

			let current_owner = "";
			// Shared
			sharedData += albums.json.shared_albums.reduce(function (html, album) {
				albums.parse(album);
				if (current_owner !== album.owner_name && lychee.publicMode === false) {
					html += build.divider(album.owner_name);
					current_owner = album.owner_name;
				}
				return html + build.album(album, !lychee.rights.settings.can_edit);
			}, "");

			if (smartData === "" && tagAlbumsData === "" && albumsData === "" && sharedData === "") {
				lychee.content.html("");
				lychee.content.append(build.no_content("eye"));
			} else {
				lychee.content.html(smartData + tagAlbumsData + albumsData + sharedData);
			}

			album.apply_nsfw_filter();
			view.album.content.restoreScroll();
		},

		/**
		 * @param {string} albumID
		 * @returns {void}
		 */
		title: function (albumID) {
			const album = albums.getByID(albumID);
			const title = album.title ? album.title : lychee.locale["UNTITLED"];

			$('.album[data-id="' + albumID + '"] .overlay h1')
				.text(title)
				.attr("title", title);
		},

		/**
		 * @param {string} albumID
		 * @returns {void}
		 */
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
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		view.album.sidebar();
		view.album.title();
		view.album.public();
		view.album.nsfw();
		view.album.nsfw_warning.init();
		view.album.content.init();

		// TODO: `init` is not a property of the Album JSON; this is a property of the view. Consider to move it to `view.album.isInitialized`
		album.json.init = true;
	},

	/** @returns {void} */
	title: function () {
		if ((visible.album() || !album.json.init) && !visible.photo()) {
			switch (album.getID()) {
				case SmartAlbumID.STARRED:
					lychee.setMetaData(lychee.locale["STARRED"]);
					break;
				case SmartAlbumID.PUBLIC:
					lychee.setMetaData(lychee.locale["PUBLIC"]);
					break;
				case SmartAlbumID.RECENT:
					lychee.setMetaData(lychee.locale["RECENT"]);
					break;
				case SmartAlbumID.UNSORTED:
					lychee.setMetaData(lychee.locale["UNSORTED"]);
					break;
				case SmartAlbumID.ON_THIS_DAY:
					lychee.setMetaData(lychee.locale["ON_THIS_DAY"]);
					break;
				default:
					if (album.json.init) sidebar.changeAttr("title", album.json.title);
					lychee.setMetaData(album.json.title, true, album.json.description);
					break;
			}
		}
	},

	nsfw_warning: {
		/** @returns {void} */
		init: function () {
			if (!lychee.nsfw_warning) {
				$("#sensitive_warning").removeClass("active");
				return;
			}

			if (album.json.policy.is_nsfw && !lychee.nsfw_unlocked_albums.includes(album.json.id)) {
				$("#sensitive_warning").addClass("active");
			} else {
				$("#sensitive_warning").removeClass("active");
			}
		},

		/** @returns {void} */
		next: function () {
			lychee.nsfw_unlocked_albums.push(album.json.id);
			$("#sensitive_warning").removeClass("active");
		},
	},

	content: {
		/** @returns {void} */
		init: function () {
			let photosData = "";
			let albumsData = "";
			let html = "";

			if (album.json.albums) {
				album.json.albums.forEach(function (_album) {
					albums.parse(_album);
					albumsData += build.album(_album, !album.json.rights.can_edit);
				});
			}
			if (album.json.photos) {
				// Build photos
				album.json.photos.forEach(function (_photo) {
					photosData += build.photo(_photo, !album.json.rights.can_edit);
				});
			}

			if (photosData !== "") {
				if (lychee.layout === 1) {
					// The CSS class 'laying-out' prevents the DIV from being
					// rendered.
					// The CSS class will eventually be removed by the
					// layout routine `view.album.content.justify` after all
					// child nodes have been arranged.
					// ---- Update 2022-10-20, temporary fix ----
					// However, the reported width of hidden elements is zero.
					// Hence, using the CSS class `laying-out` currently
					// prevent `view.album.content.justify` from calculating
					// the correct width of the container.
					// TODO: Re-add the CSS class `laying-out` here after https://github.com/LycheeOrg/Lychee-front/pull/335 has been merged.
					photosData = '<div class="justified-layout">' + photosData + "</div>";
				} else if (lychee.layout === 2) {
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

			setTimeout(function () {
				view.album.content.justify();
			}, 0);
		},

		/** @returns {void} */
		restoreScroll: function () {
			// Restore scroll position
			const urls = JSON.parse(sessionStorage.getItem("scroll"));
			const urlWindow = window.location.href;
			$("#lychee_view_container").scrollTop(urls != null && urls[urlWindow] ? urls[urlWindow] : 0);
		},

		/**
		 * @param {string} photoID
		 * @returns {void}
		 */
		title: function (photoID) {
			const photo = album.getByID(photoID);
			const title = photo.title ? photo.title : lychee.locale["UNTITLED"];

			$('.photo[data-id="' + photoID + '"] .overlay h1')
				.text(title)
				.attr("title", title);
		},

		/**
		 * @param {string} albumID
		 * @returns {void}
		 */
		titleSub: function (albumID) {
			const subalbum = album.getSubByID(albumID);
			const title = subalbum.title ? subalbum.title : lychee.locale["UNTITLED"];

			$('.album[data-id="' + albumID + '"] .overlay h1')
				.text(title)
				.attr("title", title);
		},

		/**
		 * @param {string} photoID
		 * @returns {void}
		 */
		star: function (photoID) {
			const $badge = $('.photo[data-id="' + photoID + '"] .icn-star');

			if (album.getByID(photoID).is_starred) $badge.addClass("badge--star");
			else $badge.removeClass("badge--star");
		},

		/**
		 * @param {string} photoID
		 * @returns {void}
		 */
		public: function (photoID) {
			const $badge = $('.photo[data-id="' + photoID + '"] .icn-share');

			if (album.getByID(photoID).is_public === 1) $badge.addClass("badge--visible badge--hidden");
			else $badge.removeClass("badge--visible badge--hidden");
		},

		/**
		 * @param {string} photoID
		 * @returns {void}
		 */
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

		/**
		 * @param {Photo} data
		 * @returns {void}
		 */
		updatePhoto: function (data) {
			let src,
				srcset = "";

			// This mimicks the structure of build.photo
			if (lychee.layout === 0) {
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

			setTimeout(() => view.album.content.justify(), 0);
		},

		/**
		 * @param {string} photoID
		 * @param {boolean} [justify=false]
		 * @returns {void}
		 */
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
									sidebar.changeAttr("images", (album.json.photos.length - videoCount).toString());
								} else {
									sidebar.hideAttr("images");
								}
								if (videoCount > 0) {
									sidebar.changeAttr("videos", videoCount.toString());
								} else {
									sidebar.hideAttr("videos");
								}
							}
							if (album.json.photos.length <= 0) {
								lychee.content.find(".divider").remove();
							}
							if (justify) {
								setTimeout(() => view.album.content.justify(), 0);
							}
						}
					}
				);
		},

		/**
		 * @param {string} albumID
		 * @returns {void}
		 */
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
									sidebar.changeAttr("subalbums", album.json.albums.length.toString());
								} else {
									sidebar.hideAttr("subalbums");
								}
							}
						}
					}
				);
		},

		/**
		 * Lays out the photos inside an album or a search result.
		 *
		 * This method is a misnomer, because it does not necessarily
		 * create a justified layout, but the configured layout as specified
		 * by `lychee.layout` which can also be a non-justified layout.
		 *
		 * Also note that this method is bastardized by `search.find`.
		 * Hence, this method would better not be part of `view.album.content`,
		 * because it is not exclusively used for an album.
		 *
		 * TODO: Livewire front-end will make this a pure CSS solution.
		 *
		 * @returns {void}
		 */
		justify: function () {
			// Note, this also works for search results as the search creates
			// a virtual "search smart album" which fills `album.json`.
			if (album.json === null || album.json.photos.length === 0) return;
			/**
			 * @type {Photo[]}
			 */
			const photos = album.json.photos;

			if (lychee.layout === 1) {
				/** @type {jQuery} */
				const jqJustifiedLayout = $(".justified-layout");
				let containerWidth = parseFloat(jqJustifiedLayout.width());
				if (containerWidth === 0) {
					// The reported width is zero, if `.justified-layout`
					// or any parent element is hidden via `display: none`.
					// Currently, this happens when a page reload is triggered
					// in photo view due to dorky timing constraints.
					// (In short: `lychee.load` initially hides the parent
					// container `.content`, and the parent container only
					// becomes visible _after_ the photo has been loaded which
					// is too late for this method.)
					// Also note, that this container and the parent
					// container are normally always visible, even if a photo
					// is shown as the photo view is drawn in the foreground
					// and covers this container.
					// Hence, this edge case here is really only a problem
					// during a full page reload in combination with
					// `lychee.load`.
					// Also note that the code below is wrong and outdated.
					// The alternative way to calculate the container width
					// depends on the window width and (falsely) assumes that
					// neither the left menu nor the right sidebar are open,
					// but that the `.content` box covers the whole viewport.
					// That was a correct assumption in the past, as the
					// sidebar was always closed after a full page reload, but
					// this assumption isn't true anymore since Lychee
					// remembers the state of the sidebar.
					// Luckily, this whole problem vanishes with the new
					// box model after
					// https://github.com/LycheeOrg/Lychee-front/pull/335 has been merged.
					// Then, we can use the view of the view container which
					// is always visible and always has the correct width
					// even for opened sidebars.
					// TODO: Unconditionally use the width of the view container and remove this alternative width calculation after https://github.com/LycheeOrg/Lychee-front/pull/335 has been merged
					containerWidth = $(window).width() - 2 * parseFloat(jqJustifiedLayout.css("margin"));
				}
				/** @type {number[]} */
				const ratio = photos.map(function (_photo) {
					const height = _photo.size_variants.original.height;
					const width = _photo.size_variants.original.width;
					const ratio = height > 0 ? width / height : 1;
					// If there is no small and medium size variants for videos,
					// we have to fall back to square thumbs
					return _photo.type &&
						_photo.type.indexOf("video") !== -1 &&
						_photo.size_variants.small === null &&
						_photo.size_variants.medium === null
						? 1
						: ratio;
				});

				/**
				 * An album listing has potentially hundreds of photos, hence
				 * only query for them once.
				 * @type {jQuery}
				 */
				const jqPhotoElements = $(".justified-layout > div.photo");
				const photoDefaultHeight = parseFloat(jqPhotoElements.css("--lychee-default-height"));

				const layoutGeometry = require("justified-layout")(ratio, {
					containerWidth: containerWidth,
					containerPadding: 0,
					targetRowHeight: photoDefaultHeight,
				});
				// if (lychee.rights.settings.can_edit) console.log(layoutGeometry);
				$(".justified-layout").css("height", layoutGeometry.containerHeight + "px");
				$(".justified-layout > div").each(function (i) {
					if (!layoutGeometry.boxes[i]) {
						// Race condition in search.find -- window content
						// and `photos` can get out of sync as search
						// query is being modified.
						return false;
					}
					const imgs = $(this)
						.css({
							top: layoutGeometry.boxes[i].top + "px",
							width: layoutGeometry.boxes[i].width + "px",
							height: layoutGeometry.boxes[i].height + "px",
							left: layoutGeometry.boxes[i].left + "px",
						})
						.find(".thumbimg > img");

					if (imgs.length > 0 && imgs[0].getAttribute("data-srcset")) {
						imgs[0].setAttribute("sizes", layoutGeometry.boxes[i].width + "px");
					}
				});
				// Show updated layout
				jqJustifiedLayout.removeClass("laying-out");
			} else if (lychee.layout === 2) {
				/** @type {jQuery} */
				const jqUnjustifiedLayout = $(".unjustified-layout");
				let containerWidth = parseFloat(jqUnjustifiedLayout.width());
				if (containerWidth === 0) {
					// Triggered on Reload in photo view.
					containerWidth = $(window).width() - 2 * parseFloat(jqUnjustifiedLayout.css("margin"));
				}
				/**
				 * An album listing has potentially hundreds of photos, hence
				 * only query for them once.
				 * @type {jQuery}
				 */
				const jqPhotoElements = $(".unjustified-layout > div.photo");
				const photoMaxHeight = parseFloat(jqPhotoElements.css("max-height"));
				const photoMargin = parseFloat(jqPhotoElements.css("margin-right"));
				// Temporarily hide the container such that not each
				// modification of every photo triggers a UI update.
				jqUnjustifiedLayout.addClass("laying-out");
				jqPhotoElements.each(function (i) {
					if (!photos[i]) {
						// Race condition in search.find -- window content
						// and `photos` can get out of sync as search
						// query is being modified.
						return false;
					}
					let ratio =
						photos[i].size_variants.original.height > 0
							? photos[i].size_variants.original.width / photos[i].size_variants.original.height
							: 1;
					if (photos[i].type && photos[i].type.indexOf("video") > -1) {
						// Video.  If there's no small and medium, we have
						// to fall back to the square thumb.
						if (photos[i].size_variants.small === null && photos[i].size_variants.medium === null) {
							ratio = 1;
						}
					}

					let height = photoMaxHeight;
					let width = height * ratio;

					if (width > containerWidth - photoMargin) {
						width = containerWidth - photoMargin;
						height = width / ratio;
					}

					const imgs = $(this)
						.css({
							width: width + "px",
							height: height + "px",
						})
						.find(".thumbimg > img");
					if (imgs.length > 0 && imgs[0].getAttribute("data-srcset")) {
						imgs[0].setAttribute("sizes", width + "px");
					}
				});
				// Show updated layout
				jqUnjustifiedLayout.removeClass("laying-out");
			}
			view.album.content.restoreScroll();
		},
	},

	/**
	 * @returns {void}
	 */
	description: function () {
		sidebar.changeAttr("description", album.json.description ? album.json.description : "");
	},

	/**
	 * @returns {void}
	 */
	show_tags: function () {
		sidebar.changeAttr("show_tags", album.json.show_tags.join(", "));
	},

	/**
	 * @returns {void}
	 */
	license: function () {
		let license;
		switch (album.json.license) {
			case "none":
				// TODO: If we do not use `"none"` as a literal string, we should convert `license` to a nullable DB attribute and use `null` for none to be consistent which everything else
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

	/**
	 * @returns {void}
	 */
	public: function () {
		$("#button_visibility_album, #button_sharing_album_users").removeClass("active--not-hidden active--hidden");

		if (album.json.policy.is_public) {
			if (album.json.policy.is_link_required) {
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

	/**
	 * @returns {void}
	 */
	requiresLink: function () {
		if (album.json.policy.is_link_required) sidebar.changeAttr("hidden", lychee.locale["ALBUM_SHR_YES"]);
		else sidebar.changeAttr("hidden", lychee.locale["ALBUM_SHR_NO"]);
	},

	/**
	 * @returns {void}
	 */
	nsfw: function () {
		if (album.json.policy.is_nsfw) {
			// Sensitive
			$("#button_nsfw_album").addClass("active").attr("title", lychee.locale["ALBUM_UNMARK_NSFW"]);
		} else {
			// Not Sensitive
			$("#button_nsfw_album").removeClass("active").attr("title", lychee.locale["ALBUM_MARK_NSFW"]);
		}
	},

	/**
	 * @returns {void}
	 */
	downloadable: function () {
		if (album.json.policy.grants_download) sidebar.changeAttr("downloadable", lychee.locale["ALBUM_SHR_YES"]);
		else sidebar.changeAttr("downloadable", lychee.locale["ALBUM_SHR_NO"]);
	},

	/**
	 * @returns {void}
	 */
	password: function () {
		if (album.json.policy.is_password_required) sidebar.changeAttr("password", lychee.locale["ALBUM_SHR_YES"]);
		else sidebar.changeAttr("password", lychee.locale["ALBUM_SHR_NO"]);
	},

	/**
	 * @returns {void}
	 */
	sidebar: function () {
		if ((visible.album() || (album.json && !album.json.init)) && !visible.photo()) {
			const structure = sidebar.createStructure.album(album.json);
			const html = sidebar.render(structure);

			sidebar.dom("#lychee_sidebar_content").html(html);
			sidebar.bind();
		}
	},
};

view.photo = {
	/**
	 * @param {boolean} autoplay
	 * @returns {void}
	 */
	init: function (autoplay) {
		multiselect.clearSelection();

		view.photo.sidebar();
		view.photo.title();
		view.photo.star();
		view.photo.public();
		view.photo.header();
		view.photo.photo(autoplay);

		// TODO: `init` is not a property of the Photo JSON; this is a property of the view. Consider to move it to `view.photo.isInitialized`
		photo.json.init = true;
	},

	/**
	 * @returns {void}
	 */
	show: function () {
		// Change header
		lychee.content.addClass("view");
		header.setMode("photo");

		if (!visible.photo()) {
			// Fullscreen
			let timeout = null;
			$(document).bind("mousemove", function () {
				clearTimeout(timeout);
				// For live Photos: header animation only if LivePhoto is not playing
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
			lychee.imageview.addClass("active");
		}
	},

	/**
	 * @returns {void}
	 */
	hide: function () {
		header.show();

		lychee.content.removeClass("view");
		header.setMode("album");

		// Disable Fullscreen
		$(document).unbind("mousemove");
		if ($("video").length) {
			$("video")[$("video").length - 1].pause();
		}

		// Hide Photo
		lychee.animate(lychee.imageview, "fadeOut");
		// TODO: Reconsider the lines below
		// The lines below are inconsistent to the corresponding code for
		// the mapview (cp. `mapview.close()`).
		// Here, we remove the `active` class after the animation has ended,
		// in `mapview.close()` we remove that class immediately.
		setTimeout(() => {
			lychee.imageview.removeClass("active");
			view.album.sidebar();
		}, 300);
	},

	/**
	 * @returns {void}
	 */
	title: function () {
		if (photo.json.init) sidebar.changeAttr("title", photo.json.title ? photo.json.title : "");
		const photoUrl = photo.json.size_variants.medium ? photo.json.size_variants.medium.url : photo.json.size_variants.original.url;
		lychee.setMetaData(photo.json.title ? photo.json.title : lychee.locale["UNTITLED"], true, photo.json.description, photoUrl);
	},

	/**
	 * @returns {void}
	 */
	description: function () {
		if (photo.json.init) sidebar.changeAttr("description", photo.json.description ? photo.json.description : "");
	},

	/**
	 * @returns {void}
	 */
	uploaded: function () {
		if (photo.json.init) sidebar.changeAttr("uploaded", photo.json.created_at ? lychee.locale.printDateTime(photo.json.created_at) : "");
	},

	/**
	 * @returns {void}
	 */
	license: function () {
		let license;

		// Process key to display correct string
		switch (photo.json.license) {
			case "none":
				// TODO: If we do not use `"none"` as a literal string, we should convert `license` to a nullable DB attribute and use `null` for none to be consistent which everything else
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

	/**
	 * @returns {void}
	 */
	star: function () {
		if (photo.json.is_starred) {
			// Starred
			$("#button_star").addClass("active").attr("title", lychee.locale["UNSTAR_PHOTO"]);
		} else {
			// Unstarred
			$("#button_star").removeClass("active").attr("title", lychee.locale["STAR_PHOTO"]);
		}
	},

	/**
	 * @returns {void}
	 */
	public: function () {
		$("#button_visibility").removeClass("active--hidden active--not-hidden");

		if (photo.json.is_public === true) {
			$("#button_visibility").addClass("active--hidden");
			if (photo.json.init) sidebar.changeAttr("public", lychee.locale["PHOTO_SHR_YES"]);
		} else if (photo.json.album_id !== null && album.json.policy.is_public === true) {
			// part of a visible album
			$("#button_visibility").addClass("active--not-hidden");
			if (photo.json.init) sidebar.changeAttr("public", lychee.locale["PHOTO_SHR_YES"]);
		} else {
			// Photo private
			if (photo.json.init) sidebar.changeAttr("public", lychee.locale["PHOTO_SHR_NO"]);
		}
	},

	/**
	 * @returns {void}
	 */
	tags: function () {
		sidebar.changeAttr("tags", build.tags(photo.json.tags), true);
		sidebar.bind();
	},

	/**
	 * @param {boolean} autoplay
	 * @returns {void}
	 */
	photo: function (autoplay) {
		let ret = build.imageview(photo.json, visible.header(), autoplay);
		lychee.imageview.html(ret.html);
		tabindex.makeFocusable(lychee.imageview);

		// Init Live Photo if needed
		if (photo.isLivePhoto()) {
			// Package gives warning that function will be remove and
			// shoud be replaced by LivePhotosKit.augementElementAsPlayer
			// But, LivePhotosKit.augementElementAsPlayer is not yet available
			photo.livePhotosObject = LivePhotosKit.Player(document.getElementById("livephoto"));
		}

		view.photo.onresize();

		const $nextArrow = lychee.imageview.find("a#next");
		const $previousArrow = lychee.imageview.find("a#previous");
		const photoID = photo.getID();
		/** @type {?Photo} */
		const photoInAlbum = album.json && album.json.photos ? album.getByID(photoID) : null;
		/** @type {?Photo} */
		const nextPhotoInAlbum = photoInAlbum && photoInAlbum.next_photo_id ? album.getByID(photoInAlbum.next_photo_id) : null;
		/** @type {?Photo} */
		const prevPhotoInAlbum = photoInAlbum && photoInAlbum.previous_photo_id ? album.getByID(photoInAlbum.previous_photo_id) : null;

		const img = $("img#image");
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

		if (nextPhotoInAlbum === null || lychee.viewMode === true) {
			$nextArrow.hide();
		} else {
			// Check if thumbUrl exists (for videos w/o ffmpeg, we add a play-icon)
			let thumbUrl = "img/placeholder.png";
			if (nextPhotoInAlbum.size_variants.thumb !== null) {
				thumbUrl = nextPhotoInAlbum.size_variants.thumb.url;
			} else if (nextPhotoInAlbum.type.indexOf("video") > -1) {
				thumbUrl = "img/play-icon.png";
			}
			$nextArrow.css("background-image", lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${thumbUrl}")`);
		}

		if (prevPhotoInAlbum === null || lychee.viewMode === true) {
			$previousArrow.hide();
		} else {
			// Check if thumbUrl exists (for videos w/o ffmpeg, we add a play-icon)
			let thumbUrl = "img/placeholder.png";
			if (prevPhotoInAlbum.size_variants.thumb !== null) {
				thumbUrl = prevPhotoInAlbum.size_variants.thumb.url;
			} else if (prevPhotoInAlbum.type.indexOf("video") > -1) {
				thumbUrl = "img/play-icon.png";
			}
			$previousArrow.css("background-image", lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${thumbUrl}")`);
		}
	},

	/**
	 * @returns {void}
	 */
	sidebar: function () {
		const structure = sidebar.createStructure.photo(photo.json);
		const html = sidebar.render(structure);
		const has_location = !!(photo.json.latitude && photo.json.longitude);

		sidebar.dom("#lychee_sidebar_content").html(html);
		sidebar.bind();

		if (has_location && lychee.map_display) {
			// Leaflet searches for icon in same directory as js file -> paths needs
			// to be overwritten
			delete L.Icon.Default.prototype._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: "img/marker-icon-2x.png",
				iconUrl: "img/marker-icon.png",
				shadowUrl: "img/marker-shadow.png",
			});

			const myMap = L.map("leaflet_map_single_photo").setView([photo.json.latitude, photo.json.longitude], 13);

			L.tileLayer(map_provider_layer_attribution[lychee.map_provider].layer, {
				attribution: map_provider_layer_attribution[lychee.map_provider].attribution,
			}).addTo(myMap);

			if (!lychee.map_display_direction || !photo.json.img_direction) {
				// Add Marker to map, direction is not set
				L.marker([photo.json.latitude, photo.json.longitude]).addTo(myMap);
			} else {
				// Add Marker, direction has been set
				const viewDirectionIcon = L.icon({
					iconUrl: "img/view-angle-icon.png",
					iconRetinaUrl: "img/view-angle-icon-2x.png",
					iconSize: [100, 58], // size of the icon
					iconAnchor: [50, 49], // point of the icon which will correspond to marker's location
				});
				const marker = L.marker([photo.json.latitude, photo.json.longitude], { icon: viewDirectionIcon }).addTo(myMap);
				marker.setRotationAngle(photo.json.img_direction);
			}
		}
	},

	/**
	 * @returns {void}
	 */
	header: function () {
		/* Note: the condition below is duplicated in contextMenu.photoMore() */
		if (
			(photo.json.type && (photo.json.type.indexOf("video") === 0 || photo.json.type === "raw")) ||
			(photo.json.live_photo_url !== "" && photo.json.live_photo_url !== null)
		) {
			$("#button_rotate_cwise, #button_rotate_ccwise").hide();
		}
	},

	/**
	 * @returns {void}
	 */
	onresize: function () {
		if (!photo.json || photo.json.size_variants.medium === null || photo.json.size_variants.medium2x === null) return;

		// Calculate the width of the image in the current window without
		// borders and set 'sizes' to it.
		const imgWidth = photo.json.size_variants.medium.width;
		const imgHeight = photo.json.size_variants.medium.height;
		const containerWidth = $(window).outerWidth();
		const containerHeight = $(window).outerHeight();

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
	/**
	 * @returns {void}
	 */
	init: function () {
		multiselect.clearSelection();

		if (visible.photo()) view.photo.hide();
		view.settings.title();
		header.setMode("config");
		view.settings.content.init();
	},

	/**
	 * @returns {void}
	 */
	title: function () {
		lychee.setMetaData(lychee.locale["SETTINGS"]);
	},

	/**
	 * @returns {void}
	 */
	clearContent: function () {
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {
		/**
		 * @returns {void}
		 */
		init: function () {
			view.settings.clearContent();
			if (lychee.rights.user.can_edit) {
				view.settings.content.setLogin();
			}
			if (lychee.rights.settings.can_edit) {
				view.settings.content.setSorting();
				view.settings.content.setDropboxKey();
				view.settings.content.setLang();
				view.settings.content.setDefaultLicense();
				view.settings.content.setLayout();
				view.settings.content.setPublicSearch();
				view.settings.content.setAlbumDecoration();
				view.settings.content.setOverlayType();
				view.settings.content.setMapDisplay();
				view.settings.content.setNSFWVisible();
				view.settings.content.setRecentPublic();
				view.settings.content.setStarredPublic();
				view.settings.content.setOnThisDayPublic();
				view.settings.content.setNotification();
				view.settings.content.setCSS();
				view.settings.content.setJS();
				view.settings.content.moreButton();
			}
		},

		/**
		 * @returns {void}
		 */
		setLogin: function () {
			let username_type = "hidden";
			if (lychee.allow_username_change) {
				username_type = "text";
			}

			const msg = lychee.html`
			<div class="setLogin">
			<form>
			  <p>$${lychee.locale["PASSWORD_TITLE"]}
				  <input name='oldPassword' class='text' type='password' placeholder='$${lychee.locale["PASSWORD_CURRENT"]}' value=''>
			  </p>
			  <p>$${lychee.locale["PASSWORD_TEXT"]}
				  <input name='username' class='text' type='$${username_type}' placeholder='$${lychee.locale["LOGIN_USERNAME"]}' value=''>
				  <input name='password' class='text' type='password' placeholder='$${lychee.locale["LOGIN_PASSWORD"]}' value=''>
				  <input name='confirm' class='text' type='password' placeholder='$${lychee.locale["LOGIN_PASSWORD_CONFIRM"]}' value=''>
			  </p>
			<div class="basicModal__buttons">
				<!--<a id="basicModal__cancel" class="basicModal__button ">Cancel</a>-->
				<a id="basicModal__action_password_change" class="basicModal__button ">$${lychee.locale["PASSWORD_CHANGE"]}</a>
				<a id="basicModal__action_token" class="basicModal__button ">$${lychee.locale["TOKEN_BUTTON"]}</a>
			</div>
			</form>
			</div>`;

			$(".settings_view").append(msg);

			settings.bind("#basicModal__action_password_change", ".setLogin", settings.changeLogin);
			settings.bind("#basicModal__action_token", ".setLogin", settings.openTokenDialog);
		},

		/**
		 * @returns {void}
		 */
		clearLogin: function () {
			$("input[name=oldUsername], input[name=oldPassword], input[name=username], input[name=password], input[name=confirm]").val("");
		},

		/**
		 * Renders the area of the settings related to sorting
		 *
		 * TODO: Note, the method is a misnomer.
		 * It does not **set** any sorting, see {@link settings.changeSorting}
		 * for that.
		 * This method only creates the HTML GUI.
		 *
		 * @returns {void}
		 */
		setSorting: function () {
			const msg = lychee.html`
				<div class="setSorting">
					<p>
						${sprintf(
							lychee.locale["SORT_ALBUM_BY"],
							`<span class="select">
							<select id="settings_albums_sorting_column" name="sorting_albums_column">
								<option value='created_at'>${lychee.locale["SORT_ALBUM_SELECT_1"]}</option>
								<option value='title'>${lychee.locale["SORT_ALBUM_SELECT_2"]}</option>
								<option value='description'>${lychee.locale["SORT_ALBUM_SELECT_3"]}</option>
								<option value='max_taken_at'>${lychee.locale["SORT_ALBUM_SELECT_5"]}</option>
								<option value='min_taken_at'>${lychee.locale["SORT_ALBUM_SELECT_6"]}</option>
							</select>
						</span>`,
							`<span class="select">
							<select id="settings_albums_sorting_order" name="sorting_albums_order">
								<option value='ASC'>${lychee.locale["SORT_ASCENDING"]}</option>
								<option value='DESC'>${lychee.locale["SORT_DESCENDING"]}</option>
							</select>
						</span>`
						)}
					</p>
					<p>
						${sprintf(
							lychee.locale["SORT_PHOTO_BY"],
							`<span class="select">
							<select id="settings_photos_sorting_column" name="sorting_photos_column">
								<option value='created_at'>${lychee.locale["SORT_PHOTO_SELECT_1"]}</option>
								<option value='taken_at'>${lychee.locale["SORT_PHOTO_SELECT_2"]}</option>
								<option value='title'>${lychee.locale["SORT_PHOTO_SELECT_3"]}</option>
								<option value='description'>${lychee.locale["SORT_PHOTO_SELECT_4"]}</option>
								<option value='is_public'>${lychee.locale["SORT_PHOTO_SELECT_5"]}</option>
								<option value='is_starred'>${lychee.locale["SORT_PHOTO_SELECT_6"]}</option>
								<option value='type'>${lychee.locale["SORT_PHOTO_SELECT_7"]}</option>
							</select>
				  		</span>`,
							`<span class="select">
							<select id="settings_photos_sorting_order" name="sorting_photos_order">
								<option value='ASC'>${lychee.locale["SORT_ASCENDING"]}</option>
								<option value='DESC'>${lychee.locale["SORT_DESCENDING"]}</option>
							</select>
						</span>`
						)}
					</p>
					<div class="basicModal__buttons">
						<!--<a id="basicModal__cancel" class="basicModal__button ">Cancel</a>-->
						<a id="basicModal__action_sorting_change" class="basicModal__button ">$${lychee.locale["SORT_CHANGE"]}</a>
					</div>
				</div>
			`;

			$(".settings_view").append(msg);

			if (lychee.sorting_albums) {
				$(".setSorting select#settings_albums_sorting_column").val(lychee.sorting_albums.column);
				$(".setSorting select#settings_albums_sorting_order").val(lychee.sorting_albums.order);
			}

			if (lychee.sorting_photos) {
				$(".setSorting select#settings_photos_sorting_column").val(lychee.sorting_photos.column);
				$(".setSorting select#settings_photos_sorting_order").val(lychee.sorting_photos.order);
			}

			settings.bind("#basicModal__action_sorting_change", ".setSorting", settings.changeSorting);
		},

		/**
		 * @returns {void}
		 */
		setDropboxKey: function () {
			let msg = `
			<div class="setDropBox">
			  <p>${lychee.locale["DROPBOX_TEXT"]}
			  <input class='text' name='key' type='text' placeholder='${lychee.locale["SETTINGS_DROPBOX_KEY"]}' value='${lychee.dropboxKey}'>
			  </p>
				<div class="basicModal__buttons">
					<a id="basicModal__action_dropbox_change" class="basicModal__button">${lychee.locale["DROPBOX_TITLE"]}</a>
				</div>
			  </div>
			  `;

			$(".settings_view").append(msg);
			settings.bind("#basicModal__action_dropbox_change", ".setDropBox", settings.changeDropboxKey);
		},

		/**
		 * @returns {void}
		 */
		setLang: function () {
			let msg = `
				<div class="setLang">
					<p>
						${lychee.locale["LANG_TEXT"]}
			  			<span class="select">
							<select id="settings_lang" name="lang">
								${lychee.lang_available.reduce(function (html, lang_av) {
									return html + (lychee.lang === lang_av ? "<option selected>" : "<option>") + lang_av + "</option>";
								}, "")}
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

		/**
		 * @returns {void}
		 */
		setDefaultLicense: function () {
			const msg = `
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

		/**
		 * @returns {void}
		 */
		setLayout: function () {
			const msg = `
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

		/**
		 * @returns {void}
		 */
		setPublicSearch: function () {
			const msg = `
			<div class="setPublicSearch">
			<p>${lychee.locale["PUBLIC_SEARCH_TEXT"]}
			<label class="switch">
			  <input id="PublicSearch" type="checkbox" name="public_search">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.public_search) $("#PublicSearch").click();

			settings.bind("#PublicSearch", ".setPublicSearch", settings.changePublicSearch);
		},

		/**
		 * @returns {void}
		 */
		setNSFWVisible: function () {
			let msg = `
			<div class="setNSFWVisible">
			<p>${lychee.locale["NSFW_VISIBLE_TEXT_1"]}
			<label class="switch">
			  <input id="NSFWVisible" type="checkbox" name="nsfw_visible">
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

		/**
		 * @returns {void}
		 */
		setRecentPublic: function () {
			let msg = `
			<div class="setRecentPublic">
			<p>${lychee.locale["SETTING_RECENT_PUBLIC_TEXT"]}
			<label class="switch">
			  <input id="RecentPublic" type="checkbox" name="is_public">
			  <span class="slider round"></span>
			</label></p>
			<input type="hidden" name="albumID" value="recent" />
			</div>
			`;

			$(".settings_view").append(msg);
			console.log(lychee.smart_album_visibilty);
			if (lychee.smart_album_visibilty.recent === true) {
				$("#RecentPublic").click();
			}

			settings.bind("#RecentPublic", ".setRecentPublic", settings.changeSmartAlbumVisibility);
		},

		/**
		 * @returns {void}
		 */
		setStarredPublic: function () {
			let msg = `
			<div class="setStarredPublic">
			<p>${lychee.locale["SETTING_STARRED_PUBLIC_TEXT"]}
			<label class="switch">
			  <input id="StarredPublic" type="checkbox" name="is_public">
			  <span class="slider round"></span>
			</label></p>
			<input type="hidden" name="albumID" value="starred" />
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.smart_album_visibilty.starred) {
				$("#StarredPublic").click();
			}

			settings.bind("#StarredPublic", ".setStarredPublic", settings.changeSmartAlbumVisibility);
		},

		/**
		 * @returns {void}
		 */
		setOnThisDayPublic: function () {
			let msg = `
			<div class="setOnThisDayPublic">
			<p>${lychee.locale["SETTING_ONTHISDAY_PUBLIC_TEXT"]}
			<label class="switch">
			  <input id="OnThisDayPublic" type="checkbox" name="is_public">
			  <span class="slider round"></span>
			</label></p>
			<input type="hidden" name="albumID" value="on_this_day" />
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.smart_album_visibilty.on_this_day) {
				$("#OnThisDayPublic").click();
			}

			settings.bind("#OnThisDayPublic", ".setOnThisDayPublic", settings.changeSmartAlbumVisibility);
		},

		/**
		 * @returns {void}
		 */
		setAlbumDecoration: function () {
			let msg = `
			<div class="setAlbumDecoration">
			<p>${lychee.locale["ALBUM_DECORATION"]}
			<span class="select" style="width:270px">
				<select name="album_decoration" id="AlbumDecorationType">
					<option value="none">${lychee.locale["ALBUM_DECORATION_NONE"]}</option>
					<option value="layers">${lychee.locale["ALBUM_DECORATION_ORIGINAL"]}</option>
					<option value="album">${lychee.locale["ALBUM_DECORATION_ALBUM"]}</option>
					<option value="photo">${lychee.locale["ALBUM_DECORATION_PHOTO"]}</option>
					<option value="all">${lychee.locale["ALBUM_DECORATION_ALL"]}</option>
				</select>
			</span>
			<p>${lychee.locale["ALBUM_DECORATION_ORIENTATION"]}
			<span class="select" style="width:270px">
				<select name="album_decoration_orientation" id="AlbumDecorationOrientation">
					<option value="row">${lychee.locale["ALBUM_DECORATION_ORIENTATION_ROW"]}</option>
					<option value="row-reverse">${lychee.locale["ALBUM_DECORATION_ORIENTATION_ROW_REVERSE"]}</option>
					<option value="column">${lychee.locale["ALBUM_DECORATION_ORIENTATION_COLUMN"]}</option>
					<option value="column-reverse">${lychee.locale["ALBUM_DECORATION_ORIENTATION_COLUMN_REVERSE"]}</option>
				</select>
			</span>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_album_decoration" class="basicModal__button">${lychee.locale["SET_ALBUM_DECORATION"]}</a>
			</div>
			</div>
			`;

			$(".settings_view").append(msg);

			$("select#AlbumDecorationType").val(!lychee.album_decoration ? "layers" : lychee.album_decoration);
			$("select#AlbumDecorationOrientation").val(!lychee.album_decoration_orientation ? "row" : lychee.album_decoration_orientation);
			settings.bind("#basicModal__action_set_album_decoration", ".setAlbumDecoration", settings.setAlbumDecoration);
		},

		/**
		 * @returns {void}
		 */
		setOverlayType: function () {
			let msg = `
			<div class="setOverlayType">
			<p>${lychee.locale["OVERLAY_TYPE"]}
			<span class="select" style="width:270px">
				<select name="image_overlay_type" id="ImgOverlayType">
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

		/**
		 * @returns {void}
		 */
		setMapDisplay: function () {
			let msg = `
			<div class="setMapDisplay">
			<p>${lychee.locale["MAP_DISPLAY_TEXT"]}
			<label class="switch">
			  <input id="MapDisplay" type="checkbox" name="map_display">
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
				<input id="MapDisplayPublic" type="checkbox" name="map_display_public">
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
				<select name="map_provider" id="MapProvider">
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
			<div class="setMapIncludeSubAlbums">
			<p>${lychee.locale["MAP_INCLUDE_SUBALBUMS_TEXT"]}
			<label class="switch">
			  <input id="MapIncludeSubAlbums" type="checkbox" name="map_include_subalbums">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.map_include_subalbums) $("#MapIncludeSubAlbums").click();

			settings.bind("#MapIncludeSubAlbums", ".setMapIncludeSubAlbums", settings.changeMapIncludeSubAlbums);

			msg = `
			<div class="setLocationDecoding">
			<p>${lychee.locale["LOCATION_DECODING"]}
			<label class="switch">
			  <input id="LocationDecoding" type="checkbox" name="location_decoding">
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
			  <input id="LocationShow" type="checkbox" name="location_show">
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
				<input id="LocationShowPublic" type="checkbox" name="location_show_public">
				<span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.location_show_public) $("#LocationShowPublic").click();

			settings.bind("#LocationShowPublic", ".setLocationShowPublic", settings.changeLocationShowPublic);
		},

		/**
		 * @returns {void}
		 */
		setNotification: function () {
			const msg = `
			<div class="setNewPhotosNotification">
			<p>${lychee.locale["NEW_PHOTOS_NOTIFICATION"]}
			<label class="switch">
				<input id="NewPhotosNotification" type="checkbox" name="new_photos_notification">
				<span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.new_photos_notification) $("#NewPhotosNotification").click();

			settings.bind("#NewPhotosNotification", ".setNewPhotosNotification", settings.changeNewPhotosNotification);
		},

		/**
		 * @returns {void}
		 */
		setCSS: function () {
			const msg = `
			<div class="setCSS">
			<p>${lychee.locale["CSS_TEXT"]}</p>
			<textarea id="css"></textarea>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_css" class="basicModal__button">${lychee.locale["CSS_TITLE"]}</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);

			let css_addr = $($("link")[1]).attr("href");

			api.getRawContent(css_addr, function (data) {
				$("#css").html(data);
			});

			settings.bind("#basicModal__action_set_css", ".setCSS", settings.changeCSS);
		},

		/**
		 * @returns {void}
		 */
		setJS: function () {
			const msg = `
			<div class="setJS">
			<p>${lychee.locale["JS_TEXT"]}</p>
			<textarea id="js"></textarea>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_js" class="basicModal__button">${lychee.locale["JS_TITLE"]}</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);

			let js_addr = $("script[src]:last").attr("src");

			api.getRawContent(js_addr, function (data) {
				$("#js").html(data);
			});

			settings.bind("#basicModal__action_set_js", ".setJS", settings.changeJS);
		},

		/**
		 * @returns {void}
		 */
		moreButton: function () {
			const msg = lychee.html`
			<div class="setJS">
				<a id="basicModal__action_more" class="basicModal__button basicModal__button_MORE">${lychee.locale["MORE"]}</a>
			</div>
			`;

			$(".settings_view").append(msg);

			$("#basicModal__action_more").on("click", view.full_settings.init);
		},
	},
};

view.full_settings = {
	/**
	 * @returns {void}
	 */
	init: function () {
		multiselect.clearSelection();

		view.full_settings.title();
		view.full_settings.content.init();
	},

	/**
	 * @returns {void}
	 */
	title: function () {
		lychee.setMetaData(lychee.locale["FULL_SETTINGS"]);
	},

	/**
	 * @returns {void}
	 */
	clearContent: function () {
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {
		init: function () {
			view.full_settings.clearContent();

			api.post(
				"Settings::getAll",
				{},
				/** @param {ConfigSetting[]} data */
				function (data) {
					let msg = lychee.html`
						<div id="fullSettings">
						<div class="setting_line">
						<p class="warning">
						${lychee.locale["SETTINGS_ADVANCED_WARNING_EXPL"]}
						</p>
						</div>
						`;

					let prev = "";
					data.forEach(function (_config) {
						if (_config.cat && prev !== _config.cat) {
							msg += lychee.html`
								<div class="setting_category">
									<p>$${_config.cat}</p>
								</div>`;
							prev = _config.cat;
						}
						// prevent 'null' string for empty values
						const val = _config.value ? _config.value : "";
						msg += lychee.html`
							<div class="setting_line">
								<p>
									<span class="text">$${_config.key}</span>
									<input class="text" name="$${_config.key}" type="text" value="$${val}" placeholder="" />
								</p>
							</div>`;
					});

					msg += lychee.html`
						<a id="FullSettingsSave_button"  class="basicModal__button basicModal__button_SAVE">${lychee.locale["SETTINGS_ADVANCED_SAVE"]}</a>
						</div>`;

					$(".settings_view").append(msg);

					settings.bind("#FullSettingsSave_button", "#fullSettings", settings.save);

					$("#fullSettings").on("keypress", function (e) {
						settings.save_enter(e);
					});
				}
			);
		},
	},
};

view.notifications = {
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		if (visible.photo()) view.photo.hide();
		view.notifications.title();
		header.setMode("config");
		view.notifications.content.init();
	},

	/** @returns {void} */
	title: function () {
		lychee.setMetaData(lychee.locale["NOTIFICATIONS"]);
	},

	/** @returns {void} */
	clearContent: function () {
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {
		/** @returns {void} */
		init: function () {
			view.notifications.clearContent();

			const html = `
				<div class="setting_line">
					<p>${lychee.locale["USER_EMAIL_INSTRUCTION"]}</p>
				</div><div class="setLogin">
					<p id="UserUpdate">
						${lychee.locale["ENTER_EMAIL"]}
						<input
							name="email" class="text" type="text"
							placeholder="email@example.com"
							value="${notifications.json && notifications.json.email ? notifications.json.email : ""}"
						>
					</p>
					<div class="basicModal__buttons">
						<a id="UserUpdate_button" class="basicModal__button">${lychee.locale["SAVE"]}</a>
					</div>
				</div>`;

			$(".settings_view").append(html);
			settings.bind("#UserUpdate_button", "#UserUpdate", notifications.update);
		},
	},
};

view.users = {
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		if (visible.photo()) view.photo.hide();
		view.users.title();
		header.setMode("config");
		view.users.content.init();
	},

	/** @returns {void} */
	title: function () {
		lychee.setMetaData(lychee.locale["USERS"]);
	},

	/** @returns {void} */
	clearContent: function () {
		lychee.content.html('<div class="users_view"></div>');
	},

	content: {
		/** @returns {void} */
		init: function () {
			view.users.clearContent();

			if (users.json.length === 0) {
				$(".users_view").append(
					'<div class="users_view_line" style="margin-bottom: 50px;"><p style="text-align: center">User list is empty!</p></div>'
				);
			}

			let html = `
				<div class="users_view_line"><p>
					<span class="text">${lychee.locale["USERNAME"]}</span>
					<span class="text">${lychee.locale["NEW_PASSWORD"]}</span>
					<span class="text_icon" title="${lychee.locale["ALLOW_UPLOADS"]}">
						${build.iconic("data-transfer-upload")}
					</span>
					<span class="text_icon" title="${lychee.locale["ALLOW_USER_SELF_EDIT"]}">
						${build.iconic("lock-unlocked")}
					</span>
				</p></div>`;

			$(".users_view").append(html);

			users.json.forEach(function (_user) {
				$(".users_view").append(build.user(_user));
				// TODO: Instead of binding an event handler to each input element it would be much more efficient, to bind a single event handler to the common parent view, let the event bubble up the DOM tree and use the `originalElement` property of the event to get the input element which caused the event.
				settings.bind("#UserUpdate" + _user.id, "#UserData" + _user.id, users.update);
				settings.bind("#UserDelete" + _user.id, "#UserData" + _user.id, users.delete);
				if (_user.may_upload) {
					$("#UserData" + _user.id + ' .choice input[name="may_upload"]').click();
				}
				if (_user.may_edit_own_settings) {
					$("#UserData" + _user.id + ' .choice input[name="may_edit_own_settings"]').click();
				}
			});

			html = `
				<div class="users_view_line" ${users.json.length === 0 ? 'style="padding-top: 0px;"' : ""}>
					<p id="UserCreate">
						<input class="text" name="username" type="text" value="" placeholder="${lychee.locale["LOGIN_USERNAME"]}" />
						<input class="text" name="password" type="text" placeholder="${lychee.locale["LOGIN_PASSWORD"]}" />
						<span class="choice" title="${lychee.locale["ALLOW_UPLOADS"]}">
							<label>
								<input type="checkbox" name="may_upload" />
								<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
							</label>
						</span>
						<span class="choice" title="${lychee.locale["ALLOW_USER_SELF_EDIT"]}">
							<label>
								<input type="checkbox" name="may_edit_own_settings" />
								<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>
							</label>
						</span>
					</p>
					<a id="UserCreate_button"  class="basicModal__button basicModal__button_CREATE">${lychee.locale["CREATE"]}</a>
				</div>`;
			$(".users_view").append(html);
			settings.bind("#UserCreate_button", "#UserCreate", users.create);
		},
	},
};

view.sharing = {
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		if (visible.photo()) view.photo.hide();
		view.sharing.title();
		header.setMode("config");
		view.sharing.content.init();
	},

	/** @returns {void} */
	title: function () {
		lychee.setMetaData(lychee.locale["SHARING"]);
	},

	/** @returns {void} */
	clearContent: function () {
		lychee.content.html('<div class="sharing_view"></div>');
	},

	content: {
		/** @returns {void} */
		init: function () {
			view.sharing.clearContent();

			if (sharing.json.shared.length === 0) {
				$(".sharing_view").append(
					'<div class="sharing_view_line" style="margin-bottom: 50px;"><p style="text-align: center">Sharing list is empty!</p></div>'
				);
			}

			const albumOptions = sharing.json.albums.reduce(function (acc, _album) {
				return acc + lychee.html`<option value="${_album.id}">$${_album.title}</option>`;
			}, "");

			const userOptions = sharing.json.users.reduce(function (acc, _user) {
				return acc + lychee.html`<option value="${_user.id}">$${_user.username}</option>`;
			}, "");

			const sharingOptions = sharing.json.shared.reduce(function (acc, _shareInfo) {
				return (
					acc +
					lychee.html`
						<p>
							<span class="text">$${_shareInfo.title}</span>
							<span class="text">$${_shareInfo.username}</span>
							<span class="choice">
								<label>
									<input type="checkbox" name="remove_id" value="${_shareInfo.id}"/>
									<span class="checkbox">
										<svg class="iconic "><use xlink:href="#check"></use></svg>
									</span>
								</label>
							</span>
						</p>`
				);
			}, "");

			let html = `
				<div class="sharing_view_line"><p>Share</p></div>
				<div class="sharing_view_line">
					<div class="col-xs-5">
						<select name="from" id="albums_list" class="form-control select" size="13" multiple="multiple">
							${albumOptions}
						</select>
					</div>
					<div class="col-xs-2">
						<!--<button type="button" id="albums_list_undo" class="btn btn-primary btn-block">undo</button>-->
						<button type="button" id="albums_list_rightAll" class="btn btn-default btn-block blue">
							${build.iconic("media-skip-forward")}
						</button>
						<button type="button" id="albums_list_rightSelected" class="btn btn-default btn-block blue">
							${build.iconic("chevron-right")}
						</button>
						<button type="button" id="albums_list_leftSelected" class="btn btn-default btn-block grey">
							${build.iconic("chevron-left")}
						</button>
						<button type="button" id="albums_list_leftAll" class="btn btn-default btn-block grey">
							${build.iconic("media-skip-backward")}
						</button>
						<!--<button type="button" id="albums_list_redo" class="btn btn-warning btn-block">redo</button>-->
					</div>
					<div class="col-xs-5">
						<select name="to" id="albums_list_to" class="form-control select" size="13" multiple="multiple"></select>
					</div>
				</div>
				<div class="sharing_view_line"><p class="with">with</p></div>
				<div class="sharing_view_line">
					<div class="col-xs-5">
						<select name="from" id="user_list" class="form-control select" size="13" multiple="multiple">
							${userOptions}
						</select>
					</div>
					<div class="col-xs-2">
						<!--<button type="button" id="user_list_undo" class="btn btn-primary btn-block">undo</button>-->
						<button type="button" id="user_list_rightAll" class="btn btn-default btn-block blue">
							${build.iconic("media-skip-forward")}
						</button>
						<button type="button" id="user_list_rightSelected" class="btn btn-default btn-block blue">
							${build.iconic("chevron-right")}
						</button>
						<button type="button" id="user_list_leftSelected" class="btn btn-default btn-block grey">
							${build.iconic("chevron-left")}
						</button>
						<button type="button" id="user_list_leftAll" class="btn btn-default btn-block grey">
							${build.iconic("media-skip-backward")}
						</button>
						<!--<button type="button" id="user_list_redo" class="btn btn-warning btn-block">redo</button>-->
					</div>
					<div class="col-xs-5">
						<select name="to" id="user_list_to" class="form-control select" size="13" multiple="multiple"></select>
					</div>
				</div>
				<div class="sharing_view_line"><a id="Share_button" class="basicModal__button">${lychee.locale["SHARE"]}</a></div>
				<div class="sharing_view_line">
					${sharingOptions}
				</div>`;

			if (sharing.json.shared.length !== 0) {
				html += `<div class="sharing_view_line"><a id="Remove_button"  class="basicModal__button">${lychee.locale["REMOVE"]}</a></div>`;
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

view.diagnostics = {
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		if (visible.photo()) view.photo.hide();
		view.diagnostics.title();
		header.setMode("config");
		view.diagnostics.content.init();
	},

	/** @returns {void} */
	title: function () {
		lychee.setMetaData(lychee.locale["DIAGNOSTICS"]);
	},

	/**
	 * @param {number} update - The update status: `0`: not on master branch;
	 *                          `1`: up-to-date; `2`: not up-to-date;
	 *                          `3`: requires migration
	 * @returns {void}
	 */
	clearContent: function (update) {
		let html = "";

		if (update === 2) {
			html = view.diagnostics.button("", lychee.locale["UPDATE_AVAILABLE"]);
		} else if (update === 3) {
			html = view.diagnostics.button("", lychee.locale["MIGRATION_AVAILABLE"]);
		} else if (update > 0) {
			html = view.diagnostics.button("Check_", lychee.locale["CHECK_FOR_UPDATE"]);
		}

		html += '<pre class="logs_diagnostics_view"></pre>';
		lychee.content.html(html);
	},

	/**
	 * @param {string} type
	 * @param {string} locale
	 * @returns {string} - HTML
	 */
	button: function (type, locale) {
		return `
			<div class="clear_logs_update">
				<a id="${type}Update_Lychee" class="basicModal__button">${locale}</a>
			</div>`;
	},

	/** @returns {string} */
	bind: function () {
		$("#Update_Lychee").on("click", view.diagnostics.call_apply_update);
		$("#Check_Update_Lychee").on("click", view.diagnostics.call_check_update);
	},

	content: {
		/** @returns {void} */
		init: function () {
			view.diagnostics.clearContent(0);
			api.post("Diagnostics::get", {}, view.diagnostics.content.parseResponse);
		},

		/**
		 * @param {DiagnosticInfo} data
		 * @returns {void}
		 */
		parseResponse: function (data) {
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
		},

		/**
		 * @param {string} id
		 * @param {string} title
		 * @param {string[]} arr
		 * @returns {string} - HTML
		 */
		block: function (id, title, arr) {
			let html = "";
			html += '<pre id="content_diag_' + id + '">\n\n\n\n';
			html += "    " + title + "\n";
			html += "    ".padEnd(title.length, "-") + "\n";
			html += arr.reduce((acc, line) => acc + "    " + line + "\n", "");
			html += "</pre>\n";
			return html;
		},
	},

	/** @returns {void} */
	call_check_update: function () {
		api.post(
			"Update::check",
			{},
			/** @param {{updateStatus: string}} data */
			function (data) {
				loadingBar.show("success", data.updateStatus);
				$("#Check_Update_Lychee").remove();
			}
		);
	},

	/** @returns {void} */
	call_apply_update: function () {
		api.post(
			"Update::apply",
			{},
			/** @param {{updateMsgs: string[]}} data */
			function (data) {
				const html = view.preify(data.updateMsgs, "");
				$("#Update_Lychee").remove();
				$(html).prependTo(".logs_diagnostics_view");
			}
		);
	},

	/** @returns {void} */
	call_get_size: function () {
		api.post(
			"Diagnostics::getSize",
			{},
			/** @param {string[]} data */
			function (data) {
				const html = view.preify(data, "");
				$("#Get_Size_Lychee").remove();
				$(html).appendTo("#content_diag_sys");
			}
		);
	},
};

view.update = {
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		if (visible.photo()) view.photo.hide();
		view.update.title();
		header.setMode("config");
		view.update.content.init();
	},

	/** @returns {void} */
	title: function () {
		lychee.setMetaData(lychee.locale["UPDATE"]);
	},

	/** @returns {void} */
	clearContent: function () {
		const html = '<pre class="logs_diagnostics_view"></pre>';
		lychee.content.html(html);
	},

	content: {
		init: function () {
			view.update.clearContent();

			// code duplicate
			api.post(
				"Update::apply",
				{},
				/** @param {{updateMsgs: string[]}} data */
				function (data) {
					const html = view.preify(data.updateMsgs, "");
					lychee.content.html(html);
				}
			);
		},
	},
};

/**
 * @param {string[]} data
 * @param {string} cssClass
 * @returns {string} - HTML which wraps `data` into a `<pre>`-tag
 */
view.preify = function (data, cssClass) {
	return data.reduce((acc, line) => acc + "    " + line + "\n", '<pre class="' + cssClass + '">') + "</pre>";
};

view.u2f = {
	/** @returns {void} */
	init: function () {
		multiselect.clearSelection();

		if (visible.photo()) view.photo.hide();
		view.u2f.title();
		header.setMode("config");
		view.u2f.content.init();
	},

	/** @returns {void} */
	title: function () {
		lychee.setMetaData(lychee.locale["U2F"]);
	},

	/** @returns {void} */
	clearContent: function () {
		lychee.content.html('<div class="u2f_view"></div>');
	},

	content: {
		/** @returns {void} */
		init: function () {
			view.u2f.clearContent();

			if (u2f.json.length === 0) {
				$(".u2f_view").append('<div class="u2f_view_line"><p class="single">Credentials list is empty!</p></div>');
			} else {
				const html = `
					<div class="u2f_view_line"><p><span class="text">
						${lychee.locale["U2F_CREDENTIALS"]}
					</span></p></div>`;

				$(".u2f_view").append(html);

				u2f.json.forEach(function (credential) {
					// TODO: Don't query the DOM for the same element in each loop iteration
					$(".u2f_view").append(build.u2f(credential));
					settings.bind("#CredentialDelete" + credential.id, "#CredentialData" + credential.id, u2f.delete);
				});
			}

			const html = `
				<div class="u2f_view_line">
					<a id="RegisterU2FButton"  class="basicModal__button basicModal__button_CREATE">
						${lychee.locale["U2F_REGISTER_KEY"]}
					</a>
				</div>`;
			$(".u2f_view").append(html);
			$("#RegisterU2FButton").on("click", u2f.register);
		},
	},
};
