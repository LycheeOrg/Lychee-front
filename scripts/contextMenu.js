/**
 * @description This module is used for the context menu.
 */

contextMenu = {};

contextMenu.add = function(e) {

	let items = [
		{ title: build.iconic('image') + lychee.locale['UPLOAD_PHOTO'], fn: () => $('#upload_files').click() },
		{ },
		{ title: build.iconic('link-intact') + lychee.locale['IMPORT_LINK'], fn: upload.start.url },
		{ title: build.iconic('dropbox', 'ionicons') + lychee.locale['IMPORT_DROPBOX'], fn: upload.start.dropbox },
		{ title: build.iconic('terminal') + lychee.locale['IMPORT_SERVER'], fn: upload.start.server },
		{ },
		{ title: build.iconic('folder') + lychee.locale['NEW_ALBUM'], fn: album.add }
	];

    if (lychee.api_V2 && !lychee.admin)
    {
        items.splice(3, 2);
    }

    basicContext.show(items, e.originalEvent);

	upload.notify()

};

contextMenu.album = function(albumID, e) {

	// Notice for 'Merge':
	// fn must call basicContext.close() first,
	// in order to keep the selection

	if (albumID==='0' || albumID==='f' || albumID==='s' || albumID==='r') return false;

	// Show merge-item when there's more than one album
	let showMerge = (albums.json && albums.json.albums && Object.keys(albums.json.albums).length>1);

	let items = [
		{ title: build.iconic('pencil') + lychee.locale['RENAME'], fn: () => album.setTitle([ albumID ]) },
		{ title: build.iconic('collapse-left') + lychee.locale['MERGE'], visible: showMerge, fn: () => { basicContext.close(); contextMenu.mergeAlbum(albumID, e) } },
		{ title: build.iconic('trash') + lychee.locale['DELETE'], fn: () => album.delete([ albumID ]) }
	];

	$('.album[data-id="' + albumID + '"]').addClass('active');

	basicContext.show(items, e.originalEvent, contextMenu.close)

};

contextMenu.albumMulti = function(albumIDs, e) {

	multiselect.stopResize();

	// Automatically merge selected albums when albumIDs contains more than one album
	// Show list of albums otherwise
	let autoMerge = (albumIDs.length > 1);

	// Show merge-item when there's more than one album
	let showMerge = (albums.json && albums.json.albums && Object.keys(albums.json.albums).length>1);

	let items = [
		{ title: build.iconic('pencil') + lychee.locale['RENAME_ALL'], fn: () => album.setTitle(albumIDs) },
		{ title: build.iconic('collapse-left') + lychee.locale['MERGE_ALL'], visible: showMerge && autoMerge, fn: () => album.merge(albumIDs) },
		{ title: build.iconic('collapse-left') + lychee.locale['MERGE'], visible: showMerge && !autoMerge, fn: () => { basicContext.close(); contextMenu.mergeAlbum(albumIDs[0], e) } },
		{ title: build.iconic('trash') + lychee.locale['DELETE_ALL'], fn: () => album.delete(albumIDs) }
	];

	items.push();

	basicContext.show(items, e.originalEvent, contextMenu.close)

};

contextMenu.albumTitle = function(albumID, e) {

	api.post('Albums::get', {}, function(data) {

		let items = [];

		if (data.albums && data.num>1) {

			// Generate list of albums
			$.each(data.albums, function() {

				if (!this.thumbs[0]) this.thumbs[0] = 'Lychee-front/images/no_cover.svg';
				if (this.title==='') this.title = lychee.locale['UNTITLED'];

				let html = lychee.html`<img class='cover' width='16' height='16' src='${ this.thumbs[0] }'><div class='title'>${ this.title }</div>`;

				if (this.id!=albumID) items.push({
					title: html,
					fn: () => lychee.goto(this.id)
				})

			});

			items.unshift({ })

		}

		items.unshift({ title: build.iconic('pencil') + lychee.locale['RENAME'], fn: () => album.setTitle([ albumID ]) });

		basicContext.show(items, e.originalEvent, contextMenu.close)

	})

};

contextMenu.mergeAlbum = function(albumID, e) {

	api.post('Albums::get', {}, function(data) {

		let items = [];

		if (data.albums && data.num>1) {

			$.each(data.albums, function() {

				if (!this.thumbs[0]) this.thumbs[0] = 'Lychee-front/images/no_cover.svg';
				if (this.title==='') this.title = lychee.locale['UNTITLED'];

				let html = lychee.html`<img class='cover' width='16' height='16' src='${ this.thumbs[0] }'><div class='title'>${ this.title }</div>`;

				if (this.id!=albumID) items.push({
					title: html,
					fn: () => album.merge([ albumID, this.id ])
				})

			})

		}

		if (items.length===0) return false;

		basicContext.show(items, e.originalEvent, contextMenu.close)

	})

};

contextMenu.photo = function(photoID, e) {

	// Notice for 'Move':
	// fn must call basicContext.close() first,
	// in order to keep the selection

	let items = [
		{ title: build.iconic('star') + lychee.locale['STAR'], fn: () => photo.setStar([ photoID ]) },
		{ title: build.iconic('tag') + lychee.locale['TAGS'], fn: () => photo.editTags([ photoID ]) },
		{ },
		{ title: build.iconic('pencil') + lychee.locale['RENAME'], fn: () => photo.setTitle([ photoID ]) },
		{ title: build.iconic('layers') + lychee.locale['DUPLICATE'], fn: () => photo.duplicate([ photoID ]) },
		{ title: build.iconic('folder') + lychee.locale['MOVE'], fn: () => { basicContext.close(); contextMenu.move([ photoID ], e) } },
		{ title: build.iconic('trash') + lychee.locale['DELETE'], fn: () => photo.delete([ photoID ]) }
	];

	$('.photo[data-id="' + photoID + '"]').addClass('active');

	basicContext.show(items, e.originalEvent, contextMenu.close)

};

contextMenu.photoMulti = function(photoIDs, e) {

	// Notice for 'Move All':
	// fn must call basicContext.close() first,
	// in order to keep the selection and multiselect

	multiselect.stopResize();

	let items = [
		{ title: build.iconic('star') + lychee.locale['STAR_ALL'], fn: () => photo.setStar(photoIDs) },
		{ title: build.iconic('tag') + lychee.locale['TAGS_ALL'], fn: () => photo.editTags(photoIDs) },
		{ },
		{ title: build.iconic('pencil') + lychee.locale['RENAME_ALL'], fn: () => photo.setTitle(photoIDs) },
		{ title: build.iconic('layers') + lychee.locale['DUPLICATE_ALL'], fn: () => photo.duplicate(photoIDs) },
		{ title: build.iconic('folder') + lychee.locale['MOVE_ALL'], fn: () => { basicContext.close(); contextMenu.move(photoIDs, e) } },
		{ title: build.iconic('trash') + lychee.locale['DELETE_ALL'], fn: () => photo.delete(photoIDs) }
	];

	basicContext.show(items, e.originalEvent, contextMenu.close)

};

contextMenu.photoTitle = function(albumID, photoID, e) {

	let items = [
		{ title: build.iconic('pencil') + lychee.locale['RENAME'], fn: () => photo.setTitle([ photoID ]) }
	];

	let data = album.json;

	if (data.content!==false && data.num>1) {

		items.push({ });

		// Generate list of albums
		$.each(data.content, function(index) {

			if (this.title==='') this.title = lychee.locale['UNTITLED'];

			let html = lychee.html`<img class='cover' width='16' height='16' src='${ this.thumbUrl }'><div class='title'>${ this.title }</div>`;

			if (this.id!=photoID) items.push({
				title: html,
				fn: () => lychee.goto(albumID + '/' + this.id)
			})

		})

	}

	basicContext.show(items, e.originalEvent, contextMenu.close)

};

contextMenu.photoMore = function(photoID, e) {

	// Show download-item when
	// a) Public mode is off
	// b) Downloadable is 1 and public mode is on
	let showDownload = lychee.publicMode===false || ((album.json && album.json.downloadable && album.json.downloadable==='1') && lychee.publicMode===true);

	let items = [
		{ title: build.iconic('fullscreen-enter') + lychee.locale['FULL_PHOTO'], fn: () => window.open(photo.getDirectLink()) },
		{ title: build.iconic('cloud-download') + lychee.locale['DOWNLOAD'], visible: showDownload, fn: () => photo.getArchive(photoID) }
	];

	basicContext.show(items, e.originalEvent)

};

contextMenu.move = function(photoIDs, e) {

	let items = [];

	api.post('Albums::get', {}, function(data) {

		if (data.num===0) {

			// Show only 'Add album' when no album available
			items = [
				{ title: lychee.locale['NEW_ALBUM'], fn: album.add }
			]

		} else {

			// Generate list of albums
			$.each(data.albums, function() {

				if (!this.thumbs[0]) this.thumbs[0] = 'Lychee-front/images/no_cover.svg';
				if (this.title==='') this.title = lychee.locale['UNTITLED'];

				let html = lychee.html`<img class='cover' width='16' height='16' src='${ this.thumbs[0] }'><div class='title'>${ this.title }</div>`;

				if (this.id!=album.getID()) items.push({
					title: html,
					fn: () => photo.setAlbum(photoIDs, this.id)
				})

			});

			// Show Unsorted when unsorted is not the current album
			if (album.getID()!=='0') {

				items.unshift({ });
				items.unshift({ title: lychee.locale['UNSORTED'], fn: () => photo.setAlbum(photoIDs, 0) })

			}

		}

		basicContext.show(items, e.originalEvent, contextMenu.close)

	})

};

contextMenu.sharePhoto = function(photoID, e) {

	let link      = photo.getViewLink(photoID);
	let iconClass = 'ionicons';

	let items = [
		{ title: `<input readonly id="link" value="${ link }">`, fn: () => {}, class: 'basicContext__item--noHover' },
		{ },
		{ title: build.iconic('twitter', iconClass) + 'Twitter', fn: () => photo.share(photoID, 'twitter') },
		{ title: build.iconic('facebook', iconClass) + 'Facebook', fn: () => photo.share(photoID, 'facebook') },
		{ title: build.iconic('envelope-closed') + 'Mail', fn: () => photo.share(photoID, 'mail') },
		{ title: build.iconic('dropbox', iconClass) + 'Dropbox', visible: lychee.publicMode===false, fn: () => photo.share(photoID, 'dropbox') },
		{ title: build.iconic('link-intact') + lychee.locale['DIRECT_LINK'], fn: () => window.open(photo.getDirectLink()) },
		{ },
		{ title: build.iconic('ban') + lychee.locale['MAKE_PRIVATE'], visible: lychee.publicMode===false, fn: () => photo.setPublic(photoID) }
	];

	if (lychee.publicMode===true || (lychee.api_V2 && !lychee.upload))
	{
		items.splice(7, 2);
    }

	basicContext.show(items, e.originalEvent);
	$('.basicContext input#link').focus().select()

};

contextMenu.shareAlbum = function(albumID, e) {

	let iconClass = 'ionicons';

	let items = [
		{ title: `<input readonly id="link" value="${ location.href }">`, fn: () => {}, class: 'basicContext__item--noHover' },
		{ },
		{ title: build.iconic('twitter', iconClass) + 'Twitter', fn: () => album.share('twitter') },
		{ title: build.iconic('facebook', iconClass) + 'Facebook', fn: () => album.share('facebook') },
		{ title: build.iconic('envelope-closed') + 'Mail', fn: () => album.share('mail') },
		{ },
		{ title: build.iconic('pencil') + lychee.locale['EDIT_SHARING'], visible: lychee.publicMode===false, fn: () => album.setPublic(albumID, true, e) },
		{ title: build.iconic('ban') + lychee.locale['MAKE_PRIVATE'], visible: lychee.publicMode===false, fn: () => album.setPublic(albumID, false) }
	];

	if (lychee.publicMode===true || (lychee.api_V2 && !lychee.upload)) items.splice(5, 3);

	basicContext.show(items, e.originalEvent);
	$('.basicContext input#link').focus().select()

};

contextMenu.close = function() {

	if (!visible.contextMenu()) return false;

	basicContext.close();

	$('.photo.active, .album.active').removeClass('active');
	if (visible.multiselect()) multiselect.close()

};
