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
    if (Parse.FacebookUtils.isLinked(user) && !user.get('profileUpdated')) {
        Parse.Cloud.httpRequest({
            url:'https://graph.facebook.com/me?fields=email,name&access_token='+user.get('authData').facebook.access_token,
            success:function(httpResponse){
                user.setUsername(httpResponse.data.name);
                user.setEmail(httpResponse.data.email);
                user.set('profileUpdated', true);
                user.save({useMasterKey: true}).then(
                    function(result) {
                        console.log('===========================================');
                        console.log('============FACEBOOK DATA==================');
                        console.log(httpResponse.data.name);
                        console.log(httpResponse.data.email);
                        console.log('===========================================');
                        response.success(JSON.stringify(result));
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                        response.success(JSON.stringify(error));
                    }
                );
            },
            error:function(httpResponse){
                console.error(httpResponse);
            }
        });
    }else {
        response.success(user);
    }
});