/**
 * @description Responsible to reflect data changes to the UI.
 */

view = {};

view.albums = {

	init: function () {

		multiselect.clearSelection();

		view.albums.title();
		view.albums.content.init();

	},

	title: function () {

		if (lychee.landing_page_enable) {
			if (lychee.title !== 'Lychee v4') {
				lychee.setTitle(lychee.title, false)
			} else {
				lychee.setTitle(lychee.locale['ALBUMS'], false)
			}
		} else {
			lychee.setTitle(lychee.locale['ALBUMS'], false)
		}

	},

	content: {

		scrollPosition: 0,

		init: function () {

			let smartData = '';
			let albumsData = '';
			let sharedData = '';

			// Smart Albums
			if (lychee.publicMode === false && albums.json.smartalbums != null) {

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
			if (albums.json.albums && albums.json.albums.length !== 0) {

				$.each(albums.json.albums, function () {
					if (!this.parent_id || this.parent_id === 0) {
						albums.parse(this);
						albumsData += build.album(this)
					}
				});

				// Add divider
				if (lychee.publicMode === false) albumsData = build.divider(lychee.locale['ALBUMS']) + albumsData

			}

			if (lychee.api_V2) {
				let current_owner = '';
				let i = 0;
				// Shared
				if (albums.json.shared_albums && albums.json.shared_albums.length !== 0) {

					for (i = 0; i < albums.json.shared_albums.length; ++i) {
						let alb = albums.json.shared_albums[i];
						if (!alb.parent_id || alb.parent_id === 0) {
							albums.parse(alb);
							if (current_owner !== alb.owner && lychee.publicMode === false) {
								sharedData += build.divider(alb.owner);
								current_owner = alb.owner;
							}
							sharedData += build.album(alb, !lychee.admin);
						}
					}
					// $.each(albums.json.shared_albums, function() {
					// 	if(!this.parent_id || this.parent_id === 0) {
					// 		albums.parse(this);
					// 		sharedData += build.album(this, true)
					// 	}
					// });
					//
					// // Add divider
					// if (lychee.publicMode===false) sharedData = build.divider(lychee.locale['SHARED_ALBUMS']) + sharedData
				}
			}

			if (smartData === '' && albumsData === '' && sharedData === '') {
				lychee.content.html('');
				$('body').append(build.no_content('eye'))
			} else {
				lychee.content.html(smartData + albumsData + sharedData)
			}

			// Restore scroll position
			if (view.albums.content.scrollPosition != null && view.albums.content.scrollPosition !== 0) {
				$(document).scrollTop(view.albums.content.scrollPosition)
			}

		},

		title: function (albumID) {

			let title = albums.getByID(albumID).title;

			title = lychee.escapeHTML(title);

			$('.album[data-id="' + albumID + '"] .overlay h1')
				.html(title)
				.attr('title', title)

		},

		delete: function (albumID) {

			$('.album[data-id="' + albumID + '"]').css('opacity', 0).animate({
				width: 0,
				marginLeft: 0
			}, 300, function () {
				$(this).remove();
				if (albums.json.albums.length <= 0) lychee.content.find('.divider:last-child').remove()
			})

		}

	}

};

view.album = {

	init: function () {

		multiselect.clearSelection();

		album.parse();

		view.album.sidebar();
		view.album.title();
		view.album.public();
		view.album.content.init();

		album.json.init = 1

	},

	title: function () {

		if ((visible.album() || !album.json.init) && !visible.photo()) {

			switch (album.getID()) {
				case 'f':
					lychee.setTitle(lychee.locale['STARRED'], true);
					break;
				case 's':
					lychee.setTitle(lychee.locale['PUBLIC'], true);
					break;
				case 'r':
					lychee.setTitle(lychee.locale['RECENT'], true);
					break;
				case '0':
					lychee.setTitle(lychee.locale['UNSORTED'], true);
					break;
				default:
					if (album.json.init) sidebar.changeAttr('title', album.json.title);
					lychee.setTitle(album.json.title, true);
					break
			}

		}

	},

	content: {

		init: function () {

			let photosData = '';
			let albumsData = '';
			let html = '';

			if (album.json.albums && album.json.albums !== false) {
				$.each(album.json.albums, function () {
					albums.parse(this);
					albumsData += build.album(this, !album.isUploadable())
				});

			}
			if (album.json.photos && album.json.photos !== false) {

				// Build photos
				$.each(album.json.photos, function () {
					photosData += build.photo(this, !album.isUploadable())
				});
			}

			if (photosData !== '') {
				if (lychee.layout === '1') {
					photosData = '<div class="justified-layout">' + photosData + '</div>';
				} else if (lychee.layout === '2') {
					photosData = '<div class="unjustified-layout">' + photosData + '</div>';
				}
			}

			if (albumsData !== '' && photosData !== '') {
				html = build.divider(lychee.locale['ALBUMS']);
			}
			html += albumsData;
			if (albumsData !== '' && photosData !== '') {
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

		title: function (photoID) {

			let title = album.getByID(photoID).title;

			title = lychee.escapeHTML(title);

			$('.photo[data-id="' + photoID + '"] .overlay h1')
				.html(title)
				.attr('title', title)

		},

		titleSub: function (albumID) {

			let title = album.getSubByID(albumID).title;

			title = lychee.escapeHTML(title);

			$('.album[data-id="' + albumID + '"] .overlay h1')
				.html(title)
				.attr('title', title)

		},

		star: function (photoID) {

			let $badge = $('.photo[data-id="' + photoID + '"] .icn-star');

			if (album.getByID(photoID).star === '1') $badge.addClass('badge--star');
			else $badge.removeClass('badge--star')

		},

		public: function (photoID) {

			let $badge = $('.photo[data-id="' + photoID + '"] .icn-share');

			if (album.getByID(photoID).public === '1') $badge.addClass('badge--visible');
			else $badge.removeClass('badge--visible')

		},

		delete: function (photoID, justify = false) {

			if (album.json && album.json.num) {
				album.json.num--;
			}
			$('.photo[data-id="' + photoID + '"]').css('opacity', 0).animate({
				width: 0,
				marginLeft: 0
			}, 300, function () {
				$(this).remove();
				// Only when search is not active
				if (album.json) {
					if (album.json.num) {
						view.album.num();
					}
					if (album.json.photos.length <= 0) {
						lychee.content.find('.divider').remove()
					}
					if (justify) {
						view.album.content.justify()
					}
				}
			})

		},

		deleteSub: function (albumID) {

			$('.album[data-id="' + albumID + '"]').css('opacity', 0).animate({
				width: 0,
				marginLeft: 0
			}, 300, function () {
				$(this).remove();
				if (album.json && album.json.albums.length <= 0) lychee.content.find('.divider').remove()
			})

		},

		justify: function () {
			if (!album.json || !album.json.photos || album.json.photos === false) return;
			if (lychee.layout === '1') {
				let containerWidth = parseFloat($('.justified-layout').width(), 10);
				if (containerWidth == 0) {
					// Triggered on Reload in photo view.
					containerWidth = $(window).width() -
						parseFloat($('.justified-layout').css('margin-left'), 10) -
						parseFloat($('.justified-layout').css('margin-right'), 10);
				}
				let ratio = [];
				$.each(album.json.photos, function (i) {
					ratio[i] = this.height > 0 ? this.width / this.height : 1;
					if (this.type && this.type.indexOf('video') > -1) {
						// Video.  If there's no small and medium, we have
						// to fall back to the square thumb.
						if (this.small === '' && this.medium === '') {
							ratio[i] = 1;
						}
					}
				});
				let layoutGeometry = require('justified-layout')(ratio, {
					containerWidth: containerWidth,
					containerPadding: 0
				});
				if (lychee.admin) console.log(layoutGeometry);
				$('.justified-layout').css('height', layoutGeometry.containerHeight + 'px')
					.css('height', layoutGeometry.containerHeight + 'px');
				$('.justified-layout > div').each(function (i) {
					if (!layoutGeometry.boxes[i]) {
						// Race condition in search.find -- window content
						// and album.json can get out of sync as search
						// query is being modified.
						return false
					}
					$(this).css('top', layoutGeometry.boxes[i].top);
					$(this).css('width', layoutGeometry.boxes[i].width);
					$(this).css('height', layoutGeometry.boxes[i].height);
					$(this).css('left', layoutGeometry.boxes[i].left);

					let imgs = $(this).find(".thumbimg > img");
					if (imgs.length > 0 && imgs[0].getAttribute('data-srcset')) {
						imgs[0].setAttribute('sizes', layoutGeometry.boxes[i].width + 'px');
					}
				});
			} else if (lychee.layout === '2') {
				let containerWidth = parseFloat($('.unjustified-layout').width(), 10);
				if (containerWidth == 0) {
					// Triggered on Reload in photo view.
					containerWidth = $(window).width() -
						parseFloat($('.unjustified-layout').css('margin-left'), 10) -
						parseFloat($('.unjustified-layout').css('margin-right'), 10);
				}
				$('.unjustified-layout > div').each(function (i) {
					if (!album.json.photos[i]) {
						// Race condition in search.find -- window content
						// and album.json can get out of sync as search
						// query is being modified.
						return false
					}
					let ratio = album.json.photos[i].height > 0 ?
						album.json.photos[i].width / album.json.photos[i].height : 1;
					if (album.json.photos[i].type && album.json.photos[i].type.indexOf('video') > -1) {
						// Video.  If there's no small and medium, we have
						// to fall back to the square thumb.
						if (album.json.photos[i].small === '' && album.json.photos[i].medium === '') {
							ratio = 1;
						}
					}

					let height = parseFloat($(this).css('max-height'), 10);
					let width = height * ratio;
					let margin = parseFloat($(this).css('margin-right'), 10);
					let imgs = $(this).find(".thumbimg > img");

					if (width > containerWidth - margin) {
						width = containerWidth - margin;
						height = width / ratio;
					}

					$(this).css('width', width + 'px');
					$(this).css('height', height + 'px');
					if (imgs.length > 0 && imgs[0].getAttribute('data-srcset')) {
						imgs[0].setAttribute('sizes', width + 'px');
					}
				});
			}
		}

	},

	description: function () {

		sidebar.changeAttr('description', album.json.description)

	},

	license: function () {

		switch (album.json.license) {
			case 'none'    :
				license = ''; // none is displayed as - thus is empty.
				break;
			case 'reserved'    :
				license = lychee.locale['ALBUM_RESERVED'];
				break;
			default            :
				license = album.json.license;
				console.log('default');
				break;
		}

		sidebar.changeAttr('license', license)

	},

	num: function () {

		sidebar.changeAttr('images', album.json.num)

	},

	public: function () {

		if (album.json.public === '1') {

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

	hidden: function () {

		if (album.json.visible === '1') sidebar.changeAttr('hidden', lychee.locale['ALBUM_SHR_NO']);
		else sidebar.changeAttr('hidden', lychee.locale['ALBUM_SHR_YES'])

	},

	downloadable: function () {

		if (album.json.downloadable === '1') sidebar.changeAttr('downloadable', lychee.locale['ALBUM_SHR_YES']);
		else sidebar.changeAttr('downloadable', lychee.locale['ALBUM_SHR_NO'])

	},

	password: function () {

		if (album.json.password === '1') sidebar.changeAttr('password', lychee.locale['ALBUM_SHR_YES']);
		else sidebar.changeAttr('password', lychee.locale['ALBUM_SHR_NO'])

	},

	sidebar: function () {

		if ((visible.album() || !album.json.init) && !visible.photo()) {

			let structure = sidebar.createStructure.album(album.json);
			let html = sidebar.render(structure);

			sidebar.dom('.sidebar__wrapper').html(html);
			sidebar.bind()

		}

	}

};

view.photo = {

	init: function () {

		multiselect.clearSelection();

		photo.parse();

		view.photo.sidebar();
		view.photo.title();
		view.photo.star();
		view.photo.public();
		view.photo.photo();

		photo.json.init = 1

	},

	show: function () {

		// Change header
		lychee.content.addClass('view');
		header.setMode('photo');

		// Make body not scrollable
		// use bodyScrollLock package to enable locking on iOS
		// Simple overflow: hidden not working of iOS Safari
		bodyScrollLock.disableBodyScroll(lychee.imageview);

		// Fullscreen
		let timeout = null;
		$(document).bind('mousemove', function () {
			clearTimeout(timeout);
			header.show();
			timeout = setTimeout(header.hide, 2500)
		});

		lychee.animate(lychee.imageview, 'fadeIn')

	},

	hide: function () {

		header.show();

		lychee.content.removeClass('view');
		header.setMode('album');

		// Make body scrollable
		bodyScrollLock.enableBodyScroll(lychee.imageview);

		// Disable Fullscreen
		$(document).unbind('mousemove');
		if ($('video').length) {
			$('video')[$('video').length - 1].pause();
		}

		// Hide Photo
		lychee.animate(lychee.imageview, 'fadeOut');
		setTimeout(() => {
			lychee.imageview.hide();
			view.album.sidebar()
		}, 300)

	},

	title: function () {

		if (photo.json.init) sidebar.changeAttr('title', photo.json.title);
		lychee.setTitle(photo.json.title, true)

	},

	description: function () {

		if (photo.json.init) sidebar.changeAttr('description', photo.json.description)

	},

	license: function () {
		let license;

		// Process key to display correct string
		switch (album.json.license) {
			case 'none'    :
				license = ''; // none is displayed as - thus is empty (uniformity of the display).
				break;
			case 'reserved'    :
				license = lychee.locale['PHOTO_RESERVED'];
				break;
			default            :
				license = photo.json.license;
				break;
		}

		// Update the sidebar if the photo is visible
		if (photo.json.init) sidebar.changeAttr('license', license);
	},

	star: function () {

		if (photo.json.star === '1') {

			// Starred
			$('#button_star')
				.addClass('active')
				.attr('title', lychee.locale['UNSTAR_PHOTO'])

		} else {

			// Unstarred
			$('#button_star').removeClass('active').attr('title', lychee.locale['STAR_PHOTO'])

		}

	},

	public: function () {

		if (photo.json.public === '1' || photo.json.public === '2') {

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

	tags: function () {

		sidebar.changeAttr('tags', build.tags(photo.json.tags), true);
		sidebar.bind()

	},

	photo: function () {

		lychee.imageview.html(build.imageview(photo.json, visible.header()));
		view.photo.onresize();

		let $nextArrow = lychee.imageview.find('a#next');
		let $previousArrow = lychee.imageview.find('a#previous');
		let photoID = photo.getID();
		let hasNext = album.json && album.json.photos && album.getByID(photoID) && album.getByID(photoID).nextPhoto != null && album.getByID(photoID).nextPhoto !== '';
		let hasPrevious = album.json && album.json.photos && album.getByID(photoID) && album.getByID(photoID).previousPhoto != null && album.getByID(photoID).previousPhoto !== '';

		if (hasNext === false || lychee.viewMode === true) {

			$nextArrow.hide()

		} else {

			let nextPhotoID = album.getByID(photoID).nextPhoto;
			let nextPhoto = album.getByID(nextPhotoID);

			$nextArrow.css('background-image', lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${nextPhoto.thumbUrl}")`)

		}

		if (hasPrevious === false || lychee.viewMode === true) {

			$previousArrow.hide()

		} else {

			let previousPhotoID = album.getByID(photoID).previousPhoto;
			let previousPhoto = album.getByID(previousPhotoID);

			$previousArrow.css('background-image', lychee.html`linear-gradient(to bottom, rgba(0, 0, 0, .4), rgba(0, 0, 0, .4)), url("${previousPhoto.thumbUrl}")`)

		}

	},

	sidebar: function () {

		let structure = sidebar.createStructure.photo(photo.json);
		let html = sidebar.render(structure);

		sidebar.dom('.sidebar__wrapper').html(html);
		sidebar.bind()

	},

	onresize: function () {
		if (photo.json.medium === '' || !photo.json.medium2x || photo.json.medium2x === '') return;

		// Calculate the width of the image in the current window and
		// set 'sizes' to it.
		let imgWidth = parseInt(photo.json.medium_dim);
		let imgHeight = photo.json.medium_dim.substr(photo.json.medium_dim.lastIndexOf('x') + 1);
		let containerWidth = parseFloat($('#imageview').width(), 10);
		let containerHeight = parseFloat($('#imageview').height(), 10);

		// Image can be no larger than its natural size, but it can be
		// smaller depending on the size of the window.
		let width = (imgWidth < containerWidth) ? imgWidth : containerWidth;
		let height = (width * imgHeight) / imgWidth;
		if (height > containerHeight) {
			width = (containerHeight * imgWidth) / imgHeight
		}

		$('img#image').attr('sizes', width + 'px');
	}

};

view.settings = {

	init: function () {

		multiselect.clearSelection();

		view.settings.title();
		view.settings.content.init()

	},

	title: function () {

		lychee.setTitle('Settings', false)
	},

	clearContent: function () {
		lychee.content.unbind('mousedown');
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {

		init: function () {
			view.settings.clearContent();
			view.settings.content.setLogin();
			if (lychee.admin) {
				view.settings.content.setSorting();
				view.settings.content.setDropboxKey();
				view.settings.content.setLang();
				view.settings.content.setDefaultLicense();
				view.settings.content.setLayout();
				view.settings.content.setPublicSearch();
				view.settings.content.setOverlay();
				view.settings.content.setOverlayType();
				view.settings.content.setCSS();
				view.settings.content.moreButton();
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
				  <input name='confirm' class='text' type='password' placeholder='` + lychee.locale['LOGIN_PASSWORD_CONFIRM'] + `' value=''>
			  </p>
			<div class="basicModal__buttons">
				<!--<a id="basicModal__cancel" class="basicModal__button ">Cancel</a>-->
				<a id="basicModal__action_password_change" class="basicModal__button ">` + lychee.locale['PASSWORD_CHANGE'] + `</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);

			settings.bind('#basicModal__action_password_change', '.setLogin', settings.changeLogin);

		},

		clearLogin: function () {
			$('input[name=oldUsername], input[name=oldPassword], input[name=username], input[name=password], input[name=confirm]').val('')
		},

		setSorting: function () {

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

			if (lychee.sortingAlbums !== '') {

				sortingAlbums = lychee.sortingAlbums.replace('ORDER BY ', '').split(' ');

				$('.setSorting select#settings_albums_type').val(sortingAlbums[0]);
				$('.setSorting select#settings_albums_order').val(sortingAlbums[1])

			}

			if (lychee.sortingPhotos !== '') {

				sortingPhotos = lychee.sortingPhotos.replace('ORDER BY ', '').split(' ');

				$('.setSorting select#settings_photos_type').val(sortingPhotos[0]);
				$('.setSorting select#settings_photos_order').val(sortingPhotos[1])

			}

			settings.bind('#basicModal__action_sorting_change', '.setSorting', settings.changeSorting);
		},

		setDropboxKey: function () {
			let msg = `
			<div class="setDropBox">
			  <p>${lychee.locale['DROPBOX_TEXT']}
			  <input class='text' name='key' type='text' placeholder='Dropbox API Key' value='${lychee.dropboxKey}'>
			  </p>
				<div class="basicModal__buttons">
					<a id="basicModal__action_dropbox_change" class="basicModal__button">${lychee.locale['DROPBOX_TITLE']}</a>
				</div>
			  </div>
			  `;

			$(".settings_view").append(msg);
			settings.bind('#basicModal__action_dropbox_change', '.setDropBox', settings.changeDropboxKey);
		},

		setLang: function () {
			let msg = `
			<div class="setLang">
			<p>${lychee.locale['LANG_TEXT']}
			  <span class="select">
				  <select id="settings_photos_order" name="lang">`;
			let i = 0;
			while (i < lychee.lang_available.length) {
				let lang_av = lychee.lang_available[i];
				msg += `<option ` + (lychee.lang === lang_av ? 'selected' : '') + `>` + lang_av + `</option>`;
				i += 1;
			}
			msg += `
				  </select>
			  </span>
			</p>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_lang" class="basicModal__button">${lychee.locale['LANG_TITLE']}</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);
			settings.bind('#basicModal__action_set_lang', '.setLang', settings.changeLang);
		},

		setDefaultLicense: function () {
			let msg = `
			<div class="setDefaultLicense">
			<p>${lychee.locale['DEFAULT_LICENSE']}
			<span class="select" style="width:270px">
				<select name="license" id="license">
					<option value="none">${lychee.locale['PHOTO_LICENSE_NONE']}</option>
					<option value="reserved">${lychee.locale['PHOTO_RESERVED']}</option>
					<option value="CC0">CC0 - Public Domain</option>
					<option value="CC-BY">CC Attribution 4.0</option>
					<option value="CC-BY-ND">CC Attribution-NoDerivatives 4.0</option>
					<option value="CC-BY-SA">CC Attribution-ShareAlike 4.0</option>
					<option value="CC-BY-NC">CC Attribution-NonCommercial 4.0</option>
					<option value="CC-BY-NC-ND">CC Attribution-NonCommercial-NoDerivatives 4.0</option>
					<option value="CC-BY-NC-SA">CC Attribution-NonCommercial-ShareAlike 4.0</option>
				</select>
			</span>
			<br />
			<a href="https://creativecommons.org/choose/" target="_blank">${lychee.locale['PHOTO_LICENSE_HELP']}</a>
			</p>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_license" class="basicModal__button">${lychee.locale['SET_LICENSE']}</a>
			</div>
			</div>
			`
			$(".settings_view").append(msg);
			$('select#license').val(lychee.default_license === '' ? 'none' : lychee.default_license);
			settings.bind('#basicModal__action_set_license', '.setDefaultLicense', settings.setDefaultLicense);
		},

		setLayout: function () {
			let msg = `
			<div class="setLayout">
			<p>${lychee.locale['LAYOUT_TYPE']}
			<span class="select" style="width:270px">
				<select name="layout" id="layout">
					<option value="0">${lychee.locale['LAYOUT_SQUARES']}</option>
					<option value="1">${lychee.locale['LAYOUT_JUSTIFIED']}</option>
					<option value="2">${lychee.locale['LAYOUT_UNJUSTIFIED']}</option>
				</select>
			</span>
			</p>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_layout" class="basicModal__button">${lychee.locale['SET_LAYOUT']}</a>
			</div>
			</div>
			`
			$(".settings_view").append(msg);
			$('select#layout').val(lychee.layout);
			settings.bind('#basicModal__action_set_layout', '.setLayout', settings.setLayout);
		},

		setPublicSearch: function () {
			let msg = `
			<div class="setPublicSearch">
			<p>${lychee.locale['PUBLIC_SEARCH_TEXT']}
			<label class="switch">
			  <input id="PublicSearch" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.public_search) $('#PublicSearch').click();

			settings.bind('#PublicSearch', '.setPublicSearch', settings.changePublicSearch);
		},

		setOverlay: function () {
			let msg = `
			<div class="setOverlay">
			<p>${lychee.locale['IMAGE_OVERLAY_TEXT']}
			<label class="switch">
			  <input id="ImageOverlay" type="checkbox">
			  <span class="slider round"></span>
			</label>
			</p>
			</div>
			`;

			$(".settings_view").append(msg);
			if (lychee.image_overlay_default) $('#ImageOverlay').click();

			settings.bind('#ImageOverlay', '.setOverlay', settings.changeImageOverlay);
		},

		setOverlayType: function () {
			let msg = `
			<div class="setOverlayType">
			<p>${lychee.locale['OVERLAY_TYPE']}
			<span class="select" style="width:270px">
				<select name="OverlayType" id="ImgOverlayType">
					<option value="exif">${lychee.locale['OVERLAY_EXIF']}</option>
					<option value="desc">${lychee.locale['OVERLAY_DESCRIPTION']}</option>
					<option value="takedate">${lychee.locale['OVERLAY_DATE']}</option>
				</select>
			</span>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_overlay_type" class="basicModal__button">${lychee.locale['SET_OVERLAY_TYPE']}</a>
			</div>
			</div>
			`

			$(".settings_view").append(msg);

			// Enable based on image_overlay setting
			if (!lychee.image_overlay) $('select#ImgOverlayType').attr('disabled', true);

			$('select#ImgOverlayType').val(!lychee.image_overlay_type_default ? 'exif' : lychee.image_overlay_type_default);
			settings.bind('#basicModal__action_set_overlay_type', '.setOverlayType', settings.setOverlayType);

		},

		setCSS: function () {
			let msg = `
			<div class="setCSS">
			<p>${lychee.locale['CSS_TEXT']}</p>
			<textarea id="css"></textarea>
			<div class="basicModal__buttons">
				<a id="basicModal__action_set_css" class="basicModal__button">${lychee.locale['CSS_TITLE']}</a>
			</div>
			</div>`;

			$(".settings_view").append(msg);

			api.get('dist/user.css', function (data) {
				$("#css").html(data);
			});

			settings.bind('#basicModal__action_set_css', '.setCSS', settings.changeCSS);
		},

		moreButton: function () {
			let msg = lychee.html`
			<div class="setCSS">
				<a id="basicModal__action_more" class="basicModal__button basicModal__button_MORE">${lychee.locale['MORE']}</a>
			</div>
			`;

			$(".settings_view").append(msg);

			$("#basicModal__action_more").on('click', view.full_settings.init);

		},

	},

};


view.full_settings = {

	init: function () {

		multiselect.clearSelection();

		view.full_settings.title();
		view.full_settings.content.init()

	},

	title: function () {

		lychee.setTitle('Full Settings', false)
	},

	clearContent: function () {
		lychee.content.unbind('mousedown');
		lychee.content.html('<div class="settings_view"></div>');
	},

	content: {

		init: function () {
			view.full_settings.clearContent();

			api.post('Settings::getAll', {}, function (data) {

				let msg = lychee.html`
				<div id="fullSettings">
				<div class="setting_line">
				<p class="warning">
				${lychee.locale['SETTINGS_WARNING']}
				</p>
				</div>
				`;

				let prev = '';
				$.each(data, function () {

					if (this.cat && prev !== this.cat) {
						msg += lychee.html`
						<div class="setting_category">
						<p>
						$${this.cat}
						</p>
						</div>`;
						prev = this.cat

					}

					msg += lychee.html`
			<div class="setting_line">
				<p>
				<span class="text">$${this.key}</span>
				<input class="text" name="$${this.key}" type="text" value="$${this.value}" placeholder="" />
				</p>
			</div>
		`;

				});

				msg += lychee.html`
			<a id="FullSettingsSave_button"  class="basicModal__button basicModal__button_SAVE">${lychee.locale['SAVE_RISK']}</a>
		</div>
			`;
				$(".settings_view").append(msg);

				settings.bind('#FullSettingsSave_button', '#fullSettings', settings.save);

				$('#fullSettings').on('keypress', function (e) {
					settings.save_enter(e)
				});

			});

		},

	},

};

view.users = {
	init: function () {

		multiselect.clearSelection();

		view.users.title();
		view.users.content.init()

	},

	title: function () {

		lychee.setTitle('Users', false)

	},

	clearContent: function () {
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
				'<span class="text_icon" title="Allow uploads">' + build.iconic('data-transfer-upload') + '</span>' +
				'<span class="text_icon" title="Restricted account">' + build.iconic('lock-locked') + '</span>' +
				'</p>' +
				'</div>';

			$(".users_view").append(html);

			$.each(users.json, function () {
				$(".users_view").append(build.user(this));
				// photosData += build.photo(this)
				settings.bind('#UserUpdate' + this.id, '#UserData' + this.id, users.update);
				settings.bind('#UserDelete' + this.id, '#UserData' + this.id, users.delete);
				if (this.upload === 1) {
					$('#UserData' + this.id + ' .choice input[name="upload"]').click();
				}
				if (this.lock === 1) {
					$('#UserData' + this.id + ' .choice input[name="lock"]').click();
				}

			});

			html = '<div class="users_view_line"';

			if (users.json.length === 0) {
				html += ' style="padding-top: 0px;"';
			}
			html += '>' +
				'<p id="UserCreate">' +
				'<input class="text" name="username" type="text" value="" placeholder="new username" /> ' +
				'<input class="text" name="password" type="text" placeholder="new password" /> ' +
				'<span class="choice" title="Allow uploads">' +
				'<label>' +
				'<input type="checkbox" name="upload" />' +
				'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
				'</label>' +
				'</span> ' +
				'<span class="choice" title="Restricted account">' +
				'<label>' +
				'<input type="checkbox" name="lock" />' +
				'<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
				'</label>' +
				'</span>' +
				'</p> ' +
				'<a id="UserCreate_button"  class="basicModal__button basicModal__button_CREATE">Create</a>' +
				'</div>';
			$(".users_view").append(html);
			settings.bind('#UserCreate_button', '#UserCreate', users.create);
		}
	}
};

view.sharing = {
	init: function () {

		multiselect.clearSelection();

		view.sharing.title();
		view.sharing.content.init()

	},

	title: function () {

		lychee.setTitle('Sharing', false)

	},

	clearContent: function () {
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

			$.each(sharing.json.albums, function () {
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

			$.each(sharing.json.users, function () {
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

			$.each(sharing.json.shared, function () {
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
			if (sharing.json.shared.length !== 0) {
				html += `<div class="sharing_view_line"><a id="Remove_button"  class="basicModal__button">Remove</a></div>`;
			}

			$(".sharing_view").append(html);

			$('#albums_list').multiselect();
			$('#user_list').multiselect();
			$("#Share_button").on('click', sharing.add)
				.on('mouseenter', function () {
					$('#albums_list_to, #user_list_to').addClass('borderBlue')
				})
				.on('mouseleave', function () {
					$('#albums_list_to, #user_list_to').removeClass('borderBlue')
				});

			$('#Remove_button').on('click', sharing.delete);
		}
	}
};

view.logs = {
	init: function () {

		multiselect.clearSelection();

		view.logs.title();
		view.logs.content.init()

	},

	title: function () {

		lychee.setTitle('Logs', false)

	},

	clearContent: function () {
		lychee.content.unbind('mousedown');
		let html = '';
		if (lychee.api_V2) {
			html += lychee.html`<div class="clear_logs_update"><a id="Clean_Noise" class="basicModal__button">${lychee.locale['CLEAN_LOGS']}</a></div>`;
		}
		html += '<pre class="logs_diagnostics_view"></pre>';
		lychee.content.html(html);

		$("#Clean_Noise").on('click', function () {
			api.post_raw('Logs::clearNoise', {}, function () {
				view.logs.init();
			});
		});

	},

	content: {
		init: function () {
			view.logs.clearContent();
			api.post_raw('Logs', {}, function (data) {
				$(".logs_diagnostics_view").html(data);
			})
		}
	},
};

view.diagnostics = {
	init: function () {

		multiselect.clearSelection();

		view.diagnostics.title('Diagnostics');
		view.diagnostics.content.init()

	},

	title: function () {

		lychee.setTitle('Diagnostics', false)

	},

	clearContent: function (update) {
		lychee.content.unbind('mousedown');
		let html = '';
		if (update === 1) {
			html += lychee.html`<div class="clear_logs_update"><a id="Update_Lychee" class="basicModal__button">${lychee.locale['UPDATE_AVAILABLE']}</a></div>`;
		}
		html += '<pre class="logs_diagnostics_view"></pre>';
		lychee.content.html(html);

		$("#Update_Lychee").on('click', function () {
			api.get('api/Update', function (data) {
				let data_json;
				try {
					data_json = JSON.parse(data);
				} catch (e) {
					data_json = "JSON error. Check the console logs.";
					console.log(data);
				}
				html = '<pre>';
				if (Array.isArray(data_json)) {
					for (let i = 0; i < data_json.length; i++) {
						html += '    ' + data_json[i] + '\n';
					}
				} else {
					html += '    ' + data_json;
				}
				html += '</pre>';
				$(html).prependTo(".logs_diagnostics_view");
			});
		});

	},

	content: {
		init: function () {
			view.diagnostics.clearContent(false);

			if (lychee.api_V2) {
				api.post('Diagnostics', {}, function (data) {
					view.diagnostics.clearContent(data.update);
					let html = '';
					let i;
					html += '<pre>\n\n\n\n';
					html += '    Diagnostics\n' +
						'    -----------\n';
					for (i = 0; i < data.errors.length; i++) {
						html += '    ' + data.errors[i] + '\n';
					}
					html += '\n' +
						'    System Information\n' +
						'    ------------------\n';
					for (i = 0; i < data.infos.length; i++) {
						html += '    ' + data.infos[i] + '\n';
					}
					html += '\n' +
						'    Config Information\n' +
						'    ------------------\n';
					for (i = 0; i < data.configs.length; i++) {
						html += '    ' + data.configs[i] + '\n';
					}
					html += '</pre>';

					$(".logs_diagnostics_view").html(html);
				})
			} else {
				api.post_raw('Diagnostics', {}, function (data) {
					$(".logs_diagnostics_view").html(data);
				})
			}
		}
	},

};
