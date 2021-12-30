/**
 * @description This module is used to check if elements are visible or not.
 */

let visible = {};

/** @return {boolean} */
visible.albums = function () {
	return (
		!!header.dom(".header__toolbar--public").hasClass("header__toolbar--visible") ||
		!!header.dom(".header__toolbar--albums").hasClass("header__toolbar--visible")
	);
};

/** @return {boolean} */
visible.album = function () {
	return !!header.dom(".header__toolbar--album").hasClass("header__toolbar--visible");
};

/** @return {boolean} */
visible.photo = function () {
	return $("#imageview.fadeIn").length > 0;
};

/** @return {boolean} */
visible.mapview = function () {
	return $("#mapview.fadeIn").length > 0;
};

/** @return {boolean} */
visible.config = function () {
	return !!header.dom(".header__toolbar--config").hasClass("header__toolbar--visible");
};

/** @return {boolean} */
visible.search = function () {
	return search.hash != null;
};

/** @return {boolean} */
visible.sidebar = function () {
	return !!sidebar.dom().hasClass("active");
};

/** @return {boolean} */
visible.sidebarbutton = function () {
	return visible.photo() || (visible.album() && $("#button_info_album:visible").length > 0);
};

/** @return {boolean} */
visible.header = function () {
	return !header.dom().hasClass("header--hidden");
};

/** @return {boolean} */
visible.contextMenu = function () {
	return basicContext.visible();
};

/** @return {boolean} */
visible.multiselect = function () {
	return $("#multiselect").length > 0;
};

/** @return {boolean} */
visible.leftMenu = function () {
	return !!leftMenu.dom().hasClass("leftMenu__visible");
};
