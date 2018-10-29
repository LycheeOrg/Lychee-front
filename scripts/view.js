/**
 * @description Responsible to reflect data changes to the UI.
 */

view = {};

view.albums = {

	init: function() {

		view.albums.title();
		view.albums.content.init()

	},

	title: function() {

		lychee.setTitle('Albums', false)

	},

	content: {

		scrollPosition: 0,

		init: function() {

			let smartData  = '';
			let albumsData = '';

			// Smart Albums
			if (lychee.publicMode===false) {

				albums.parse(albums.json.smartalbums.unsorted);
				albums.parse(albums.json.smartalbums.public);
				albums.parse(albums.json.smartalbums.starred);
				albums.parse(albums.json.smartalbums.recent);

				smartData = build.divider('Smart Albums') + build.album(albums.json.smartalbums.unsorted) + build.album(albums.json.smartalbums.public) + build.album(albums.json.smartalbums.starred) + build.album(albums.json.smartalbums.recent)

			}

			// Albums
			if (albums.json.albums && albums.json.num!==0) {

				$.each(albums.json.albums, function() {
					albums.parse(this);
					albumsData += build.album(this)
				});

				// Add divider
				if (lychee.publicMode===false) albumsData = build.divider('Albums') + albumsData

			}

			if (smartData==='' && albumsData==='') {
				lychee.content.html('');
				$('body').append(build.no_content('eye'))
			} else {
				lychee.content.html(smartData + albumsData)
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
				if (albums.json.num<=0) lychee.content.find('.divider:last-child').remove()
			})

		}

	}

};

view.album = {

	init: function() {

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

			if (album.json.content && album.json.content!==false) {

				// Build photos
				$.each(album.json.photos, function() {
					photosData += build.photo(this)
				})

			}

			// Save and reset scroll position
			view.albums.content.scrollPosition = $(document).scrollTop();
			requestAnimationFrame(() => $(document).scrollTop(0));

			// Add photos to view
			lychee.content.html(photosData)

		},

		title: function(photoID) {

			let title = album.json.content[photoID].title;

			title = lychee.escapeHTML(title);

			$('.photo[data-id="' + photoID + '"] .overlay h1')
				.html(title)
				.attr('title', title)

		},

		star: function(photoID) {

			let $badge = $('.photo[data-id="' + photoID + '"] .icn-star');

			if (album.json.content[photoID].star==='1') $badge.addClass('badge--visible');
			else                                        $badge.removeClass('badge--visible')

		},

		public: function(photoID) {

			let $badge = $('.photo[data-id="' + photoID + '"] .icn-share');

			if (album.json.content[photoID].public==='1') $badge.addClass('badge--visible');
			else                                          $badge.removeClass('badge--visible')

		},

		delete: function(photoID) {

			$('.photo[data-id="' + photoID + '"]').css('opacity', 0).animate({
				width      : 0,
				marginLeft : 0
			}, 300, function() {
				$(this).remove();
				// Only when search is not active
				if (!visible.albums()) {
					album.json.num--;
					view.album.num()
				}
			})

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

		photo.parse();

		view.photo.sidebar();
		view.photo.title();
		view.photo.star();
		view.photo.public();
		view.photo.photo();

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
		let hasNext        = album.json && album.json.content && album.json.content[photoID] && album.json.content[photoID].nextPhoto!=null && album.json.content[photoID].nextPhoto!=='';
		let hasPrevious    = album.json && album.json.content && album.json.content[photoID] && album.json.content[photoID].previousPhoto!=null && album.json.content[photoID].previousPhoto!=='';

		if (hasNext===false || lychee.viewMode===true) {

			$nextArrow.hide()

		} else {

			let nextPhotoID = album.json.content[photoID].nextPhoto;
			let nextPhoto   = album.json.content[nextPhotoID];

			$nextArrow.css('background-image', lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${ nextPhoto.thumbUrl }")`)

		}

		if (hasPrevious===false || lychee.viewMode===true) {

			$previousArrow.hide()

		} else {

			let previousPhotoID = album.json.content[photoID].previousPhoto;
			let previousPhoto   = album.json.content[previousPhotoID];

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

        view.settings.title();
        view.settings.content.init()

    },

    title: function() {

        lychee.setTitle('Settings', false)
    },

    clearContent: function() {
        $('.content').unbind('mousedown');
    	$(".content").html('<div class="settings_view"></div>');
	},

	content: {

    	init: function() {
            view.settings.clearContent();
            view.settings.content.setLogin();
            view.settings.content.setSorting();
            view.settings.content.setDropboxKey();
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
        }
    },

};

view.users = {
    init: function() {

        view.users.title();
        view.users.content.init()

    },

    title: function() {

        lychee.setTitle('Users', false)

    },

    clearContent: function() {
        $('.content').unbind('mousedown');
        $(".content").html('<div class="users_view"></div>');
    },

    content: {

        init: function () {

        	view.users.clearContent();

			let i = 0;
			while(i < users.json.length)
			{
				user = users.json[i];

                $(".users_view").append(build.user(user));

                settings.bind('#UserUpdate' + user.id, '#UserData' + user.id, users.update);
                settings.bind('#UserDelete' + user.id, '#UserData' + user.id, users.delete);
                i += 1;
			}
			if (users.json.length === 0) {
                    $(".users_view").append('<div class="users_view_line"><p style="text-align: center">User list is empty!</p></div>');
            }
            let html =
				'<div class="users_view_line">' +
				'<p id="UserCreate">' +
				'<input class="text" name="username" type="text" value="" placeholder="new username" />' +
				'<input class="text" name="password" type="text" placeholder="new password" />' +
				'</p>' +
				'<a id="UserCreate_button"  class="basicModal__button basicModal__button_CREATE">Create</a>' +
				'</div>';
			$(".users_view").append(html);
            settings.bind('#UserCreate_button', '#UserCreate', users.create);
        }
    }
};