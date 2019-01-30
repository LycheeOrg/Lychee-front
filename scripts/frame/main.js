
// Sub-implementation of lychee -------------------------------------------------------------- //

let lychee = {
	api_V2 : true
};

lychee.content = $('.content');

lychee.escapeHTML = function (html = '') {

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

lychee.html = function (literalSections, ...substs) {

	// Use raw literal sections: we don’t want
	// backslashes (\n etc.) to be interpreted
	let raw = literalSections.raw;
	let result = '';

	substs.forEach((subst, i) => {

		// Retrieve the literal section preceding
		// the current substitution
		let lit = raw[i];

		// If the substitution is preceded by a dollar sign,
		// we escape special characters in it
		if (lit.slice(-1) === '$') {
			subst = lychee.escapeHTML(subst);
			lit = lit.slice(0, -1)
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

lychee.getEventName = function () {

	let touchendSupport = (/Android|iPhone|iPad|iPod/i).test(navigator.userAgent || navigator.vendor || window.opera) && ('ontouchend' in document.documentElement);
	return (touchendSupport === true ? 'touchend' : 'click')

};


// Sub-implementation of lychee -------------------------------------------------------------- //


let frame = {
	refresh: 30000
};

frame.start_blur = function() {
	let img = document.getElementById('background');
	let canvas = document.getElementById('background_canvas');
	StackBlur.image(img,canvas,20);
	canvas.style.width = '100%';
	canvas.style.height = '100%';
};

frame.next = function() {
	$('body').removeClass('loaded');
	setTimeout(function(){ location.reload(); }, 1000);
};

frame.refreshPicture = function() {
	api.post('Photo::getRandom', {}, function (data) {
		if(!data.url)    console.log('URL not found');
		if(!data.thumb)  console.log('Thumb not found');

		$('#background').attr("src",data.thumb).on("load",function () {
			frame.start_blur();
		});

		$('#picture').attr("src",data.url).css('display', 'inline');
		$('body').addClass('loaded');

		setTimeout(function(){ frame.next(); }, frame.refresh);
	});

};

frame.set = function(data) {
	console.log(data.refresh);
	frame.refresh = data.refresh ? data.refresh : 30000;
	console.log(frame.refresh);
	frame.refreshPicture();
};

// Main -------------------------------------------------------------- //

let loadingBar = {
	show() {
	}, hide() {
	}
};

let imageview = $('#imageview');

$(document).ready(function () {

	// set CSRF protection (Laravel)
	csrf.bind();

	api.post('Frame::getSettings', {}, function(data) {
		frame.set(data);
	});
});
