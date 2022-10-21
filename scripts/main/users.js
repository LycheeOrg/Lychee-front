const users = {
	/** @type {?UserDTO[]} */
	json: null,
};

/**
 * Updates a user account.
 *
 * The object `params` must be kept in sync with the HTML form constructed
 * by {@link build.user}.
 *
 * @param {{id: number, username: string, password: string, may_upload: boolean, may_edit_own_settings: boolean}} params
 * @returns {void}
 */
users.update = function (params) {
	if (params.username.length < 1) {
		loadingBar.show("error", lychee.locale["ERROR_EMPTY_USERNAME"]);
		return;
	}

	// If the password is empty, then the password shall not be changed.
	// In this case, the password must not be an attribute of the object at
	// all.
	// An existing, but empty password, would indicate to clear the password.
	if (params.password.length === 0) {
		delete params.password;
	}

	api.post("User::save", params, function () {
		loadingBar.show("success", lychee.locale["USER_UPDATED"]);
		users.list(); // reload user list
	});
};

/**
 * Creates a new user account.
 *
 * The object `params` must be kept in sync with the HTML form constructed
 * by {@link view.users.content}.
 *
 * @param {{id: string, username: string, password: string, may_upload: boolean, may_edit_own_settings: boolean}} params
 * @returns {void}
 */
users.create = function (params) {
	if (params.username.length < 1) {
		loadingBar.show("error", lychee.locale["ERROR_EMPTY_USERNAME"]);
		return;
	}
	if (params.password.length < 1) {
		loadingBar.show("error", lychee.locale["ERROR_EMPTY_PASSWORD"]);
		return;
	}

	api.post("User::create", params, function () {
		loadingBar.show("success", lychee.locale["USER_CREATED"]);
		users.list(); // reload user list
	});
};

/**
 * Deletes a user account.
 *
 * The object `params` must be kept in sync with the HTML form constructed
 * by {@link build.user}.
 *
 * @param {{id: number}} params
 * @returns {boolean}
 */
users.delete = function (params) {
	api.post("User::delete", params, function () {
		loadingBar.show("success", lychee.locale["USER_DELETED"]);
		users.list(); // reload user list
	});
};

/**
 * @returns {void}
 */
users.list = function () {
	api.post(
		"User::list",
		{},
		/** @param {UserDTO[]} data */
		function (data) {
			users.json = data;
			view.users.init();
		}
	);
};
