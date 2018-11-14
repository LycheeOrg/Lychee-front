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

	return true

};

sidebar.toggle = function() {

	if (visible.sidebar() || visible.sidebarbutton()) {

		header.dom('.button--info').toggleClass('active');
		lychee.content.toggleClass('content--sidebar');
		sidebar.dom().toggleClass('active');

		return true

	}

	return false

};

sidebar.setSelectable = function(selectable = true) {

	// Attributes/Values inside the sidebar are selectable by default.
	// Selection needs to be deactivated to prevent an unwanted selection
	// while using multiselect.

	if (selectable===true) sidebar.dom().removeClass('notSelectable')
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

sidebar.createStructure.photo = function(data) {

	if (data==null || data==='') return false;

	let editable  = false;
	let exifHash  = data.takestamp + data.make + data.model + data.shutter + data.aperture + data.focal + data.iso;
	let structure = {};
	let _public   = '';

	// Enable editable when user logged in
	if (lychee.publicMode===false && lychee.upload) editable = true;

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
			{ title: lychee.locale['PHOTO_TITLE'],       value: data.title, editable },
			{ title: lychee.locale['PHOTO_UPLOADED'],    value: data.sysdate },
			{ title: lychee.locale['PHOTO_DESCRIPTION'], value: data.description, editable }
		]
	};

	structure.image = {
		title : lychee.locale['PHOTO_IMAGE'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['PHOTO_SIZE'],       value: data.size },
			{ title: lychee.locale['PHOTO_FORMAT'],     value: data.type },
			{ title: lychee.locale['PHOTO_RESOLUTION'], value: data.width + ' x ' + data.height }
		]
	};

	// Only create tags section when user logged in
	if (lychee.publicMode===false && lychee.upload) {

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
	if (exifHash!=='0') {

		structure.exif = {
			title : lychee.locale['PHOTO_CAMERA'],
			type  : sidebar.types.DEFAULT,
			rows  : [
				{ title: lychee.locale['PHOTO_CAPTURED'],      value: data.takedate },
				{ title: lychee.locale['PHOTO_MAKE'],          value: data.make },
				{ title: lychee.locale['PHOTO_TYPE'],    value: data.model },
				{ title: lychee.locale['PHOTO_SHUTTER'], value: data.shutter },
				{ title: lychee.locale['PHOTO_APERTURE'],      value: data.aperture },
				{ title: lychee.locale['PHOTO_FOCAL'],  value: data.focal },
				{ title: lychee.locale['PHOTO_ISO'],           value: data.iso }
			]
		}

	} else {

		structure.exif = {}

	}

	structure.sharing = {
		title : lychee.locale['PHOTO_SHARING'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['PHOTO_SHR_PLUBLIC'], value: _public }
		]
	};

	// Construct all parts of the structure
	structure = [
		structure.basics,
		structure.image,
		structure.tags,
		structure.exif,
		structure.sharing
	];

	return structure

};

sidebar.createStructure.album = function(data) {

	if (data==null || data==='') return false;

	let editable     = false;
	let structure    = {};
	let _public      = '';
	let hidden       = '';
	let downloadable = '';
	let password     = '';

	// Enable editable when user logged in
	if (lychee.publicMode===false && lychee.upload) editable = true;

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

	structure.basics = {
		title : lychee.locale['ALBUM_BASICS'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['ALBUM_TITLE'],       value: data.title,       editable },
			{ title: lychee.locale['ALBUM_DESCRIPTION'], value: data.description, editable }
		]
	};

	structure.album = {
		title : lychee.locale['ALBUM_ALBUM'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['ALBUM_CREATED'], value: data.sysdate },
			{ title: lychee.locale['ALBUM_IMAGES'],  value: data.num }
		]
	};

	structure.share = {
		title : lychee.locale['ALBUM_SHARING'],
		type  : sidebar.types.DEFAULT,
		rows  : [
			{ title: lychee.locale['ALBUM_PUBLIC'],       value: _public },
			{ title: lychee.locale['ALBUM_HIDDEN'],       value: hidden },
			{ title: lychee.locale['ALBUM_DOWNLOADABLE'], value: downloadable },
			{ title: lychee.locale['ALBUM_PASSWORD'],     value: password }
		]
	};

	// Construct all parts of the structure
	structure = [
		structure.basics,
		structure.album,
		structure.share
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
			value = lychee.html`<span class='attr_${ row.title.toLowerCase() }'>${ value }</span>`;

			// Add edit-icon to the value when editable
			if (row.editable===true) value += ' ' + build.editIcon('edit_' + row.title.toLowerCase());

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

}
