/**
 * @description Takes care of every action a photo can handle and execute.
 */

photo = {

	json  : null,
	cache : null

};

photo.getID = function() {

	let id = null;

	if (photo.json) id = photo.json.id;
	else            id = $('.photo:hover, .photo.active').attr('data-id');

	if ($.isNumeric(id)===true) return id;
	else                        return false

};

photo.load = function(photoID, albumID) {

	const checkContent = function() {
		if (album.json!=null && album.json.photos) photo.load(photoID, albumID);
		else                  setTimeout(checkContent, 100)
	};

	const checkPasswd = function() {
		if (password.value!=='') photo.load(photoID, albumID);
		else                     setTimeout(checkPasswd, 200)
	};

	// we need to check the album.json.photos because otherwise the script is too fast and this raise an error.
	if (album.json==null || album.json.photos == null) {
		checkContent();
		return false
	}

	let params = {
		photoID,
		albumID,
		password: password.value
	};

	api.post('Photo::get', params, function(data) {

		if (data==='Warning: Photo private!') {
			lychee.content.show();
			lychee.goto();
			return false
		}

		if (data==='Warning: Wrong password!') {
			checkPasswd();
			return false
		}

		photo.json = data;

		if (!visible.photo()) view.photo.show();
		view.photo.init();
		lychee.imageview.show();

		setTimeout(() => {
			lychee.content.show();
			photo.preloadNext(photoID)
		}, 300)

	})

};

photo.hasExif = function () {
	let exifHash  = photo.json.make + photo.json.model + photo.json.shutter + photo.json.aperture + photo.json.focal + photo.json.iso;

	return exifHash !== '';
};

photo.hasTakedate = function () {
	return photo.json.takedate && photo.json.takedate !== '';
};

photo.hasDesc = function () {
	return photo.json.description && photo.json.description !== '';
};

photo.update_overlay_type = function() {
	// Only run if the overlay is showing
	if(!lychee.image_overlay)
	{
		return false;
	}
	else
	{
		// console.log('Current ' + lychee.image_overlay_type);
		let types = ['exif', 'desc', 'takedate'];

		let i = types.indexOf(lychee.image_overlay_type);
		let j = (i + 1) %types.length;
		let cont = true;
		while(i !== j && cont)
		{
			if (types[j] === 'desc' && photo.hasDesc())
				cont = false;
			else if (types[j] === 'takedate' && photo.hasTakedate())
				cont = false;
			else if (types[j] === 'exif' && photo.hasExif())
				cont = false;
			else
				j = (j + 1) %types.length;
		}

		if (i !== j)
		{
			lychee.image_overlay_type = types[j];
			$('#image_overlay').remove();
			lychee.imageview.append(build.overlay_image(photo.json));
		}
		else
		{
			console.log('no other data found, displaying ' + types[j]);
		}
	}
};

photo.update_display_overlay = function () {
	lychee.image_overlay = !lychee.image_overlay;
	if(!lychee.image_overlay)
	{
		$('#image_overlay').remove();
	}
	else
	{
		lychee.imageview.append(build.overlay_image(photo.json))
	}
};

// Preload the next photo for better response time
photo.preloadNext = function(photoID) {
	if (album.json &&
		album.json.photos &&
		album.getByID(photoID) &&
		album.getByID(photoID).nextPhoto!=='') {

		let nextPhoto = album.getByID(photoID).nextPhoto;
		let url       = album.getByID(nextPhoto).url;
		let medium    = album.getByID(nextPhoto).medium;
		let href      = url;
		if (medium != null && medium !== '') {
			href = medium;

			let medium2x = album.getByID(nextPhoto).medium2x;
			if (medium2x && medium2x !== '') {
				// If the currently displayed image uses the 2x variant,
				// chances are that so will the next one.
				let imgs=$('img#image');
				if (imgs.length > 0 && imgs[0].currentSrc != null && imgs[0].currentSrc.includes('@2x.')) {
					href = medium2x;
				}
			}
		}

		$('head [data-prefetch]').remove();
		$('head').append(`<link data-prefetch rel="prefetch" href="${ href }">`)

	}

};

photo.parse = function() {

	if (!photo.json.title) photo.json.title = lychee.locale['UNTITLED']

};

photo.previous = function(animate) {

	if (photo.getID()!==false &&
		album.json &&
		album.getByID(photo.getID()) &&
		album.getByID(photo.getID()).previousPhoto!=='') {

		let delay = 0;

		if (animate===true) {

			delay = 200;

			$('#imageview #image').css({
				WebkitTransform : 'translateX(100%)',
				MozTransform    : 'translateX(100%)',
				transform       : 'translateX(100%)',
				opacity         : 0
			})

		}

		setTimeout(() => {
			if (photo.getID()===false) return false;
			lychee.goto(album.getID() + '/' + album.getByID(photo.getID()).previousPhoto)
		}, delay)

	}

};

photo.next = function(animate) {

	if (photo.getID()!==false &&
		album.json &&
		album.getByID(photo.getID()) &&
		album.getByID(photo.getID()).nextPhoto!=='') {

		let delay = 0;

		if (animate===true) {

			delay = 200;

			$('#imageview #image').css({
				WebkitTransform : 'translateX(-100%)',
				MozTransform    : 'translateX(-100%)',
				transform       : 'translateX(-100%)',
				opacity         : 0
			})

		}

		setTimeout(() => {
			if (photo.getID()===false) return false;
			lychee.goto(album.getID() + '/' + album.getByID(photo.getID()).nextPhoto)
		}, delay)

	}

};

photo.duplicate = function(photoIDs, callback = null) {

	if (!photoIDs) return false;
	if (photoIDs instanceof Array===false) photoIDs = [ photoIDs ];

	albums.refresh();

	let params = {
		photoIDs: photoIDs.join()
	};

	api.post('Photo::duplicate', params, function(data) {

		if (data!==true){
			lychee.error(null, params, data);
		}
		else {
			album.load(album.getID());
			if (callback != null) {
				callback();
			}
		}

	})

};

photo.delete = function(photoIDs) {

	let action     = {};
	let cancel     = {};
	let msg        = '';
	let photoTitle = '';

	if (!photoIDs) return false;
	if (photoIDs instanceof Array===false) photoIDs = [ photoIDs ];

	if (photoIDs.length===1) {

		// Get title if only one photo is selected
		if (visible.photo()) photoTitle = photo.json.title;
		else                 photoTitle = album.getByID(photoIDs).title;

		// Fallback for photos without a title
		if (photoTitle==='') photoTitle = lychee.locale['UNTITLED']

	}

	action.fn = function() {

		let nextPhoto = null;
		let previousPhoto = null;

		basicModal.close();

		photoIDs.forEach(function(id, index) {

			// Change reference for the next and previous photo
			if (album.getByID(id).nextPhoto!=='' || album.getByID(id).previousPhoto!=='') {

				nextPhoto     = album.getByID(id).nextPhoto;
				previousPhoto = album.getByID(id).previousPhoto;

				album.getByID(previousPhoto).nextPhoto = nextPhoto;
				album.getByID(nextPhoto).previousPhoto = previousPhoto

			}

			album.deleteByID(id);
			view.album.content.delete(id, (index === photoIDs.length - 1))

		});

		albums.refresh();

		// Go to next photo if there is a next photo and
		// next photo is not the current one. Show album otherwise.
		if (visible.photo() && nextPhoto!=null && nextPhoto!==photo.getID()) lychee.goto(album.getID() + '/' + nextPhoto);
		else if (!visible.albums())                                          lychee.goto(album.getID());

		let params = {
			photoIDs: photoIDs.join()
		};

		api.post('Photo::delete', params, function(data) {

			if (data!==true) lychee.error(null, params, data)

		})

	};

	if (photoIDs.length===1) {

		action.title = lychee.locale['PHOTO_DELETE'];
		cancel.title = lychee.locale['PHOTO_KEEP'];

		msg = lychee.html`<p>${ lychee.locale['PHOTO_DELETE_1'] } '${ photoTitle }' ${ lychee.locale['PHOTO_DELETE_2'] }</p>`

	} else {

		action.title = lychee.locale['PHOTO_DELETE'];
		cancel.title = lychee.locale['PHOTO_KEEP'];

		msg = lychee.html`<p>${ lychee.locale['PHOTO_DELETE_ALL_1'] } ${ photoIDs.length } ${ lychee.locale['PHOTO_DELETE_ALL_2'] }</p>`

	}

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: action.title,
				fn: action.fn,
				class: 'red'
			},
			cancel: {
				title: cancel.title,
				fn: basicModal.close
			}
		}
	})

};

photo.setTitle = function(photoIDs) {

	let oldTitle = '';
	let msg      = '';

	if (!photoIDs) return false;
	if (photoIDs instanceof Array===false) photoIDs = [ photoIDs ];

	if (photoIDs.length===1) {

		// Get old title if only one photo is selected
		if (photo.json)      oldTitle = photo.json.title;
		else if (album.json) oldTitle = album.getByID(photoIDs).title

	}

	const action = function(data) {

		basicModal.close();

		let newTitle = data.title;

		if (visible.photo()) {
			photo.json.title = (newTitle==='' ? 'Untitled' : newTitle);
			view.photo.title()
		}

		photoIDs.forEach(function(id) {
			album.getByID(id).title = newTitle;
			view.album.content.title(id)
		});

		let params = {
			photoIDs : photoIDs.join(),
			title    : newTitle
		};

		api.post('Photo::setTitle', params, function(data) {

			if (data!==true) lychee.error(null, params, data)

		})

	};

	let input = lychee.html`<input class='text' name='title' type='text' maxlength='50' placeholder='Title' value='$${ oldTitle }'>`;

	if (photoIDs.length===1) msg = lychee.html`<p>${ lychee.locale['PHOTO_NEW_TITLE'] } ${ input }</p>`;
	else                     msg = lychee.html`<p>${ lychee.locale['PHOTOS_NEW_TITLE_1'] } ${ photoIDs.length } ${ lychee.locale['PHOTOS_NEW_TITLE_2'] } ${ input }</p>`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['PHOTO_SET_TITLE'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};

photo.copyTo = function(photoIDs, albumID) {

	const action = function()
	{
		photo.setAlbum(photoIDs,albumID);
	};
	photo.duplicate(photoIDs, action);
};

photo.setAlbum = function(photoIDs, albumID) {

	let nextPhoto = null;
	let previousPhoto = null;

	if (!photoIDs) return false;
	if (photoIDs instanceof Array===false) photoIDs = [ photoIDs ];

	photoIDs.forEach(function(id, index) {

		// Change reference for the next and previous photo
		if (album.getByID(id).nextPhoto!==''||album.getByID(id).previousPhoto!=='') {

			nextPhoto     = album.getByID(id).nextPhoto;
			previousPhoto = album.getByID(id).previousPhoto;

			album.getByID(previousPhoto).nextPhoto = nextPhoto;
			album.getByID(nextPhoto).previousPhoto = previousPhoto

		}

		album.deleteByID(id);
		view.album.content.delete(id, (index === photoIDs.length - 1))

	});

	albums.refresh();

	// Go to next photo if there is a next photo and
	// next photo is not the current one. Show album otherwise.
	if (visible.photo() && nextPhoto!=null && nextPhoto!==photo.getID()) lychee.goto(album.getID() + '/' + nextPhoto);
	else if (!visible.albums())                                          lychee.goto(album.getID());

	let params = {
		photoIDs: photoIDs.join(),
		albumID
	};

	api.post('Photo::setAlbum', params, function(data) {

		if (data!==true){
			lychee.error(null, params, data)
		}
		else {
			if (album.hasSub(albumID)) {
				// If we moved photos to a subalbum of the currently
				// displayed album, that may change the subalbum thumbs
				// being displayed so we need to reload.
				if (visible.album()) {
					album.reload();
				}
				else {
					// We're most likely in photo view.  We still need to
					// refresh the album but we don't want to reload it
					// since that would switch the view being displayed.
					album.refresh();
				}
			}
		}

	})

};

photo.setStar = function(photoIDs) {

	if (!photoIDs) return false;

	if (visible.photo()) {
		photo.json.star = (photo.json.star==='0' ? '1' : '0');
		view.photo.star()
	}

	photoIDs.forEach(function(id) {
		album.getByID(id).star = (album.getByID(id).star==='0' ? '1' : '0');
		view.album.content.star(id)
	});

	albums.refresh();

	let params = {
		photoIDs: photoIDs.join()
	};

	api.post('Photo::setStar', params, function(data) {

		if (data!==true) lychee.error(null, params, data)

	})

};

photo.setPublic = function(photoID, e) {

	if (photo.json.public==='2') {

		const action = function() {

			basicModal.close();
			lychee.goto(photo.json.original_album)

		};

		basicModal.show({
			body: '<p>' + lychee.locale['PHOTO_MAKE_PRIVATE_ALBUM'] + '</p>',
			buttons: {
				action: {
					title: lychee.locale['PHOTO_SHOW_ALBUM'],
					fn: action
				},
				cancel: {
					title: lychee.locale['CANCEL'],
					fn: basicModal.close
				}
			}
		});

		return false

	}

	if (visible.photo()) {

		photo.json.public = (photo.json.public==='0' ? '1' : '0');
		view.photo.public();
		if (photo.json.public==='1') contextMenu.sharePhoto(photoID, e)

	}

	album.getByID(photoID).public = (album.getByID(photoID).public==='0' ? '1' : '0');
	view.album.content.public(photoID);

	albums.refresh();

	api.post('Photo::setPublic', { photoID }, function(data) {

		if (data!==true) lychee.error(null, params, data)

	})

};

photo.setDescription = function(photoID) {

	let oldDescription = photo.json.description;

	const action = function(data) {

		basicModal.close();

		let description = data.description;

		if (visible.photo()) {
			photo.json.description = description;
			view.photo.description()
		}

		let params = {
			photoID,
			description
		};

		api.post('Photo::setDescription', params, function(data) {
			if (data!==true) lychee.error(null, params, data)

		})

	};

	basicModal.show({
		body: lychee.html`<p>${ lychee.locale['PHOTO_NEW_DESCRIPTION'] } <input class='text' name='description' type='text' maxlength='800' placeholder='${ lychee.locale['PHOTO_DESCRIPTION'] }' value='$${ oldDescription }'></p>`,
		buttons: {
			action: {
				title: lychee.locale['PHOTO_SET_DESCRIPTION'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};

photo.editTags = function(photoIDs) {

	let oldTags = '';
	let msg     = '';

	if (!photoIDs) return false;
	if (photoIDs instanceof Array===false) photoIDs = [ photoIDs ];

	// Get tags
	if (visible.photo())                              oldTags = photo.json.tags;
	else if (visible.album() && photoIDs.length===1)  oldTags = album.getByID(photoIDs).tags;
	else if (visible.search() && photoIDs.length===1) oldTags = album.getByID(photoIDs).tags;
	else if (visible.album() && photoIDs.length>1) {
		let same = true;
		photoIDs.forEach(function(id) {
			same = (album.getByID(id).tags === album.getByID(photoIDs[0]).tags && same === true);
		});
		if (same===true) oldTags = album.getByID(photoIDs[0]).tags
	}

	// Improve tags
	oldTags = oldTags.replace(/,/g, ', ');

	const action = function(data) {

		basicModal.close();
		photo.setTags(photoIDs, data.tags)

	};

	let input = lychee.html`<input class='text' name='tags' type='text' maxlength='800' placeholder='Tags' value='$${ oldTags }'>`;

	if (photoIDs.length===1) msg = lychee.html`<p>${ lychee.locale['PHOTO_NEW_TAGS'] } ${ input }</p>`;
	else                     msg = lychee.html`<p>${ lychee.locale['PHOTO_NEW_TAGS_1'] } ${ photoIDs.length } ${ lychee.locale['PHOTO_NEW_TAGS_2'] } ${ input }</p>`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['PHOTO_SET_TAGS'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};

photo.setTags = function(photoIDs, tags) {

	if (!photoIDs) return false;
	if (photoIDs instanceof Array===false) photoIDs = [ photoIDs ];

	// Parse tags
	tags = tags.replace(/(\ ,\ )|(\ ,)|(,\ )|(,{1,}\ {0,})|(,$|^,)/g, ',');
	tags = tags.replace(/,$|^,|(\ ){0,}$/g, '');

	if (visible.photo()) {
		photo.json.tags = tags;
		view.photo.tags()
	}

	photoIDs.forEach(function(id, index, array) {
		album.getByID(id).tags = tags
	});

	let params = {
		photoIDs: photoIDs.join(),
		tags
	};

	api.post('Photo::setTags', params, function(data) {

		if (data!==true) lychee.error(null, params, data)

	})

};

photo.deleteTag = function(photoID, index) {

	let tags;

	// Remove
	tags = photo.json.tags.split(',');
	tags.splice(index, 1);

	// Save
	photo.json.tags = tags.toString();
	photo.setTags([ photoID ], photo.json.tags)

};

photo.share = function(photoID, service) {

	let url  = photo.getViewLink(photoID);

	switch (service) {
		case 'twitter':
			window.open(`https://twitter.com/share?url=${ encodeURI(url) }`);
			break;
		case 'facebook':
			window.open(`http://www.facebook.com/sharer.php?u=${ encodeURI(url) }&t=${ encodeURI(photo.json.title) }`);
			break;
		case 'mail':
			location.href = `mailto:?subject=${ encodeURI(photo.json.title) }&body=${ encodeURI(url) }`;
			break;
		case 'dropbox':
			lychee.loadDropbox(function() {
				let filename = photo.json.title + '.' + photo.getDirectLink().split('.').pop();
				Dropbox.save(photo.getDirectLink(), filename)
			});
			break
	}

};

photo.setLicense = function(photoID) {

	const callback = function() {
		$('select#license').val(photo.json.license === '' ? 'none' : photo.json.license);
		return false;
	};

	const action = function(data) {

		basicModal.close();
		let license = data.license;

		let params = {
			photoID,
			license
		};

		api.post('Photo::setLicense', params, function(data) {

			if (data!==true) {
				lychee.error(null, params, data)
			} else {
				// update the photo JSON and reload the license in the sidebar
				photo.json.license = params.license;
				view.photo.license();
			}

		})

	};

	let msg = lychee.html`
	<div>
		<p>${ lychee.locale['PHOTO_LICENSE'] }
		<span class="select" style="width:270px">
			<select name="license" id="license">
				<option value="none">${ lychee.locale['PHOTO_LICENSE_NONE'] }</option>
				<option value="reserved">${ lychee.locale['PHOTO_RESERVED'] }</option>
				<option value="CC0">CC0 - Public Domain</option>
				<option value="CC-BY">CC Attribution 4.0</option>
				<option value="CC-BY-ND">CC Attribution-NoDerivatives 4.0</option>
				<option value="CC-BY-SA">CC Attribution-ShareAlike 4.0</option>
				<option value="CC-BY-NC">CC Attribution-NonCommercial 4.0</option>
				<option value="CC-BY-NC-ND">CC Attribution-NonCommercial-NoDerivatives 4.0</option>
				<option value="CC-BY-NC-SA">CC Attribution-NonCommercial-ShareAlike 4.0</option>
			</select>
		</span>
		<br />
		<a href="https://creativecommons.org/choose/" target="_blank">${ lychee.locale['PHOTO_LICENSE_HELP'] }</a>
		</p>
	</div>`;

	basicModal.show({
		body: msg,
		callback: callback,
		buttons: {
			action: {
				title: lychee.locale['PHOTO_SET_LICENSE'],
				fn: action
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	})

};

photo.getArchive = function(photoID, kind) {

	let link;

	if(lychee.api_V2)
	{
		console.log(api.get_url('Photo::getArchive') + lychee.html`?photoID=${photoID}&kind=${ kind }`);
		location.href = api.get_url('Photo::getArchive') + lychee.html`?photoID=${photoID}&kind=${ kind }`;
	}
	else
	{
		let url = `${ api.path }?function=Photo::getArchive&photoID=${ photoID }&kind=${ kind }`;

		if (location.href.indexOf('index.html')>0) link = location.href.replace(location.hash, '').replace('index.html', url);
		else                                       link = location.href.replace(location.hash, '') + url;

		if (lychee.publicMode===true) link += `&password=${ encodeURIComponent(password.value) }`;

		location.href = link
	}

};

photo.getDirectLink = function() {

	let url = '';

	if (photo.json && photo.json.url && photo.json.url!=='') url = photo.json.url;

	return url

};

photo.getViewLink = function(photoID) {

	let url = 'view.php?p=' + photoID;
	if(lychee.api_V2)
	{
		url = 'view?p=' + photoID;
	}

	if (location.href.indexOf('index.html')>0) return location.href.replace('index.html' + location.hash, url);
	if (location.href.indexOf('gallery')>0) return location.href.replace('gallery' + location.hash, url);
	return location.href.replace(location.hash, url)

};
