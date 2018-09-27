/**
 * @description This module provides the basic functions of Lychee.
 */

lychee = {

	title           : document.title,
	version         : '3.1.6',
	versionCode     : '030106',

	updatePath      : '//update.electerious.com/index.json',
	updateURL       : 'https://github.com/LycheeOrg/Lychee',
	website         : 'https://LycheeOrg.github.io',

	publicMode      : false,
	viewMode        : false,
    api_V2			: false,

	checkForUpdates : '1',
	sortingPhotos   : '',
	sortingAlbums   : '',
	location        : '',

	dropbox         : false,
	dropboxKey      : '',

	content         : $('.content'),
	imageview       : $('#imageview'),

	locale					: {

		'USERNAME'	: 'username',
		'PASSWORD'	: 'password',
		'ENTER'			:	'Enter',
		'CANCEL'		: 'Cancel',
		'SIGN_IN'		: 'Sign In',

		'CHANGE_LOGIN'		: 'Change Login',
		'CHANGE_SORTING'	: 'Change Sorting',
		'SET_DROPBOX'			: 'Set Dropbox',
		'ABOUT_LYCHEE'		: 'About Lychee',
		'DIAGNOSTICS'			: 'Diagnostics',
		'LOGS'						: 'Show Logs',
		'SIGN_OUT'				: 'Sign Out',

		'SMART_ALBUMS'		: 'Smart albums',
		'ALBUMS'					: 'Albums',

		'RENAME'					:	'Rename',
		'RENAME_ALL'			:	'Rename All',
		'MERGE'						:	'Merge',
		'MERGE_ALL'				:	'Merge All',
		'MAKE_PUBLIC' 		: 'Make Public',
		'SHARE_ALBUM' 		: 'Share Album',
		'DOWNLOAD_ALBUM'	: 'Download Album',
		'ABOUT_ALBUM'			: 'About Album',
		'DELETE_ALBUM'		: 'Delete Album',

		'DELETE_ALBUM_QUESTION' : 'Delete Album and Photos',
		'KEEP_ALBUM'			: 'Keep Album',
		'DELETE_ALBUM_CONFIRMATION_1' : 'Are you sure you want to delete the album',
		'DELETE_ALBUM_CONFIRMATION_2'	: 'and all of the photos it contains? This action can\'t be undone!',

		'DELETE_ALBUMS_QUESTION' : 'Delete Albums and Photos',
		'KEEP_ALBUMS'			: 'Keep Albums',
		'DELETE_ALBUMS_CONFIRMATION_1' : 'Are you sure you want to delete all',
		'DELETE_ALBUMS_CONFIRMATION_2'	: 'selected albums and all of the photos they contain? This action can\'t be undone!',

		'DELETE_UNSORTED_CONFIRM' : 'Are you sure you want to delete all photos from \'Unsorted\'?<br>This action can\'t be undone!',
		'CLEAR_UNSORTED'	: 'Clear Unsorted',
		'KEEP_UNSORTED'		: 'Keep Unsorted',

		'EDIT_SHARING'		: 'Edit Sharing',
		'MAKE_PRIVATE'		: 'Make Private',

		'CLOSE_ALBUM'			: 'Close Album',
		'CLOSE_PHOTO'			: 'Close Photo',

		'ADD'							: 'Add',
		'MOVE'						: 'Move',
		'MOVE_ALL'				: 'Move All',
		'DUPLICATE'				: 'Duplicate',
		'DUPLICATE_ALL'		: 'Duplicate All',
		'DELETE'					: 'Delete',
		'DELETE_ALL'			: 'Delete All',
		'DOWNLOAD'				: 'Download',
		'UPLOAD_PHOTO'		: 'Upload Photo',
		'IMPORT_LINK'			: 'Import from Link',
		'IMPORT_DROPBOX'	: 'Import from Dropbox',
		'IMPORT_SERVER'		: 'Import from Server',
		'NEW_ALBUM'				: 'New Album',

		'TITLE_NEW_ALBUM'	: 'Enter a title for the new album:',
		'UNTITLED'				: 'Untilted',
		'UNSORTED'				: 'Unsorted',
		'STARED'					: 'Stared',
		'RECENT'					: 'Recent',
		'PUBLIC'					: 'Public',
		'NUM_PHOTOS'			: 'Photos',

		'CREATE_ALBUM'		: 'Create Album',

		'STAR_PHOTO'			: 'Star Photo',
		'STAR'						: 'Star',
		'STAR_ALL'				: 'Star All',
		'TAGS'						: 'Tags',
		'TAGS_ALL'				: 'Tags All',
		'UNSTAR_PHOTO'		: 'Unstar Photo',

		'FULL_PHOTO'			: 'Full Photo',
		'ABOUT_PHOTO'			:	'About Photo',
		'DIRECT_LINK'			: 'Direct Link',

		'ALBUM_ABOUT'						:	'About',
		'ALBUM_BASICS'					: 'Basics',
		'ALBUM_TITLE'						: 'Title',
		'ALBUM_NEW_TITLE'				: 'Enter a new title for this album:',
		'ALBUMS_NEW_TITLE_1'		: 'Enter a title for all',
		'ALBUMS_NEW_TITLE_2'		: 'selected albums:',
		'ALBUM_SET_TITLE'				: 'Set Title',
		'ALBUM_DESCRIPTION'			: 'Description',
		'ALBUM_NEW_DESCRIPTION'	: 'Enter a new description for this album:',
		'ALBUM_SET_DESCRIPTION'	: 'Set Description',
		'ALBUM_ALBUM'						: 'Album',
		'ALBUM_CREATED'					: 'Created',
		'ALBUM_IMAGES'					: 'Images',
		'ALBUM_SHARING'					: 'Share',
		'ALBUM_SHR_YES'					: 'YES',
		'ALBUM_SHR_NO'					: 'No',
		'ALBUM_PUBLIC'					: 'Public',
		'ALBUM_HIDDEN'					: 'Hidden',
		'ALBUM_HIDDEN_EXPL'			: 'Only people with the direct link can view this album.',
		'ALBUM_DOWNLOADABLE'		: 'Downloadable',
		'ALBUM_DOWNLOADABLE_EXPL'	: 'Visitors of your Lychee can download this album.',
		'ALBUM_PASSWORD'				: 'Password',
		'ALBUM_PASSWORD_PROT'		: 'Password protected',
		'ALBUM_PASSWORD_PROT_EXPL'	: 'Album only accessible with a valid password.',
		'ALBUM_PASSWORD_REQUIRED' : 'This album is protected by a password. Enter the password below to view the photos of this album:',
		'ALBUM_MERGE_1'					: 'Are you sure you want to merge the album',
		'ALBUM_MERGE_2'					: 'into the album',
		'ALBUMS_MERGE'					: 'Are you sure you want to merge all selected albums into the album',
		'MERGE_ALBUM'						: 'Merge Albums',
		'DONT_MERGE'						: "Don't Merge",

		'PHOTO_ABOUT'						:	'About',
		'PHOTO_BASICS'					: 'Basics',
		'PHOTO_TITLE'						: 'Title',
		'PHOTO_NEW_TITLE'				: 'Enter a new title for this photo:',
		'PHOTO_SET_TITLE'				: 'Set Title',
		'PHOTO_UPLOADED'				: 'Uploaded',
		'PHOTO_DESCRIPTION'			: 'Description',
		'PHOTO_NEW_DESCRIPTION'	: 'Enter a new description for this photo:',
		'PHOTO_SET_DESCRIPTION'	: 'Set Description',
		'PHOTO_IMAGE'						: 'Image',
		'PHOTO_SIZE'						: 'Size',
		'PHOTO_FORMAT'					: 'Format',
		'PHOTO_RESOLUTION'			: 'Resolution',
		'PHOTO_TAGS'						: 'Tags',
		'PHOTO_NOTAGS'					: 'No Tags',
		'PHOTO_NEW_TAGS'				: 'Enter your tags for this photo. You can add multiple tags by separating them with a comma:',
		'PHOTO_SET_TAGS'				: 'Set Tags',
		'PHOTO_CAMERA'					: 'Camera',
		'PHOTO_CAPTURED'				: 'Captured',
		'PHOTO_MAKE'						: 'Make',
		'PHOTO_TYPE'						: 'Type/Model',
		'PHOTO_SHUTTER'					: 'Shutter Speed',
		'PHOTO_APERTURE'				: 'Aperture',
		'PHOTO_FOCAL'						: 'Focal Length',
		'PHOTO_ISO'							: 'ISO',
		'PHOTO_SHARING'					: 'Sharing',
		'PHOTO_SHR_ALB'					: 'Yes (Album)',
		'PHOTO_SHR_PHT'					: 'Yes (Photo)',
		'PHOTO_SHR_NO'					: 'No',

		'LOADING'								: 'Loading',
		'ERROR'									: 'Error',
		'ERROR_TEXT'						: 'Whoops, it looks like something went wrong. Please reload the site and try again!',
		'ERROR_DB_1'						: 'Unable to connect to host database because access was denied. Double-check your host, username and password and ensure that access from your current location is permitted.',
		'ERROR_DB_2'						: 'Unable to create the database. Double-check your host, username and password and ensure that the specified user has the rights to modify and add content to the database.',
		'ERROR_CONFIG_FILE'			: "Unable to save this configuration. Permission denied in <b>'data/'</b>. Please set the read, write and execute rights for others in <b>'data/'</b> and <b>'uploads/'</b>. Take a look at the readme for more information.",
		'ERROR_UNKNOWN'					: 'Something unexpected happened. Please try again and check your installation and server. Take a look at the readme for more information.',
		'ERROR_LOGIN'						: 'Unable to save login. Please try again with another username and password!',
		'RETRY'									: 'Retry',

		'DB_INFO_TITLE'					: 'Enter your database connection details below:',
		'DB_INFO_HOST'					: 'Database Host (optional)',
		'DB_INFO_USER'					: 'Database Username',
		'DB_INFO_PASSWORD'			: 'Database Password',
		'DB_INFO_TEXT'					: 'Lychee will create its own database. If required, you can enter the name of an existing database instead:',
		'DB_NAME'								: 'Database Name (optional)',
		'DB_PREFIX'							: 'Table prefix (optional)',
		'DB_CONNECT'						: 'Connect',

		'LOGIN_TITLE'						:	'Enter a username and password for your installation:',
		'LOGIN_USERNAME' 				: 'New Username',
		'LOGIN_PASSWORD' 				: 'New Password',
		'LOGIN_CREATE'					: 'Create Login',

		'PASSWORD_TITLE'				: 'Enter your current password:',
		'PASSWORD_CURRENT'			: 'Current Password',
		'PASSWORD_TEXT'					: 'Your username and password will be changed to the following:',
		'PASSWORD_CHANGE'				: 'Change Login',


		'EDIT_SHARING_TITLE'		: 'Edit Sharing',
		'EDIT_SHARING_TEXT'			: 'The sharing-properties of this album will be changed to the following:',
		'SHARE_ALBUM_TEXT'			: 'This album will be shared with the following properties:',

		'SORT_ALBUM_BY_1'					: 'Sort albums by',
		'SORT_ALBUM_BY_2'					: 'in an',
		'SORT_ALBUM_BY_3'					: 'order.',

		'SORT_ALBUM_SELECT_1'			: 'Creation Time',
		'SORT_ALBUM_SELECT_2'			: 'Title',
		'SORT_ALBUM_SELECT_3'			: 'Description',
		'SORT_ALBUM_SELECT_4'			: 'Public',
		'SORT_ALBUM_SELECT_5'			: 'Latest Take Date',
		'SORT_ALBUM_SELECT_5'			: 'Oldest Take Date',


		'SORT_PHOTO_BY_1'					: 'Sort photos by',
		'SORT_PHOTO_BY_2'					: 'in an',
		'SORT_PHOTO_BY_3'					: 'order.',

		'SORT_PHOTO_SELECT_1'			: 'Upload Time',
		'SORT_PHOTO_SELECT_2'			: 'Take Date',
		'SORT_PHOTO_SELECT_3'			: 'Title',
		'SORT_PHOTO_SELECT_4'			: 'Description',
		'SORT_PHOTO_SELECT_5'			: 'Public',
		'SORT_PHOTO_SELECT_6'			: 'Star',
		'SORT_PHOTO_SELECT_7'			: 'Photo Format',

		'SORT_ASCENDING'					: 'Ascending',
		'SORT_DESCENDING'					: 'Descending',
		'SORT_CHANGE'							: 'Change Sorting',

		'DROPBOX_TITLE'						: 'Set Dropbox Key',
		'DROPBOX_TEXT'						: "In order to import photos from your Dropbox, you need a valid drop-ins app key from <a href='https://www.dropbox.com/developers/apps/create'>their website</a>. Generate yourself a personal key and enter it below:",

	}

}

lychee.init = function() {

	api.post('Session::init', {}, function(data) {

		// Check status
		// 0 = No configuration
		// 1 = Logged out
		// 2 = Logged in

        lychee.api_V2          = data.api_V2 || false;

		if (data.status===2) {

			// Logged in

			lychee.sortingPhotos   = data.config.sortingPhotos   || ''
			lychee.sortingAlbums   = data.config.sortingAlbums   || ''
			lychee.dropboxKey      = data.config.dropboxKey      || ''
			lychee.location        = data.config.location        || ''
			lychee.checkForUpdates = data.config.checkForUpdates || '1'

			// Show dialog when there is no username and password
			if (data.config.login===false) settings.createLogin()

		} else if (data.status===1) {

			// Logged out

			lychee.checkForUpdates = data.config.checkForUpdates || '1'

			lychee.setMode('public')

		} else if (data.status===0) {

			// No configuration

			lychee.setMode('public')

			header.dom().hide()
			lychee.content.hide()
			$('body').append(build.no_content('cog'))
			settings.createConfig()

			return true

		}

		$(window).bind('popstate', lychee.load)
		lychee.load()

	})

}

lychee.login = function(data) {

	let user     = data.username
	let password = data.password

	let params = {
		user,
		password
	}

	api.post('Session::login', params, function(data) {

		if (data===true) {

			window.location.reload()

		} else {

			// Show error and reactive button
			basicModal.error('password')

		}

	})

}

lychee.loginDialog = function() {

	let msg = lychee.html`
	          <p class='signIn'>
	              <input class='text' name='username' autocomplete='username' type='text' placeholder='username' autocapitalize='off' autocorrect='off'>
	              <input class='text' name='password' autocomplete='current-password' type='password' placeholder='password'>
	          </p>
	          <p class='version'>Lychee $${ lychee.version }<span> &#8211; <a target='_blank' href='$${ lychee.updateURL }'>Update available!</a><span></p>
	          `

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: 'Sign In',
				fn: lychee.login
			},
			cancel: {
				title: 'Cancel',
				fn: basicModal.close
			}
		}
	})

	if (lychee.checkForUpdates==='1') lychee.getUpdate()

}

lychee.logout = function() {

	api.post('Session::logout', {}, function() {
		window.location.reload()
	})

}

lychee.goto = function(url = '') {

	url = '#' + url

	history.pushState(null, null, url)
	lychee.load()

}

lychee.load = function() {

	let albumID = ''
	let photoID = ''
	let hash    = document.location.hash.replace('#', '').split('/')

	$('.no_content').remove()
	contextMenu.close()
	multiselect.close()

	if (hash[0]!=null) albumID = hash[0]
	if (hash[1]!=null) photoID = hash[1]

	if (albumID && photoID) {

		// Trash data
		photo.json = null

		// Show Photo
		if (lychee.content.html()==='' || (header.dom('.header__search').length && header.dom('.header__search').val().length!==0)) {
			lychee.content.hide()
			album.load(albumID, true)
		}
		photo.load(photoID, albumID)

	} else if (albumID) {

		// Trash data
		photo.json = null

		// Show Album
		if (visible.photo()) view.photo.hide()
		if (visible.sidebar() && (albumID==='0' || albumID==='f' || albumID==='s' || albumID==='r')) sidebar.toggle()
		if (album.json && albumID==album.json.id) view.album.title()
		else album.load(albumID)

	} else {

		// Trash albums.json when filled with search results
		if (search.hash!=null) {
			albums.json = null
			search.hash = null
		}

		// Trash data
		album.json = null
		photo.json = null

		// Hide sidebar
		if (visible.sidebar()) sidebar.toggle()

		// Show Albums
		if (visible.photo()) view.photo.hide()
		lychee.content.show()
		albums.load()

	}

}

lychee.getUpdate = function() {

	const success = function(data) {
		if (data.lychee.version>parseInt(lychee.versionCode)) $('.version span').show()
	}

	$.ajax({
		url     : lychee.updatePath,
		success : success
	})

}

lychee.setTitle = function(title, editable) {

	document.title = lychee.title + ' - ' + title

	header.setEditable(editable)
	header.setTitle(title)

}

lychee.setMode = function(mode) {

	$('#button_settings, #button_trash_album, .button_add, .header__divider').remove()
	$('#button_trash, #button_move, #button_star').remove()

	$('#button_share, #button_share_album')
		.removeClass('button--eye')
		.addClass('button--share')
		.find('use')
		.attr('xlink:href', '#share')

	$(document)
		.off('click',       '.header__title--editable')
		.off('touchend',    '.header__title--editable')
		.off('contextmenu', '.photo')
		.off('contextmenu', '.album')
		.off('drop')

	Mousetrap
		.unbind([ 'u' ])
		.unbind([ 's' ])
		.unbind([ 'f' ])
		.unbind([ 'r' ])
		.unbind([ 'd' ])
		.unbind([ 't' ])
		.unbind([ 'command+backspace', 'ctrl+backspace' ])
		.unbind([ 'command+a', 'ctrl+a' ])

	if (mode==='public') {

		lychee.publicMode = true

	} else if (mode==='view') {

		Mousetrap.unbind([ 'esc', 'command+up' ])

		$('#button_back, a#next, a#previous').remove()
		$('.no_content').remove()

		lychee.publicMode = true
		lychee.viewMode   = true

	}

}

lychee.animate = function(obj, animation) {

	let animations = [
		[ 'fadeIn', 'fadeOut' ],
		[ 'contentZoomIn', 'contentZoomOut' ]
	]

	if (!obj.jQuery) obj = $(obj)

	for (let i = 0; i < animations.length; i++) {
		for (let x = 0; x < animations[i].length; x++) {
			if (animations[i][x]==animation) {
				obj.removeClass(animations[i][0] + ' ' + animations[i][1]).addClass(animation)
				return true
			}
		}
	}

	return false

}

lychee.retinize = function(path = '') {

	let extention = path.split('.').pop()
	let isPhoto   = extention!=='svg'

	if (isPhoto===true) {

		path = path.replace(/\.[^/.]+$/, '')
		path = path + '@2x' + '.' + extention

	}

	return {
		path,
		isPhoto
	}

}

lychee.loadDropbox = function(callback) {

	if (lychee.dropbox===false && lychee.dropboxKey!=null && lychee.dropboxKey!=='') {

		loadingBar.show()

		let g = document.createElement('script')
		let s = document.getElementsByTagName('script')[0]

		g.src   = 'https://www.dropbox.com/static/api/1/dropins.js'
		g.id    = 'dropboxjs'
		g.type  = 'text/javascript'
		g.async = 'true'
		g.setAttribute('data-app-key', lychee.dropboxKey)
		g.onload = g.onreadystatechange = function() {
			let rs = this.readyState
			if (rs && rs!=='complete' && rs!=='loaded') return
			lychee.dropbox = true
			loadingBar.hide()
			callback()
		}
		s.parentNode.insertBefore(g, s)

	} else if (lychee.dropbox===true && lychee.dropboxKey!=null && lychee.dropboxKey!=='') {

		callback()

	} else {

		settings.setDropboxKey(callback)

	}

}

lychee.getEventName = function() {

	let touchendSupport = (/Android|iPhone|iPad|iPod/i).test(navigator.userAgent || navigator.vendor || window.opera) && ('ontouchend' in document.documentElement)
	let eventName       = (touchendSupport===true ? 'touchend' : 'click')

	return eventName

}

lychee.escapeHTML = function(html = '') {

	// Ensure that html is a string
	html += ''

	// Escape all critical characters
	html = html.replace(/&/g, '&amp;')
	           .replace(/</g, '&lt;')
	           .replace(/>/g, '&gt;')
	           .replace(/"/g, '&quot;')
	           .replace(/'/g, '&#039;')
	           .replace(/`/g, '&#96;')

	return html

}

lychee.html = function(literalSections, ...substs) {

	// Use raw literal sections: we don’t want
	// backslashes (\n etc.) to be interpreted
	let raw    = literalSections.raw
	let result = ''

	substs.forEach((subst, i) => {

		// Retrieve the literal section preceding
		// the current substitution
		let lit = raw[i]

		// If the substitution is preceded by a dollar sign,
		// we escape special characters in it
		if (lit.slice(-1)==='$') {
			subst = lychee.escapeHTML(subst)
			lit   = lit.slice(0, -1)
		}

		result += lit
		result += subst

	})

	// Take care of last literal section
	// (Never fails, because an empty template string
	// produces one literal section, an empty string)
	result += raw[raw.length - 1]

	return result

}

lychee.error = function(errorThrown, params, data) {

	console.error({
		description : errorThrown,
		params      : params,
		response    : data
	})

	loadingBar.show('error', errorThrown)

}
