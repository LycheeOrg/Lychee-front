csrf = {};

csrf.addLaravelCSRF = function (event, jqxhr, settings) {
	if (settings.url !== lychee.updatePath) {
		jqxhr.setRequestHeader('X-XSRF-TOKEN', csrf.getCookie('XSRF-TOKEN'));
	}
};

csrf.escape = function (s) {
	return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1');
};

csrf.getCookie = function (name) {
	// we stop the selection at = (default json) but also at % to prevent any %3D at the end of the string
	var match = document.cookie.match(RegExp('(?:^|;\\s*)' + csrf.escape(name) + '=([^;^%]*)'));
	return match ? match[1] : null;
};

csrf.bind = function () {
	$(document).on('ajaxSend', csrf.addLaravelCSRF);
};

