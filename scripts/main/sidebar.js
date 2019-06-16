/**
 * @description This module takes care of the sidebar.
 */

sidebar = {

	_dom: $('.sidebar'),
	types: {
		DEFAULT : 0,
		TAGS    : 1
	},
	createStructure: {}

};

sidebar.dom = function(selector) {

	if (selector==null || selector==='') return sidebar._dom;

	return sidebar._dom.find(selector)

};

sidebar.bind = function() {

	// This function should be called after building and appending
	// the sidebars content to the DOM.
	// This function can be called multiple times, therefore
	// event handlers should be removed before binding a new one.

	// Event Name
	let eventName = lychee.getEventName();

	sidebar
		.dom('#edit_title')
		.off(eventName)
		.on(eventName, function() {
			if (visible.photo())      photo.setTitle([ photo.getID() ]);
			else if (visible.album()) album.setTitle([ album.getID() ])
		});

	sidebar
		.dom('#edit_description')
		.off(eventName)
		.on(eventName, function() {
			if (visible.photo())      photo.setDescription(photo.getID());
			else if (visible.album()) album.setDescription(album.getID())
		});

	sidebar
		.dom('#edit_tags')
		.off(eventName)
		.on(eventName, function() {
			photo.editTags([ photo.getID() ])
		});

	sidebar
		.dom('#tags .tag span')
		.off(eventName)
		.on(eventName, function() {
			photo.deleteTag(photo.getID(), $(this).data('index'))
		});

	sidebar
		.dom('#edit_license')
		.off(eventName)
		.on(eventName, function() {
			if (visible.photo())      photo.setLicense(photo.getID());
			else if (visible.album()) album.setLicense(album.getID())
		})

	return true

};

sidebar.toggle = function() {

	if (visible.sidebar() || visible.sidebarbutton()) {

		header.dom('.button--info').toggleClass('active');
		lychee.content.toggleClass('content--sidebar');
		lychee.imageview.toggleClass('image--sidebar');
		view.album.content.justify();
		sidebar.dom().toggleClass('active');

		return true

	}

	return false

};

sidebar.setSelectable = function(selectable = true) {

	// Attributes/Values inside the sidebar are selectable by default.
	// Selection needs to be deactivated to prevent an unwanted selection
	// while using multiselect.

	if (selectable===true) sidebar.dom().removeClass('notSelectable');
	else                   sidebar.dom().addClass('notSelectable')

};

sidebar.changeAttr = function(attr, value = '-', dangerouslySetInnerHTML = false) {

	if (attr==null || attr==='') return false;

	// Set a default for the value
	if (value==null || value==='') value = '-';

	// Escape value
	if (dangerouslySetInnerHTML===false) value = lychee.escapeHTML(value);

	// Set new value
	sidebar.dom('.attr_' + attr).html(value);

	return true

};

sidebar.secondsToHMS = function(d) {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 60);

	return ((h > 0) ? h.toString() + 'h' : '') + ((m > 0) ? m.toString() + 'm' : '') + ((s > 0 || (h == 0 && m == 0)) ? s.toString() + 's' : '');
}

sidebar.createStructure.photo = function(data) {

	if (data==null || data==='') return false;

	let editable  = album.isUploadable();
	let exifHash  = data.takedate + data.make + data.model + data.shutter + data.aperture + data.focal + data.iso;
	let structure = {};
	let _public   = '';
	let isVideo = data.type && data.type.indexOf('video') > -1;

	// Set the license string for a photo
	switch (data.license) {
		// if the photo doesn't have a license
		case 'none' 	:   license = '';
							break;
		// Localize All Rights Reserved
		case 'reserved'	:	license = lychee.locale['PHOTO_RESERVED'];
							break;
		// Display anything else that's set
		default			: 	license = data.license;
							break;
	}

	// Set value for public
	switch (data.public) {

		case '0' : _public = lychee.locale['PHOTO_SHR_NO'];
				   break;
		case '1' : _public = lychee.locale['PHOTO_SHR_YES'];
				   break;
		case '2' : _public = lychee.locale['PHOTO_SHR_ALB'];
				   break;
		default :  _public = '-';
				   break

	}

	structure.basics = {
		title : lychee.locale['PHOTO_BASICS'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['PHOTO_TITLE'],       kind: 'title',         value: data.title, editable },
			{ title: lychee.locale['PHOTO_UPLOADED'],    kind: 'uploaded',      value: data.sysdate },
			{ title: lychee.locale['PHOTO_DESCRIPTION'], kind: 'description',   value: data.description, editable }
		]
	};

	structure.image = {
		title : lychee.locale[isVideo ? 'PHOTO_VIDEO' : 'PHOTO_IMAGE'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['PHOTO_SIZE'],       kind: 'size',           value: data.size },
			{ title: lychee.locale['PHOTO_FORMAT'],     kind: 'type',           value: data.type },
			{ title: lychee.locale['PHOTO_RESOLUTION'], kind: 'resolution',     value: data.width + ' x ' + data.height }
		]
	};

	if (isVideo) {
		if (data.width === 0 || data.height === 0) {
			// Remove the "Resolution" line if we don't have the data.
			structure.image.rows.splice(-1, 1);
		}

		// We overload the database, storing duration (in full seconds) in
		// "aperture" and frame rate (floating point with three digits after
		// the decimal point) in "focal".
		if (data.aperture != '') {
			structure.image.rows.push({ title: lychee.locale['PHOTO_DURATION'],
				kind: 'duration', value: sidebar.secondsToHMS(data.aperture) });
		}
		if (data.focal != '') {
			structure.image.rows.push({ title: lychee.locale['PHOTO_FPS'],
				kind: 'fps', value: data.focal + ' fps'});
		}
	}

	// Only create tags section when the photo is editable
	if (editable) {

		structure.tags = {
			title : lychee.locale['PHOTO_TAGS'],
			type  : sidebar.types.TAGS,
			value : build.tags(data.tags),
			editable
		}

	} else {

		structure.tags = {}

	}

	// Only create EXIF section when EXIF data available
	if (exifHash!=='') {

		structure.exif = {
			title : lychee.locale['PHOTO_CAMERA'],
			type  : sidebar.types.DEFAULT,
			rows  : isVideo ? [
				{ title: lychee.locale['PHOTO_CAPTURED'],       kind: 'takedate',   value: data.takedate },
			] :
			[
				{ title: lychee.locale['PHOTO_CAPTURED'],       kind: 'takedate',   value: data.takedate },
				{ title: lychee.locale['PHOTO_MAKE'],           kind: 'make',       value: data.make },
				{ title: lychee.locale['PHOTO_TYPE'],           kind: 'model',      value: data.model },
				{ title: lychee.locale['PHOTO_LENS'],           kind: 'lens',       value: data.lens },
				{ title: lychee.locale['PHOTO_SHUTTER'],        kind: 'shutter',    value: data.shutter },
				{ title: lychee.locale['PHOTO_APERTURE'],       kind: 'aperture',   value: data.aperture },
				{ title: lychee.locale['PHOTO_FOCAL'],          kind: 'focal',      value: data.focal },
				{ title: lychee.locale['PHOTO_ISO'],            kind: 'iso',        value: data.iso }
			]
		}

	} else {

		structure.exif = {}

	}

	structure.sharing = {
		title : lychee.locale['PHOTO_SHARING'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['PHOTO_SHR_PLUBLIC'],    kind:'public',   value: _public }
		]
	};

	structure.license = {
		title : lychee.locale['PHOTO_REUSE'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['PHOTO_LICENSE'], kind: 'license', value: license, editable: editable }
		]
	};

	// Construct all parts of the structure
	structure = [
		structure.basics,
		structure.image,
		structure.tags,
		structure.exif,
		structure.sharing,
		structure.license
	];

	return structure

};

sidebar.createStructure.album = function(data) {

	if (data==null || data==='') return false;

	let editable     = album.isUploadable();
	let structure    = {};
	let _public      = '';
	let hidden       = '';
	let downloadable = '';
	let password     = '';
	let license 	 = '';

	// Set value for public
	switch (data.public) {

		case '0' : _public = lychee.locale['ALBUM_SHR_NO'];
				   break;
		case '1' : _public = lychee.locale['ALBUM_SHR_YES'];
				   break;
		default  : _public = '-';
				   break

	}

	// Set value for hidden
	switch (data.visible) {

		case '0' : hidden = lychee.locale['ALBUM_SHR_YES'];
				   break;
		case '1' : hidden = lychee.locale['ALBUM_SHR_NO'];
				   break;
		default  : hidden = '-';
				   break

	}

	// Set value for downloadable
	switch (data.downloadable) {

		case '0' : downloadable = lychee.locale['ALBUM_SHR_NO'];
				   break;
		case '1' : downloadable = lychee.locale['ALBUM_SHR_YES'];
				   break;
		default  : downloadable = '-';
				   break

	}

	// Set value for password
	switch (data.password) {

		case '0' : password = lychee.locale['ALBUM_SHR_NO'];
				   break;
		case '1' : password = lychee.locale['ALBUM_SHR_YES'];
				   break;
		default  : password = '-';
				   break

	}

	// Set license string
	switch (data.license) {
		case 'none' 	:   license = ''; // consistency
							break;
		case 'reserved'	:	license = lychee.locale['ALBUM_RESERVED'];
							break;
		default			: 	license = data.license;
							break;
	}

	structure.basics = {
		title : lychee.locale['ALBUM_BASICS'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['ALBUM_TITLE'],       kind: 'title',         value: data.title,       editable },
			{ title: lychee.locale['ALBUM_DESCRIPTION'], kind: 'description',   value: data.description, editable }
		]
	};

	videoCount = 0;
	$.each(data.photos, function () {
		if (this.type && this.type.indexOf('video') > -1) {
			videoCount++;
		}
	});
	structure.album = {
		title : lychee.locale['ALBUM_ALBUM'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['ALBUM_CREATED'], kind: 'created',       value: data.sysdate }
		]
	};
	if (data.albums && data.albums.length > 0) {
		structure.album.rows.push({ title: lychee.locale['ALBUM_SUBALBUMS'],
									kind: 'subalbums', value: data.albums.length });
	}
	if (data.photos) {
		if (data.photos.length - videoCount > 0) {
			structure.album.rows.push({ title: lychee.locale['ALBUM_IMAGES'],
										kind: 'images',
										value: data.photos.length - videoCount });
		}
	}
	if (videoCount > 0) {
		structure.album.rows.push({ title: lychee.locale['ALBUM_VIDEOS'],
									kind: 'videos', value: videoCount });
	}

	structure.share = {
		title : lychee.locale['ALBUM_SHARING'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['ALBUM_PUBLIC'],       kind: 'public',           value: _public },
			{ title: lychee.locale['ALBUM_HIDDEN'],       kind: 'hidden',           value: hidden },
			{ title: lychee.locale['ALBUM_DOWNLOADABLE'], kind: 'downloadable',     value: downloadable },
			{ title: lychee.locale['ALBUM_PASSWORD'],     kind: 'password',         value: password }
		]
	};

	if (data.owner != null)
	{
		structure.share.rows.push({title: lychee.locale['ALBUM_OWNER'], kind: 'owner',    value: data.owner });
	}

	structure.license = {
		title : lychee.locale['ALBUM_REUSE'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['ALBUM_LICENSE'], kind: 'license', value: license, editable: editable }
		]
	};

	// Construct all parts of the structure
	structure = [
		structure.basics,
		structure.album,
		structure.share,
		structure.license
	];

	return structure

};

sidebar.render = function(structure) {

	if (structure==null || structure==='' || structure===false) return false;

	let html = '';

	let renderDefault = function(section) {

		let _html = '';

		_html += `
				 <div class='sidebar__divider'>
					 <h1>${ section.title }</h1>
				 </div>
				 <table>
				 `;

		section.rows.forEach(function(row) {

			let value = row.value;

			// Set a default for the value
			if (value==='' || value==null) value = '-';

			// Wrap span-element around value for easier selecting on change
			value = lychee.html`<span class='attr_${ row.kind }'>$${ value }</span>`;

			// Add edit-icon to the value when editable
			if (row.editable===true) value += ' ' + build.editIcon('edit_' + row.kind);

			_html += lychee.html`
					 <tr>
						 <td>${ row.title }</td>
						 <td>${ value }</td>
					 </tr>
					 `

		});

		_html += `
				 </table>
				 `;

		return _html

	};

	let renderTags = function(section) {

		let _html    = '';
		let editable = '';

		// Add edit-icon to the value when editable
		if (section.editable===true) editable = build.editIcon('edit_tags');

		_html += lychee.html`
				 <div class='sidebar__divider'>
					 <h1>${ section.title }</h1>
				 </div>
				 <div id='tags'>
					 <div class='attr_${ section.title.toLowerCase() }'>${ section.value }</div>
					 ${ editable }
				 </div>
				 `;

		return _html

	};

	structure.forEach(function(section) {

		if (section.type===sidebar.types.DEFAULT)   html += renderDefault(section);
		else if (section.type===sidebar.types.TAGS) html += renderTags(section)

	});

	return html

};
