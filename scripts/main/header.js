/**
 * @description This module takes care of the header.
 */

header = {

	_dom: $('.header')

};

header.dom = function(selector) {

	if (selector==null || selector==='') return header._dom;
	return header._dom.find(selector)

};

header.bind = function() {

	// Event Name
	let eventName = lychee.getEventName();

	header.dom('.header__title').on(eventName, function(e) {

		if ($(this).hasClass('header__title--editable')===false) return false;

		if (visible.photo()) contextMenu.photoTitle(album.getID(), photo.getID(), e);
		else                 contextMenu.albumTitle(album.getID(), e)

	});

	header.dom('#button_share').on(eventName, function(e) {
		if (photo.json.public === '1' || photo.json.public === '2' || !album.isUploadable()) contextMenu.sharePhoto(photo.getID(), e);
		else                                                    photo.setPublic(photo.getID(), e)
	});

	header.dom('#button_share_album').on(eventName, function(e) {
		if (album.json.public === '1' || !album.isUploadable()) contextMenu.shareAlbum(album.getID(), e);
		else                         album.setPublic(album.getID(), true, e)
	});

	header.dom('#button_signin')      .on(eventName, lychee.loginDialog);
	header.dom('#button_settings')    .on(eventName, leftMenu.open);
	header.dom('#button_info_album')  .on(eventName, sidebar.toggle);
	header.dom('#button_info')        .on(eventName, sidebar.toggle);
	header.dom('.button_add')         .on(eventName, contextMenu.add);
	header.dom('#button_more')        .on(eventName, function(e) { contextMenu.photoMore(photo.getID(), e) });
	header.dom('#button_move_album')  .on(eventName, function(e) { contextMenu.move([ album.getID() ], e, album.setAlbum, 'ROOT', album.getParent() != '') });
	header.dom('#button_move')        .on(eventName, function(e) { contextMenu.move([ photo.getID() ], e, photo.setAlbum) });
	header.dom('.header__hostedwith') .on(eventName, function() { window.open(lychee.website) });
	header.dom('#button_trash_album') .on(eventName, function() { album.delete([ album.getID() ]) });
	header.dom('#button_trash')       .on(eventName, function() { photo.delete([ photo.getID() ]) });
	header.dom('#button_archive')     .on(eventName, function() { album.getArchive(album.getID()) });
	header.dom('#button_star')        .on(eventName, function() { photo.setStar([ photo.getID() ]) });
	header.dom('#button_back_home')   .on(eventName, function() {
		if (!album.json.parent_id) {
			lychee.goto();
		} else {
			lychee.goto(album.getParent());
		}
	});
	header.dom('#button_back')        .on(eventName, function() { lychee.goto(album.getID()) });
	header.dom('#button_fs_album_enter,#button_fs_enter').on(eventName, lychee.fullscreenEnter);
	header.dom('#button_fs_album_exit,#button_fs_exit').on(eventName, lychee.fullscreenExit).hide();

	header.dom('.header__search').on('keyup click', function() { search.find($(this).val()) });
	header.dom('.header__clear').on(eventName, function() {
		header.dom('.header__search').focus();
		search.reset()
	});

	header.bind_back();

	return true

};

header.bind_back = function () {

	// Event Name
	let eventName = lychee.getEventName();

	header.dom('.header__title').on(eventName, function () {
		if (lychee.landing_page_enable && visible.albums()) {
			window.location.href = '.'
		}
		else {
			return false;
		}

	});
};

header.show = function() {

	lychee.imageview.removeClass('full');
	header.dom().removeClass('header--hidden');

	return true

};

header.hide = function() {

	if (visible.photo() && !visible.sidebar() && !visible.contextMenu() && basicModal.visible()===false) {

		lychee.imageview.addClass('full');
		header.dom().addClass('header--hidden');

		return true

	}

	return false

};

header.setTitle = function(title = 'Untitled') {

	let $title = header.dom('.header__title');
	let html   = lychee.html`$${ title }${ build.iconic('caret-bottom') }`;

	$title.html(html);

	return true

};

header.setMode = function(mode) {

	if (mode==='albums' && lychee.publicMode===true) mode = 'public';

	switch (mode) {

		case 'public':

			header.dom().removeClass('header--view');
			header.dom('.header__toolbar--albums, .header__toolbar--album, .header__toolbar--photo').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--public').addClass('header__toolbar--visible');
			if (lychee.public_search) {
				$('.header__search, .header__clear', '.header__toolbar--public').show()
			} else {
				$('.header__search, .header__clear', '.header__toolbar--public').hide()
			}

			return true;

		case 'albums':

			header.dom().removeClass('header--view');
			header.dom('.header__toolbar--public, .header__toolbar--album, .header__toolbar--photo').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--albums').addClass('header__toolbar--visible');

			return true;

		case 'album':

			let albumID = album.getID();

			header.dom().removeClass('header--view');
			header.dom('.header__toolbar--public, .header__toolbar--albums, .header__toolbar--photo').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--album').addClass('header__toolbar--visible');

			// Hide download button when album empty or we are not allowed to
			// upload to it and it's not explicitly marked as downloadable.
			if (!album.json || album.json.photos === false || (!album.isUploadable() && album.json.downloadable === '0')) {
				$('#button_archive').hide();
			} else {
				$('#button_archive').show();
			}

			if (albumID==='s' || albumID==='f' || albumID==='r') {
				$('#button_info_album, #button_trash_album, #button_share_album, #button_move_album').hide();
				$('.button_add, .header__divider', '.header__toolbar--album').show()
			} else if (albumID==='0') {
				$('#button_info_album, #button_share_album, #button_move_album').hide();
				$('#button_trash_album, .button_add, .header__divider', '.header__toolbar--album').show()
			} else {
				$('#button_info_album, #button_share_album').show();
				if (album.isUploadable()) {
					$('#button_trash_album, #button_move_album, .button_add, .header__divider', '.header__toolbar--album').show();
					$('#button_share_album')
						.removeClass('button--share')
						.addClass('button--eye')
						.find('use')
						.attr('xlink:href', '#eye')
				} else {
					$('#button_trash_album, #button_move_album, .button_add, .header__divider', '.header__toolbar--album').hide();
					$('#button_share_album')
					.removeClass('button--eye')
					.addClass('button--share')
					.find('use')
					.attr('xlink:href', '#share')
				}
			}

			return true;

		case 'photo':

			header.dom().addClass('header--view');
			header.dom('.header__toolbar--public, .header__toolbar--albums, .header__toolbar--album').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--photo').addClass('header__toolbar--visible');
			if (album.isUploadable()) {
				$('#button_trash, #button_move, #button_star').show();
				$('#button_share')
					.removeClass('button--share')
					.addClass('button--eye')
					.find('use')
					.attr('xlink:href', '#eye')
			} else {
				$('#button_trash, #button_move, #button_star').hide();
				$('#button_share')
					.removeClass('button--eye')
					.addClass('button--share')
					.find('use')
					.attr('xlink:href', '#share')
			}

			// Hide More menu if empty (see contextMenu.photoMore)
			if (!lychee.full_photo && !album.isUploadable() && !(album.json && album.json.downloadable && album.json.downloadable === '1')) {
				$('#button_more').hide();
			}

			return true;

	}

	return false

};

// Note that the pull-down menu is now enabled not only for editable
// items but for all of public/albums/album/photo views, so 'editable' is a
// bit of a misnomer at this point...
header.setEditable = function(editable) {

	let $title = header.dom('.header__title');

	if (editable) $title.addClass('header__title--editable');
	else          $title.removeClass('header__title--editable');

	return true

};
