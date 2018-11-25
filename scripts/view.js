/**
 * @description Responsible to reflect data changes to the UI.
 */

view = {};

view.albums = {

	init: function() {

		multiselect.clearSelection();

		view.albums.title();
		view.albums.content.init();

	},

	title: function() {

		lychee.setTitle(lychee.locale['ALBUMS'], false)

	},

	content: {

		scrollPosition: 0,

		init: function() {

			let smartData  = '';
			let albumsData = '';
			let sharedData = '';

			// Smart Albums
			if (lychee.publicMode===false && albums.json.smartalbums != null) {

				albums.parse(albums.json.smartalbums.unsorted);
				albums.parse(albums.json.smartalbums.public);
				albums.parse(albums.json.smartalbums.starred);
				albums.parse(albums.json.smartalbums.recent);

				smartData = build.divider(lychee.locale['SMART_ALBUMS']);
				smartData += build.album(albums.json.smartalbums.unsorted);
				smartData += build.album(albums.json.smartalbums.public);
				smartData += build.album(albums.json.smartalbums.starred);
				smartData += build.album(albums.json.smartalbums.recent);

			}

			// Albums
			if (albums.json.albums && albums.json.albums.length !==0) {

				$.each(albums.json.albums, function() {
					if(!this.parent_id || this.parent_id === 0)
					{
						albums.parse(this);
						albumsData += build.album(this)
					}
				});

				// Add divider
				if (lychee.publicMode===false) albumsData = build.divider(lychee.locale['ALBUMS']) + albumsData

			}

			if(lychee.api_V2)
			{
				// Shared
				if (albums.json.shared_albums && albums.json.shared_albums.length !==0) {

					$.each(albums.json.shared_albums, function() {
						if(!this.parent_id || this.parent_id === 0) {
							albums.parse(this);
							sharedData += build.album(this, true)
						}
					});

					// Add divider
					if (lychee.publicMode===false) sharedData = build.divider(lychee.locale['SHARED_ALBUMS']) + sharedData
				}
			}

			if (smartData==='' && albumsData==='' && sharedData==='' ) {
				lychee.content.html('');
				$('body').append(build.no_content('eye'))
			} else {
				lychee.content.html(smartData + albumsData + sharedData)
			}

			// Restore scroll position
			if (view.albums.content.scrollPosition!=null && view.albums.content.scrollPosition!==0) {
				$(document).scrollTop(view.albums.content.scrollPosition)
			}

		},

		title: function(albumID) {

			let title = albums.getByID(albumID).title;

			title = lychee.escapeHTML(title);

			$('.album[data-id="' + albumID + '"] .overlay h1')
				.html(title)
				.attr('title', title)

		},

		delete: function(albumID) {

			$('.album[data-id="' + albumID + '"]').css('opacity', 0).animate({
				width      : 0,
				marginLeft : 0
			}, 300, function() {
				$(this).remove();
				if (albums.json.albums.length <=0) lychee.content.find('.divider:last-child').remove()
			})

		}

	}

};

view.album = {

	init: function() {

		multiselect.clearSelection();

		album.parse();

		view.album.sidebar();
		view.album.title();
		view.album.public();
		view.album.content.init();

		album.json.init = 1

	},

	title: function() {

		if ((visible.album() || !album.json.init) && !visible.photo()) {

			switch (album.getID()) {
				case 'f':
					lychee.setTitle(lychee.locale['STARED'], false);
					break;
				case 's':
					lychee.setTitle(lychee.locale['PUBLIC'], false);
					break;
				case 'r':
					lychee.setTitle(lychee.locale['RECENT'], false);
					break;
				case '0':
					lychee.setTitle(lychee.locale['UNSORTED'], false);
					break;
				default:
					if (album.json.init) sidebar.changeAttr('title', album.json.title);
					lychee.setTitle(album.json.title, true);
					break
			}

		}

	},

	content: {

		init: function() {

			let photosData = '';
			let albumsData = '';
			let html = '';

			if (album.json.albums && album.json.albums !== false) {
				$.each(album.json.albums, function() {
					albums.parse(this);
					albumsData += build.album(this)
				});

			}
			if (album.json.photos && album.json.photos!==false) {

				// Build photos
				$.each(album.json.photos, function () {
					photosData += build.photo(this)
				});
			}

			if (photosData !== '' && lychee.justified) {
				photosData = '<div class="justified-layout">' + photosData + '</div>';
			}

			if (albumsData !== '' && photosData !== '')
			{
				html = build.divider(lychee.locale['ALBUMS']);
			}
			html += albumsData;
			if (albumsData !== '' && photosData !== '')
			{
				html += build.divider(lychee.locale['PHOTOS'])
			}
			html += photosData;

			// Save and reset scroll position
			view.albums.content.scrollPosition = $(document).scrollTop();
			requestAnimationFrame(() => $(document).scrollTop(0));

			// Add photos to view
			lychee.content.html(html);
			view.album.content.justify();

		},

		title: function(photoID) {

			let title = album.getByID(photoID).title;

			title = lychee.escapeHTML(title);

			$('.photo[data-id="' + photoID + '"] .overlay h1')
				.html(title)
				.attr('title', title)

		},

		star: function(photoID) {

			let $badge = $('.photo[data-id="' + photoID + '"] .icn-star');

			if (album.getByID(photoID).star ==='1') $badge.addClass('badge--star');
			else                                   $badge.removeClass('badge--star')

		},

		public: function(photoID) {

			let $badge = $('.photo[data-id="' + photoID + '"] .icn-share');

			if (album.getByID(photoID).public==='1') $badge.addClass('badge--visible');
			else                                     $badge.removeClass('badge--visible')

		},

		delete: function(photoID) {

			$('.photo[data-id="' + photoID + '"]').css('opacity', 0).animate({
				width: 0,
				marginLeft: 0
			}, 300, function () {
				$(this).remove();
				// Only when search is not active
				if (!visible.albums()) {
					album.json.num--;
					view.album.num()
				}
			})

		},

		justify: function () {
			if (!lychee.justified) return;
			if (!album.json.photos || album.json.photos===false) return;
			let ratio = [];
			$.each(album.json.photos, function (i) {
				let l_width = this.width > 0 ? this.width : 200;
				let l_height = this.height > 0 ? this.height : 200;
				ratio[i] = l_width / l_height;
			});
			let layoutGeometry = require('justified-layout')(ratio, {
				containerWidth: $('.justified-layout').width(),
				containerPadding: 0
			});
			if(lychee.admin) console.log(layoutGeometry);
			$('.justified-layout').css('height',layoutGeometry.containerHeight + 'px')
				.css('height',layoutGeometry.containerHeight + 'px');
			$('.justified-layout > div').each(function (i) {
				$(this).css('top',layoutGeometry.boxes[i].top);
				$(this).css('width',layoutGeometry.boxes[i].width);
				$(this).css('height',layoutGeometry.boxes[i].height);
				$(this).css('left',layoutGeometry.boxes[i].left);
			});
		}

	},

	description: function() {

		sidebar.changeAttr('description', album.json.description)

	},

	num: function() {

		sidebar.changeAttr('images', album.json.num)

	},

	public: function() {

		if (album.json.public==='1') {

			$('#button_share_album')
				.addClass('active')
				.attr('title', lychee.locale['SHARE_ALBUM']);

			$('.photo .iconic-share').remove();

			if (album.json.init) sidebar.changeAttr('public', lychee.locale['ALBUM_SHR_YES'])

		} else {

			$('#button_share_album')
				.removeClass('active')
				.attr('title', lychee.locale['MAKE_PUBLIC']);

			if (album.json.init) sidebar.changeAttr('public', lychee.locale['ALBUM_SHR_NO'])

		}

	},

	hidden: function() {

		if (album.json.visible==='1') sidebar.changeAttr('hidden', lychee.locale['ALBUM_SHR_NO']);
		else                          sidebar.changeAttr('hidden', lychee.locale['ALBUM_SHR_YES'])

	},

	downloadable: function() {

		if (album.json.downloadable==='1') sidebar.changeAttr('downloadable', lychee.locale['ALBUM_SHR_YES']);
		else                               sidebar.changeAttr('downloadable', lychee.locale['ALBUM_SHR_NO'])

	},

	password: function() {

		if (album.json.password==='1') sidebar.changeAttr('password', lychee.locale['ALBUM_SHR_YES']);
		else                           sidebar.changeAttr('password', lychee.locale['ALBUM_SHR_NO'])

	},

	sidebar: function() {

		if ((visible.album() || !album.json.init) && !visible.photo()) {

			let structure = sidebar.createStructure.album(album.json);
			let html      = sidebar.render(structure);

			sidebar.dom('.sidebar__wrapper').html(html);
			sidebar.bind()

		}

	}

};

view.photo = {

	init: function() {

		multiselect.clearSelection();

		photo.parse();

		view.photo.sidebar();
		view.photo.title();
		view.photo.star();
		view.photo.public();
		view.photo.photo();
		view.photo.license();

		photo.json.init = 1

	},

	show: function() {

		// Change header
		lychee.content.addClass('view');
		header.setMode('photo');

		// Make body not scrollable
		$('body').css('overflow', 'hidden');

		// Fullscreen
		let timeout = null;
		$(document).bind('mousemove', function() {
			clearTimeout(timeout);
			header.show();
			timeout = setTimeout(header.hide, 2500)
		});

		lychee.animate(lychee.imageview, 'fadeIn')

	},

	hide: function() {

		header.show();

		lychee.content.removeClass('view');
		header.setMode('album');

		// Make body scrollable
		$('body').css('overflow', 'auto');

		// Disable Fullscreen
		$(document).unbind('mousemove');
		if($('video').length){
		  $('video')[$('video').length - 1].pause();
		}

		// Hide Photo
		lychee.animate(lychee.imageview, 'fadeOut');
		setTimeout(() => {
			lychee.imageview.hide();
			view.album.sidebar()
		}, 300)

	},

	title: function() {

		if (photo.json.init) sidebar.changeAttr('title', photo.json.title);
		lychee.setTitle(photo.json.title, true)

	},

	description: function() {

		if (photo.json.init) sidebar.changeAttr('description', photo.json.description)

	},

	license: function() {
		if (photo.json.init) sidebar.changeAttr('license', photo.json.license)
	},

	star: function() {

		if (photo.json.star==='1') {

			// Starred
			$('#button_star')
				.addClass('active')
				.attr('title', lychee.locale['UNSTAR_PHOTO'])

		} else {

			// Unstarred
			$('#button_star').removeClass('active').attr('title', lychee.locale['STAR_PHOTO'])

		}

	},

	public: function() {

		if (photo.json.public==='1' || photo.json.public==='2') {

			// Photo public
			$('#button_share')
				.addClass('active')
				.attr('title', lychee.locale['SHARE_PHOTO']);

			if (photo.json.init) sidebar.changeAttr('public', lychee.locale['PHOTO_SHR_YES'])

		} else {

			// Photo private
			$('#button_share')
				.removeClass('active')
				.attr('title', 'Make Public');

			if (photo.json.init) sidebar.changeAttr('public', 'No')

		}

	},

	tags: function() {

		sidebar.changeAttr('tags', build.tags(photo.json.tags), true);
		sidebar.bind()

	},

	photo: function() {

		lychee.imageview.html(build.imageview(photo.json, visible.header()));

		let $nextArrow     = lychee.imageview.find('a#next');
		let $previousArrow = lychee.imageview.find('a#previous');
		let photoID        = photo.getID();
		let hasNext        = album.json && album.json.photos && album.getByID(photoID) && album.getByID(photoID).nextPhoto!=null && album.getByID(photoID).nextPhoto!=='';
		let hasPrevious    = album.json && album.json.photos && album.getByID(photoID) && album.getByID(photoID).previousPhoto!=null && album.getByID(photoID).previousPhoto!=='';

		if (hasNext===false || lychee.viewMode===true) {

			$nextArrow.hide()

		} else {

			let nextPhotoID = album.getByID(photoID).nextPhoto;
			let nextPhoto   = album.getByID(nextPhotoID);

			$nextArrow.css('background-image', lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${ nextPhoto.thumbUrl }")`)

		}

		if (hasPrevious===false || lychee.viewMode===true) {

			$previousArrow.hide()

		} else {

			let previousPhotoID = album.getByID(photoID).previousPhoto;
			let previousPhoto   = album.getByID(previousPhotoID);

			$previousArrow.css('background-image', lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${ previousPhoto.thumbUrl }")`)

		}

	},

	sidebar: function() {

		let structure = sidebar.createStructure.photo(photo.json);
		let html      = sidebar.render(structure);

		sidebar.dom('.sidebar__wrapper').html(html);
		sidebar.bind()

	}

};

view.settings = {

	init: function() {

		multiselect.clearSelection();

		view.settings.title();
		view.settings.content.init()

	},

	title: function() {

		lychee.setTitle('Settings', false)
	},

	clearContent: function() {
		lychee.content.unbind('mousedown');
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {

		init: function() {
			view.settings.clearContent();
			view.settings.content.setLogin();
			if(lychee.admin)
			{
				view.settings.content.setSorting();
				view.settings.content.setDropboxKey();
				view.settings.content.setLang();
				view.settings.content.setLayoutOverlay();
			}
		},

		setLogin: function () {
			let msg = `
			<div class="setLogin">
			  <p>
				  ` + lychee.locale['PASSWORD_TITLE'] + `
				  <input name='oldUsername' class='text' type='text' placeholder='` + lychee.locale['USERNAME_CURRENT'] + `' value=''>
				  <input name='oldPassword' class='text' type='password' placeholder='` + lychee.locale['PASSWORD_CURRENT'] + `' value=''>
			  </p>
			  <p>
				  ` + lychee.locale['PASSWORD_TEXT'] + `
				  <input name='username' class='text' type='text' placeholder='` + lychee.locale['LOGIN_USERNAME'] + `' value=''>
				  <input name='password' class='text' type='password' placeholder='` + lychee.locale['LOGIN_PASSWORD'] + `' value=''>
			  </p>
			<div class="basicModal__buttons">
				<!--<a id="basicModal__cancel" class="basicModal__button ">Cancel</a>-->
				<a id="basicModal__action_password_change" class="basicModal__button ">` + lychee.locale['PASSWORD_CHANGE'] + `</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);

			settings.bind('#basicModal__action_password_change','.setLogin',settings.changeLogin);

		},

		clearLogin: function () {
			$('input[name=oldUsername], input[name=oldPassword], input[name=username], input[name=password]').val('')
		},

		setSorting: function() {

			let sortingPhotos = [];
			let sortingAlbums = [];

			let msg = `
			<div class="setSorting">
			  <p>` + lychee.locale['SORT_ALBUM_BY_1'] + `
				  <span class="select">
					  <select id="settings_albums_type" name="typeAlbums">
						  <option value='id'>` + lychee.locale['SORT_ALBUM_SELECT_1'] + `</option>
						  <option value='title'>` + lychee.locale['SORT_ALBUM_SELECT_2'] + `</option>
						  <option value='description'>` + lychee.locale['SORT_ALBUM_SELECT_3'] + `</option>
						  <option value='public'>` + lychee.locale['SORT_ALBUM_SELECT_4'] + `</option>
						  <option value='max_takestamp'>` + lychee.locale['SORT_ALBUM_SELECT_5'] + `</option>
						  <option value='min_takestamp'>` + lychee.locale['SORT_ALBUM_SELECT_6'] + `</option>
					  </select>
				  </span>
				  ` + lychee.locale['SORT_ALBUM_BY_2'] + `
				  <span class="select">
					  <select id="settings_albums_order" name="orderAlbums">
						  <option value='ASC'>` + lychee.locale['SORT_ASCENDING'] + `</option>
						  <option value='DESC'>` + lychee.locale['SORT_DESCENDING'] + `</option>
					  </select>
				  </span>
				  ` + lychee.locale['SORT_ALBUM_BY_3'] + `
			  </p>
			  <p>` + lychee.locale['SORT_PHOTO_BY_1'] + `
				  <span class="select">
					  <select id="settings_photos_type" name="typePhotos">
						  <option value='id'>` + lychee.locale['SORT_PHOTO_SELECT_1'] + `</option>
						  <option value='takestamp'>` + lychee.locale['SORT_PHOTO_SELECT_2'] + `</option>
						  <option value='title'>` + lychee.locale['SORT_PHOTO_SELECT_3'] + `</option>
						  <option value='description'>` + lychee.locale['SORT_PHOTO_SELECT_4'] + `</option>
						  <option value='public'>` + lychee.locale['SORT_PHOTO_SELECT_5'] + `</option>
						  <option value='star'>` + lychee.locale['SORT_PHOTO_SELECT_6'] + `</option>
						  <option value='type'>` + lychee.locale['SORT_PHOTO_SELECT_7'] + `</option>
					  </select>
				  </span>
				  ` + lychee.locale['SORT_PHOTO_BY_2'] + `
				  <span class="select">
					  <select id="settings_photos_order" name="orderPhotos">
						  <option value='ASC'>` + lychee.locale['SORT_ASCENDING'] + `</option>
						  <option value='DESC'>` + lychee.locale['SORT_DESCENDING'] + `</option>
					  </select>
				  </span>
				  ` + lychee.locale['SORT_PHOTO_BY_3'] + `
			  </p>
				<div class="basicModal__buttons">
					<!--<a id="basicModal__cancel" class="basicModal__button ">Cancel</a>-->
					<a id="basicModal__action_sorting_change" class="basicModal__button ">` + lychee.locale['SORT_CHANGE'] + `</a>
				</div>
			  </div>
			  `;

			$(".settings_view").append(msg);

			if (lychee.sortingAlbums!=='') {

				sortingAlbums = lychee.sortingAlbums.replace('ORDER BY ', '').split(' ');

				$('.setSorting select#settings_albums_type').val(sortingAlbums[0]);
				$('.setSorting select#settings_albums_order').val(sortingAlbums[1])

			}

			if (lychee.sortingPhotos!=='') {

				sortingPhotos = lychee.sortingPhotos.replace('ORDER BY ', '').split(' ');

				$('.setSorting select#settings_photos_type').val(sortingPhotos[0]);
				$('.setSorting select#settings_photos_order').val(sortingPhotos[1])

			}

			settings.bind('#basicModal__action_sorting_change','.setSorting',settings.changeSorting);
		},

		setDropboxKey: function () {
			let msg = `
			<div class="setDropBox">
			  <p>${ lychee.locale['DROPBOX_TEXT'] }
			  <input class='text' name='key' type='text' placeholder='Dropbox API Key' value='${ lychee.dropboxKey }'>
			  </p>
				<div class="basicModal__buttons">
					<a id="basicModal__action_dropbox_change" class="basicModal__button">${ lychee.locale['DROPBOX_TITLE'] }</a>
				</div>
			  </div>
			  `;

			$(".settings_view").append(msg);
			settings.bind('#basicModal__action_dropbox_change','.setDropBox',settings.changeDropboxKey);
		},

		setLang: function () {
			let msg = `
			<div class="setLang">
			<p>${ lychee.locale['LANG_TEXT']}
			  <span class="select">
				  <select id="settings_photos_order" name="lang">`;
			let i = 0;
			while( i < lychee.lang_available.length)
			{
				let lang_av = lychee.lang_available[i];
				msg += `<option ` + (lychee.lang === lang_av ? 'selected' : '') + `>` + lang_av + `</option>`;
				i += 1;
			}
			msg += `
				  </select>
			  </span>
			</p>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_lang" class="basicModal__button">${ lychee.locale['LANG_TITLE'] }</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);
			settings.bind('#basicModal__action_set_lang','.setLang',settings.changeLang);
		},

		setLayoutOverlay: function () {
			let msg = `
			<div class="setLayoutOverlay">
			<p>${ lychee.locale['LAYOUT_TEXT'] }
			<label class="switch">
			  <input id="JustifiedLayout" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			<p>${ lychee.locale['IMAGE_OVERLAY_TEXT'] }
			<label class="switch">
			  <input id="ImageOverlay" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>`;

			$(".settings_view").append(msg);
			if(lychee.justified) $('#JustifiedLayout').click();
			if(lychee.image_overlay) $('#ImageOverlay').click();

			settings.bind('#JustifiedLayout','.setLayoutOverlay',settings.changeLayout);
			settings.bind('#ImageOverlay','.setLayoutOverlay',settings.changeImageOverlay);
		}
	},

};

view.users = {
	init: function() {

		multiselect.clearSelection();

		view.users.title();
		view.users.content.init()

	},

	title: function() {

		lychee.setTitle('Users', false)

	},

	clearContent: function() {
		lychee.content.unbind('mousedown');
		lychee.content.html('<div class="users_view"></div>');
	},

	content: {

		init: function () {

			view.users.clearContent();

			if (users.json.length === 0) {
				$(".users_view").append('<div class="users_view_line" style="margin-bottom: 50px;"><p style="text-align: center">User list is empty!</p></div>');
			}

			let html = '';

			html += '<div class="users_view_line">' +
			'<p>' +
			'<span class="text">username</span>' +
			'<span class="text">new password</span>' +
			'<span class="text_icon">' + build.iconic('data-transfer-upload')+ '</span>' +
			'<span class="text_icon">' + build.iconic('lock-locked')+ '</span>' +
			'</p>' +
			'</div>';

			$(".users_view").append(html);

			$.each(users.json, function() {
				$(".users_view").append(build.user(this));
				// photosData += build.photo(this)
				settings.bind('#UserUpdate' + this.id, '#UserData' + this.id, users.update);
				settings.bind('#UserDelete' + this.id, '#UserData' + this.id, users.delete);
				if(this.upload === 1)
				{
					$('#UserData' + this.id + ' .choice input[name="upload"]').click();
				}
				if(this.lock === 1)
				{
					$('#UserData' + this.id + ' .choice input[name="lock"]').click();
				}

			});

			html = '<div class="users_view_line"';

			if (users.json.length === 0) {
				html += ' style="padding-top: 0px;"';
			}
			html += '>' +
				'<p id="UserCreate">' +
				'<input class="text" name="username" type="text" value="" placeholder="new username" />' +
				'<input class="text" name="password" type="text" placeholder="new password" />' +
				'<span class="choice">' +
				'<label>' +
				'<input type="checkbox" name="upload" />' +
				'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
				'</label>' +
				'</span>' +
				'<span class="choice">' +
				'<label>' +
				'<input type="checkbox" name="lock" />' +
				'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
				'</label>' +
				'</span>' +
				'</p>' +
				'<a id="UserCreate_button"  class="basicModal__button basicModal__button_CREATE">Create</a>' +
				'</div>';
			$(".users_view").append(html);
			settings.bind('#UserCreate_button', '#UserCreate', users.create);
		}
	}
};

view.sharing = {
	init: function() {

		multiselect.clearSelection();

		view.sharing.title();
		view.sharing.content.init()

	},

	title: function() {

		lychee.setTitle('Sharing', false)

	},

	clearContent: function() {
		lychee.content.unbind('mousedown');
		lychee.content.html('<div class="sharing_view"></div>');
	},

	content: {

		init: function () {

			view.sharing.clearContent();

			if (sharing.json.shared.length === 0) {
				$(".sharing_view").append('<div class="sharing_view_line" style="margin-bottom: 50px;"><p style="text-align: center">Sharing list is empty!</p></div>');
			}


			let html = '';

			html += `
			<div class="sharing_view_line"><p>Share</p></div>
			<div class="sharing_view_line">
				<div class="col-xs-5">
					<select name="from" id="albums_list" class="form-control select" size="13" multiple="multiple">`

			$.each(sharing.json.albums, function() {
				html += `<option value="` + this.id + `">` + this.title + `</option>`;
			});

			html += `</select>
				</div>

				<div class="col-xs-2">
					<!--<button type="button" id="albums_list_undo" class="btn btn-primary btn-block">undo</button>-->
					<button type="button" id="albums_list_rightAll" class="btn btn-default btn-block blue">` + build.iconic('media-skip-forward') + `</button>
					<button type="button" id="albums_list_rightSelected" class="btn btn-default btn-block blue">` + build.iconic('chevron-right') + `</button>
					<button type="button" id="albums_list_leftSelected" class="btn btn-default btn-block grey">` + build.iconic('chevron-left') + `</button>
					<button type="button" id="albums_list_leftAll" class="btn btn-default btn-block grey">` + build.iconic('media-skip-backward') + `</button>
					<!--<button type="button" id="albums_list_redo" class="btn btn-warning btn-block">redo</button>-->
				</div>

				<div class="col-xs-5">
					<select name="to" id="albums_list_to" class="form-control select" size="13" multiple="multiple"></select>
				</div>
			</div>`;

			html += `
			<div class="sharing_view_line"><p class="with">with</p></div>
			<div class="sharing_view_line">
				<div class="col-xs-5">
					<select name="from" id="user_list" class="form-control select" size="13" multiple="multiple">`

			$.each(sharing.json.users, function() {
				html += `<option value="` + this.id + `">` + this.username + `</option>`;
			});

			html += `</select>
				</div>

				<div class="col-xs-2">
					<!--<button type="button" id="user_list_undo" class="btn btn-primary btn-block">undo</button>-->
					<button type="button" id="user_list_rightAll" class="btn btn-default btn-block blue">` + build.iconic('media-skip-forward') + `</button>
					<button type="button" id="user_list_rightSelected" class="btn btn-default btn-block blue">` + build.iconic('chevron-right') + `</button>
					<button type="button" id="user_list_leftSelected" class="btn btn-default btn-block grey">` + build.iconic('chevron-left') + `</button>
					<button type="button" id="user_list_leftAll" class="btn btn-default btn-block grey">` + build.iconic('media-skip-backward') + `</button>
					<!--<button type="button" id="user_list_redo" class="btn btn-warning btn-block">redo</button>-->
				</div>

				<div class="col-xs-5">
					<select name="to" id="user_list_to" class="form-control select" size="13" multiple="multiple"></select>
				</div>
			</div>`;
			html += `<div class="sharing_view_line"><a id="Share_button"  class="basicModal__button">Share</a></div>`;
			html += '<div class="sharing_view_line">';

			$.each(sharing.json.shared, function() {
				html +=
				`<p><span class="text">` + this.title + `</span><span class="text">` + this.username +
				'</span><span class="choice">' +
				'<label>' +
				'<input type="checkbox" name="remove_id" value="' + this.id + '"/>' +
				'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
				'</label>' +
				'</span></p>' +
				``;
			});

			html += '</div>';
			if(sharing.json.shared.length !== 0)
			{
				html += `<div class="sharing_view_line"><a id="Remove_button"  class="basicModal__button">Remove</a></div>`;
			}

			$(".sharing_view").append(html);

			$('#albums_list').multiselect();
			$('#user_list').multiselect();
			$("#Share_button").on('click', sharing.add)
				.on('mouseenter', function () {$('#albums_list_to, #user_list_to').addClass('borderBlue')})
				.on('mouseleave', function () {$('#albums_list_to, #user_list_to').removeClass('borderBlue')});

			$('#Remove_button').on('click', sharing.delete);
		}
	}
};

view.logs_diagnostics = {
	init: function (get) {

		multiselect.clearSelection();

		view.logs_diagnostics.title(get);
		view.logs_diagnostics.content.init(get)

	},

	title: function (get) {

		lychee.setTitle(get, false)

	},

	clearContent: function () {
		lychee.content.unbind('mousedown');
		lychee.content.html('<pre class="logs_diagnostics_view"></pre>');
	},

	content: {
		init: function (get) {
			view.logs_diagnostics.clearContent();
			api.post_raw(get, {}, function (data) {
				$(".logs_diagnostics_view").html(data);
			})
		}
	}
};
