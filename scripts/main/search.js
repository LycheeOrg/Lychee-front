/**
 * @description Searches through your photos and albums.
 */

search = {

	hash: null

};

search.find = function(term) {

	if(term.trim() === '') return false;

	clearTimeout($(window).data('timeout'));

	$(window).data('timeout', setTimeout(function() {

		if (header.dom('.header__search').val().length!==0) {

			api.post('search', { term }, function(data) {

				let html       = '';
				let albumsData = '';
				let photosData = '';

				// Build albums
				if (data && data.albums) {
					albums.json = { albums: data.albums };
					$.each(albums.json.albums, function() {
						albums.parse(this);
						albumsData += build.album(this)
					})
				}

				// Build photos
				if (data && data.photos) {
					album.json = { photos: data.photos };
					$.each(album.json.photos, function() {
						photosData += build.photo(this)
					})
				}

				let albums_divider = lychee.locale['ALBUMS'];
				let photos_divider = lychee.locale['PHOTOS'];

				if (albumsData !=='') albums_divider += ' (' + data.albums.length + ')';
				if (photosData !== '') {
					photos_divider += ' (' + data.photos.length + ')';
					if (lychee.layout === '1') {
						photosData = '<div class="justified-layout">' + photosData + '</div>';
					}
					else if  (lychee.layout === '2') {
						photosData = '<div class="unjustified-layout">' + photosData + '</div>';
					}
				}

				// 1. No albums and photos
				// 2. Only photos
				// 3. Only albums
				// 4. Albums and photos
				if (albumsData==='' && photosData==='') html = 'error';
				else if (albumsData==='')               html = build.divider(photos_divider) + photosData;
				else if (photosData==='')               html = build.divider(albums_divider) + albumsData;
				else                                    html = build.divider(albums_divider) + albumsData + build.divider(photos_divider) + photosData;

				// Only refresh view when search results are different
				if (search.hash!==data.hash) {

					$('.no_content').remove();

					lychee.animate('.content', 'contentZoomOut');

					search.hash = data.hash;

					setTimeout(() => {

						if (html==='error') {
							lychee.content.html('');
							$('body').append(build.no_content('magnifying-glass'))
						} else {
							lychee.content.html(html);
							view.album.content.justify();
							lychee.animate(lychee.content, 'contentZoomIn')
						}

					}, 300)

				}

			})

		} else search.reset()

	}, 250))

};

search.reset = function() {

	header.dom('.header__search').val('');
	$('.no_content').remove();

	if (search.hash!=null) {

		// Trash data
		albums.json = null;
		album.json  = null;
		photo.json  = null;
		search.hash = null;

		lychee.animate('.divider', 'fadeOut');
		lychee.goto()

	}

};
