/**
 * @description Takes care of every action albums can handle and execute.
 */

albums = {

	json: null

};

albums.load = function() {

	let startTime = new Date().getTime();

	lychee.animate('.content', 'contentZoomOut');

	if (albums.json===null) {

		api.post('Albums::get', {}, function(data) {

			let waitTime = 0;

			// Smart Albums
			if (lychee.publicMode===false && data.smartalbums != null) albums._createSmartAlbums(data.smartalbums);

			albums.json = data;

			// Calculate delay
			let durationTime = (new Date().getTime() - startTime);
			if (durationTime>300) waitTime = 0;
			else                  waitTime = 300 - durationTime;

			// Skip delay when opening a blank Lychee
			if (!visible.albums() && !visible.photo() && !visible.album()) waitTime = 0;
			if (visible.album() && lychee.content.html()==='')             waitTime = 0;

			setTimeout(() => {
				header.setMode('albums');
				view.albums.init();
				lychee.animate(lychee.content, 'contentZoomIn')
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

albums.parse = function(album) {

	if (album.password==='1' && lychee.publicMode===true) {
		album.thumbs[0] = 'Lychee-front/images/password.svg';
		album.thumbs[1] = 'Lychee-front/images/password.svg';
		album.thumbs[2] = 'Lychee-front/images/password.svg'
	} else {
		if (!album.thumbs[0]) album.thumbs[0] = 'Lychee-front/images/no_images.svg';
		if (!album.thumbs[1]) album.thumbs[1] = 'Lychee-front/images/no_images.svg';
		if (!album.thumbs[2]) album.thumbs[2] = 'Lychee-front/images/no_images.svg'
	}

};

albums._createSmartAlbums = function(data) {

	data.unsorted = {
		id       : 0,
		title    : lychee.locale['UNSORTED'],
		sysdate  : data.unsorted.num + ' ' + lychee.locale['NUM_PHOTOS'],
		unsorted : '1',
		thumbs   : data.unsorted.thumbs,
		types   : data.unsorted.types
	};

	data.starred = {
		id      : 'f',
		title   : lychee.locale['STARED'],
		sysdate : data.starred.num + ' ' + lychee.locale['NUM_PHOTOS'],
		star    : '1',
		thumbs  : data.starred.thumbs,
    types   : data.starred.types
	};

	data.public = {
		id      : 's',
		title   : lychee.locale['PUBLIC'],
		sysdate : data.public.num + ' ' + lychee.locale['NUM_PHOTOS'],
		public  : '1',
		thumbs  : data.public.thumbs,
		hidden 	: '1',
    types   : data.public.types
	};

	data.recent = {
		id      : 'r',
		title   : lychee.locale['RECENT'],
		sysdate : data.recent.num + ' ' + lychee.locale['NUM_PHOTOS'],
		recent  : '1',
		thumbs  : data.recent.thumbs,
    types   : data.recent.types
	}

};

albums.getByID = function(albumID) {

	// Function returns the JSON of an album

	if (albumID==null)       return undefined;
	if (!albums.json)        return undefined;
	if (!albums.json.albums) return undefined;

	let json = undefined;

	$.each(albums.json.albums, function(i) {

		let elem = albums.json.albums[i];

		if (elem.id==albumID) json = elem

	});

	return json

};

albums.deleteByID = function(albumID) {

	// Function returns the JSON of an album

	if (albumID==null)       return false;
	if (!albums.json)        return false;
	if (!albums.json.albums) return false;

	let deleted = false;

	$.each(albums.json.albums, function(i) {

		if (albums.json.albums[i].id==albumID) {
			albums.json.albums.splice(i, 1);
			deleted = true;
			return false
		}

	});

	return deleted

};

albums.refresh = function() {

	albums.json = null

};
