/**
 * @description Select multiple albums or photos.
 */

const isSelectKeyPressed = function(e) {

	return e.metaKey || e.ctrlKey

};


multiselect = {

	ids            : [],
	albumsSelected : 0,
	photosSelected : 0

};

multiselect.position = {

	top    : null,
	right  : null,
	bottom : null,
	left   : null

};

multiselect.bind = function() {

	$('.content').on('mousedown', (e) => { if (e.which===1) multiselect.show(e) });

	return true

};

multiselect.isSelected = function(id) {

	let pos = $.inArray(id, multiselect.ids);

	return {
		selected : (pos !== -1),
		position : pos
	}

};


multiselect.toggleItem = function(object, id) {

	if (album.isSmartID(id)) return;

	let selected = multiselect.isSelected(id).selected;

	if (selected===false) multiselect.addItem(object, id);
	else                  multiselect.removeItem(object, id);

};

multiselect.addItem = function(object, id) {

	if (album.isSmartID(id)) return;
	if (!lychee.admin && albums.isShared(id)) return;
	if (multiselect.isSelected(id).selected===true) return;

	let isAlbum = object.hasClass('album');

	if ((isAlbum && multiselect.photosSelected > 0) ||
		(!isAlbum && multiselect.albumsSelected > 0)) {
		lychee.error('Please select either albums or photos!');
		return
	}

	multiselect.ids.push(id);
	multiselect.select(object);

	if (isAlbum)
	{
		multiselect.albumsSelected++
	}
	else
	{
		multiselect.photosSelected++
	}

};


multiselect.removeItem = function(object, id) {

	let { selected, pos } = multiselect.isSelected(id);

	if (selected===false) return;

	multiselect.ids.splice(pos, 1);
	multiselect.deselect(object);

	let isAlbum = object.hasClass('album');

	if (isAlbum)
	{
		multiselect.albumsSelected--
	}
	else
	{
		multiselect.photosSelected--
	}

};



multiselect.albumClick = function(e, albumObj) {

	let id = albumObj.attr('data-id');

	if (isSelectKeyPressed(e) && album.isUploadable()) {
		if (albumObj.hasClass('disabled')) return;
		multiselect.toggleItem(albumObj, id);
	} else {
		lychee.goto(id)
	}

};

multiselect.photoClick = function(e, photoObj) {

	let id = photoObj.attr('data-id');

	if (isSelectKeyPressed(e) && album.isUploadable()) {
		if (photoObj.hasClass('disabled')) return;
		multiselect.toggleItem(photoObj, id);
	} else {
		lychee.goto(album.getID() + '/' + id);
	}

};




multiselect.albumContextMenu = function(e, albumObj) {

	let id       = albumObj.attr('data-id');
	let selected = multiselect.isSelected(id).selected;

	if (albumObj.hasClass('disabled')) return;

	if (selected!==false && multiselect.ids.length > 1) {
		contextMenu.albumMulti(multiselect.ids, e);
	}
	else {
		contextMenu.album(id, e)
	}

};

multiselect.photoContextMenu = function(e, photoObj) {

	let id       = photoObj.attr('data-id');
	let selected = multiselect.isSelected(id).selected;

	if (photoObj.hasClass('disabled')) return;

	if (selected!==false && multiselect.ids.length > 1) {
		contextMenu.photoMulti(multiselect.ids, e);
	}
	else if (visible.album() || visible.search())
	{
		contextMenu.photo(id, e);
	}
	else if (visible.photo())
	{
		// should not happen... but you never know...
		contextMenu.photo(photo.getID(), e)
	}
	else
	{
		lychee.error('Could not find what you wnat.');
	}

};

multiselect.clearSelection = function() {

	multiselect.deselect('.photo.active, .album.active');
	multiselect.ids = [];
	multiselect.albumsSelected = 0;
	multiselect.photosSelected = 0

};

multiselect.show = function(e) {

	if (!album.isUploadable())                      return false;
	if (!visible.albums() && !visible.album())      return false;
	if ($('.album:hover, .photo:hover').length!==0) return false;
	if (visible.search())                           return false;
	if (visible.multiselect())                      $('#multiselect').remove();

	sidebar.setSelectable(false);

	multiselect.position.top    = e.pageY;
	multiselect.position.right  = -1 * (e.pageX - $(document).width());
	multiselect.position.bottom = -1 * (multiselect.position.top - $(window).height());
	multiselect.position.left   = e.pageX;

	$('body').append(build.multiselect(multiselect.position.top, multiselect.position.left));

	$(document)
		.on('mousemove', multiselect.resize)
		.on('mouseup', (e) => { if (e.which===1) multiselect.getSelection(e) })

};

multiselect.resize = function(e) {

	if (multiselect.position.top    === null ||
		multiselect.position.right  === null ||
		multiselect.position.bottom === null ||
		multiselect.position.left   === null) return false;

	let newSize      = {};
	let documentSize = {};

	// Get the position of the mouse
	let mousePos = {
		x : e.pageX,
		y : e.pageY
	};

	// Default CSS
	let newCSS = {
		top    : null,
		bottom : null,
		height : null,
		left   : null,
		right  : null,
		width  : null
	};

	if (mousePos.y>=multiselect.position.top) {

		documentSize.height = $(document).height();

		// Do not leave the screen
		newSize.height = mousePos.y - multiselect.position.top;
		if ((multiselect.position.top + newSize.height)>=documentSize.height) {
			newSize.height -= (multiselect.position.top + newSize.height) - documentSize.height + 2
		}

		newCSS.top    = multiselect.position.top;
		newCSS.bottom = 'inherit';
		newCSS.height = newSize.height

	} else {

		newCSS.top    = 'inherit';
		newCSS.bottom = multiselect.position.bottom;
		newCSS.height = multiselect.position.top - e.pageY

	}

	if (mousePos.x>=multiselect.position.left) {

		documentSize.width = $(document).width();

		// Do not leave the screen
		newSize.width = mousePos.x - multiselect.position.left;
		if ((multiselect.position.left + newSize.width)>=documentSize.width) {
			newSize.width -= (multiselect.position.left + newSize.width) - documentSize.width + 2
		}

		newCSS.right = 'inherit';
		newCSS.left  = multiselect.position.left;
		newCSS.width = newSize.width

	} else {

		newCSS.right = multiselect.position.right;
		newCSS.left  = 'inherit';
		newCSS.width = multiselect.position.left - e.pageX

	}

	// Updated all CSS properties at once
	$('#multiselect').css(newCSS)

};

multiselect.stopResize = function() {

	if (multiselect.position.top!==null) $(document).off('mousemove mouseup')

};

multiselect.getSize = function() {

	if (!visible.multiselect()) return false;

	let $elem  = $('#multiselect');
	let offset = $elem.offset();

	return {
		top    : offset.top,
		left   : offset.left,
		width  : parseInt($elem.css('width').replace('px', '')),
		height : parseInt($elem.css('height').replace('px', ''))
	}

};

multiselect.getSelection = function(e) {
  // TODO(nshemon): Make tolerance depend on image size.
	let tolerance = 202;
	let size      = multiselect.getSize();

	if (visible.contextMenu())  return false;
	if (!visible.multiselect()) return false;

	if (!e.shiftKey && (size.width===0 || size.height===0)) {
		multiselect.close();
		return false
	}

	const sortKind = function (a,b){
		return $(a).hasClass("photo") < $(b).hasClass("photo") ? 1 : -1;
	};

	$('.photo, .album').sort(sortKind).each(function() {

		let offset = $(this).offset();

		if (offset.top>=(size.top - tolerance) &&
			offset.left>=(size.left - tolerance) &&
			(offset.top + 206)<=(size.top + size.height + tolerance) &&
			(offset.left + 206)<=(size.left + size.width + tolerance)) {

			let id = $(this).attr('data-id');

			if (isSelectKeyPressed(e)) {
				multiselect.toggleItem($(this), id);
			} else {
				multiselect.addItem($(this), id)
			}

		}

	});

	multiselect.hide()

};

multiselect.select = function(id) {

	let el = $(id);

	el.addClass('selected');
	el.addClass('active')

};

multiselect.deselect = function(id) {

	let el = $(id);

	el.removeClass('selected');
	el.removeClass('active')

};

multiselect.hide = function() {

	sidebar.setSelectable(true);

	multiselect.stopResize();

	multiselect.position.top    = null;
	multiselect.position.right  = null;
	multiselect.position.bottom = null;
	multiselect.position.left   = null;

	lychee.animate('#multiselect', 'fadeOut');
	setTimeout(() => $('#multiselect').remove(), 300)

};

multiselect.close = function() {

	sidebar.setSelectable(true);

	multiselect.stopResize();

	multiselect.position.top    = null;
	multiselect.position.right  = null;
	multiselect.position.bottom = null;
	multiselect.position.left   = null;

	lychee.animate('#multiselect', 'fadeOut');
	setTimeout(() => $('#multiselect').remove(), 300)

};

multiselect.selectAll = function() {

	if (!album.isUploadable())               return false;
	if (visible.search())                    return false;
	if (!visible.albums() && !visible.album) return false;
	if (visible.multiselect())               $('#multiselect').remove();

	sidebar.setSelectable(false);

	multiselect.position.top    = 70;
	multiselect.position.right  = 40;
	multiselect.position.bottom = 90;
	multiselect.position.left   = 20;

	$('body').append(build.multiselect(multiselect.position.top, multiselect.position.left));

	let documentSize = {
		width  : $(document).width(),
		height : $(document).height()
	};

	let newSize = {
		width  : documentSize.width - multiselect.position.right + 2,
		height : documentSize.height - multiselect.position.bottom
	};

	let e = {
		pageX : documentSize.width - (multiselect.position.right / 2),
		pageY : documentSize.height - multiselect.position.bottom
	};

	$('#multiselect').css(newSize);

	multiselect.getSelection(e)

};

