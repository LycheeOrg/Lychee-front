/**
 * @description Takes care of every action albums can handle and execute.
 */

albums = {

	json: null

};

albums.load = function () {

	let startTime = new Date().getTime();

	lychee.animate('.content', 'contentZoomOut');

	if (albums.json === null) {

		api.post('Albums::get', {}, function (data) {

			let waitTime = 0;

			// Smart Albums
			if (lychee.publicMode === false && data.smartalbums != null) albums._createSmartAlbums(data.smartalbums);

			albums.json = data;

			// Calculate delay
			let durationTime = (new Date().getTime() - startTime);
			if (durationTime > 300) waitTime = 0;
			else waitTime = 300 - durationTime;

			// Skip delay when opening a blank Lychee
			if (!visible.albums() && !visible.photo() && !visible.album()) waitTime = 0;
			if (visible.album() && lychee.content.html() === '') waitTime = 0;

			setTimeout(() => {
				header.setMode('albums');
				view.albums.init();
				lychee.animate(lychee.content, 'contentZoomIn');
				setTimeout(() => {
					lychee.footer_show();
				},
					300)
			}, waitTime)

		})

	} else {

		setTimeout(() => {
			header.setMode('albums');
			view.albums.init();
			lychee.animate(lychee.content, 'contentZoomIn')
		}, 300)

	}
};

albums.parse = function (album) {

	let i;
	for (i = 0; i < 3; i++) {
		if (!album.thumbs[i]) {
			album.thumbs[i] = (album.password === '1' ? 'img/password.svg' : 'img/no_images.svg');
		}
	}

};

albums._createSmartAlbums = function (data) {

	data.unsorted = {
		id: 0,
		title: lychee.locale['UNSORTED'],
		sysdate: data.unsorted.num + ' ' + lychee.locale['NUM_PHOTOS'],
		unsorted: '1',
		thumbs: data.unsorted.thumbs,
		thumbs2x: data.unsorted.thumbs2x ? data.unsorted.thumbs2x : null,
		types: data.unsorted.types
	};

	data.starred = {
		id: 'f',
		title: lychee.locale['STARRED'],
		sysdate: data.starred.num + ' ' + lychee.locale['NUM_PHOTOS'],
		star: '1',
		thumbs: data.starred.thumbs,
		thumbs2x: data.starred.thumbs2x ? data.starred.thumbs2x : null,
		types: data.starred.types
	};

	data.public = {
		id: 's',
		title: lychee.locale['PUBLIC'],
		sysdate: data.public.num + ' ' + lychee.locale['NUM_PHOTOS'],
		public: '1',
		thumbs: data.public.thumbs,
		thumbs2x: data.public.thumbs2x ? data.public.thumbs2x : null,
		hidden: '1',
		types: data.public.types
	};

	data.recent = {
		id: 'r',
		title: lychee.locale['RECENT'],
		sysdate: data.recent.num + ' ' + lychee.locale['NUM_PHOTOS'],
		recent: '1',
		thumbs: data.recent.thumbs,
		thumbs2x: data.recent.thumbs2x ? data.recent.thumbs2x : null,
		types: data.recent.types
	}

};

albums.isShared = function (albumID) {

	if (albumID == null) return false;
	if (!albums.json) return false;
	if (!albums.json.albums) return false;

	let found = false;

	let func = function () {
		if (parseInt(this.id, 10) === parseInt(albumID, 10)) {
			found = true;
			return false; // stop the loop
		}
		if (this.albums) {
			$.each(this.albums, func)
		}
	};

	if (albums.json.shared_albums !== null)
		$.each(albums.json.shared_albums, func);

	return found;

};

albums.getByID = function (albumID) {

	// Function returns the JSON of an album

	if (albumID == null) return undefined;
	if (!albums.json) return undefined;
	if (!albums.json.albums) return undefined;

	let json = undefined;

	let func = function () {
		if (parseInt(this.id, 10) === parseInt(albumID, 10)) {
			json = this;
			return false; // stop the loop
		}
		if (this.albums) {
			$.each(this.albums, func)
		}
	};

	$.each(albums.json.albums, func);

	if (json === undefined && albums.json.shared_albums !== null)
		$.each(albums.json.shared_albums, func);

	return json;

};

albums.deleteByID = function (albumID) {

	// Function returns the JSON of an album
	// This function is only ever invoked for top-level albums so it
	// doesn't need to descend down the albums tree.

	if (albumID == null) return false;
	if (!albums.json) return false;
	if (!albums.json.albums) return false;

	let deleted = false;

	$.each(albums.json.albums, function (i) {

		if (parseInt(albums.json.albums[i].id) === parseInt(albumID)) {
			albums.json.albums.splice(i, 1);
			deleted = true;
			return false  // stop the loop
		}

	});

	if (deleted === false) {
		if (!albums.json.shared_albums) return undefined;
		$.each(albums.json.shared_albums, function (i) {

			if (parseInt(albums.json.shared_albums[i].id) === parseInt(albumID)) {
				albums.json.shared_albums.splice(i, 1);
				deleted = true;
				return false // stop the loop
			}
		});
	}

	return deleted

};

albums.refresh = function () {
	albums.json = null

};
