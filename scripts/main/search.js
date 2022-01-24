/**
 * @description Searches through your photos and albums.
 */

const search = {
	/** @type {?string} - a checksum of the search result to efficiently determine if the result has changed since the last time */
	checksum: null,
};

/**
 * @param {string} term
 * @returns {void}
 */
search.find = function (term) {
	if (term.trim() === "") return;

	/** @returns {void} */
	const timeoutHandler = function () {
		/** @param {SearchResult} data */
		const successHandler = function (data) {
			let html = "";
			let albumsData = "";
			let photosData = "";

			// TODO: My IDE complains that `albums.json.albums` must be an array of `Album` only, however `SearchResult` returns an array with a mix of `Album` and `TagAlbum`. This probably only works "accidentally", because we don't use any of the special properties of a `TagAlbum` or `Album` when we display search results. However, the problem could be easily solved, when we would split `TagAlbums` from `SmartAlbums` (also see comment on {@link Albums}).
			albums.json.albums = data.albums;
			// Build HTML for photo
			albums.json.albums.forEach(function (album) {
				albums.parse(album);
				albumsData += build.album(album);
			});

			album.json.photos = data.photos;
			// Build HTML for photo
			album.json.photos.forEach(function (photo) {
				photosData += build.photo(photo);
			});

			let albums_divider = lychee.locale["ALBUMS"];
			let photos_divider = lychee.locale["PHOTOS"];

			if (albumsData !== "") albums_divider += " (" + data.albums.length + ")";
			if (photosData !== "") {
				photos_divider += " (" + data.photos.length + ")";
				if (lychee.layout === "1") {
					photosData = '<div class="justified-layout">' + photosData + "</div>";
				} else if (lychee.layout === "2") {
					photosData = '<div class="unjustified-layout">' + photosData + "</div>";
				}
			}

			// 1. No albums and photos
			// 2. Only photos
			// 3. Only albums
			// 4. Albums and photos
			if (albumsData === "" && photosData === "") html = "error";
			else if (albumsData === "") html = build.divider(photos_divider) + photosData;
			else if (photosData === "") html = build.divider(albums_divider) + albumsData;
			else html = build.divider(albums_divider) + albumsData + build.divider(photos_divider) + photosData;

			// Only refresh view when search results are different
			if (search.checksum !== data.checksum) {
				$(".no_content").remove();

				lychee.animate($(".content"), "contentZoomOut");

				search.checksum = data.checksum;

				setTimeout(() => {
					if (visible.photo()) view.photo.hide();
					if (visible.sidebar()) sidebar.toggle(false);
					if (visible.mapview()) mapview.close();

					header.setMode("albums");

					if (html === "error") {
						lychee.content.html("");
						$("body").append(build.no_content("magnifying-glass"));
					} else {
						lychee.content.html(html);
						view.album.content.justify();
						lychee.animate(lychee.content, "contentZoomIn");
					}
					lychee.setTitle(lychee.locale["SEARCH_RESULTS"], false);

					$(window).scrollTop(0);
				}, 300);
			}
		};

		if (header.dom(".header__search").val().length !== 0) {
			api.post("Search::run", { term }, successHandler);
		} else {
			search.reset();
		}
	};

	clearTimeout($(window).data("timeout"));
	$(window).data("timeout", setTimeout(timeoutHandler, 250));
};

search.reset = function () {
	header.dom(".header__search").val("");
	$(".no_content").remove();

	if (search.checksum != null) {
		// Trash data
		albums.json = null;
		album.json = null;
		photo.json = null;
		search.checksum = null;

		lychee.animate($(".divider"), "fadeOut");
		lychee.goto();
	}
};
