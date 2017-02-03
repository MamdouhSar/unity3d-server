/**
* Created by mamdouh on 26/01/17.
*/
var async = require('async');

Parse.Cloud.define('searchUser', function(request, response) {
  var user = request.user;
    var searchTerm = request.params.searchTerm;
    var emailQuery = new Parse.Query('User');
    emailQuery.startsWith('email', searchTerm);
    var usernameLowerQuery = new Parse.Query('usernameLower');
    usernameLowerQuery.startsWith('usernameLower', searchTerm.toLowerCase());
    var mainQuery = Parse.Query.or(emailQuery, usernameLowerQuery);
    mainQuery.find({sessionToken: user.getSessionToken()})
        .then(function(foundUsers) {
          response.success({
            'message': 'SUCCESS',
            'result': foundUsers
          });
        },function(error) {
          response.success({
            'message': 'ERROR',
            'result': error.message
          });
        });
});

Parse.Cloud.define('searchUserLong', function(request, response) {
    var user = request.user;
    var searchTerm = request.params.searchTerm;
    var emailQuery = new Parse.Query('User');
    emailQuery.startsWith('email', searchTerm);
    var usernameLowerQuery = new Parse.Query('usernameLower');
    usernameLowerQuery.startsWith('usernameLower', searchTerm.toLowerCase());
    var mainQuery = Parse.Query.or(emailQuery, usernameLowerQuery);
    mainQuery.find({sessionToken: user.getSessionToken()})
        .then(function(foundUsers) {
          var friendQuery = new Parse.Query('Friend');
          friendQuery.equalTo('user', user);
          friendQuery.first().then(
            function(friends) {
              var friendRequestQuery = new Parse.Query('FriendRequest');
              friendRequestQuery.equalTo('requestedBy', user);
              friendRequestQuery.equalTo('isAccepted', false);
              friendRequestQuery.find().then(
                function(friendsRequested) {
                  var requestsQuery = new Parse.Query('FriendRequest');
                  requestsQuery.equalTo('requestedTo', user);
                  requestsQuery.equalTo('isAccepted', false);
                  requestsQuery.find().then(
                    function(requests) {
                      sortFriends(foundUsers, friends.get('friends'), friendsRequested, requests, response);
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
                  });
                }
              );
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
            });
        });
});

function sortFriends(foundUsers, friends, friendsRequested, requests, response) {
  var responseArray = [];
  async.each(foundUsers, function(singleUser, userCallback) {
    if(isFriend(singleUser, friends)) {
      responseArray.push({
        'user': singleUser,
        'friendshipStatus': 1
      });
    } else if(isFriendRequested(singleUser, friendsRequested)) {
      responseArray.push({
        'user':singleUser,
        'friendshipStatus': 2
      });
    } else if(isRequested(singleUser, requests)) {
      responseArray.push({
        'user': singleUser,
        'friendshipStatus': 3
      });
    } else {
      responseArray.push({
        'user': singleUser,
        'friendshipStatus': 0
      });
    }
  },
  function(error) {
    if(error) {
      response.success({
        'message': 'ERROR',
        'result': error
      });
    } else {
      response.success({
        'message': 'ERROR',
        'result': responseArray
      });
    }
  });
}

function isFriend(user, friends) {
  for(var i=0; i<friends.length; i++) {
    if(user.id == friends[i].objectId) {
      return true;
    }
  }
  return false;
}

function isFriendRequested(user, friendsRequested) {
  for(var i=0; i<friendsRequested.length; i++) {
    if(user.id == friendsRequested[i].get('requestedBy').id) {
      return true;
    }
  }
  return false;
}

function isRequested(user, requests) {
  for(var i=0; i<requests.length; i++) {
    if(user.id == requests[i].get('requestedTo').id) {
      return true;
    }
  }
  return false;
}