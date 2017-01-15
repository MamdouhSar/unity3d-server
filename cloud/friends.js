/**
 * Created by mamdouh on 15/01/17.
 */
var async = require('async');

Parse.Cloud.define('addFriend', function(request, response) {
    var user = request.user;
    var friendId = request.params.id;
    user.addUnique('friends', friendId);
    user.save().then(
        function(result) {
            response.success({
                'Result': result,
                'Message': 'Friend Added'
            });
        },
        function(error) {
            response.error(error);
        }
    );
});

Parse.Cloud.define('getAllFriends', function(request, response) {
    var user = request.user;
    var friends = user.get('friends');
    var userQuery = new Parse.Query('User');
    userQuery.containedIn('objectId', friends);
    userQuery.find().then(
        function(result) {
            var responseFriends = []
            async.each(result, function(singleFriend, friendCallback) {
                responseFriends.push({
                    'id': singleFriend.id,
                    'username': singleFriend.username,
                    'email': singleFriend.email
                });
                friendCallback();
            },
            function(err) {
                if(err) {
                    response.error(err);
                } else {
                    response.success(responseFriends);
                }
            });
        },
        function(error) {
            response.error(error);
        }
    );
});