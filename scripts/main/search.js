/**
 * @description Searches through your photos and albums.
 */

/**
 * The ID of the search album
 *
 * Constant `'search'`.
 *
 * @type {string}
 */
const SearchAlbumIDPrefix = "search";

/**
 * @typedef SearchAlbum
 *
 * A "virtual" album which holds the search results in a form which is
 * mostly compatible with the other album types, i.e.
 * {@link Album}, {@link TagAlbum} and {@link SmartAlbum}.
 *
 * @property {string}  id                       - always equals `SearchAlbumIDPrefix/search-term`
 * @property {string}  title                    - always equals `lychee.locale["SEARCH_RESULTS"]`
 * @property {Photo[]} photos                   - the found photos
 * @property {Album[]} albums                   - the found albums
 * @property {TagAlbum[]} tag_albums            - the found tag albums
 * @property {?Thumb}  thumb                    - always `null`; just a dummy entry, because all other albums {@link Album}, {@link TagAlbum}, {@link SmartAlbum} have it
 * @property {boolean} is_public                - always `false`; just a dummy entry, because all other albums {@link Album}, {@link TagAlbum}, {@link SmartAlbum} have it
 * @property {boolean} is_downloadable          - always `false`; just a dummy entry, because all other albums {@link Album}, {@link TagAlbum}, {@link SmartAlbum} have it
 * @property {boolean} is_share_button_visible  - always `false`; just a dummy entry, because all other albums {@link Album}, {@link TagAlbum}, {@link SmartAlbum} have it
 */

/**
 * The search object
 */
const search = {
	/** @type {?SearchResult} */
	json: null,
};

/**
 * @param {string} term
 * @returns {void}
 */
search.find = function (term) {
	if (term.trim() === "") return;

	/** @param {SearchResult} data */
	const successHandler = function (data) {
		if (search.json && search.json.checksum === data.checksum) {
			// If search result is identical to previous result, just
			// update the album id with the new search term and bail out.
			album.json.id = SearchAlbumIDPrefix + "/" + term;
			return;
		}

		search.json = data;

		// Create and assign a `SearchAlbum`
		album.json = {
			id: SearchAlbumIDPrefix + "/" + term,
			title: lychee.locale["SEARCH_RESULTS"],
			photos: search.json.photos,
			albums: search.json.albums,
			tag_albums: search.json.tag_albums,
			thumb: null,
			is_public: false,
			is_downloadable: false,
			is_share_button_visible: false,
		};

		let albumsData = "";
		let photosData = "";

		// Build HTML for album
		search.json.tag_albums.forEach(function (album) {
			albums.parse(album);
			albumsData += build.album(album);
		});
		search.json.albums.forEach(function (album) {
			albums.parse(album);
			albumsData += build.album(album);
		});

		// Build HTML for photo
		search.json.photos.forEach(function (photo) {
			photosData += build.photo(photo);
		});

		let albums_divider = lychee.locale["ALBUMS"];
		let photos_divider = lychee.locale["PHOTOS"];

		if (albumsData !== "") albums_divider += " (" + (search.json.tag_albums.length + search.json.albums.length) + ")";
		if (photosData !== "") {
			photos_divider += " (" + search.json.photos.length + ")";
			if (lychee.layout === 1) {
				photosData = '<div class="justified-layout">' + photosData + "</div>";
			} else if (lychee.layout === 2) {
				photosData = '<div class="unjustified-layout">' + photosData + "</div>";
			}
		}

		// 1. No albums and photos
		// 2. Only photos
		// 3. Only albums
		// 4. Albums and photos
		const html =
			albumsData === "" && photosData === ""
				? ""
				: albumsData === ""
				? build.divider(photos_divider) + photosData
				: photosData === ""
				? build.divider(albums_divider) + albumsData
				: build.divider(albums_divider) + albumsData + build.divider(photos_divider) + photosData;

		$(".no_content").remove();
		lychee.animate(lychee.content, "contentZoomOut");

		setTimeout(() => {
			if (visible.photo()) view.photo.hide();
			if (visible.sidebar()) sidebar.toggle(false);
			if (visible.mapview()) mapview.close();

			header.setMode("albums");

			if (html === "") {
				lychee.content.html("");
				$("body").append(build.no_content("magnifying-glass"));
			} else {
				lychee.content.html(html);
				// Here we exploit the layout method of an album although
				// the search result is not a proper album.
				// It would be much better to have a component like
				// `view.photos` (note the plural form) which takes care of
				// all photo listings independent of the surrounding "thing"
				// (i.e. regular album, tag album, search result)
				setTimeout(function () {
					view.album.content.justify();
					lychee.animate(lychee.content, "contentZoomIn");
					$(window).scrollTop(0);
				}, 0);
			}
			lychee.setMetaData(lychee.locale["SEARCH_RESULTS"]);
		}, 300);
	};

	/** @returns {void} */
	const timeoutHandler = function () {
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

	if (search.json !== null) {
		// Trash data
		album.json = null;
		photo.json = null;
		search.json = null;

		lychee.animate($(".divider"), "fadeOut");
		lychee.goto();
	}
};
