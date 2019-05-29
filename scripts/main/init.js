/**
 * @description This module is used for bindings.
 */

$(document).ready(function() {

	// Event Name
	let eventName = lychee.getEventName();

	// set CSRF protection (Laravel)
    csrf.bind();

	// Set API error handler
	api.onError = lychee.error;

	// Multiselect
	multiselect.bind();

	// Header
	header.bind();

	// Image View
	lychee.imageview
		.on(eventName, '.arrow_wrapper--previous', photo.previous)
		.on(eventName, '.arrow_wrapper--next',     photo.next)
		.on('click', 'img', photo.update_display_overlay);

	// Keyboard
	Mousetrap
		.bind([ 'left' ], function() {
			if (visible.photo()) { $('#imageview a#previous').click(); return false }
		})
		.bind([ 'right' ], function() {
			if (visible.photo()) { $('#imageview a#next').click(); return false }
		})
		.bind([ 'u' ], function() {
			if (!visible.photo() && album.isUploadable()) { $('#upload_files').click(); return false }
		})
		.bind([ 'n' ], function() {
			if (!visible.photo() && album.isUploadable()) { album.add(); return false }
		})
		.bind([ 's' ], function() {
			if (visible.photo() && album.isUploadable()) { header.dom('#button_star').click(); return false }
			else if (visible.albums()) { header.dom('.header__search').focus(); return false }
		})
		.bind([ 'r' ], function() {
			if (album.isUploadable()) {
				if (visible.album())      { album.setTitle(album.getID()); return false }
				else if (visible.photo()) { photo.setTitle([photo.getID()]); return false }
			}
		})
		.bind([ 'd' ], function() {
			if (album.isUploadable()) {
				if (visible.photo())      { photo.setDescription(photo.getID()); return false }
				else if (visible.album()) { album.setDescription(album.getID()); return false }
			}
		})
		.bind([ 't' ], function() {
			if (visible.photo() && album.isUploadable()) { photo.editTags([photo.getID()]); return false }
		})
		.bind([ 'i' ], function() {
			if (!visible.multiselect()) { sidebar.toggle(); return false }
		})
		.bind([ 'command+backspace', 'ctrl+backspace' ], function() {
			if (album.isUploadable()) {
				if (visible.photo() && basicModal.visible()===false)      { photo.delete([photo.getID()]); return false }
				else if (visible.album() && basicModal.visible()===false) { album.delete([album.getID()]); return false }
			}
		})
		.bind([ 'command+a', 'ctrl+a' ], function() {
			if (visible.album() && basicModal.visible()===false)       { multiselect.selectAll(); return false }
			else if (visible.albums() && basicModal.visible()===false) { multiselect.selectAll(); return false }
		})
		.bind([ 'o' ], function() {
			if(visible.photo()) { photo.update_overlay_type(); return false }
		})
		.bind([ 'f' ], function() {
			if (visible.album() || visible.photo()) { lychee.fullscreenToggle(); return false }
		});

	Mousetrap.bindGlobal('enter', function() {
		if (basicModal.visible()===true) basicModal.action()
	});

	Mousetrap.bindGlobal([ 'esc', 'command+up' ], function() {
		if (basicModal.visible()===true)                                             basicModal.cancel();
		else if (visible.leftMenu())												 leftMenu.close();
		else if (visible.contextMenu())                                              contextMenu.close();
		else if (visible.photo())                                                    lychee.goto(album.getID());
		else if (visible.album() && !album.json.parent_id)                           lychee.goto();
		else if (visible.album())													 lychee.goto(album.getParent());
		else if (visible.albums() && search.hash !== null) search.reset();
		return false
	});

	if (eventName==='touchend') {

		$(document)

			// Fullscreen on mobile
			.on('touchend', '#imageview #image', function(e) {
				if (swipe.obj==null || (swipe.offset>=-5&&swipe.offset<=5)) {
					if (visible.header()) header.hide(e);
					else                  header.show()
				}
			})

			// Swipe on mobile
			.swipe().on('swipeStart', function() { if (visible.photo()) swipe.start($('#imageview #image')) })
			.swipe().on('swipeMove',  function(e) { if (visible.photo()) swipe.move(e.swipe) })
			.swipe().on('swipeEnd',   function(e) { if (visible.photo()) swipe.stop(e.swipe, photo.previous, photo.next) })

	}

	// Document
	$(document)


	// Navigation
	.on('click', '.album', function(e) { multiselect.albumClick(e, $(this)) })
	.on('click', '.photo', function(e) { multiselect.photoClick(e, $(this)) })

	// Context Menu
	.on('contextmenu', '.photo', function(e) { multiselect.photoContextMenu(e, $(this)) })
	.on('contextmenu', '.album', function(e) { multiselect.albumContextMenu(e, $(this)) })


	// Upload
	.on('change', '#upload_files', function() { basicModal.close(); upload.start.local(this.files) })


	// Drag and Drop upload
	.on('dragover', function() { return false }, false)
	.on('drop', function(e) {

		if (!album.isUploadable()) {
			return false;
		}

		// Close open overlays or views which are correlating with the upload
		if (visible.photo())       lychee.goto(album.getID());
		if (visible.contextMenu()) contextMenu.close();

		// Detect if dropped item is a file or a link
		if (e.originalEvent.dataTransfer.files.length>0)                upload.start.local(e.originalEvent.dataTransfer.files);
		else if (e.originalEvent.dataTransfer.getData('Text').length>3) upload.start.url(e.originalEvent.dataTransfer.getData('Text'));

		return false

	})

	// Fullscreen
	.on('fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange', lychee.fullscreenUpdate);

	$(window)
	// resize
	.on('resize', function () {
		if(visible.album() || visible.search()) view.album.content.justify();
		if(visible.photo()) view.photo.onresize();
	});

	// Init
	lychee.init()

});
