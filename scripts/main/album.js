/**
 * @description Takes care of every action an album can handle and execute.
 */

album = {

	json: null
};

album.isSmartID = function (id) {

	return (id === '0' || id === 'f' || id === 's' || id === 'r')

};

album.getParent = function () {

	if (album.json == null || album.isSmartID(album.json.id) === true || !album.json.parent_id || album.json.parent_id === 0) return '';
	return album.json.parent_id

};

album.getID = function () {

	let id = null;

	let isID = (id) => {
		if (id === '0' || id === 'f' || id === 's' || id === 'r') return true;
		return $.isNumeric(id)
	};

	if (photo.json) id = photo.json.album;
	else if (album.json) id = album.json.id;

	// Search
	if (isID(id) === false) id = $('.album:hover, .album.active').attr('data-id');
	if (isID(id) === false) id = $('.photo:hover, .photo.active').attr('data-album-id');

	if (isID(id) === true) return id;
	else return false

};

album.getByID = function (photoID) {

	// Function returns the JSON of a photo

	if (photoID == null || !album.json || !album.json.photos) {
		lychee.error('Error: Album json not found !');
		return undefined;
	}

	let i = 0;
	while (i < album.json.photos.length) {
		if (parseInt(album.json.photos[i].id) === parseInt(photoID)) {
			return album.json.photos[i]
		}
		i++;
	}

	lychee.error('Error: photo ' + photoID + ' not found !');
	return undefined;
};

album.getSubByID = function (albumID) {

	// Function returns the JSON of a subalbum

	if (albumID == null || !album.json || !album.json.albums) {
		lychee.error('Error: Album json not found!');
		return undefined;
	}

	let i = 0;
	while (i < album.json.albums.length) {
		if (parseInt(album.json.albums[i].id) === parseInt(albumID)) {
			return album.json.albums[i]
		}
		i++;
	}

	lychee.error('Error: album ' + albumID + ' not found!');
	return undefined;
};

album.hasSub = function (albumID) {

	// Return true if the current album has albumID as its descendant

	if (albumID == null || !album.json || !album.json.albums) {
		return false;
	}

	let ret = false;

	let func = function () {
		if (parseInt(this.id, 10) === parseInt(albumID, 10)) {
			ret = true;
			return false
		}
		if (this.albums) {
			$.each(this.albums, func)
		}
	};

	$.each(album.json.albums, func);

	return ret

};

album.deleteByID = function (photoID) {

	if (photoID == null || !album.json || !album.json.photos) {
		lychee.error('Error: Album json not found !');
		return false;
	}

	let deleted = false;

	$.each(album.json.photos, function (i) {

		if (parseInt(album.json.photos[i].id) === parseInt(photoID)) {
			album.json.photos.splice(i, 1);
			deleted = true;
			return false
		}

	});

	return deleted

};

album.deleteSubByID = function (albumID) {

	if (albumID == null || !album.json || !album.json.albums) {
		lychee.error('Error: Album json not found !');
		return false;
	}

	let deleted = false;

	$.each(album.json.albums, function (i) {

		if (parseInt(album.json.albums[i].id) === parseInt(albumID)) {
			album.json.albums.splice(i, 1);
			deleted = true;
			return false
		}

	});

	return deleted

};

album.load = function (albumID, refresh = false) {

	let params = {
		albumID,
		password: ''
	};

	const processData = function (data) {

		if (data === 'Warning: Wrong password!') {
			// User hit Cancel at the password prompt
			return false
		}

		if (data === 'Warning: Album private!') {

			if (document.location.hash.replace('#', '').split('/')[1] !== undefined) {
				// Display photo only
				lychee.setMode('view');
				lychee.footer_hide();
			} else {
				// Album not public
				lychee.content.show();
				lychee.footer_show();
				if (!visible.albums() && !visible.album()) lychee.goto()
			}
			return false
		}

		album.json = data;

		if (refresh === false)
		{
			lychee.animate('.content', 'contentZoomOut');
		}
		let waitTime = 300;

		// Skip delay when refresh is true
		// Skip delay when opening a blank Lychee
		if (refresh === true) waitTime = 0;
		if (!visible.albums() && !visible.photo() && !visible.album()) waitTime = 0;

		setTimeout(() => {

			view.album.init();

			if (refresh === false) {
				lychee.animate(lychee.content, 'contentZoomIn');
				header.setMode('album');
			}
		}, waitTime)
	};

	api.post('Album::get', params, function (data) {

		if (data === 'Warning: Wrong password!') {
			password.getDialog(albumID, function () {

				params.password = password.value;

				api.post('Album::get', params, function (data) {
					albums.refresh();
					processData(data)
				})
			})
		} else {
			processData(data)
		}
	})

};

album.parse = function () {

	if (!album.json.title) album.json.title = lychee.locale['UNTITLED']

};

album.add = function (IDs = null, callback = null) {

	const action = function (data) {

		// let title = data.title;

		const isNumber = (n) => (!isNaN(parseInt(n, 10)) && isFinite(n));

		basicModal.close();

		let params = {
			title: data.title,
			parent_id: 0
		};

		if (visible.albums()) {
			params.parent_id = 0;
		} else if (visible.album()) {
			params.parent_id = album.json.id;
		} else if (visible.photo()) {
			params.parent_id = photo.json.album;
		}

		api.post('Album::add', params, function (data) {

			if (data !== false && isNumber(data)) {
				if (IDs != null && callback != null) {
					callback(IDs, data, false); // we do not confirm
				} else {
					albums.refresh();
					lychee.goto(data)
				}
			} else {
				lychee.error(null, params, data)
			}

		})

	};

	basicModal.show({
		body: `<p>${lychee.locale['TITLE_NEW_ALBUM']} <input class='text' name='title' type='text' maxlength='50' placeholder='Title' value='Untitled'></p>`,
		buttons: {
			action: {
				title: lychee.locale['CREATE_ALBUM'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};


album.setTitle = function (albumIDs) {

	let oldTitle = '';
	let msg = '';

	if (!albumIDs) return false;
	if (albumIDs instanceof Array === false) albumIDs = [albumIDs];

	if (albumIDs.length === 1) {

		// Get old title if only one album is selected
		if (album.json) {
			if (parseInt(album.getID()) === parseInt(albumIDs[0])) {
				oldTitle = album.json.title
			} else oldTitle = album.getSubByID(albumIDs[0]).title
		}
		if (!oldTitle && albums.json) oldTitle = albums.getByID(albumIDs[0]).title

	}

	const action = function (data) {

		basicModal.close();

		let newTitle = data.title;

		if (visible.album()) {

			if (albumIDs.length === 1 && parseInt(album.getID()) === parseInt(albumIDs[0])) {
				// Rename only one album

				album.json.title = newTitle;
				view.album.title();

				if (albums.json) albums.getByID(albumIDs[0]).title = newTitle
			} else {
				albumIDs.forEach(function (id) {
					album.getSubByID(id).title = newTitle;
					view.album.content.titleSub(id);

					if (albums.json) albums.getByID(id).title = newTitle
				})
			}

		} else if (visible.albums()) {

			// Rename all albums

			albumIDs.forEach(function (id) {
				albums.getByID(id).title = newTitle;
				view.albums.content.title(id)
			})

		}

		let params = {
			albumIDs: albumIDs.join(),
			title: newTitle
		};

		api.post('Album::setTitle', params, function (data) {

			if (data !== true) lychee.error(null, params, data)

		})

	};

	let input = lychee.html`<input class='text' name='title' type='text' maxlength='50' placeholder='$${lychee.locale['ALBUM_TITLE']}' value='$${oldTitle}'>`;

	if (albumIDs.length === 1) msg = lychee.html`<p>${lychee.locale['ALBUM_NEW_TITLE']} ${input}</p>`;
	else msg = lychee.html`<p>${lychee.locale['ALBUMS_NEW_TITLE_1']} $${albumIDs.length} ${lychee.locale['ALBUMS_NEW_TITLE_2']} ${input}</p>`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['ALBUM_SET_TITLE'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};

album.setDescription = function (albumID) {

	let oldDescription = album.json.description;

	const action = function (data) {

		let description = data.description;

		basicModal.close();

		if (visible.album()) {
			album.json.description = description;
			view.album.description()
		}

		let params = {
			albumID,
			description
		};

		api.post('Album::setDescription', params, function (data) {

			if (data !== true) lychee.error(null, params, data)

		})

	};

	basicModal.show({
		body: lychee.html`<p>${lychee.locale['ALBUM_NEW_DESCRIPTION']}<input class='text' name='description' type='text' maxlength='800' placeholder='$${lychee.locale['ALBUM_DESCRIPTION']}' value='$${oldDescription}'></p>`,
		buttons: {
			action: {
				title: lychee.locale['ALBUM_SET_DESCRIPTION'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};

album.setLicense = function (albumID) {

	const callback = function () {
		$('select#license').val(album.json.license === '' ? 'none' : album.json.license);
		return false;
	};

	const action = function (data) {

		let license = data.license;

		basicModal.close();

		let params = {
			albumID,
			license
		};

		api.post('Album::setLicense', params, function (data) {

			if (data !== true) {
				lychee.error(null, params, data);
			} else {
				if (visible.album()) {
					album.json.license = params.license;
					view.album.license()
				}
			}
		})

	};

	let msg = lychee.html`
	<div>
		<p>${lychee.locale['ALBUM_LICENSE']}
		<span class="select" style="width:270px">
			<select name="license" id="license">
				<option value="none">${lychee.locale['ALBUM_LICENSE_NONE']}</option>
				<option value="reserved">${lychee.locale['ALBUM_RESERVED']}</option>
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
		<a href="https://creativecommons.org/choose/" target="_blank">${lychee.locale['ALBUM_LICENSE_HELP']}</a>
		</p>
	</div>`;

	basicModal.show({
		body: msg,
		callback: callback,
		buttons: {
			action: {
				title: lychee.locale['ALBUM_SET_LICENSE'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};

album.setPublic = function (albumID, modal, e) {

	let password = '';

	albums.refresh();

	if (modal === true) {

		let text = '';
		let action = {};

		action.fn = () => {

			// Call setPublic function without showing the modal
			album.setPublic(album.getID(), false, e)

		};

		// Album public = Editing a shared album
		if (album.json.public === '1') {

			action.title = lychee.locale['EDIT_SHARING_TITLE'];
			text = lychee.locale['EDIT_SHARING_TEXT']

		} else {

			action.title = lychee.locale['SHARE_ALBUM'];
			text = lychee.locale['SHARE_ALBUM_TEXT']

		}

		let msg = `
				  <p class='less'>${text}</p>
				  <form>
					  <div class='choice'>
						  <label>
							  <input type='checkbox' name='hidden'>
							  <span class='checkbox'>${build.iconic('check')}</span>
							  <span class='label'>${lychee.locale['ALBUM_HIDDEN']}</span>
						  </label>
						  <p>${lychee.locale['ALBUM_HIDDEN_EXPL']}</p>
					  </div>
					  <div class='choice'>
						  <label>
							  <input type='checkbox' name='downloadable'>
							  <span class='checkbox'>${build.iconic('check')}</span>
							  <span class='label'>${lychee.locale['ALBUM_DOWNLOADABLE']}</span>
						  </label>
						  <p>${lychee.locale['ALBUM_DOWNLOADABLE_EXPL']}</p>
					  </div>
					  <div class='choice'>
						  <label>
							  <input type='checkbox' name='password'>
							  <span class='checkbox'>${build.iconic('check')}</span>
							  <span class='label'>${lychee.locale['ALBUM_PASSWORD_PROT']}</span>
						  </label>
						  <p>${lychee.locale['ALBUM_PASSWORD_PROT_EXPL']}</p>
						  <input class='text' name='passwordtext' type='text' placeholder='password' value=''>
					  </div>
				  </form>
				  `;

		basicModal.show({
			body: msg,
			buttons: {
				action: {
					title: action.title,
					fn: action.fn
				},
				cancel: {
					title: lychee.locale['CANCEL'],
					fn: basicModal.close
				}
			}
		});

		if (album.json.public === '1' && album.json.visible === '0') $('.basicModal .choice input[name="hidden"]').click();
		if (album.json.downloadable === '1') $('.basicModal .choice input[name="downloadable"]').click();

		$('.basicModal .choice input[name="password"]').on('change', function () {

			if ($(this).prop('checked') === true) $('.basicModal .choice input[name="passwordtext"]').show().focus();
			else $('.basicModal .choice input[name="passwordtext"]').hide()

		});

		return true

	}

	// Set data
	if (basicModal.visible()) {

		// Visible modal => Set album public
		album.json.public = '1';

		// Set visible
		if ($('.basicModal .choice input[name="hidden"]:checked').length === 1) album.json.visible = '0';
		else album.json.visible = '1';

		// Set downloadable
		if ($('.basicModal .choice input[name="downloadable"]:checked').length === 1) album.json.downloadable = '1';
		else album.json.downloadable = '0';

		// Set password
		if ($('.basicModal .choice input[name="password"]:checked').length === 1) {
			password = $('.basicModal .choice input[name="passwordtext"]').val();
			album.json.password = '1'
		} else {
			password = '';
			album.json.password = '0'
		}

		// Modal input has been processed, now it can be closed
		basicModal.close()

	} else {

		// Modal not visible => Set album private
		album.json.public = '0'

	}

	// Set data and refresh view
	if (visible.album()) {

		album.json.visible = (album.json.public === '0') ? '1' : album.json.visible;
		album.json.downloadable = (album.json.public === '0') ? '0' : album.json.downloadable;
		album.json.password = (album.json.public === '0') ? '0' : album.json.password;

		view.album.public();
		view.album.hidden();
		view.album.downloadable();
		view.album.password();

		if (album.json.public === '1') contextMenu.shareAlbum(albumID, e)

	}

	let params = {
		albumID,
		public: album.json.public,
		password: password,
		visible: album.json.visible,
		downloadable: album.json.downloadable
	};

	api.post('Album::setPublic', params, function (data) {

		if (data !== true) lychee.error(null, params, data)

	})

};

album.share = function (service) {

	let url = location.href;

	switch (service) {
		case 'twitter':
			window.open(`https://twitter.com/share?url=${encodeURI(url)}`);
			break;
		case 'facebook':
			window.open(`http://www.facebook.com/sharer.php?u=${encodeURI(url)}&t=${encodeURI(album.json.title)}`);
			break;
		case 'mail':
			location.href = `mailto:?subject=${encodeURI(album.json.title)}&body=${encodeURI(url)}`;
			break
	}

};

album.getArchive = function (albumID) {

	let link = '';

	// double check with API_V2 this will not work...
	if (lychee.api_V2) {
		location.href = api.get_url('Album::getArchive') + lychee.html`?albumID=${albumID}`;
	} else {
		let url = `${api.path}?function=Album::getArchive&albumID=${albumID}`;

		if (location.href.indexOf('index.html') > 0) link = location.href.replace(location.hash, '').replace('index.html', url);
		else link = location.href.replace(location.hash, '') + url;

		if (lychee.publicMode === true) link += `&password=${encodeURIComponent(password.value)}`;

		location.href = link
	}

};

album.buildMessage = function (albumIDs, albumID, op1, op2, ops) {

	let title = '';
	let sTitle = '';
	let msg = '';

	if (!albumIDs) return false;
	if (albumIDs instanceof Array === false) albumIDs = [albumIDs];

	// Get title of first album
	if (parseInt(albumID, 10) === 0) {
		title = lychee.locale['ROOT'];
	} else if (albums.json) title = albums.getByID(albumID).title;

	// Fallback for first album without a title
	if (title === '') title = lychee.locale['UNTITLED'];

	if (albumIDs.length === 1) {

		// Get title of second album
		if (albums.json) sTitle = albums.getByID(albumIDs[0]).title;

		// Fallback for second album without a title
		if (sTitle === '') sTitle = lychee.locale['UNTITLED'];

		msg = lychee.html`<p>${lychee.locale[op1]} '$${sTitle}' ${lychee.locale[op2]} '$${title}'?</p>`

	} else {

		msg = lychee.html`<p>${lychee.locale[ops]} '$${title}'?</p>`

	}

	return msg

};

album.delete = function (albumIDs) {

	let action = {};
	let cancel = {};
	let msg = '';

	if (!albumIDs) return false;
	if (albumIDs instanceof Array === false) albumIDs = [albumIDs];

	action.fn = function () {

		basicModal.close();

		let params = {
			albumIDs: albumIDs.join()
		};

		api.post('Album::delete', params, function (data) {

			if (visible.albums()) {

				albumIDs.forEach(function (id) {
					view.albums.content.delete(id);
					albums.deleteByID(id)
				})

			} else if (visible.album()) {

				albums.refresh();
				if (albumIDs.length === 1 && parseInt(album.getID()) === parseInt(albumIDs[0])) {
					lychee.goto(album.getParent())
				} else {
					albumIDs.forEach(function (id) {
						album.deleteSubByID(id);
						view.album.content.deleteSub(id)
					})
				}

			}

			if (data !== true) lychee.error(null, params, data)

		})

	};

	if (albumIDs.toString() === '0') {

		action.title = lychee.locale['CLEAR_UNSORTED'];
		cancel.title = lychee.locale['KEEP_UNSORTED'];

		msg = `<p>` + lychee.locale['DELETE_UNSORTED_CONFIRM'] + `</p>`

	} else if (albumIDs.length === 1) {

		let albumTitle = '';

		action.title = lychee.locale['DELETE_ALBUM_QUESTION'];
		cancel.title = lychee.locale['KEEP_ALBUM'];

		// Get title
		if (album.json) {
			if (parseInt(album.getID()) === parseInt(albumIDs[0])) {
				albumTitle = album.json.title
			} else albumTitle = album.getSubByID(albumIDs[0]).title
		}
		if (!albumTitle && albums.json) albumTitle = albums.getByID(albumIDs).title;

		// Fallback for album without a title
		if (albumTitle === '') albumTitle = lychee.locale['UNTITLED'];

		msg = lychee.html`<p>${lychee.locale['DELETE_ALBUM_CONFIRMATION_1']} '$${albumTitle}' ${lychee.locale['DELETE_ALBUM_CONFIRMATION_2']}</p>`

	} else {

		action.title = lychee.locale['DELETE_ALBUMS_QUESTION'];
		cancel.title = lychee.locale['KEEP_ALBUMS'];

		msg = lychee.html`<p>${lychee.locale['DELETE_ALBUMS_CONFIRMATION_1']} $${albumIDs.length} ${lychee.locale['DELETE_ALBUMS_CONFIRMATION_2']}</p>`

	}

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: action.title,
				fn: action.fn,
				class: 'red'
			},
			cancel: {
				title: cancel.title,
				fn: basicModal.close
			}
		}
	})

};

album.merge = function (albumIDs, albumID, confirm = true) {

	const action = function () {

		basicModal.close();
		albumIDs.unshift(albumID);

		let params = {
			albumIDs: albumIDs.join()
		};

		api.post('Album::merge', params, function (data) {

			if (data !== true) {
				lychee.error(null, params, data)
			} else {
				album.reload();
			}

		})

	};

	if (confirm) {
		basicModal.show({
			body: album.buildMessage(albumIDs, albumID, 'ALBUM_MERGE_1', 'ALBUM_MERGE_2', 'ALBUMS_MERGE'),
			buttons: {
				action: {
					title: lychee.locale['MERGE_ALBUM'],
					fn: action,
					class: 'red'
				},
				cancel: {
					title: lychee.locale['DONT_MERGE'],
					fn: basicModal.close
				}
			}
		})
	} else {
		action();
	}

};

album.setAlbum = function (albumIDs, albumID, confirm = true) {

	const action = function () {

		basicModal.close();
		albumIDs.unshift(albumID);

		let params = {
			albumIDs: albumIDs.join()
		};


		api.post('Album::move', params, function (data) {

			if (data !== true) {
				lychee.error(null, params, data);
			} else {
				album.reload();
			}

		})

	};

	if (confirm) {
		basicModal.show({
			body: album.buildMessage(albumIDs, albumID, 'ALBUM_MOVE_1', 'ALBUM_MOVE_2', 'ALBUMS_MOVE'),
			buttons: {
				action: {
					title: lychee.locale['MOVE_ALBUMS'],
					fn: action,
					class: 'red'
				},
				cancel: {
					title: lychee.locale['NOT_MOVE_ALBUMS'],
					fn: basicModal.close
				}
			}
		})
	} else {
		action();
	}

};

album.isUploadable = function() {
	if (lychee.admin) {
		return true;
	}
	if (lychee.publicMode || !lychee.upload) {
		return false;
	}

	// For special cases of no album / smart album / etc. we return true.
	// It's only for regular non-matching albums that we return false.
	if (album.json === null || !album.json.owner) {
		return true;
	}

	return (album.json.owner === lychee.username);
}

album.reload = function () {

	let albumID = album.getID();

	album.refresh();
	albums.refresh();

	if (visible.album()) lychee.goto(albumID);
	else lychee.goto()

};

album.refresh = function () {

	album.json = null

};
