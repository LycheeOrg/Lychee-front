/**
 * @description Controls the access to password-protected albums and photos.
 */

const password = {};

/**
 * @callback UnlockSuccessCB
 * @returns {void}
 */

/**
 * Shows the "album unlock"-dialog, tries to unlock the album and calls
 * the provided callback in case of success.
 *
 * @param {string} albumID - the ID of the album which shall be unlocked
 * @param {UnlockSuccessCB} callback - called in case of success
 */
password.getDialog = function (albumID, callback) {
	/** @param {{password: string}} data */
	const action = (data) => {
		const params = {
			albumID: albumID,
			password: data.password,
		};

		api.post(
			"Album::unlock",
			params,
			function () {
				basicModal.close();
				callback();
			},
			null,
			function (jqXHR, params2, lycheeException) {
				if ((jqXHR.status === 401 || jqXHR.status === 403) && lycheeException.message.includes("Password is invalid")) {
					basicModal.focusError("password");
					return true;
				}
				basicModal.close();
				return false;
			}
		);
	};

	const cancel = function () {
		basicModal.close();
		if (!visible.albums() && !visible.album()) lychee.goto();
	};

	const enterPasswordDialogBody =	`
		  <p></p>
		  <form>
		  	<div class="input-group stacked"><input name='password' class='text' type='password'></div>
		  </form>`;

	/**
	 * @param {ModelDialogFormElements} formElements
	 * @param {HTMLDivElement} dialog
	 * @returns {void}
	 */
	const initEnterPasswordDialog = function (formElements, dialog) {
		dialog.querySelector("p").textContent = lychee.locale["ALBUM_PASSWORD_REQUIRED"];
		formElements.password.placeholder = lychee.locale["PASSWORD"];
	}

	basicModal.show({
		body: enterPasswordDialogBody,
		readyCB: initEnterPasswordDialog,
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
