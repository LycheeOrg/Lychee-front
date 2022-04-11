let sharing = {
	json: null,
};

sharing.add = function () {
	let params = {
		albumIDs: "",
		UserIDs: "",
	};

	$("#albums_list_to option").each(function () {
		if (params.albumIDs !== "") params.albumIDs += ",";
		params.albumIDs += this.value;
	});

	$("#user_list_to option").each(function () {
		if (params.UserIDs !== "") params.UserIDs += ",";
		params.UserIDs += this.value;
	});

	if (params.albumIDs === "") {
		loadingBar.show("error", lychee.locale["ERROR_SELECT_ALBUM"]);
		return false;
	}
	if (params.UserIDs === "") {
		loadingBar.show("error", lychee.locale["ERROR_SELECT_USER"]);
		return false;
	}

	api.post("Sharing::Add", params, function (data) {
		if (data !== true) {
			loadingBar.show("error", data.description);
			lychee.error(null, params, data);
		} else {
			loadingBar.show("success", lychee.locale["SUCCESS_SHARING_UPDATE"]);
			sharing.list(); // reload user list
		}
	});
};

sharing.delete = function () {
	let params = {
		ShareIDs: "",
	};

	$('input[name="remove_id"]:checked').each(function () {
		if (params.ShareIDs !== "") params.ShareIDs += ",";
		params.ShareIDs += this.value;
	});

	if (params.ShareIDs === "") {
		loadingBar.show("error", lychee.locale["ERROR_SELECT_SHARING"]);
		return false;
	}
	api.post("Sharing::Delete", params, function (data) {
		if (data !== true) {
			loadingBar.show("error", data.description);
			lychee.error(null, params, data);
		} else {
			loadingBar.show("success", lychee.locale["SUCCESS_SHARING_REMOVED"]);
			sharing.list(); // reload user list
		}
	});
};

sharing.list = function () {
	api.post("Sharing::List", {}, function (data) {
		sharing.json = data;
		view.sharing.init();
	});
};
