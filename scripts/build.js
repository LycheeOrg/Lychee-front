/**
 * @description This module is used to generate HTML-Code.
 */

build = {};

build.iconic = function(icon, classes = '') {

	let html = '';

	html += lychee.html`<svg class='iconic ${ classes }'><use xlink:href='#${ icon }' /></svg>`;

	return html

};

build.divider = function(title) {

	let html = '';

	html += lychee.html`<div class='divider'><h1>${ title }</h1></div>`;

	return html

};

build.editIcon = function(id) {

	let html = '';

	html += lychee.html`<div id='${ id }' class='edit'>${ build.iconic('pencil') }</div>`;

	return html

};

build.multiselect = function(top, left) {

	return lychee.html`<div id='multiselect' style='top: ${ top }px; left: ${ left }px;'></div>`

};

build.album = function(data) {

	let html = '';
	let date_stamp = data.sysdate;
	let sortingAlbums = [];

    let { path: retinaThumbUrl, isPhoto } = lychee.retinize(data.thumbs[0]);

	// In the special case of take date sorting use the take stamps as title
	if (lychee.sortingAlbums!=='' && data.min_takestamp && data.max_takestamp) {

		sortingAlbums = lychee.sortingAlbums.replace('ORDER BY ', '').split(' ');
		if (sortingAlbums[0]==='max_takestamp' || sortingAlbums[0]==='min_takestamp'){
			if (data.min_takestamp !== '' && data.max_takestamp !== '')
			{
                date_stamp = (data.min_takestamp===data.max_takestamp ? data.max_takestamp  : data.min_takestamp + ' - ' + data.max_takestamp)
			}
            else if (data.min_takestamp !== '')
            {
                date_stamp = data.min_takestamp
            }
            else if (data.min_takestamp !== '' && data.max_takestamp !== '')
            {
                date_stamp = data.max_takestamp
            }
		}
	}

	html += lychee.html`
	        <div class='album' data-id='${ data.id }'>
	            <img src='${ data.thumbs[2] }' width='200' height='200' alt='Photo thumbnail' data-overlay='false' draggable='false'>
	            <img src='${ data.thumbs[1] }' width='200' height='200' alt='Photo thumbnail' data-overlay='false' draggable='false'>
	            <img src='${ data.thumbs[0] }' srcset='${ retinaThumbUrl } 1.5x' width='200' height='200' alt='Photo thumbnail' data-overlay='${ isPhoto }' draggable='false'>
	            <div class='overlay'>
	                <h1 title='${ data.title }'>${ data.title }</h1>
	                <a>${ date_stamp }</a>
	            </div>
	        `;

	if (lychee.publicMode===false) {

		html += lychee.html`
		        <div class='badges'>
		            <a class='badge ${ (data.star==='1'     ? 'badge--star' : '') } icn-star'>${ build.iconic('star') }</a>
		            <a class='badge ${ (data.public==='1'   ? 'badge--visible' : '') } ${ (data.hidden==='1' ? 'badge--not--hidden' : 'badge--hidden') } icn-share'>${ build.iconic('eye') }</a>
		            <a class='badge ${ (data.unsorted==='1' ? 'badge--visible' : '') }'>${ build.iconic('list') }</a>
		            <a class='badge ${ (data.recent==='1'   ? 'badge--visible badge--list' : '') }'>${ build.iconic('clock') }</a>
		            <a class='badge ${ (data.password==='1' ? 'badge--visible' : '') }'>${ build.iconic('lock-locked') }</a>
		        </div>
		        `

	}

	html += '</div>';

	return html

};

build.photo = function(data) {

	let html = '';

	let { path: retinaThumbUrl } = lychee.retinize(data.thumbUrl);

	html += lychee.html`
	        <div class='photo' data-album-id='${ data.album }' data-id='${ data.id }'>
	            <img src='${ data.thumbUrl }' srcset='${ retinaThumbUrl } 1.5x' width='200' height='200' alt='Photo thumbnail' draggable='false'>
	            <div class='overlay'>
	                <h1 title='${ data.title }'>${ data.title }</h1>
	        `;

	if (data.cameraDate==='1') html += lychee.html`<a><span title='Camera Date'>${ build.iconic('camera-slr') }</span>${ data.sysdate }</a>`;
	else                       html += lychee.html`<a>${ data.sysdate }</a>`;

	html += `</div>`;

	if (lychee.publicMode===false) {

		html += lychee.html`
		        <div class='badges'>
		            <a class='badge ${ (data.star==='1'                                ? 'badge--visible' : '') } icn-star'>${ build.iconic('star') }</a>
		            <a class='badge ${ ((data.public==='1' && album.json.public!=='1') ? 'badge--visible' : '') } icn-share'>${ build.iconic('eye') }</a>
		        </div>
		        `

	}

	html += `</div>`;

	return html

};

build.imageview = function(data, visibleControls) {

	let html      = '';
	let hasMedium = data.medium !== '';

	if (hasMedium===false) {

		html += lychee.html`<img id='image' class='${ visibleControls===true ? '' : 'full' }' src='${ data.url }' draggable='false'>`

	} else {

		// html += lychee.html`<img id='image' class='${ visibleControls===true ? '' : 'full' }' src='${ data.url }' srcset='${ data.medium } 1920w, ${ data.url } ${ data.width }w' draggable='false'>`
        html += lychee.html`<img id='image' class='${ visibleControls===true ? '' : 'full' }' src='${ data.medium }' draggable='false'>`

	}

	html += `
	        <div class='arrow_wrapper arrow_wrapper--previous'><a id='previous'>${ build.iconic('caret-left') }</a></div>
	        <div class='arrow_wrapper arrow_wrapper--next'><a id='next'>${ build.iconic('caret-right') }</a></div>
	        `;

	return html

};

build.no_content = function(typ) {

	let html = '';

	html += `
	        <div class='no_content fadeIn'>
	            ${ build.iconic(typ) }
	        `;

	switch (typ) {
		case 'magnifying-glass':
			html += `<p>` + lychee.locale['VIEW_NO_RESULT'] + `</p>`;
			break;
		case 'eye':
			html += `<p>` + lychee.locale['VIEW_NO_PUBLIC_ALBUMS'] + `</p>`;
			break;
		case 'cog':
			html += `<p>` + lychee.locale['VIEW_NO_CONFIGURATION'] + `</p>`;
			break;
		case 'question-mark':
			html += `<p>` + lychee.locale['VIEW_PHOTO_NOT_FOUND'] + `</p>`;
			break
	}

	html += `</div>`;

	return html

};

build.uploadModal = function(title, files) {

	let html = '';

	html += lychee.html`
	        <h1>${ title }</h1>
	        <div class='rows'>
	        `;

	let i = 0;

	while (i<files.length) {

		let file = files[i];

		if (file.name.length>40) file.name = file.name.substr(0, 17) + '...' + file.name.substr(file.name.length - 20, 20);

		html += lychee.html`
		        <div class='row'>
		            <a class='name'>${ file.name }</a>
		            <a class='status'></a>
		            <p class='notice'></p>
		        </div>
		        `;

		i++

	}

	html +=	`</div>`;

	return html

};

build.tags = function(tags) {

	let html = '';

	if (tags!=='') {

		tags = tags.split(',');

		tags.forEach(function(tag, index, array) {
			html += lychee.html`<a class='tag'>${ tag }<span data-index='${ index }'>${ build.iconic('x') }</span></a>`
		})

	} else {

		html = `<div class='empty'>` + lychee.locale['NO_TAGS'] + `</div>`

	}

	return html

};

build.user = function (user) {
    return '<div class="users_view_line">' +
        '<p id="UserData' + user.id + '">' +
        '<input name="id" type="hidden" value="' + user.id + '" />' +
        '<input class="text" name="username" type="text" value="' + user.username + '" placeholder="username" />' +
        '<input class="text" name="password" type="text" placeholder="new password" />' +
        '<span class="choice">' +
        '<label>' +
        '<input type="checkbox" name="upload" />' +
        '<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
        '</label>' +
        '</span>' +
        '<span class="choice">' +
        '<label>' +
        '<input type="checkbox" name="lock" />' +
        '<span class="checkbox"><svg class="iconic "><use xlink:href="#check"></use></svg></span>' +
        '</label>' +
        '</span>' +
        '</p>' +
        '<a id="UserUpdate' + user.id + '"  class="basicModal__button basicModal__button_OK">Save</a>' +
        '<a id="UserDelete' + user.id + '"  class="basicModal__button basicModal__button_DEL">Delete</a>' +
        '</div>';
};
