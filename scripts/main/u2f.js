const u2f = {
	/** @type {?WebAuthnCredential[]} */
	json: null,
};

/**
 * @returns {boolean}
 */
u2f.is_available = function () {
	if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
		const msg = lychee.html`<h1>${lychee.locale["U2F_NOT_SECURE"]}</h1>`;

		basicModal.show({
			body: msg,
			buttons: {
				cancel: {
					title: lychee.locale["CLOSE"],
					fn: basicModal.close,
				},
			},
		});

		return false;
	}
	return true;
};

/**
 * @returns {void}
 */
u2f.login = function () {
	if (!u2f.is_available()) {
		return;
	}

	new Larapass({
		login: "/api/WebAuthn::login",
		loginOptions: "/api/WebAuthn::login/gen",
	})
		.login({
			user_id: 0, // for now it is only available to Admin user via a secret key shortcut.
		})
		.then(function () {
			loadingBar.show("success", lychee.locale["U2F_AUTHENTIFICATION_SUCCESS"]);
			window.location.reload();
		})
		.catch(() => loadingBar.show("error", "Something went wrong!"));
};

/**
 * @returns {void}
 */
u2f.register = function () {
	if (!u2f.is_available()) {
		return;
	}

	const larapass = new Larapass({
		register: "/api/WebAuthn::register",
		registerOptions: "/api/WebAuthn::register/gen",
	});
	if (Larapass.supportsWebAuthn()) {
		larapass
			.register()
			.then(function () {
				loadingBar.show("success", lychee.locale["U2F_REGISTRATION_SUCCESS"]);
				u2f.list(); // reload credential list
			})
			.catch(() => loadingBar.show("error", "Something went wrong!"));
	} else {
		loadingBar.show("error", lychee.locale["U2F_NOT_SUPPORTED"]);
	}
};

/**
 * @param {{id: string}} params - ID of WebAuthn credential
 */
u2f.delete = function (params) {
	api.delete("WebAuthn::delete", params, function () {
		loadingBar.show("success", lychee.locale["U2F_CREDENTIALS_DELETED"]);
		u2f.list(); // reload credential list
	});
};

u2f.list = function () {
	api.get(
		"WebAuthn::list",
		{},
		/** @param {WebAuthnCredential[]} data*/
		function (data) {
			u2f.json = data;
			view.u2f.init();
		}
	);
};
