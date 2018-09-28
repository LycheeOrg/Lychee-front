/**
 * @description This module communicates with Lychee's API
 */

api = {

	path    : 'php/index.php',
	onError : null

}

api.get_url = function(fn) {

		var api_url = ''

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

}

api.post = function(fn, params, callback) {

	loadingBar.show()

	params = $.extend({ function: fn }, params)

	var api_url = api.get_url(fn);

	const success = (data) => {

		setTimeout(loadingBar.hide, 100)

		// Catch errors
		if (typeof data==='string' && data.substring(0, 7)==='Error: ') {
			api.onError(data.substring(7, data.length), params, data)
			return false
		}

		callback(data)

	}

	const error = (jqXHR, textStatus, errorThrown) => {

		api.onError('Server error or API not found.', params, errorThrown)

	}

	$.ajax({
		type: 'POST',
		url: api_url,
		data: params,
		dataType: 'json',
		success,
		error
	})

}
