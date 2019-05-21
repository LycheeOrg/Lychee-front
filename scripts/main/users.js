users = {
	json: null
};

users.update = function (params) {

	if (params.username.length < 1) {
		loadingBar.show('error', 'new username cannot be empty.');
		return false
	}

	if ( $('#UserData' + params.id + ' .choice input[name="upload"]:checked').length === 1 )
	{
		params.upload = '1';
	}
	else
	{
		params.upload= '0';
	}
	if ( $('#UserData' + params.id + ' .choice input[name="lock"]:checked').length === 1 )
	{
		params.lock = '1';
	}
	else
	{
		params.lock = '0';
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

users.create = function (params) {

	if (params.username.length < 1) {
		loadingBar.show('error', 'new username cannot be empty.');
		return false
	}
	if (params.password.length < 1) {
		loadingBar.show('error', 'new password cannot be empty.');
		return false
	}

	if ( $('#UserCreate .choice input[name="upload"]:checked').length === 1 )
	{
		params.upload = '1';
	}
	else
	{
		params.upload = '0';
	}
	if ( $('#UserCreate .choice input[name="lock"]:checked').length === 1 )
	{
		params.lock = '1';
	}
	else
	{
		params.lock = '0';
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