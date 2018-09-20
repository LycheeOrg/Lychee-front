# API Functions

**This might change in the future**

The current API provide the following calls to `php/index.php` as `POST` requests

|      Function           |  Arguments  |   Action    |
|:------------------------|:------------|:------------|
| `Session::init`         |                                                   |             |
| `Session::login`        | `user`, `password`                                |             |
| `Session::logout`       |                                                   |             |
| `Albums::get`           |                                                   |             |
| `Album::get`            | `albumID`                                         |             |
| `Album::getPublic`      | `albumID`                                         |             |
| `Album::add`            | `title`                                           |             |
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

# Module

[api.js &#187;](scripts/api.js)

```js
/**
 * @description This module communicates with Lychee's API
 */

api = {

	path    : 'php/index.php',
	onError : null

}

api.post = function(fn, params, callback) {

	loadingBar.show()

	params = $.extend({ function: fn }, params)

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
		url: api.path,
		data: params,
		dataType: 'json',
		success,
		error
	})

}
```
