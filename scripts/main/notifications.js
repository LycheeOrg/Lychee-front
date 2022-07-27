const notifications = {
	/** @type {?EMailData} */
	json: null,
};

/**
 * @param {EMailData} params
 * @returns {void}
 */
notifications.update = function (params) {
	if (params.email && params.email.length > 1) {
		const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (!regexp.test(String(params.email).toLowerCase())) {
			loadingBar.show("error", lychee.locale["ERROR_INVALID_EMAIL"]);
			return;
		}
	}

	api.post("User::setEmail", params, function () {
		loadingBar.show("success", lychee.locale["EMAIL_SUCCESS"]);
	});
};

notifications.load = function () {
	api.post(
		"User::getEmail",
		{},
		/** @param {EMailData} data */ function (data) {
			notifications.json = data;
			view.notifications.init();
		}
	);
};
