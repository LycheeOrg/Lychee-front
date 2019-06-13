/**
 * @description This module communicates with Lychee's API
 */

api = {

	path    : 'php/index.php',
	onError : null

};

api.get_url = function(fn) {

		let api_url = '';

		if(lychee.api_V2)
		{
		// because the api is defined directly by the function called in the route.php
			api_url = 'api/' + fn;
		}
		else
		{
			api_url = api.path;
		}

		return api_url;

};

api.isTimeout = function(errorThrown, jqXHR) {
	if (errorThrown && errorThrown === 'Bad Request' &&
			jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error &&
			jqXHR.responseJSON.error === 'Session timed out') {
		return true;
	}

	return false;
};

api.post = function(fn, params, callback) {

	loadingBar.show();

	params = $.extend({ function: fn }, params);

	let api_url = api.get_url(fn);

	const success = (data) => {

		setTimeout(loadingBar.hide, 100);

		// Catch errors
		if (typeof data==='string' && data.substring(0, 7)==='Error: ') {
			api.onError(data.substring(7, data.length), params, data);
			return false
		}

		callback(data)

	};

	const error = (jqXHR, textStatus, errorThrown) => {

		api.onError((api.isTimeout(errorThrown, jqXHR) ? 'Session timed out.' :
					 'Server error or API not found.'), params, errorThrown)

	};

	$.ajax({
		type: 'POST',
		url: api_url,
		data: params,
		dataType: 'json',
		success,
		error
	})

};

api.get = function(url, callback) {

	loadingBar.show();

	const success = (data) => {

		setTimeout(loadingBar.hide, 100);

		// Catch errors
		if (typeof data==='string' && data.substring(0, 7)==='Error: ') {
			api.onError(data.substring(7, data.length), params, data);
			return false
		}

		callback(data)

	};

	const error = (jqXHR, textStatus, errorThrown) => {

		api.onError((api.isTimeout(errorThrown, jqXHR) ? 'Session timed out.' :
					 'Server error or API not found.'), {}, errorThrown)

	};

	$.ajax({
		type: 'GET',
		url: url,
		data: {},
		dataType: 'text',
		success,
		error
	})

};

api.post_raw = function (fn, params, callback) {
	loadingBar.show();

	params = $.extend({ function: fn }, params);

	let api_url = api.get_url(fn);

	const success = (data) => {

		setTimeout(loadingBar.hide, 100);

		// Catch errors
		if (typeof data==='string' && data.substring(0, 7)==='Error: ') {
			api.onError(data.substring(7, data.length), params, data);
			return false
		}

		callback(data)

	};

	const error = (jqXHR, textStatus, errorThrown) => {

		api.onError((api.isTimeout(errorThrown, jqXHR) ? 'Session timed out.' :
					 'Server error or API not found.'), params, errorThrown)

	};

	$.ajax({
		type: 'POST',
		url: api_url,
		data: params,
		dataType: 'text',
		success,
		error
	})

};