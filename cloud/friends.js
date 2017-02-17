/**
 * Created by mamdouh on 15/01/17.
 */
var async = require('async');

Parse.Cloud.define('requestFriend', function(request, response) {
  var user = request.user;
  var requestedUser = request.params.id;
  if(user.id != requestedUser) {
    var friendRequestQuery = new Parse.Query('FriendRequest');
    friendRequestQuery.equalTo('requestedBy', user);
    friendRequestQuery.equalTo('requestedTo', {'__type':'Pointer', 'className':'_User', 'objectId': requestedUser});
    friendRequestQuery.include('requestedTo');
    friendRequestQuery.first({sessionToken: user.getSessionToken()}).then(
      function(foundRequests) {
        if(!foundRequests) {
          var friendRequest = new Parse.Object('FriendRequest');
          friendRequest.set('requestedBy', user);
          friendRequest.set('requestedTo', {'__type':'Pointer', 'className':'_User', 'objectId': requestedUser});
          friendRequest.set('isAccepted', false);
          friendRequest.save().then(
            function(result) {
              var userObject = new Parse.User();
              userObject.id = requestedUser;
              userObject.fetch().then(
                function(userFetched) {
                  var pushQuery = new Parse.Query(Parse.Installation);
                  pushQuery.equalTo('user', userFetched);
                  Parse.Push.send({
                    where: pushQuery,
                    data: {
                      alert: "You got a friend request from " + user.get('username'),
                      sound: "default"
                    }
                  },{ useMasterKey: true }).then(
                    function() {
                      response.success({
                        'message': 'SUCCESS',
                        'result': result
                      });
                    },
                    function(error) {
                      response.success({
                        'message': 'ERROR',
                        'result' : error.message
                      })
                    }
                  );
                },
                function(error) {
                  response.success({
                    'message': 'ERROR',
                    'result' : error.message
                  })
                }
              );
            },
            function(error) {
              response.success({
                'message': 'ERROR',
                'result' : error.message
              })
            }
          );
        } else {
          if(foundRequests.get('isAccepted')) {
            response.success({
              'message': 'Already a Friend',
              'result': foundRequests.get('requestedTo')
            });
          } else {
            response.success({
              'message': 'Already Requested',
              'result': {
                'id': foundRequests.id,
                'requestedBy': foundRequests.get('requestedTo'),
                'isAccepted': foundRequests.get('isAccepted')
              }
            });
          }
        }
      },
      function(error) {
        response.success({
          'message': 'ERROR',
          'result': error.message
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
  var friendRequestId = request.params.requestId;
  var friendRequestObject = new Parse.Object('FriendRequest');
  friendRequestObject.id = friendRequestId;
  friendRequestObject.fetch({sessionToken: user.getSessionToken()}).then(
    function(friendRequest) {
      if(!friendRequest.get('isAccepted')) {
        var friendQuery = new Parse.Query('Friend');
        friendQuery.equalTo('user', user);
        friendQuery.first({sessionToken: user.getSessionToken()}).then(
          function(userFriends) {
            if(userFriends) {
              userFriends.addUnique('friends', friendRequest.get('requestedBy'));
              userFriends.save().then(
                function() {
                  var friendQuery2 = new Parse.Query('Friend');
                  friendQuery2.equalTo('user', friendRequest.get('requestedBy'));
                  friendQuery2.first({sessionToken: user.getSessionToken()}).then(
                    function(requestedByFriends){
                      if(requestedByFriends) {
                        requestedByFriends.addUnique('friends', friendRequest.get('requestedTo'));
                        requestedByFriends.save().then(
                          function() {
                            friendRequest.set('isAccepted', true);
                            friendRequest.save().then(
                              function() {
                                response.success({
                                  'message': 'SUCCESS'
                                });
                              },
                              function(error) {
                                response.success({
                                  'message': 'ERROR',
                                  'result': error.message
                                })
                              }
                            );
                          },
                          function(error) {
                            response.success({
                              'message': 'ERROR',
                              'result': error.message
                            })
                          }
                        );
                      } else {
                        var newFriendObject = new Parse.Object('Friend');
                        newFriendObject.set('user', friendRequest.get('requestedBy'));
                        newFriendObject.addUnique('friends', friendRequest.get('requestedTo'));
                        newFriendObject.save().then(
                          function() {
                            friendRequest.set('isAccepted', true);
                            friendRequest.save().then(
                              function() {
                                response.success({
                                  'message': 'SUCCESS'
                                });
                              },
                              function(error) {
                                response.success({
                                  'message': 'ERROR',
                                  'result': error.message
                                })
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
                      }
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
            } else {
              var newFriendObject2 = new Parse.Object('Friend');
              newFriendObject2.set('user', user);
              newFriendObject2.addUnique('friends', friendRequest.get('requestedBy'));
              newFriendObject2.save().then(
                function() {
                  var friendQuery2 = new Parse.Query('Friend');
                  friendQuery2.equalTo('user', friendRequest.get('requestedBy'));
                  friendQuery2.first({sessionToken: user.getSessionToken()}).then(
                    function(requestedByFriends){
                      if(requestedByFriends) {
                        requestedByFriends.addUnique('friends', friendRequest.get('requestedTo'));
                        requestedByFriends.save().then(
                          function() {
                            friendRequest.set('isAccepted', true);
                            friendRequest.save().then(
                              function() {
                                response.success({
                                  'message': 'SUCCESS'
                                });
                              },
                              function(error) {
                                response.success({
                                  'message': 'ERROR',
                                  'result': error.message
                                })
                              }
                            );
                          },
                          function(error) {
                            response.success({
                              'message': 'ERROR',
                              'result': error.message
                            })
                          }
                        );
                      } else {
                        var newFriendObject = new Parse.Object('Friend');
                        newFriendObject.set('user', friendRequest.get('requestedBy'));
                        newFriendObject.addUnique('friends', friendRequest.get('requestedTo'));
                        newFriendObject.save().then(
                          function() {
                            friendRequest.set('isAccepted', true);
                            friendRequest.save().then(
                              function() {
                                response.success({
                                  'message': 'SUCCESS'
                                });
                              },
                              function(error) {
                                response.success({
                                  'message': 'ERROR',
                                  'result': error.message
                                })
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
                      }
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
            }
          },
          function(error) {
            response.success({
              'message': 'ERROR',
              'result': error.message
            });
          }
        );
      } else {
        var requestedToUser = new Parse.User();
        requestedToUser.id = friendRequest.get('requestedTo').id;
        requestedToUser.fetch({sessionToken: user.getSessionToken()}).then(
          function(userFetched) {
            response.success({
              'message': 'Already a Friend',
              'result': userFetched
            });
          },
          function(error) {
            response.success({
              'message': 'ERROR',
              'result': error.message
            });
          }
        );
      }
    },
    function(error) {
      response.success({
        'message': 'ERROR',
        'result': error.message
      });
    }
  );
});

Parse.Cloud.define('getAllFriends', function(request, response) {
  var user = request.user;
  var friendQuery = new Parse.Query('Friend');
  friendQuery.equalTo('user', user);
  friendQuery.first({sessionToken: user.getSessionToken()}).then(
    function(result) {
      var responseArray = [];
      async.each(result.get('friends'), function(singleResult, resultCallback) {
          singleResult.fetch().then(
            function(friend) {
              responseArray.push(friend);
              resultCallback()
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
          if(error) {
            throw error;
          } else {
            response.success({
              'message': 'SUCCESS',
              'result': responseArray
            });
          }
        });
    },
    function(error) {
      response.success({
        'message': 'ERROR',
        'result': error.message
      });
    }
  );
});

Parse.Cloud.define('getFriendRequests', function(request, response) {
  var user = request.user;
  var requestQuery = new Parse.Query('FriendRequest');
  requestQuery.equalTo('requestedTo', user);
  requestQuery.equalTo('isAccepted', false);
  requestQuery.include('requestedBy');
  requestQuery.find().then(
    function(requests) {
      var friendRequests = [];
      async.each(requests, function(singleRequest, requestCallback) {
          friendRequests.push({
            'requestId': singleRequest.id,
            'requestedBy': singleRequest.get('requestedBy')
          });
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