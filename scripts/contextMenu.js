/**
 * @description This module is used for the context menu.
 */



const getAlbumFrom = function(albums, id) {

	for (a in albums) {
		if (albums[a].id === id) return albums[a]
	}

	return null

};

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

	if (album.isSmartID(albumID)) return false;

	// Show merge-item when there's more than one album
	let showMerge = (albums.json && albums.json.albums && Object.keys(albums.json.albums).length>1);

	let items = [
		{ title: build.iconic('pencil') + lychee.locale['RENAME'], fn: () => album.setTitle([ albumID ]) },
		{ title: build.iconic('collapse-left') + lychee.locale['MERGE'], visible: showMerge, fn: () => { basicContext.close(); contextMenu.mergeAlbum(albumID, e) } },
// TODO: localization
		{ title: build.iconic('folder') + 'Move', fn: () => { basicContext.close(); contextMenu.moveAlbum([ albumID ], e) } },
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
// TODO: localization
		{ title: build.iconic('folder') + 'Move All', fn: () => { basicContext.close(); contextMenu.moveAlbum(albumIDs, e) } },
		{ title: build.iconic('trash') + lychee.locale['DELETE_ALL'], fn: () => album.delete(albumIDs) }
	];

	items.push();

	basicContext.show(items, e.originalEvent, contextMenu.close)

};

contextMenu.buildList = function(lists, exclude, action, parent = 0, layer = 0) {

	let items = [];

	let i = 0;
	while(i < lists.length) {
		if ((layer===0 && !lists[i].parent_id) || lists[i].parent_id === parent) {

			let item = lists[i];

			let thumb = 'Lychee-front/images/no_cover.svg';
			if (item.thumbs && item.thumbs[0]) thumb = item.thumbs[0];
			else if (item.thumbUrl)             thumb = item.thumbUrl;

			if (item.title==='') item.title = lychee.locale['UNTITLED'];

			let prefix = (layer > 0 ? '&nbsp;&nbsp;'.repeat(layer - 1) + '└ ' : '');

			let html = lychee.html`
			           ${ prefix }
			           <img class='cover' width='16' height='16' src='${ thumb }'>
			           <div class='title'>$${ item.title }</div>
			           `;

			items.push({
				title: html,
				disabled: (exclude.indexOf(item.id)!==-1),
				fn: () => action(item)
			});

			items = items.concat(contextMenu.buildList(lists, exclude, action, item.id, layer + 1))

		}

		i++;
	}

	return items

};

contextMenu.albumTitle = function(albumID, e) {

	api.post('Albums::get', {}, function(data) {

		let items = [];

		if (data.albums && data.albums.length > 1) {

			items = items.concat(contextMenu.buildList(data.albums, [ parseInt(albumID, 10) ], (a) => lychee.goto(a.id)));

		}

		if (data.shared_albums && data.shared_albums.length >1) {

			items = items.concat({});
			items = items.concat(contextMenu.buildList(data.shared_albums, [ parseInt(albumID,10) ], (a) => lychee.goto(a.id)));

		}

		if(items.length > 0)
		{
			items.unshift({ });
		}

		items.unshift({ title: build.iconic('pencil') + lychee.locale['RENAME'], fn: () => album.setTitle([ albumID ]) });

		basicContext.show(items, e.originalEvent, contextMenu.close)

	})

};

contextMenu.mergeAlbum = function(albumID, e) {

	api.post('Albums::get', {}, function(data) {

		let items = [];

		if (data.albums && data.albums.length >1) {

			if (data.albums && data.albums.length > 1) {
				items = items.concat(contextMenu.buildList(data.albums, [ parseInt(albumID,10) ], (a) => album.merge([ albumID, a.id ])));
				items.unshift({ })

			}

			// $.each(data.albums, function() {
			//
			// 	if (!this.thumbs[0]) this.thumbs[0] = 'Lychee-front/images/no_cover.svg';
			// 	if (this.title==='') this.title = lychee.locale['UNTITLED'];
			//
			// 	let html = lychee.html`<img class='cover' width='16' height='16' src='${ this.thumbs[0] }'><div class='title'>${ this.title }</div>`;
			//
			// 	if (this.id!==albumID) items.push({
			// 		title: html,
			// 		fn: () => album.merge([ albumID, this.id ])
			// 	})
			//
			// })

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

contextMenu.countSubAlbums = function(photoIDs) {

	let count = 0;

	if (album.albums) {

		for (i in photoIDs) {
			for (j in album.albums) {
				if (album.albums[j].id === photoIDs[i]) {
					count++
					break
				}
			}
		}

	}

	return count
};


contextMenu.photoMulti = function(photoIDs, e) {

	// Notice for 'Move All':
	// fn must call basicContext.close() first,
	// in order to keep the selection and multiselect
	let subcount = contextMenu.countSubAlbums(photoIDs);
	let photocount = photoIDs.length - subcount;

	if (subcount && photocount) {
		multiselect.deselect('.photo.active, .album.active')
		multiselect.close()
		lychee.error('Please select either albums or photos!')
		return
	}
	if (subcount) {
		contextMenu.albumMulti(photoIDs, e)
		return
	}

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

	if (data.photos!==false && data.photos.length>1) {

		items.push({ });

		items = items.concat(contextMenu.buildList(data.photos, [ photoID ], (a) => lychee.goto(albumID + '/' + a.id)))

		// // Generate list of albums
		// $.each(data.photos, function(index) {
		//
		// 	if (this.title==='') this.title = lychee.locale['UNTITLED'];
		//
		// 	let html = lychee.html`<img class='cover' width='16' height='16' src='${ this.thumbUrl }'><div class='title'>${ this.title }</div>`;
		//
		// 	if (this.id!==photoID) items.push({
		// 		title: html,
		// 		fn: () => lychee.goto(albumID + '/' + this.id)
		// 	})
		//
		// })

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

contextMenu.getSubIDs = function(albums, albumID) {

	let ids = [ albumID ];

	for (a in albums) {
		if (albums[a].parent_id===albumID) {

			let sub = contextMenu.getSubIDs(albums, albums[a].id);
			for (id in sub)
				ids.push(sub[id])

		}
	}

	return ids

};



contextMenu.moveAlbum = function(albumIDs, e) {

	api.post('Albums::get', { parent: -1 }, function(data) {

		let items = [];

		if (data.albums && data.num>1) {

			let title = albums.getByID(albumIDs[0]).title;
			// Disable all childs
			// It's not possible to move us into them
			let exclude = [];
			for (i in albumIDs) {
				let sub = contextMenu.getSubIDs(data.albums, String(albumIDs[i]));
				for (s in sub)
					exclude.push(sub[s])
			}

			items = contextMenu.buildList(data.albums, exclude, (a) => album.move([ a.id ].concat(albumIDs), [ a.title, title ]), 0, 1);

			items.unshift({ title: 'Root', fn: () => album.move([ 0 ].concat(albumIDs), [ 'Root', title ]) })

		}

		if (items.length===0) return false;

		basicContext.show(items, e.originalEvent, contextMenu.close)

	})

};

contextMenu.move = function(photoIDs, e) {

	let items = [];

	api.post('Albums::get', {}, function(data) {

		if (data.albums.length > 0) {

			if (data.albums && data.albums.length > 1) {

				items = items.concat(contextMenu.buildList(data.albums, [ album.getID() ], (a) => photo.setAlbum(photoIDs, a.id)));

			}

			// // Generate list of albums
			// $.each(data.albums, function() {
			//
			// 	if (!this.thumbs[0]) this.thumbs[0] = 'Lychee-front/images/no_cover.svg';
			// 	if (this.title==='') this.title = lychee.locale['UNTITLED'];
			//
			// 	let html = lychee.html`<img class='cover' width='16' height='16' src='${ this.thumbs[0] }'><div class='title'>${ this.title }</div>`;
			//
			// 	if (this.id!==album.getID()) items.push({
			// 		title: html,
			// 		fn: () => photo.setAlbum(photoIDs, this.id)
			// 	})
			//
			// });

			// Show Unsorted when unsorted is not the current album
			if (album.getID()!=='0') {

				items.unshift({ });
				items.unshift({ title: lychee.locale['UNSORTED'], fn: () => photo.setAlbum(photoIDs, 0) })

			}

		}
		items.unshift({});
		items.unshift({ title: lychee.locale['NEW_ALBUM'], fn: () => album.addandmove(photoIDs) });

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

	multiselect.deselect('.photo.active, .album.active');
	if (visible.multiselect()) multiselect.close()

};
