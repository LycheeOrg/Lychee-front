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
		loadingBar.show("error", "Select an album to share!");
		return;
	}
	if (params.userIDs.length === 0) {
		loadingBar.show("error", "Select a user to share with!");
		return;
	}

	api.post("Sharing::add", params, function () {
		loadingBar.show("success", "Sharing updated!");
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
		loadingBar.show("error", "Select a sharing to remove!");
		return;
	}
	api.post("Sharing::delete", params, function () {
		loadingBar.show("success", "Sharing removed!");
		sharing.list(); // reload user list
	});
};

/**
 * @returns {void}
 */
sharing.list = function () {
	api.post(
		"Sharing::list",
		{},
		/** @param {SharingInfo} data */
		function (data) {
			sharing.json = data;
			view.sharing.init();
		}
	);
};
