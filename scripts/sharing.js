sharing = {
    json: null
};

sharing.update = function (params) {

    if ( $('#UserData' + params.id + ' .choice input[name="upload"]:checked').length === 1 )
    {
        params.upload = '1';
    }
    else
    {
        params.upload= '0';
    }

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

sharing.add = function (params) {

    if ( $('#UserCreate .choice input[name="upload"]:checked').length === 1 )
    {
        params.upload = '1';
    }
    else
    {
        params.upload= '0';
    }

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

sharing.delete = function (params) {

    api.post('User::Delete', params, function (data) {
        if(data!==true)
        {
            loadingBar.show('error', data.description);
            lychee.error(null,params,data)
        }
        else
        {
            loadingBar.show('success', 'User deleted!');
            sharing.list() // reload user list
        }
    })

};

sharing.list = function () {
    api.post('Sharing::List', {}, function (data) {
        sharing.json = data;
        view.sharing.init()
    })
};