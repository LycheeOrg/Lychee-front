let u2f = {
    json: null
};

u2f.is_available = function() {
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        let msg = lychee.html `<h1>Environment not secured. U2F not available</h1>`;

        basicModal.show({
            body: msg,
            buttons: {
                cancel: {
                    title: lychee.locale['CLOSE'],
                    fn: basicModal.close
                }
            }
        });

        return false;
    }
    return true;
}



u2f.login = function() {
    if (!u2f.is_available()) return;

    new Larapass({
            login: '/api/webauthn::login',
            loginOptions: '/api/webauthn::login/gen'
        }).login({
            user_id: 0 // for now it is only available to Admin user via a secret key shortcut.
        }).then(function(data) {
            loadingBar.show('success', 'Authentication successful!');
            window.location.reload()
        })
        .catch(error => loadingBar.show('error', 'Something went wrong!'))
}



u2f.register = function() {
    if (!u2f.is_available()) return;

    larapass = new Larapass({
        register: '/api/webauthn::register',
        registerOptions: '/api/webauthn::register/gen'
    })
    if (Larapass.supportsWebAuthn()) {
        larapass.register()
            .then(function(response) {
                loadingBar.show('success', 'Registration successful!');
                u2f.list() // reload credential list
            })
            .catch(response =>
                loadingBar.show('error', 'Something went wrong!'))
    } else {
        loadingBar.show('error', 'U2F not supported. Sorry.')
    }
}


// u2f.tmp = function() {
//     let msg = lychee.html `
//     <form>
//         <p class='signIn'>
//             <input class='text' name='username' autocomplete='on' type='text' placeholder='$${ lychee.locale['USERNAME'] }' autocapitalize='off' data-tabindex='${tabindex.get_next_tab_index()}'>
//             <input class='text' name='password' autocomplete='current-password' type='password' placeholder='$${ lychee.locale['PASSWORD'] }' data-tabindex='${tabindex.get_next_tab_index()}'>
//         </p>
//         <p class='version'>Lychee ${ lychee.version }<span> &#8211; <a target='_blank' href='${ lychee.updateURL }' data-tabindex='-1'>${ lychee.locale['UPDATE_AVAILABLE'] }</a><span></p>
//     </form>
//     `;

//     basicModal.show({
//         body: msg,
//         buttons: {
//             action: {
//                 title: lychee.locale['SIGN_IN'],
//                 fn: lychee.login,
//                 attributes: [
//                     ["data-tabindex", tabindex.get_next_tab_index()]
//                 ]
//             },
//             cancel: {
//                 title: lychee.locale['CANCEL'],
//                 fn: basicModal.close,
//                 attributes: [
//                     ["data-tabindex", tabindex.get_next_tab_index()]
//                 ]
//             }
//         }
//     });
// }

u2f.delete = function(params) {

    api.post('webauthn::delete', params, function(data) {
        if (data !== 'true') {
            loadingBar.show('error', data.description);
            lychee.error(null, params, data)
        } else {
            loadingBar.show('success', 'Credential deleted!');
            u2f.list() // reload credential list
        }
    })

};

u2f.list = function() {
    api.post('webauthn::list', {}, function(data) {
        u2f.json = data;
        view.u2f.init()
    })
};