/**
 * @description This module provides the basic functions of Lychee.
 */

lychee = {

	title					: document.title,
	version					: '',
	versionCode				: '', // not really needed anymore

	updatePath				: 'https://LycheeOrg.github.io/update.json',
	updateURL				: 'https://github.com/LycheeOrg/Lychee/releases',
	website					: 'https://LycheeOrg.github.io',

	publicMode					: false,
	viewMode					: false,
	full_photo					: true,
	api_V2						: false,	// enable api_V2
	sub_albums					: false,	// enable sub_albums features
	admin						: false,	// enable admin mode (multi-user)
	upload						: false,	// enable possibility to upload (multi-user)
	lock						: false,	// locked user (multi-user)
	username					: null,
	layout						: '1',		// 0: Use default, "square" layout. 1: Use Flickr-like "justified" layout. 2: Use Google-like "unjustified" layout
	public_search				: false,	// display Search in publicMode
	image_overlay				: false,	// display Overlay like in Lightroom
	image_overlay_default		: false,	// display Overlay like in Lightroom by default
	image_overlay_type			: 'exif',	// current Overlay display type
	image_overlay_type_default	: 'exif',	// image overlay type default type
	landing_page_enabled        : false,    // is landing page enabled ?

	checkForUpdates			: '1',
	update_json 			: 0,
	update_available		: false,
	sortingPhotos			: '',
	sortingAlbums			: '',
	location				: '',

	lang					: '',
	lang_available			: {},

	dropbox					: false,
	dropboxKey				: '',

	content					: $('.content'),
	imageview				: $('#imageview'),
	footer                  : $('#footer'),

	locale					: {}
};

lychee.diagnostics = function() {
	if(lychee.api_V2)
	{
		return '/Diagnostics'
	}
	else {
		return 'plugins/Diagnostics/'
	}
};

lychee.logs = function() {
	if(lychee.api_V2)
	{
		return '/Logs'
	}
	else {
		return 'plugins/Log/'
	}
};

lychee.aboutDialog = function() {

	let msg = lychee.html`
				<h1>Lychee ${ lychee.version }</h1>
				<div class='version'><span><a target='_blank' href='${ lychee.updateURL }'>${ lychee.locale['UPDATE_AVAILABLE'] }</a></span></div>
				<h1>${ lychee.locale['ABOUT_SUBTITLE'] }</h1>
				<p><a target='_blank' href='${ lychee.website }'>Lychee</a> ${ lychee.locale['ABOUT_DESCRIPTION'] }</p>
			  `;

	basicModal.show({
		body: msg,
		buttons: {
			cancel: {
				title: lychee.locale['CLOSE'],
				fn: basicModal.close
			}
		}
	});

	if (lychee.checkForUpdates==='1') lychee.getUpdate()

};

lychee.init = function() {

	api.post('Session::init', {}, function(data) {

		lychee.api_V2 = data.api_V2 || false;

		if (data.status===0) {

			// No configuration

			lychee.setMode('public');

			header.dom().hide();
			lychee.content.hide();
			$('body').append(build.no_content('cog'));
			settings.createConfig();

			return true

		}

		lychee.sub_albums = data.sub_albums || false;
		lychee.update_json = data.update_json;
		lychee.update_available = data.update_available;
		lychee.landing_page_enable = (data.config.landing_page_enable && data.config.landing_page_enable === '1') || false;

		if (lychee.api_V2)
		{
			lychee.versionCode = data.config.version;
		}
		else
		{
			lychee.versionCode = data.config.version.slice(7, data.config.version.length);
		}
		if (lychee.versionCode !== '')
		{
			let digits = lychee.versionCode.match(/.{1,2}/g);
			lychee.version = parseInt(digits[0]).toString() + '.' + parseInt(digits[1]).toString() + '.' + parseInt(digits[2]).toString();
		}

		// we copy the locale that exists only.
		// This ensure forward and backward compatibility.
		// e.g. if the front localization is unfished in a language
		// or if we need to change some locale string
		for (let key in data.locale) {
			lychee.locale[key] = data.locale[key]
		}

		// Check status
		// 0 = No configuration
		// 1 = Logged out
		// 2 = Logged in
		if (data.status===2) {

			// Logged in

			lychee.sortingPhotos				= data.config.sortingPhotos		|| '';
			lychee.sortingAlbums				= data.config.sortingAlbums		|| '';
			lychee.dropboxKey					= data.config.dropboxKey		|| '';
			lychee.location						= data.config.location			|| '';
			lychee.checkForUpdates				= data.config.checkForUpdates	|| '1';
			lychee.lang							= data.config.lang				|| '';
			lychee.lang_available				= data.config.lang_available	|| {};
			lychee.layout						= data.config.layout			|| '1';
			lychee.public_search				= (data.config.public_search && data.config.public_search === '1') || false;
			lychee.image_overlay_default		= (data.config.image_overlay && data.config.image_overlay === '1')			|| false;
			lychee.image_overlay				= lychee.image_overlay_default;
			lychee.image_overlay_type			= (!data.config.image_overlay_type) ? 'exif' : data.config.image_overlay_type;
			lychee.image_overlay_type_default	= lychee.image_overlay_type;
			lychee.default_license				= data.config.default_license	|| 'none';
			lychee.css							= data.config.css				|| '';

			lychee.upload	= !lychee.api_V2;
			lychee.admin	= !lychee.api_V2;

			// leftMenu
			leftMenu.build();
			leftMenu.bind();

			if (lychee.api_V2)
			{
				lychee.upload	= data.admin || data.upload;
				lychee.admin	= data.admin;
				lychee.lock		= data.lock;
				lychee.username = data.username;
			}
			lychee.setMode('logged_in');

			// Show dialog when there is no username and password
			if (data.config.login===false) settings.createLogin()

		} else if (data.status===1) {

			// Logged out

			lychee.sortingPhotos				= data.config.sortingPhotos		|| '';
			lychee.sortingAlbums				= data.config.sortingAlbums		|| '';
			lychee.full_photo					= (data.config.full_photo == null)	|| (data.config.full_photo === '1');
			lychee.checkForUpdates				= data.config.checkForUpdates		|| '1';
			lychee.layout						= data.config.layout				|| '1';
			lychee.public_search				= (data.config.public_search && data.config.public_search === '1') || false;
			lychee.image_overlay				= (data.config.image_overlay && data.config.image_overlay === '1') || false;
			lychee.image_overlay_type			= (!data.config.image_overlay_type) ? 'exif' : data.config.image_overlay_type;
			lychee.image_overlay_type_default	= lychee.image_overlay_type;

			// console.log(lychee.full_photo);
			lychee.setMode('public');

		} else {
			// should not happen.
		}

		$(window).bind('popstate', lychee.load);
		lychee.load()

	})

};

lychee.login = function(data) {

	let user	= data.username;
	let password= data.password;

	let params = {
		user,
		password
	};

	api.post('Session::login', params, function(data) {

		if (data===true) {

			window.location.reload()

		} else {

			// Show error and reactive button
			basicModal.error('password')

		}

	})

};

lychee.loginDialog = function() {

	let msg = lychee.html`
				<p class='signIn'>
					<input class='text' name='username' autocomplete='on' type='text' placeholder='$${ lychee.locale['USERNAME'] }' autocapitalize='off'>
					<input class='text' name='password' autocomplete='current-password' type='password' placeholder='$${ lychee.locale['PASSWORD'] }'>
				</p>
				<p class='version'>Lychee ${ lychee.version }<span> &#8211; <a target='_blank' href='${ lychee.updateURL }'>${ lychee.locale['UPDATE_AVAILABLE'] }</a><span></p>
			`;

	basicModal.show({
		body: msg,
		buttons: {
			action: {
				title: lychee.locale['SIGN_IN'],
				fn: lychee.login
			},
			cancel: {
				title: lychee.locale['CANCEL'],
				fn: basicModal.close
			}
		}
	});

	if (lychee.checkForUpdates==='1') lychee.getUpdate()

};

lychee.logout = function() {

	api.post('Session::logout', {}, function() {
		window.location.reload()
	})

};

lychee.goto = function(url = '') {

	url = '#' + url;

	history.pushState(null, null, url);
	lychee.load()

};

lychee.load = function() {

	let albumID	= '';
	let photoID	= '';
	let hash	= document.location.hash.replace('#', '').split('/');

	$('.no_content').remove();
	contextMenu.close();
	multiselect.close();

	if (hash[0]!=null) albumID = hash[0];
	if (hash[1]!=null) photoID = hash[1];

	if (albumID && photoID) {

		// Trash data
		photo.json = null;

		// Show Photo
		if (lychee.content.html()==='' || (header.dom('.header__search').length && header.dom('.header__search').val().length!==0)) {
			lychee.content.hide();
			album.load(albumID, true)
		}
		photo.load(photoID, albumID);
		lychee.footer_hide();

	} else if (albumID) {

		// Trash data
		photo.json = null;

		// Show Album
		if (visible.photo()) view.photo.hide();
		if (visible.sidebar() && (albumID==='0' || albumID==='f' || albumID==='s' || albumID==='r')) sidebar.toggle();
		if (album.json && albumID===album.json.id) view.album.title();
		else album.load(albumID);
		lychee.footer_show();

	} else {

		// Trash albums.json when filled with search results
		if (search.hash!=null) {
			albums.json = null;
			search.hash = null
		}

		// Trash data
		album.json = null;
		photo.json = null;

		// Hide sidebar
		if (visible.sidebar()) sidebar.toggle();

		// Show Albums
		if (visible.photo()) view.photo.hide();
		lychee.content.show();
		lychee.footer_show();
		albums.load();

	}

};

lychee.getUpdate = function() {

	console.log(lychee.update_available);
	console.log(lychee.update_json);

	if(lychee.update_json !== 0)
	{
		if(lychee.update_available)
		{
			$('.version span').show()
		}
	}
	else
	{
		const success = function(data) {
			if (data.lychee.version > parseInt(lychee.versionCode)) $('.version span').show()
		};

		$.ajax({
			url		: lychee.updatePath,
			success	: success
		})
	}
};

lychee.setTitle = function(title, editable) {

	document.title = lychee.title + ' - ' + title;

	header.setEditable(editable);
	header.setTitle(title)

};

lychee.setMode = function(mode) {

	if (lychee.lock)
	{
		$('#button_settings_open').remove();
	}
	if (!lychee.upload)
	{
		$('#button_trash_album, .button_add, #button_move_album').remove();
		$('#button_trash, #button_move, #button_star, #button_sharing').remove();

		$('#button_share, #button_share_album')
			.removeClass('button--eye')
			.addClass('button--share')
			.find('use')
			.attr('xlink:href', '#share');

		$(document)
			.off('click',		'.header__title--editable')
			.off('touchend',	'.header__title--editable')
			.off('contextmenu',	'.photo')
			.off('contextmenu',	'.album')
			.off('drop');

		Mousetrap
			.unbind([ 'u' ])
			.unbind([ 's' ])
			.unbind([ 'n' ])
			.unbind([ 'r' ])
			.unbind([ 'd' ])
			.unbind([ 't' ])
			.unbind([ 'command+backspace', 'ctrl+backspace' ])
			.unbind([ 'command+a', 'ctrl+a' ]);
	}
	if (!lychee.admin)
	{
		$('#button_users, #button_logs, #button_diagnostics').remove();
	}

	if (mode === 'logged_in') {
		// The code searches by class, so remove the other instance.
		$('.header__search, .header__clear', '.header__toolbar--public').remove();
		return;
	}
	else {
		$('.header__search, .header__clear', '.header__toolbar--albums').remove();
	}

	$('#button_settings, .header__divider, .leftMenu').remove();

	if (mode==='public') {

		lychee.publicMode = true

	} else if (mode==='view') {

		Mousetrap.unbind([ 'esc', 'command+up' ]);

		$('#button_back, a#next, a#previous').remove();
		$('.no_content').remove();

		lychee.publicMode = true;
		lychee.viewMode   = true

	}

	// just mak
	header.bind_back();

};

lychee.animate = function(obj, animation) {

	let animations = [
		[ 'fadeIn', 'fadeOut' ],
		[ 'contentZoomIn', 'contentZoomOut' ]
	];

	if (!obj.jQuery) obj = $(obj);

	for (let i = 0; i < animations.length; i++) {
		for (let x = 0; x < animations[i].length; x++) {
			if (animations[i][x]==animation) {
				obj.removeClass(animations[i][0] + ' ' + animations[i][1]).addClass(animation);
				return true
			}
		}
	}

	return false

};

lychee.retinize = function(path = '') {

	let extention = path.split('.').pop();
	let isPhoto   = extention!=='svg';

	if (isPhoto===true) {

		path = path.replace(/\.[^/.]+$/, '');
		path = path + '@2x' + '.' + extention

	}

	return {
		path,
		isPhoto
	}

};

lychee.loadDropbox = function(callback) {

	if (lychee.dropbox===false && lychee.dropboxKey!=null && lychee.dropboxKey!=='') {

		loadingBar.show();

		let g = document.createElement('script');
		let s = document.getElementsByTagName('script')[0];

		g.src   = 'https://www.dropbox.com/static/api/1/dropins.js';
		g.id    = 'dropboxjs';
		g.type  = 'text/javascript';
		g.async = 'true';
		g.setAttribute('data-app-key', lychee.dropboxKey);
		g.onload = g.onreadystatechange = function() {
			let rs = this.readyState;
			if (rs && rs!=='complete' && rs!=='loaded') return;
			lychee.dropbox = true;
			loadingBar.hide();
			callback()
		};
		s.parentNode.insertBefore(g, s)

	} else if (lychee.dropbox===true && lychee.dropboxKey!=null && lychee.dropboxKey!=='') {

		callback()

	} else {

		settings.setDropboxKey(callback)

	}

};

lychee.getEventName = function() {

	let touchendSupport = (/Android|iPhone|iPad|iPod/i).test(navigator.userAgent || navigator.vendor || window.opera) && ('ontouchend' in document.documentElement);
	return (touchendSupport === true ? 'touchend' : 'click')

};

lychee.escapeHTML = function(html = '') {

	// Ensure that html is a string
	html += '';

	// Escape all critical characters
	html = html.replace(/&/g, '&amp;')
			   .replace(/</g, '&lt;')
			   .replace(/>/g, '&gt;')
			   .replace(/"/g, '&quot;')
			   .replace(/'/g, '&#039;')
			   .replace(/`/g, '&#96;');

	return html

};

lychee.html = function(literalSections, ...substs) {

	// Use raw literal sections: we don’t want
	// backslashes (\n etc.) to be interpreted
	let raw    = literalSections.raw;
	let result = '';

	substs.forEach((subst, i) => {

		// Retrieve the literal section preceding
		// the current substitution
		let lit = raw[i];

		// If the substitution is preceded by a dollar sign,
		// we escape special characters in it
		if (lit.slice(-1)==='$') {
			subst = lychee.escapeHTML(subst);
			lit   = lit.slice(0, -1)
		}

		result += lit;
		result += subst

	});

	// Take care of last literal section
	// (Never fails, because an empty template string
	// produces one literal section, an empty string)
	result += raw[raw.length - 1];

	return result

};

lychee.error = function(errorThrown, params = '', data = '') {

	loadingBar.show('error', errorThrown);

	if (errorThrown === 'Session timed out.') {
		setTimeout(() => {
			lychee.goto();
			window.location.reload()
		}, 3000)
	}
	else {
		console.error({
			description	: errorThrown,
			params		: params,
			response	: data
		})
	}

};

lychee.fullscreenEnter = function() {
	let elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	}
};

lychee.fullscreenExit = function() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) { /* Firefox */
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) { /* IE/Edge */
		document.msExitFullscreen();
	}
};

lychee.fullscreenToggle = function() {
	if (lychee.fullscreenStatus()) {
		lychee.fullscreenExit();
	}
	else {
		lychee.fullscreenEnter();
	}
};

lychee.fullscreenStatus = function() {
	let elem = (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
	return (elem ? true : false);
};

lychee.fullscreenUpdate = function() {
	if (lychee.fullscreenStatus()) {
		$('#button_fs_album_enter,#button_fs_enter').hide();
		$('#button_fs_album_exit,#button_fs_exit').show();
	}
	else {
		$('#button_fs_album_enter,#button_fs_enter').show();
		$('#button_fs_album_exit,#button_fs_exit').hide();
	}
};

lychee.footer_show = function () {
	setTimeout(function () {
		lychee.footer.removeClass('hide_footer')
	}, 200);
};


lychee.footer_hide = function () {
	lychee.footer.addClass('hide_footer')
};
