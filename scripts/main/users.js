let users = {
	json: null,
};

users.update = function (params) {
	if (params.username.length < 1) {
		loadingBar.show("error", "new username cannot be empty.");
		return false;
	}

	if ($("#UserData" + params.id + ' .choice input[name="upload"]:checked').length === 1) {
		params.may_upload = true;
	} else {
		params.may_upload = false;
	}
	if ($("#UserData" + params.id + ' .choice input[name="lock"]:checked').length === 1) {
		params.is_locked = true;
	} else {
		params.is_locked = false;
	}

	api.post("User::save", params, function () {
		loadingBar.show("success", "User updated!");
		users.list(); // reload user list
	});
};

users.create = function (params) {
	if (params.username.length < 1) {
		loadingBar.show("error", "new username cannot be empty.");
		return false;
	}
	if (params.password.length < 1) {
		loadingBar.show("error", "new password cannot be empty.");
		return false;
	}

	if ($('#UserCreate .choice input[name="upload"]:checked').length === 1) {
		params.may_upload = true;
	} else {
		params.may_upload = false;
	}
	if ($('#UserCreate .choice input[name="lock"]:checked').length === 1) {
		params.is_locked = true;
	} else {
		params.is_locked = false;
	}

	api.post("User::create", params, function () {
		loadingBar.show("success", "User created!");
		users.list(); // reload user list
	});
};

users.delete = function (params) {
	api.post("User::delete", params, function () {
		loadingBar.show("success", "User deleted!");
		users.list(); // reload user list
	});
};

users.list = function () {
	api.post("User::list", {}, function (data) {
		users.json = data;
		view.users.init();
	});
};
