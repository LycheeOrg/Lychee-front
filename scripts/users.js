users = {
    json: null
};

users.update = function (params) {

    api.post('User::Save', params, function (data) {
        if(data!==true)
        {
            loadingBar.show('error', data.description);
            lychee.error(null,params,data)
        }
        else
        {
            loadingBar.show('success', 'User updated!')
            users.list(); // reload user list
        }
    })
};

users.create = function (params) {

    api.post('User::Create', params, function (data) {
        if(data!==true)
        {
            loadingBar.show('error', data.description);
            lychee.error(null,params,data)
        }
        else
        {
            loadingBar.show('success', 'User created!');
            users.list(); // reload user list
        }
    })

};

users.delete = function (params) {

    api.post('User::Delete', params, function (data) {
        if(data!==true)
        {
            loadingBar.show('error', data.description);
            lychee.error(null,params,data)
        }
        else
        {
            loadingBar.show('success', 'User deleted!');
            users.list() // reload user list
        }
    })

};

users.list = function () {
    api.post('User::List', {}, function (data) {
        users.json = data;
        view.users.init()
    })
};