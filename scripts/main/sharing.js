let sharing = {
	/** @type {?SharingInfo} */
	json: null,
};

/**
 * @returns {void}
 */
sharing.add = function () {
	const params = {
		/** @type {string[]} */
		albumIDs: [],
		/** @type {number[]} */
		userIDs: [],
	};

	$("#albums_list_to option").each(function () {
		params.albumIDs.push(this.value);
	});

	$("#user_list_to option").each(function () {
		params.userIDs.push(Number.parseInt(this.value, 10));
	});

	if (params.albumIDs.length === 0) {
		loadingBar.show("error", lychee.locale["ERROR_SELECT_ALBUM"]);
		return;
	}
	if (params.userIDs.length === 0) {
		loadingBar.show("error", lychee.locale["ERROR_SELECT_USER"]);
		return;
	}

	api.post("Sharing::add", params, function () {
		loadingBar.show("success", lychee.locale["SHARING_SUCCESS"]);
		sharing.list(); // reload user list
	});
};

/**
 * @returns {void}
 */
sharing.delete = function () {
	const params = {
		/** @type {number[]} */
		shareIDs: [],
	};

	$('input[name="remove_id"]:checked').each(function () {
		params.shareIDs.push(Number.parseInt(this.value, 10));
	});

	if (params.shareIDs.length === 0) {
		loadingBar.show("error", lychee.locale["ERROR_SELECT_SHARING"]);
		return;
	}
	api.post("Sharing::delete", params, function () {
		loadingBar.show("success", lychee.locale["SHARING_REMOVED"]);
		sharing.list(); // reload user list
	});
};

/**
 * Queries the backend for a list of active shares, sharable albums and users
 * with whom albums can be shared.
 *
 * For admin user, the query is unrestricted, for non-admin user the
 * query is restricted to albums which are owned by the currently
 * authenticated user.
 * The latter is required as the backend forbids unrestricted queries for
 * non-admin users.
 *
 * @returns {void}
 */
sharing.list = function () {
	api.post(
		"Sharing::list",
		lychee.rights.is_admin ? {} : { ownerID: lychee.user.id },
		/** @param {SharingInfo} data */
		function (data) {
			sharing.json = data;
			view.sharing.init();
		}
	);
};
