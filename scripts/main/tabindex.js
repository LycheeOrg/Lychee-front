/**
 * @description Helper class to manage tabindex
 */

let tabindex = {

	offset_for_header : 100,
	next_tab_index : 100

};

tabindex.saveSettings = function(elem) {
	// Todo: Make shorter noation
	// Get all elements which have a tabindex
	tmp = $(elem).find("[tabindex]");

	// iterate over all elements and set tabindex to stored value (i.e. make is not focussable)
	tmp.each(function(i, e) {
		// TODO: shorter notation
		a = $(e).attr("tabindex");
		$(this).data("tabindex-saved", a);
	});
}

tabindex.restoreSettings = function(elem) {

	if(!lychee.enable_tabindex) return;

	// Todo: Make shorter noation
	// Get all elements which have a tabindex
	tmp = $(elem).find("[tabindex]");

	// iterate over all elements and set tabindex to stored value (i.e. make is not focussable)
	tmp.each(function(i, e) {
		// TODO: shorter notation
		a = $(e).data("tabindex-saved");
		$(e).attr("tabindex", a);
	});
}

tabindex.makeUnfocusable = function(elem, saveFocusElement = false) {

	// Todo: Make shorter noation
	// Get all elements which have a tabindex
	tmp = $(elem).find("[tabindex]");

	// iterate over all elements and set tabindex to -1 (i.e. make is not focussable)
	tmp.each(function(i, e) {
		$(e).attr("tabindex", "-1");
		// Save which element had focus before we make it unfocusable
		if (saveFocusElement && $(e).is(":focus")) {
			$(e).data("tabindex-focus", true);
			// Remove focus
			$(e).blur();
		}
	});

	// Disable input fields
	$(elem).find("input").attr("disabled","disabled");

};

tabindex.makeFocusable = function(elem, restoreFocusElement = false) {

	if(!lychee.enable_tabindex) return;

	// Todo: Make shorter noation
	// Get all elements which have a tabindex
	tmp = $(elem).find("[data-tabindex]");

	// iterate over all elements and set tabindex to stored value (i.e. make is not focussable)
	tmp.each(function(i, e) {
		$(e).attr("tabindex", $(e).data("tabindex"));
		// restore focus elemente if wanted
		if(restoreFocusElement) {
			if($(e).data("tabindex-focus") && lychee.active_focus_on_page_load) {
				$(e).focus();
				$(e).removeData("tabindex-focus");
			}
		}
	});

	// Enable input fields
	$(elem).find("input").removeAttr("disabled");
};

tabindex.get_next_tab_index = function() {

	tabindex.next_tab_index = tabindex.next_tab_index + 1;

	return (tabindex.next_tab_index-1);

};

tabindex.reset = function() {

	tabindex.next_tab_index = tabindex.offset_for_header;

	return;

};
