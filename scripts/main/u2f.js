let u2f = {
	/** @type {?WebAuthnCredential[]} * */
	json: null,
};

u2f.is_available = function () {
	if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
		let msg = lychee.html`<h1>${lychee.locale["U2F_NOT_SECURE"]}</h1>`;

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
		.then(function (data) {
			loadingBar.show("success", lychee.locale["U2F_AUTHENTIFICATION_SUCCESS"]);
			window.location.reload();
		})
		.catch((error) => loadingBar.show("error", "Something went wrong!"));
};

u2f.register = function () {
	if (!u2f.is_available()) {
		return;
	}

	let larapass = new Larapass({
		register: "/api/WebAuthn::register",
		registerOptions: "/api/WebAuthn::register/gen",
	});
	if (Larapass.supportsWebAuthn()) {
		larapass
			.register()
			.then(function (response) {
				loadingBar.show("success", lychee.locale["U2F_REGISTRATION_SUCCESS"]);
				u2f.list(); // reload credential list
			})
			.catch((response) => loadingBar.show("error", "Something went wrong!"));
	} else {
		loadingBar.show("error", lychee.locale["U2F_NOT_SUPPORTED"]);
	}
};

u2f.delete = function (params) {
	api.post("WebAuthn::delete", params, function () {
		loadingBar.show("success", lychee.locale["U2F_CREDENTIALS_DELETED"]);
		u2f.list(); // reload credential list
	});
};

u2f.list = function () {
	api.post("WebAuthn::list", {}, function (data) {
		u2f.json = data;
		view.u2f.init();
	});
};
