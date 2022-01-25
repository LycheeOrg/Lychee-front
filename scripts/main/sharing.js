let sharing = {
	/** @type {?SharingInfo} */
	json: null,
};

/**
 * @returns {void}
 */
sharing.add = function () {
	// TODO: Change `albumIDs` and `userIDs` to proper arrays. This would also simplify the code below.
	const params = {
		albumIDs: "",
		userIDs: "",
	};

	$("#albums_list_to option").each(function () {
		if (params.albumIDs !== "") params.albumIDs += ",";
		params.albumIDs += this.value;
	});

	$("#user_list_to option").each(function () {
		if (params.userIDs !== "") params.userIDs += ",";
		params.userIDs += this.value;
	});

	if (params.albumIDs === "") {
		loadingBar.show("error", "Select an album to share!");
		return;
	}
	if (params.userIDs === "") {
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
	// TODO: Change `shareIDs` to a proper array. This would also simplify the code below.
	const params = {
		shareIDs: "",
	};

	$('input[name="remove_id"]:checked').each(function () {
		if (params.shareIDs !== "") params.shareIDs += ",";
		params.shareIDs += this.value;
	});

	if (params.shareIDs === "") {
		loadingBar.show("error", "Select a sharing to remove!");
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
