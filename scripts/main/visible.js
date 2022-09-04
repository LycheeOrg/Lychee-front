/**
 * @description This module is used to check if elements are visible or not.
 */

const visible = {};

/** @returns {boolean} */
visible.albums = function () {
	return (
		!!header.dom(".header__toolbar--public").hasClass("header__toolbar--visible") ||
		!!header.dom(".header__toolbar--albums").hasClass("header__toolbar--visible")
	);
};

/** @returns {boolean} */
visible.album = function () {
	return !!header.dom(".header__toolbar--album").hasClass("header__toolbar--visible");
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
	return !!header.dom(".header__toolbar--config").hasClass("header__toolbar--visible");
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
	return !header.dom().hasClass("header--hidden");
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
	return !!leftMenu.dom().hasClass("leftMenu__visible");
};
