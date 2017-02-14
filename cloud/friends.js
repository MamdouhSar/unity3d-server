/**
 * Created by mamdouh on 15/01/17.
 */
var async = require('async');

Parse.Cloud.define('requestFriend', function(request, response) {
  var user = request.user;
  var requestedUser = request.params.id;
  if(user.id != requestedUser) {
    var friendRequest = new Parse.Object('FriendRequest');
    friendRequest.set('requestedBy', user);
    friendRequest.set('requestedTo', {'__type':'Pointer', 'className':'_User', 'objectId': requestedUser});
    friendRequest.set('isAccepted', false);
    friendRequest.save().then(
      function(result) {
        console.log("LOGGING RESULT OF FRIENDREQUESTSSS")
        console.log(result);
        var userObject = new Parse.User();
        userObject.id = requestedUser;
        userObject.fetch().then(
          function(userFetched) {
            var pushQuery = new Parse.Query(Parse.Installation);
            console.log('========================================');
            console.log(userFetched);
            console.log('========================================');
            pushQuery.equalTo("username", userFetched.get('username'));
            Parse.Push.send({
              where: pushQuery,
              data: {
                alert: "You got a friend request from " + user.get('username'),
                sound: "default"
              }
            },{
              success: function(){
                response.success({
                  'message': 'SUCCESS',
                  'result': result
                })
              },
              error: function (error) {
                response.success({
                  'message': 'ERROR',
                  'result' : error.message
                })
              }
            }, { useMasterKey: true });
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
    response.success({
      'message': 'ERROR',
      'result': 'User cannot request himself'
    })
  }
});


//TODO: Optimize Accept Friend Function

Parse.Cloud.define('acceptFriend', function(request, response) {
  var user = request.user;
  var requestObject = new Parse.Object('FriendRequest');
  requestObject.id = request.params.requestId;
  requestObject.fetch().then(
    function(requestObjectFetched) {
      requestObjectFetched.set('isAccepted', true);
      var requestUser = new Parse.User();
      requestUser.id = requestObjectFetched.get('requestedBy').id;
      requestObjectFetched.save().then(
        function(requestSaved) {
          var friendQuery = new Parse.Query('Friends');
          friendQuery.equalTo('user', user);
          friendQuery.first({sessionToken: user.getSessionToken()}).then(
            function(friend) {
              console.log('=====================================');
              console.log(friend);
              if(friend != undefined) {
                friend.addUnique('friends', requestUser);
                friend.save().then(
                  function(result) {
                    var friendQuery2 = new Parse.Query('Friends');
                    friendQuery2.equalTo('user', requestUser);
                    friendQuery2.first({sessionToken: user.getSessionToken()}).then(
                      function(friend2){
                        console.log('===================================');
                        console.log(friend2)
                        if(friend2 != undefined) {
                          friend2.addUnique('friends', user);
                          friend2.save().then(
                            function(result2) {
                              response.success({
                                'message': 'SUCCESS',
                                'result1': result,
                                'result2': result2
                              });
                            }
                          );
                        } else {
                          var newFriendObject = new Parse.Object('Friend');
                          newFriendObject.set('user', requestUser);
                          newFriendObject.addUnique('friends', user);
                          newFriendObject.save().then(
                            function(result2) {
                              response.success({
                                'message': 'SUCCESS',
                                'result1': result,
                                'result2': result2
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
                  },
                  function(error) {
                    response.success({
                      'message': 'ERROR',
                      'result': error.message
                    });
                  }
                );
              } else {
                var newFriendObject = new Parse.Object('Friend');
                newFriendObject.set('user', user);
                newFriendObject.addUnique('friends', requestUser);
                newFriendObject.save().then(
                  function(result) {
                    var friendQuery2 = new Parse.Query('Friends');
                    friendQuery2.equalTo('user', requestUser);
                    friendQuery2.first({sessionToken: user.getSessionToken()}).then(
                      function(friend2 ){
                        if(friend2 != undefined) {
                          friend2.addUnique('friends', user);
                          friend2.save().then(
                            function(result2) {
                              response.success({
                                'message': 'SUCCESS',
                                'result1': result,
                                'result2': result2
                              });
                            }
                          );
                        } else {
                          var newFriendObject2 = new Parse.Object('Friend');
                          newFriendObject2.set('user', requestUser);
                          newFriendObject2.addUnique('friends', user);
                          newFriendObject2.save().then(
                            function(result2) {
                              response.success({
                                'message': 'SUCCESS',
                                'result1': result,
                                'result2': result2
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
  /*var user = request.user;
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
   )*/
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
  /*var user = request.user;
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
   });*/
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