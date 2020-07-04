/**
 * @description This module is used for the context menu.
 */

let leftMenu = {

	_dom: $('.leftMenu')

};

leftMenu.dom = function(selector) {

	if (selector==null || selector==='') return leftMenu._dom;
	return leftMenu._dom.find(selector)

};

leftMenu.build = function () {
	let html = lychee.html`
		<a id="text_settings_close" class="closetxt" data-tabindex="-1">${ lychee.locale['CLOSE'] }</a>
		<a id="button_settings_close" class="closebtn" data-tabindex="20">&times;</a>
		<a class="linkMenu" id="button_settings_open" data-tabindex="-1"><svg class="iconic"><use xlink:href="#cog"></use></svg>${ lychee.locale['SETTINGS'] }</a>`;
	if (lychee.api_V2)
	{
		html += lychee.html`
		<a class="linkMenu" id="button_users" data-tabindex="-1">${    build.iconic('person') }${             lychee.locale['USERS'] } </a>
		<a class="linkMenu" id="button_sharing" data-tabindex="-1">${  build.iconic('cloud') }${              lychee.locale['SHARING'] }</a>`
	}
	html += lychee.html`
		<a class="linkMenu" id="button_logs" data-tabindex="-1">${         build.iconic('align-left') }${     lychee.locale['LOGS'] }</a>
		<a class="linkMenu" id="button_diagnostics" data-tabindex="-1">${  build.iconic('wrench') }${         lychee.locale['DIAGNOSTICS'] }</a>
		<a class="linkMenu" id="button_about" data-tabindex="-1">${        build.iconic('info') }${           lychee.locale['ABOUT_LYCHEE'] }</a>
		<a class="linkMenu" id="button_signout" data-tabindex="21">${      build.iconic('account-logout') }${ lychee.locale['SIGN_OUT'] }</a>`;
	if (lychee.api_V2 && lychee.update_available)
	{
		html += lychee.html`
		<a class="linkMenu" id="button_update"  data-tabindex="-1">${ build.iconic('timer')}${ lychee.locale['UPDATE_AVAILABLE']}</a>
		`
	}
	leftMenu._dom.html(html)
};

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
leftMenu.open = function () {
	leftMenu._dom.addClass('leftMenu__visible');
	lychee.content.addClass('leftMenu__open');
	lychee.footer.addClass('leftMenu__open');
	header.dom('.header__title').addClass('leftMenu__open');
	loadingBar.dom().addClass('leftMenu__open');

	// Make background unfocusable
	tabindex.makeUnfocusable(header.dom());
	tabindex.makeUnfocusable(lychee.content);
	tabindex.makeFocusable(leftMenu._dom);
	$('#button_signout').focus();

	multiselect.unbind();
};

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
leftMenu.close = function () {
	leftMenu._dom.removeClass('leftMenu__visible');
	lychee.content.removeClass('leftMenu__open');
	lychee.footer.removeClass('leftMenu__open');
	$('.content').removeClass('leftMenu__open');
	header.dom('.header__title').removeClass('leftMenu__open');
	loadingBar.dom().removeClass('leftMenu__open');

	tabindex.makeFocusable(header.dom());
	tabindex.makeFocusable(lychee.content);
	tabindex.makeUnfocusable(leftMenu._dom);

	multiselect.bind();
	lychee.load();
};

leftMenu.bind = function() {

	// Event Name
	let eventName = lychee.getEventName();

	leftMenu.dom('#button_settings_close')    .on(eventName, leftMenu.close);
	leftMenu.dom('#text_settings_close')      .on(eventName, leftMenu.close);
	leftMenu.dom('#button_settings_open')     .on(eventName, settings.open);
	leftMenu.dom('#button_signout')           .on(eventName, lychee.logout);
	leftMenu.dom('#button_logs')              .on(eventName, leftMenu.Logs);
	leftMenu.dom('#button_diagnostics')       .on(eventName, leftMenu.Diagnostics);
	leftMenu.dom('#button_about')             .on(eventName, lychee.aboutDialog);

	if (lychee.api_V2)
	{
		leftMenu.dom('#button_users')         .on(eventName, leftMenu.Users);
		leftMenu.dom('#button_sharing')       .on(eventName, leftMenu.Sharing);
		leftMenu.dom('#button_update')        .on(eventName, leftMenu.Update);
	}

	return true

};

leftMenu.Logs = function() {
	if(lychee.api_V2)
	{
		view.logs.init();
	}
	else
	{
		window.open(lychee.logs())
	}
};

leftMenu.Diagnostics = function() {
	if(lychee.api_V2)
	{
		view.diagnostics.init();
	}
	else
	{
		window.open(lychee.diagnostics())
	}
};

leftMenu.Update = function() {
	view.update.init();
};

leftMenu.Users = function () {
	users.list();
};

leftMenu.Sharing = function () {
	sharing.list();
};
