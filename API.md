# API Functions

**This might change in the future**

The current API provide the following calls to `php/index.php` as `POST` requests (for Lychee classic)

|      Function           |  Arguments  |   Action    |
|:------------------------|:------------|:------------|
| `Session::init`         |                                                   |             |
| `Session::login`        | `user`, `password`                                |             |
| `Session::logout`       |                                                   |             |
| `Albums::get`           |                                                   |             |
| `Album::get`            | `albumID`                                         |             |
| `Album::getPublic`      | `albumID`                                         |             |
| `Album::add`            | `title`, `parent_id`                              |             |
| `Album::setTitle`       | `albumIDs`, `title`                               |             |
| `Album::setDescription` | `albumID`, `description`                          |             |
| `Album::setPublic`      | `albumID`, `password`, `visible`, `downloadable`  |             |
| `Album::delete`         | `albumIDs`                                        |             |
| `Album::merge`          | `albumIDs`                                        |             |
| `Photo::get`            | `albumID`, `photoID`                              |             |
| `Photo::setTitle`       | `photoIDs`, `title`                               |             |
| `Photo::setDescription` | `photoID`, `description`                          |             |
| `Photo::setStar`        | `photoIDs`                                        |             |
| `Photo::setPublic`      | `photoID`                                         |             |
| `Photo::setAlbum`       | `photoIDs`, `albumID`                             |             |
| `Photo::setTags`        | `photoIDs`, `tags`                                |             |
| `Photo::add`            | `albumID`, `0`, `0.*`                             |             |
| `Photo::delete`         | `photoIDs`                                        |             |
| `Photo::duplicate`      | `photoIDs`                                        |             |
| `Settings::setLogin`    | `username`, `password`                            |             |
| `Settings::setSorting`  | `typeAlbums`, `orderAlbums`, `typePhotos`, `orderPhotos`            |             |

In the case of Lychee-Laravel (`lychee.api_V2 = true`), the function defines the url. Cf bellow.

# Module

[api.js &#187;](scripts/api.js)

```js
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

		api.onError('Server error or API not found.', params, errorThrown)

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
```
