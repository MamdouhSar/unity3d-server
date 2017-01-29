/**
 * Created by mamdouh on 15/01/17.
 */
var async = require('async');

Parse.Cloud.define('requestFriend', function(request, response) {
    var user = request.user;
    console.log('================================');
    console.log(request.params.id);
    var requestedUser = request.params.id;
    if(user.id != requestedUser) {
        var friendRequest = new Parse.Object('FriendRequest');
        friendRequest.set('requestedBy', user);
        friendRequest.set('requestedTo', {'__type':'Pointer', 'className':'_User', 'objectId': requestedUser});
        friendRequest.set('isAccepted', false);
        friendRequest.save().then(
            function(result) {
                response.success({
                    'message': 'SUCCESS',
                    'result': result
                })
            },
            function(error) {
                response.success({
                    'message': 'ERROR',
                    'result' : error.message
                })
            }
        );
    } else {
        response.success({
            'message': 'ERROR',
            'result': 'User cannot request himself'
        })
    }
});

Parse.Cloud.define('acceptFriend', function(request, response) {
    var user = request.user;
    var requestObject = new Parse.Object('FriendRequest');
    requestObject.id = request.params.requestId;
    requestObject.fetch().then(
        function(req) {
            var requestUser = req.get('requestedBy');
            req.set('isAccepted', true);
            req.save().then(
                function(reqSaved) {
                    user.addUnique('friends', requestUser);
                    user.save().then(
                        function(userFriendSaved) {
                            requestUser.addUnique('friends', user);
                            requestUser.save().then(
                                function(requestedFriendSaved) {
                                    response.success({
                                        'message': 'SUCCESS',
                                        'request': reqSaved,
                                        'userAccepted': userFriendSaved,
                                        'userRequested': requestedFriendSaved
                                    });
                                },
                                function(error) {
                                    response.success({
                                        'message': 'ERROR',
                                        'result': error.message
                                    });
                                }
                            )
                        },
                        function(error) {
                            response.success({
                                'message': 'ERROR',
                                'result': error.message
                            });
                        }
                    );
                },
                function(error) {
                    response.success({
                        'message': 'ERROR',
                        'result': error.message
                    })
                }
            )
        },
        function(error) {
            response.success({
                'message': 'ERROR',
                'result': error.message
            })
        }
    )
});

Parse.Cloud.define('getAllFriends', function(request, response) {
    var user = request.user;
    var friends = user.get('friends');
    var responseFriends = [];
    async.each(friends, function(singleFriend, friendCallback) {
        responseFriends.push({
            'id': singleFriend.id,
            'username': singleFriend.get('username'),
            'email': singleFriend.get('email')
        });
        friendCallback();
    },
    function(err) {
        if(err) {
            response.success({
                'message': 'ERROR',
                'result': err
            });
        } else {
            response.success({
                'message': 'SUCCESS',
                'result': responseFriends
            });
        }
    });
});

Parse.Cloud.define('getFriendRequests', function(request, response) {
    var user = request.user;
    var requestQuery = new Parse.Query('FriendRequest');
    requestQuery.equalTo('requestedTo', user);
    requestQuery.equalTo('isAccepted', false);
    requestQuery.include('requestedBy');
    requestQuery.find().then(
        function(request) {
            var friendRequests = [];
            async.each(request, function(singleRequest, requestCallback) {
                friendRequests.push(singleRequest.get('requestedBy'));
                requestCallback();
            },
            function(error){
                if(error) {
                    response.success({
                        'message': 'ERROR',
                        'result': error
                    });
                } else {
                    response.success({
                        'message': 'SUCCESS',
                        'result': friendRequests
                    })
                }
            });
        },
        function(error) {
            response.success({
                'message': 'ERROR',
                'result': error.message
            })
        }
    );
});