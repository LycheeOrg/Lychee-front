/**
 * @description Lets you change settings.
 */

settings = {};

settings.open = function(e) {
	if(lychee.api_V2)
	{
		view.settings.init()
	}
	else
	{
        contextMenu.settings(e)
	}
};

settings.createConfig = function() {

	const action = function(data) {

		let dbName        = data.dbName        || ''
		let dbUser        = data.dbUser        || ''
		let dbPassword    = data.dbPassword    || ''
		let dbHost        = data.dbHost        || ''
		let dbTablePrefix = data.dbTablePrefix || ''

		if (dbUser.length<1) {
			basicModal.error('dbUser')
			return false
		}

		if (dbHost.length<1) dbHost = 'localhost'
		if (dbName.length<1) dbName = 'lychee'

		let params = {
			dbName,
			dbUser,
			dbPassword,
			dbHost,
			dbTablePrefix
		}

		api.post('Config::create', params, function(data) {

			if (data!==true) {

				// Connection failed
				if (data==='Warning: Connection failed!') {

					basicModal.show({
						body: '<p>' + lychee.locale['ERROR_DB_1'] + '</p>',
						buttons: {
							action: {
								title: lychee.locale['RETRY'],
								fn: settings.createConfig
							}
						}
					})

					return false

				}

				// Creation failed
				if (data==='Warning: Creation failed!') {

					basicModal.show({
						body: '<p>' + lychee.locale['ERROR_DB_2'] + '</p>',
						buttons: {
							action: {
								title: lychee.locale['RETRY'],
								fn: settings.createConfig
							}
						}
					})

					return false

				}

				// Could not create file
				if (data==='Warning: Could not create file!') {

					basicModal.show({
						body: "<p>" + lychee.locale['ERROR_CONFIG_FILE'] + "</p>",
						buttons: {
							action: {
								title: lychee.locale['RETRY'],
								fn: settings.createConfig
							}
						}
					})

					return false

				}

				// Something went wrong
				basicModal.show({
					body: '<p>' + lychee.locale['ERROR_UNKNOWN'] + '</p>',
					buttons: {
						action: {
							title: lychee.locale['RETRY'],
							fn: settings.createConfig
						}
					}
				})

				return false

			} else {

				// Configuration successful
				window.location.reload()

			}

		})

	}

	let msg = `
	          <p>
	              ` + lychee.locale['DB_INFO_TITLE'] + `
	              <input name='dbHost' class='text' type='text' placeholder='` + lychee.locale['DB_INFO_HOST']+ `' value=''>
	              <input name='dbUser' class='text' type='text' placeholder='` + lychee.locale['DB_INFO_USER'] + `' value=''>
	              <input name='dbPassword' class='text' type='password' placeholder='` + lychee.locale['DB_INFO_PASSWORD'] + `' value=''>
	          </p>
	          <p>
	              ` + lychee.locale['DB_INFO_TEXT'] + `
	              <input name='dbName' class='text' type='text' placeholder='` + lychee.locale['DB_NAME'] + `' value=''>
	              <input name='dbTablePrefix' class='text' type='text' placeholder='` + lychee.locale['DB_PREFIX'] + `' value=''>
	          </p>
	          `

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['DB_CONNECT'],
				fn: action
			}
		}
	})

}

settings.createLogin = function() {

	const action = function(data) {

		let username = data.username
		let password = data.password

		if (username.length<1) {
			basicModal.error('username')
			return false
		}

		if (password.length<1) {
			basicModal.error('password')
			return false
		}

		basicModal.close()

		let params = {
			username,
			password
		}

		api.post('Settings::setLogin', params, function(data) {

			if (data!==true) {

				basicModal.show({
					body: '<p>' + lychee.locale['ERROR_LOGIN'] + '</p>',
					buttons: {
						action: {
							title: lychee.locale['RETRY'],
							fn: settings.createLogin
						}
					}
				})

			}

		})

	}

	let msg = `
	          <p>
	              ` + lychee.locale['LOGIN_TITLE'] + `
	              <input name='username' class='text' type='text' placeholder='` + lychee.locale['LOGIN_USERNAME'] + `' value=''>
	              <input name='password' class='text' type='password' placeholder='` + lychee.locale['LOGIN_PASSWORD'] + `' value=''>
	          </p>
	          `

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['LOGIN_CREATE'],
				fn: action
			}
		}
	})

}


// from https://github.com/electerious/basicModal/blob/master/src/scripts/main.js
settings.getValues = function(form_name) {

    let values  = {};
    let inputs  = $(form_name + ' input[name]');
    let selects = $(form_name + ' select[name]');

    // Get value from all inputs
    $(inputs).each(function() {

        let name  = $(this).attr('name');
        // Store name and value of input
        values[name] = $(this).val()

    });

    $(selects).each(function () {
            let name  = $(this).attr('name');
            // Store name and value of select
            values[name] = $(this).options[$(this).selectedIndex].value

    });

    // console.log(values);
    return (Object.keys(values).length===0 ? null : values)

};

// from https://github.com/electerious/basicModal/blob/master/src/scripts/main.js
settings.bind = function(item, name, fn) {

    // Action-button
	$(item).on('click', function () {

		// Don't execute function when button has been clicked already
		if (this.classList.contains('basicModal__button--active') === true) return false;

		this.classList.add('basicModal__button--active');
		fn(settings.getValues(name))

	})
};

settings.setLogin = function() {

	const action = function(data) {

		let oldPassword = data.oldPassword || ''
		let username    = data.username    || ''
		let password    = data.password    || ''

		if (oldPassword.length<1) {
			basicModal.error('oldPassword')
			return false
		}

		if (username.length<1) {
			basicModal.error('username')
			return false
		}

		if (password.length<1) {
			basicModal.error('password')
			return false
		}

		basicModal.close()

		let params = {
			oldPassword,
			username,
			password
		}

		api.post('Settings::setLogin', params, function(data) {

			if (data!==true) lychee.error(null, params, data)

		})

	}

	let msg = `
	          <p>
	              ` + lychee.locale['PASSWORD_TITLE'] + `
	              <input name='oldPassword' class='text' type='password' placeholder='` + lychee.locale['PASSWORD_CURRENT'] + `' value=''>
	          </p>
	          <p>
	              ` + lychee.locale['PASSWORD_TEXT'] + `
	              <input name='username' class='text' type='text' placeholder='` + lychee.locale['LOGIN_USERNAME'] + `' value=''>
	              <input name='password' class='text' type='password' placeholder='` + lychee.locale['LOGIN_PASSWORD'] + `' value=''>
	          </p>
	          `

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['PASSWORD_CHANGE'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

}

settings.changeLogin = function(data) {
		console.log(data);
	    let oldUsername = data.oldUsername || '';
        let oldPassword = data.oldPassword || '';
        let username    = data.username    || '';
        let password    = data.password    || '';


        if (oldPassword.length<1) {
            basicModal.error('oldPassword')
            return false
        }

        if (username.length<1) {
            basicModal.error('username')
            return false
        }

        if (password.length<1) {
            basicModal.error('password')
            return false
        }

        let params = {
        	oldUsername,
            oldPassword,
            username,
            password
        };

        api.post('Settings::setLogin', params, function(data) {

            if (data!==true) lychee.error(null, params, data)

        })

}

settings.setSorting = function() {

	let sortingPhotos = []
	let sortingAlbums = []

	const action = function() {

		sortingAlbums[0] = $('.basicModal select#settings_albums_type').val()
		sortingAlbums[1] = $('.basicModal select#settings_albums_order').val()

		sortingPhotos[0] = $('.basicModal select#settings_photos_type').val()
		sortingPhotos[1] = $('.basicModal select#settings_photos_order').val()

		basicModal.close()
		albums.refresh()

		let params = {
			typeAlbums  : sortingAlbums[0],
			orderAlbums : sortingAlbums[1],
			typePhotos  : sortingPhotos[0],
			orderPhotos : sortingPhotos[1]
		}

		api.post('Settings::setSorting', params, function(data) {

			if (data===true) {
				lychee.sortingAlbums = 'ORDER BY ' + sortingAlbums[0] + ' ' + sortingAlbums[1]
				lychee.sortingPhotos = 'ORDER BY ' + sortingPhotos[0] + ' ' + sortingPhotos[1]
				lychee.load()
			} else lychee.error(null, params, data)

		})

	}

	let msg = `
	          <p>
	              ` + lychee.locale['SORT_ALBUM_BY_1'] + `
	              <span class="select">
	                  <select id='settings_albums_type'>
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
	                  <select id='settings_albums_order'>
	                      <option value='ASC'>` + lychee.locale['SORT_ASCENDING'] + `</option>
	                      <option value='DESC'>` + lychee.locale['SORT_DESCENDING'] + `</option>
	                  </select>
	              </span>
	              ` + lychee.locale['SORT_ALBUM_BY_3'] + `
	          </p>
	          <p>
	              ` + lychee.locale['SORT_PHOTO_BY_1'] + `
	              <span class="select">
	                  <select id='settings_photos_type'>
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
	                  <select id='settings_photos_order'>
	                      <option value='ASC'>` + lychee.locale['SORT_ASCENDING'] + `</option>
	                      <option value='DESC'>` + lychee.locale['SORT_DESCENDING'] + `</option>
	                  </select>
	              </span>
	              ` + lychee.locale['SORT_PHOTO_BY_3'] + `
	          </p>
	          `

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['SORT_CHANGE'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

	if (lychee.sortingAlbums!=='') {

		sortingAlbums = lychee.sortingAlbums.replace('ORDER BY ', '').split(' ')

		$('.basicModal select#settings_albums_type').val(sortingAlbums[0])
		$('.basicModal select#settings_albums_order').val(sortingAlbums[1])

	}

	if (lychee.sortingPhotos!=='') {

		sortingPhotos = lychee.sortingPhotos.replace('ORDER BY ', '').split(' ')

		$('.basicModal select#settings_photos_type').val(sortingPhotos[0])
		$('.basicModal select#settings_photos_order').val(sortingPhotos[1])

	}

}

settings.setDropboxKey = function(callback) {

	const action = function(data) {

		let key = data.key

		if (data.key.length<1) {
			basicModal.error('key')
			return false
		}

		basicModal.close()

		api.post('Settings::setDropboxKey', { key }, function(data) {

			if (data===true) {
				lychee.dropboxKey = key
				if (callback) lychee.loadDropbox(callback)
			} else lychee.error(null, params, data)

		})

	}

	let msg = lychee.html`
	          <p>
	              ` + lychee.locale['DROPBOX_TEXT'] + `
	              <input class='text' name='key' type='text' placeholder='Dropbox API Key' value='${ lychee.dropboxKey }'>
	          </p>
	          `

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['DROPBOX_TITLE'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

}
