/**
 * @description Helper class to manage tabindex
 */

let tabindex = {

	offset_for_header : 20,
	next_tab_index : 20

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

tabindex.makeUnfocusable = function(elem) {

	// Todo: Make shorter noation
	// Get all elements which have a tabindex
	tmp = $(elem).find("[tabindex]");

	// iterate over all elements and set tabindex to -1 (i.e. make is not focussable)
	tmp.each(function(i, e) {
		$(e).attr("tabindex", "-1");
	});

};

tabindex.makeFocusable = function(elem) {

	// Todo: Make shorter noation
	// Get all elements which have a tabindex
	tmp = $(elem).find("[data-tabindex]");

	// iterate over all elements and set tabindex to stored value (i.e. make is not focussable)
	tmp.each(function(i, e) {
		$(e).attr("tabindex", $(e).data("tabindex"));
	});

};

tabindex.get_next_tab_index = function() {

	tabindex.next_tab_index = tabindex.next_tab_index + 1;

	return (tabindex.next_tab_index-1);

};

tabindex.reset = function() {

	tabindex.next_tab_index = tabindex.offset_for_header;

	return;

};

tabindex.get_right_tab_index = function() {

	// Get current focussed element
	focus_elem = $(':focus');

	right_tab_idx = 0;

	var tab_idx = [];
	// create array of all tab index
	$("[tabindex]").each (function (i, e) {
		if($(e).is(":visible")) {
			tab_idx.push(parseInt($(e).attr('tabindex')));
		}
	});

	// sort it
	tab_idx.sort((a,b) => a-b);

	if (focus_elem !== 0 ){
		current_tab_idx = parseInt($(':focus').attr('tabindex'));

		// Get index of current_tab_idx;
		array_idx_current_tab_idx = tab_idx.indexOf(current_tab_idx);

		if (array_idx_current_tab_idx == tab_idx.length-1) {
			// focus has been on last element -> select first one
			right_tab_idx = tab_idx[0];
		} else {
			// Next one
			right_tab_idx = tab_idx[array_idx_current_tab_idx + 1];
		}

	} else {
		// there has been no focus  -> select first one
		right_tab_idx = tab_idx[0];
	}

	return right_tab_idx;

};

tabindex.get_left_tab_index = function() {

	// Get current focussed element
	focus_elem = $(':focus');

	right_tab_idx = 0;

	var tab_idx = [];
	// create array of all tab index
	$("[tabindex]").each (function (i, e) {
		if($(e).is(":visible")) {
			tab_idx.push(parseInt($(e).attr('tabindex')));
		}
	});

	// sort it
	tab_idx.sort((a,b) => a-b);

	if (focus_elem !== 0 ){
		current_tab_idx = parseInt($(':focus').attr('tabindex'));

		// Get index of current_tab_idx;
		array_idx_current_tab_idx = tab_idx.indexOf(current_tab_idx);

		if (array_idx_current_tab_idx == 0) {
			// focus has been on first element -> select last one
			right_tab_idx = tab_idx[tab_idx.length-1];
		} else {
			// Previous one
			right_tab_idx = tab_idx[array_idx_current_tab_idx - 1];
		}

	} else {
		// there has been no focus  -> select last one
		right_tab_idx = tab_idx[tab_idx.length-1];
	}

	return right_tab_idx;

};
