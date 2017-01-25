/**
 * Created by mamdouh on 15/01/17.
 */

Parse.Cloud.define('signUp', function(request, response) {
    var userObject = {
        'username': request.params.username,
        'email': request.params.email,
        'password': request.params.password,
    };
    var newUser = new Parse.User();
    newUser.set('username', userObject.username);
    newUser.set('email', userObject.email);
    newUser.set('password', userObject.password);
    newUser.signUp().then(
        function(user) {
            Parse.User.logIn(userObject.username, userObject.password).then(
                function() {
                    response.success({
                        'result': 'SIGNED UP',
                        'user': user
                    });
                },
                function(error) {
                    response.success({
                        'result': 'ERROR',
                        'message' : error.message
                    });
                }
            );
        },
        function(error) {
            response.success({
                'result': 'ERROR',
                'message' : error.message
            });
        }
    );
});

Parse.Cloud.define('logIn', function(request, response) {
    var userObject = {
        'username': request.params.username,
        'password': request.params.password
    };
    Parse.User.logIn(userObject.username, userObject.password).then(
        function(user) {
            response.success({
                'result': 'LOGGED IN',
                'user': user
            });
        },
        function(error) {
            response.success({
                'result':'ERROR',
                'message':error.message
            });
        }
    );
});

Parse.Cloud.define('logOut', function(request, response) {
    var user = request.user;
    user.logOut().then(
        function(result) {
            response.success({
                'result': 'LOGGED OUT',
                'user': result
            })
        },
        function(error) {
            response.success({
                'result':'ERROR',
                'message':error.message
            });
        }
    );
});

Parse.Cloud.define('updateProfile', function(request, response) {
    var user = request.user;
    var userObject = new Parse.User();
    userObject.id = user.id;
    userObject.fetch({sessionToken: user.getSessionToken()}).then(
        function(userUpdated) {
            if (Parse.FacebookUtils.isLinked(userUpdated)) {
                Parse.Cloud.httpRequest({
                    url:'https://graph.facebook.com/me?fields=email,name&access_token='+userUpdated.get('authData').facebook.access_token,
                    success:function(httpResponse){
                        response.success({
                            'username': httpResponse.data.name,
                            'email': httpResponse.data.email
                        });
                    },
                    error:function(httpResponse){
                        response.success(httpResponse);
                    }
                });
            } else {
                response.success(JSON.stringify(userUpdated));
            }
        },
        function(error) {
            response.success(error.message);
        }
    );
});