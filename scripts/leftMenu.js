/**
 * @description This module is used for the context menu.
 */

leftMenu = {

    _dom: $('.leftMenu')

}

leftMenu.dom = function(selector) {

    if (selector==null || selector==='') return leftMenu._dom
    return leftMenu._dom.find(selector)

}

leftMenu.build = function () {
    let html = ''
    html += '<a id="button_settings_close" class="closebtn" >&times;</a>'
    html += '<a class="linkMenu" id="button_settings">' + lychee.locale['SETTINGS'] + '</a>'
    html += '<a class="linkMenu" id="button_logs" href="' + lychee.logs() + '">' + build.iconic('align-left') + lychee.locale['LOGS'] + '</a>'
    html += '<a class="linkMenu" id="button_diagnostics" href="' + lychee.diagnostics() + '">' + build.iconic('wrench') + lychee.locale['DIAGNOSTICS'] + '</a>'
    html += '<a class="linkMenu" href="' + lychee.website + '">' + build.iconic('info') + lychee.locale['ABOUT_LYCHEE'] + '</a>'
    html += '<a class="linkMenu" id="button_signout">' + build.iconic('account-logout') + lychee.locale['SIGN_OUT'] + '</a>'
    leftMenu._dom.html(html)
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
leftMenu.open = function () {
    leftMenu._dom.css('width','250px');
    $('.content').css('marginLeft', '250px');
    $('.content').css('width', 'calc(100% - 250px)');
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
leftMenu.close = function () {
    leftMenu._dom.css('width', '0');
    $('.content').css('marginLeft', '0');
    $('.content').css('width', '100%');
}

leftMenu.bind = function() {

    // Event Name
    let eventName = lychee.getEventName()

    leftMenu.dom('#button_settings_close')    .on(eventName, leftMenu.close)
    leftMenu.dom('#button_settings')          .on(eventName, contextMenu.settings)
    leftMenu.dom('#button_signout')           .on(eventName, lychee.logout)
    // leftMenu.dom('#button_logs')              .on(eventName, function() { logs.load() })
    // leftMenu.dom('#button_diagnostics')       .on(eventName, function() { diagnostics.load() })

    // header.dom('#button_info_album')  .on(eventName, sidebar.toggle)
    // header.dom('#button_info')        .on(eventName, sidebar.toggle)
    // header.dom('.button_add')         .on(eventName, contextMenu.add)
    // header.dom('#button_more')        .on(eventName, function(e) { contextMenu.photoMore(photo.getID(), e) })
    // header.dom('#button_move')        .on(eventName, function(e) { contextMenu.move([ photo.getID() ], e) })
    // leftMenu.dom('.header__hostedwith') .on(eventName, function() { window.open(lychee.website) })
    // header.dom('#button_trash_album') .on(eventName, function() { album.delete([ album.getID() ]) })
    // header.dom('#button_trash')       .on(eventName, function() { photo.delete([ photo.getID() ]) })
    // header.dom('#button_archive')     .on(eventName, function() { album.getArchive(album.getID()) })
    // header.dom('#button_star')        .on(eventName, function() { photo.setStar([ photo.getID() ]) })
    // header.dom('#button_back_home')   .on(eventName, function() { lychee.goto() })
    // header.dom('#button_back')        .on(eventName, function() { lychee.goto(album.getID()) })

    // header.dom('.header__search').on('keyup click', function() { search.find($(this).val()) })
    // header.dom('.header__clear').on(eventName, function() {
    //     header.dom('.header__search').focus()
    //     search.reset()
    // })

    return true

}
