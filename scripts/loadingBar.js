/**
 * @description This module is used to show and hide the loading bar.
 */

loadingBar = {

	status : null,
	_dom   : $('#loading')

};

loadingBar.dom = function(selector) {

	if (selector==null || selector==='') return loadingBar._dom;
	return loadingBar._dom.find(selector)

};

loadingBar.show = function(status, errorText) {

	if (status==='error') {

		// Set status
		loadingBar.status = 'error';

		// Parse text
		if (errorText)  errorText = errorText.replace('<br>', '');
		if (!errorText) errorText = lychee.locale['ERROR_TEXT'];

		// Move header down
		if (visible.header()) header.dom().addClass('header--error');

		// Modify loading
		loadingBar.dom()
			.removeClass('loading uploading error success')
			.html(`<h1>` + lychee.locale['ERROR'] + `: <span>${ errorText }</span></h1>`)
			.addClass(status)
			.show();

		// Set timeout
		clearTimeout(loadingBar._timeout);
		loadingBar._timeout = setTimeout(() => loadingBar.hide(true), 3000);

		return true

	}

	if (status==='success') {
		// Set status
		loadingBar.status = 'success';

		// Parse text
		if (errorText)  errorText = errorText.replace('<br>', '');
		if (!errorText) errorText = lychee.locale['ERROR_TEXT'];

		// Move header down
		if (visible.header()) header.dom().addClass('header--error');

		// Modify loading
		loadingBar.dom()
			.removeClass('loading uploading error success')
			.html(`<h1>` + lychee.locale['SUCCESS'] + `: <span>${ errorText }</span></h1>`)
			.addClass(status)
			.show();

		// Set timeout
		clearTimeout(loadingBar._timeout);
		loadingBar._timeout = setTimeout(() => loadingBar.hide(true), 2000);

		return true

	}

	if (loadingBar.status===null) {

		// Set status
		loadingBar.status = lychee.locale['LOADING'];

		// Set timeout
		clearTimeout(loadingBar._timeout);
		loadingBar._timeout = setTimeout(() => {

			// Move header down
			if (visible.header()) header.dom().addClass('header--loading');

			// Modify loading
			loadingBar.dom()
				.removeClass('loading uploading error')
				.html('')
				.addClass('loading')
				.show()

		}, 1000);

		return true

	}

};

loadingBar.hide = function(force) {

	if ((loadingBar.status!=='error' && loadingBar.status!=='success' && loadingBar.status!=null) || force) {

		// Remove status
		loadingBar.status = null;

		// Move header up
		header.dom().removeClass('header--error header--loading');

		// Set timeout
		clearTimeout(loadingBar._timeout);
		setTimeout(() => loadingBar.dom().hide(), 300)

	}

};
