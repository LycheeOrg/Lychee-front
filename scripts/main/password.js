/**
 * @description Controls the access to password-protected albums and photos.
 */

password = {

	value: ''

};

password.get = function(albumID, callback) {

	if (lychee.publicMode===false)                                  callback();
	else if (albums.json && (albums.getByID(albumID).password==='0' || albums.getByID(albumID).passwordProvided)) callback();
	else if (!albums.json && !album.json) {

		// Continue without password

		album.json = { password: true };
		callback('')

	} else {

		// Request password

		password.getDialog(albumID, callback)

	}

};

password.getDialog = function(albumID, callback) {

	const action = (data) => {

		let passwd = data.password;

		let params = {
			albumID,
			password: passwd
		};

		api.post('Album::getPublic', params, function(data) {

			if (data===true) {
				basicModal.close();
				password.value = passwd;
				if (lychee.api_V2 && albums.json) {
					albums.getByID(albumID).passwordProvided = true;
				}
				callback()
			} else {
				basicModal.error('password')
			}

		})

	};

	const cancel = () => {

		basicModal.close();
		if (!visible.albums()) lychee.goto()

	};

	let msg = `
			  <p>
				  ` + lychee.locale['ALBUM_PASSWORD_REQUIRED'] + `
				  <input name='password' class='text' type='password' placeholder='` + lychee.locale['PASSWORD'] + `' value=''>
			  </p>
			  `;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['ENTER'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: cancel
			}
		}
	})

};
