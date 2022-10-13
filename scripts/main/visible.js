/**
 * @description This module is used to check if elements are visible or not.
 */

const visible = {};

/**
 * TODO: Whether the albums view is visible or not should not be determined based on the visibility of a toolbar, especially as this does not work for the photo view in full screen mode which makes this approach inconsistent.
 * @returns {boolean}
 */
visible.albums = function () {
	return !!header.dom("#lychee_toolbar_public").hasClass("visible") || !!header.dom("#lychee_toolbar_albums").hasClass("visible");
};

/** @returns {boolean} */
visible.album = function () {
	return !!header.dom("#lychee_toolbar_album").hasClass("visible");
};

/** @returns {boolean} */
visible.photo = function () {
	return $("#imageview.fadeIn").length > 0;
};

/** @returns {boolean} */
visible.mapview = function () {
	return $("#mapview.fadeIn").length > 0;
};

/** @returns {boolean} */
visible.config = function () {
	return !!header.dom("#lychee_toolbar_config").hasClass("visible");
};

/** @returns {boolean} */
visible.search = function () {
	return visible.albums() && album.json !== null && album.isSearchID(album.json.id);
};

/** @returns {boolean} */
visible.sidebar = function () {
	return !!sidebar.dom().hasClass("active");
};

/** @returns {boolean} */
visible.sidebarbutton = function () {
	return visible.photo() || (visible.album() && $("#button_info_album:visible").length > 0);
};

/** @returns {boolean} */
visible.header = function () {
	return !header.dom().hasClass("hidden");
};

/** @returns {boolean} */
visible.contextMenu = function () {
	return basicContext.visible();
};

/** @returns {boolean} */
visible.multiselect = function () {
	return $("#multiselect").length > 0;
};

/** @returns {boolean} */
visible.leftMenu = function () {
	return !!leftMenu.dom().hasClass("visible");
};
