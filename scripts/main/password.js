/**
 * @description Controls the access to password-protected albums and photos.
 */

let password = {
	value: "",
};

password.getDialog = function (albumID, callback) {
	const action = (data) => {
		let passwd = data.password;

		let params = {
			albumID,
			password: passwd,
		};

		api.post(
			"Album::unlock",
			params,
			function (_data) {
				basicModal.close();
				password.value = passwd;
				callback();
			},
			null,
			function (jqXHR) {
				if (jqXHR.status === 403) {
					basicModal.error("password");
					return true;
				}
				return false;
			}
		);
	};

	const cancel = () => {
		basicModal.close();
		if (!visible.albums() && !visible.album()) lychee.goto();
	};

	let msg =
		`
			  <p>
				  ` +
		lychee.locale["ALBUM_PASSWORD_REQUIRED"] +
		`
				  <input name='password' class='text' type='password' placeholder='` +
		lychee.locale["PASSWORD"] +
		`' value=''>
			  </p>
			  `;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale["ENTER"],
				fn: action,
			},
			cancel: {
				title: lychee.locale["CANCEL"],
				fn: cancel,
			},
		},
	});
};
