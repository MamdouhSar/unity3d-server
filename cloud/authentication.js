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
            response.success({
                'result': 'SIGNED UP',
                'user': user
            });
        },
        function(error) {
            response.error({
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
            response.error(error);
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
            response.error(error);
        }
    );
});