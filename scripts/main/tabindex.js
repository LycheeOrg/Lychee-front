/**
 * @description Helper class to manage tabindex
 */

const tabindex = {
	offset_for_header: 100,
	next_tab_index: 100,
};

/**
 * @param {jQuery} elem
 * @returns {void}
 */
tabindex.saveSettings = function (elem) {
	if (!lychee.enable_tabindex) return;

	// Todo: Make shorter notation
	// Get all elements which have a tabindex
	// TODO @Hallenser: What did you intended by the TODO above? It seems as if the jQuery selector is already as short as possible?
	const tmp = elem.find("[tabindex]");

	// iterate over all elements and set tabindex to stored value (i.e. make is not focusable)
	tmp.each(
		/**
		 * @param {number} i - the index
		 * @param {Element} e - the HTML element
		 * @this {Element} - identical to `e`
		 */
		function (i, e) {
			// TODO: shorter notation
			// TODO @Hallenser: What do you intended by the TODO `short notation`? Moreover: Why do we use `this` and `e`? They refer to the identical instance of a HTML element.
			const a = $(e).attr("tabindex");
			$(this).data("tabindex-saved", a);
		}
	);
};

tabindex.restoreSettings = function (elem) {
	if (!lychee.enable_tabindex) return;

	// Todo: Make shorter notation
	// Get all elements which have a tabindex
	// TODO @Hallenser: What did you intended by the TODO above? It seems as if the jQuery selector is already as short as possible?
	const tmp = $(elem).find("[tabindex]");

	// iterate over all elements and set tabindex to stored value (i.e. make is not focussable)
	tmp.each(
		/**
		 * @param {number} i - the index
		 * @param {Element} e - the HTML element
		 * @this {Element} - identical to `e`
		 */
		function (i, e) {
			// TODO: shorter notation
			// TODO @Hallenser: What do you intended by the TODO `short notation`? Moreover: Why do we use `this` and `e`? They refer to the identical instance of a HTML element.
			const a = $(e).data("tabindex-saved");
			$(e).attr("tabindex", a);
		}
	);
};

/**
 * @param {jQuery} elem
 * @param {boolean} [saveFocusElement=false]
 * @returns {void}
 */
tabindex.makeUnfocusable = function (elem, saveFocusElement = false) {
	if (!lychee.enable_tabindex) return;

	// Todo: Make shorter notation
	// Get all elements which have a tabindex
	const tmp = elem.find("[tabindex]");

	// iterate over all elements and set tabindex to -1 (i.e. make is not focussable)
	tmp.each(
		/**
		 * @param {number} i - the index
		 * @param {Element} e - the HTML element
		 */
		function (i, e) {
			$(e).attr("tabindex", "-1");
			// Save which element had focus before we make it unfocusable
			if (saveFocusElement && $(e).is(":focus")) {
				$(e).data("tabindex-focus", true);
				// Remove focus
				$(e).blur();
			}
		}
	);

	// Disable input fields
	elem.find("input").attr("disabled", "disabled");
};

/**
 * @param {jQuery} elem
 * @param {boolean} [restoreFocusElement=false]
 * @returns {void}
 */
tabindex.makeFocusable = function (elem, restoreFocusElement = false) {
	if (!lychee.enable_tabindex) return;

	// Todo: Make shorter notation
	// Get all elements which have a tabindex
	const tmp = elem.find("[data-tabindex]");

	// iterate over all elements and set tabindex to stored value (i.e. make is not focusable)
	tmp.each(
		/**
		 * @param {number} i
		 * @param {Element} e
		 */
		function (i, e) {
			$(e).attr("tabindex", $(e).data("tabindex"));
			// restore focus element if wanted
			if (restoreFocusElement) {
				if ($(e).data("tabindex-focus") && lychee.active_focus_on_page_load) {
					$(e).focus();
					$(e).removeData("tabindex-focus");
				}
			}
		}
	);

	// Enable input fields
	elem.find("input").removeAttr("disabled");
};

/**
 * @returns {number}
 */
tabindex.get_next_tab_index = function () {
	tabindex.next_tab_index = tabindex.next_tab_index + 1;

	return tabindex.next_tab_index - 1;
};

/**
 * @returns {void}
 */
tabindex.reset = function () {
	tabindex.next_tab_index = tabindex.offset_for_header;
};
