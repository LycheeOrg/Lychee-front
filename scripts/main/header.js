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

	header.dom('#button_visibility').on(eventName, function(e) {
		photo.setPublic(photo.getID(), e)
	});
	header.dom('#button_share').on(eventName, function(e) {
		contextMenu.sharePhoto(photo.getID(), e)
	});

	header.dom('#button_visibility_album').on(eventName, function(e) {
		album.setPublic(album.getID(), e)
	});
	header.dom('#button_share_album').on(eventName, function(e) {
		contextMenu.shareAlbum(album.getID(), e)
	});

	header.dom('#button_signin')      .on(eventName, lychee.loginDialog);
	header.dom('#button_settings')    .on(eventName, leftMenu.open);
	header.dom('#button_info_album')  .on(eventName, sidebar.toggle);
	header.dom('#button_info')        .on(eventName, sidebar.toggle);
	header.dom('.button--map-albums') .on(eventName, function() { lychee.gotoMap() });
	header.dom('#button_map_album')   .on(eventName, function() { lychee.gotoMap(album.getID()) });
	header.dom('#button_map')         .on(eventName, function() { lychee.gotoMap(album.getID()) });
	header.dom('.button_add')         .on(eventName, contextMenu.add);
	header.dom('#button_more')        .on(eventName, function(e) { contextMenu.photoMore(photo.getID(), e) });
	header.dom('#button_move_album')  .on(eventName, function(e) { contextMenu.move([ album.getID() ], e, album.setAlbum, 'ROOT', album.getParent() != '') });
	header.dom('#button_move')        .on(eventName, function(e) { contextMenu.move([ photo.getID() ], e, photo.setAlbum) });
	header.dom('.header__hostedwith') .on(eventName, function() { window.open(lychee.website) });
	header.dom('#button_trash_album') .on(eventName, function() { album.delete([ album.getID() ]) });
	header.dom('#button_trash')       .on(eventName, function() { photo.delete([ photo.getID() ]) });
	header.dom('#button_archive')     .on(eventName, function() { album.getArchive([ album.getID() ]) });
	header.dom('#button_star')        .on(eventName, function() { photo.setStar([ photo.getID() ]) });
	header.dom('#button_back_home')   .on(eventName, function() {
		if (!album.json.parent_id) {
			lychee.goto();
		} else {
			lychee.goto(album.getParent());
		}
	});
	header.dom('#button_back')        .on(eventName, function() { lychee.goto(album.getID()) });
	header.dom('#button_back_map')    .on(eventName, function() { lychee.goto(album.getID()) });
	header.dom('#button_fs_album_enter,#button_fs_enter').on(eventName, lychee.fullscreenEnter);
	header.dom('#button_fs_album_exit,#button_fs_exit').on(eventName, lychee.fullscreenExit).hide();

	header.dom('.header__search').on('keyup click', function() { lychee.goto('search/' + encodeURIComponent($(this).val())) });
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
			header.dom('.header__toolbar--albums, .header__toolbar--album, .header__toolbar--photo, .header__toolbar--map').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--public').addClass('header__toolbar--visible');
			if (lychee.public_search) {
				$('.header__search, .header__clear', '.header__toolbar--public').show()
			} else {
				$('.header__search, .header__clear', '.header__toolbar--public').hide()
			}

			// Set icon in Public mode
			if (lychee.map_display_public) {
				$('.button--map-albums', '.header__toolbar--public').show();
			} else {
				$('.button--map-albums', '.header__toolbar--public').hide();
			}

			return true;

		case 'albums':

			header.dom().removeClass('header--view');
			header.dom('.header__toolbar--public, .header__toolbar--album, .header__toolbar--photo, .header__toolbar--map').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--albums').addClass('header__toolbar--visible');

			// If map is disabled, we should hide the icon
			if (lychee.map_display) {
				$('.button--map-albums', '.header__toolbar--albums').show();

			} else {
				$('.button--map-albums', '.header__toolbar--albums').hide();
			}

			return true;

		case 'album':

			let albumID = album.getID();

			header.dom().removeClass('header--view');
			header.dom('.header__toolbar--public, .header__toolbar--albums, .header__toolbar--photo, .header__toolbar--map').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--album').addClass('header__toolbar--visible');

			// Hide download button when album empty or we are not allowed to
			// upload to it and it's not explicitly marked as downloadable.
			if (!album.json || album.json.photos === false || (!album.isUploadable() && album.json.downloadable === '0')) {
				$('#button_archive').hide();
			} else {
				$('#button_archive').show();
			}

			// If map is disabled, we should hide the icon
			if (lychee.publicMode===true ? lychee.map_display_public : lychee.map_display) {
				$('#button_map_album').show();
			} else {
				$('#button_map_album').hide();
			}

			if (albumID==='s' || albumID==='f' || albumID==='r') {
				$('#button_info_album, #button_trash_album, #button_visibility_album, #button_move_album').hide();
				$('.button_add, .header__divider', '.header__toolbar--album').show()
			} else if (albumID==='0') {
				$('#button_info_album, #button_visibility_album, #button_move_album').hide();
				$('#button_trash_album, .button_add, .header__divider', '.header__toolbar--album').show()
			} else {
				$('#button_info_album, #button_visibility_album').show();
				if (album.isUploadable()) {
					$('#button_trash_album, #button_move_album, #button_visibility_album, .button_add, .header__divider', '.header__toolbar--album').show()
				} else {
					$('#button_trash_album, #button_move_album, #button_visibility_album, .button_add, .header__divider', '.header__toolbar--album').hide()
				}
			}



			return true;

		case 'photo':

			header.dom().addClass('header--view');
			header.dom('.header__toolbar--public, .header__toolbar--albums, .header__toolbar--album, .header__toolbar--map').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--photo').addClass('header__toolbar--visible');

			// If map is disabled, we should hide the icon
			if (lychee.publicMode===true ? lychee.map_display_public : lychee.map_display) {
				$('#button_map').show();
			} else {
				$('#button_map').hide();
			}

			if (album.isUploadable()) {
				$('#button_trash, #button_move, #button_visibility, #button_star').show()
			} else {
				$('#button_trash, #button_move, #button_visibility, #button_star').hide();
			}

			// Hide More menu if empty (see contextMenu.photoMore)
			$('#button_more').show();
			if (!(album.isUploadable() ||
				(photo.json.hasOwnProperty('downloadable') ? photo.json.downloadable === '1' :
				album.json && album.json.downloadable && album.json.downloadable === '1')) &&
				!(photo.json.url && photo.json.url !== '')) {
				$('#button_more').hide();
			}

			return true;
		case 'map':

			header.dom().removeClass('header--view');
			header.dom('.header__toolbar--public, .header__toolbar--album, .header__toolbar--albums, .header__toolbar--photo').removeClass('header__toolbar--visible');
			header.dom('.header__toolbar--map').addClass('header__toolbar--visible');

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

header.applyTranslations = function () {

	let selector_locale = {
		'#button_signin'         : 'SIGN_IN',
		'#button_settings'       : 'SETTINGS',
		'#button_info_album'     : 'ABOUT_ALBUM',
		'#button_info'           : 'ABOUT_PHOTO',
		'.button_add'            : 'ADD',
		'#button_move_album'     : 'MOVE_ALBUM',
		'#button_move'           : 'MOVE',
		'#button_trash_album'    : 'DELETE_ALBUM',
		'#button_trash'          : 'DELETE',
		'#button_archive'        : 'DOWNLOAD_ALBUM',
		'#button_star'           : 'STAR_PHOTO',
		'#button_back_home'      : 'CLOSE_ALBUM',
		'#button_fs_album_enter' : 'FULLSCREEN_ENTER',
		'#button_fs_enter'       : 'FULLSCREEN_ENTER',
		'#button_share'          : 'SHARE_PHOTO',
		'#button_share_album'    : 'SHARE_ALBUM'
	}

	for (let selector in selector_locale) {
		header.dom(selector).prop('title', lychee.locale[selector_locale[selector]])
	}

}
