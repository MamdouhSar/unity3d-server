/**
 * Created by mamdouh on 15/01/17.
 */
var async = require('async');

Parse.Cloud.define('initConversation', function(request, response) {
    var conversationQuery1 = new Parse.Query('Conversation');
    conversationQuery1.equalTo('user1', request.user);
    conversationQuery1.equalTo('user2', {'__type':'Pointer', 'className':'_User', 'objectId': request.params.toId});
    var conversationQuery2 = new Parse.Query('Conversation');
    conversationQuery2.equalTo('user1', {'__type':'Pointer', 'className':'_User', 'objectId': request.params.toId});
    conversationQuery2.equalTo('user2', request.user);
    var mainConversationQuery = Parse.Query.or(conversationQuery1, conversationQuery2);
    mainConversationQuery.find().then(
        function(result) {
            if(result.length == 0) {
                var newConversation = new Parse.Object('Conversation');
                newConversation.set('user1', request.user);
                newConversation.set('user2', {'__type':'Pointer', 'className':'_User', 'objectId': request.params.toId});
                newConversation.save().then(
                    function(result) {
                        response.success({
                            'conversation': result,
                            'conversationId': result.id,
                            'result': 'Conversation initiated'
                        })
                    },
                    function(error) {
                        response.success({
                            'result':'ERROR',
                            'message': error.message
                        });
                    }
                );
            } else {
                response.success({
                    'conversation': result[0],
                    'conversationId': result[0].id,
                    'result': 'Conversation is already initiated'
                })
            }
        },
        function(error) {
            response.error({
                'result':'ERROR',
                'message': error.message
            });
        }
    );
});

Parse.Cloud.define('getConversations', function(request, response) {
  var user = request.user;
  var conversationQuery1 = new Parse.Query('Conversation');
  conversationQuery1.equalTo('user1', request.user);
  var conversationQuery2 = new Parse.Query('Conversation');
  conversationQuery2.equalTo('user2', request.user);
  var mainQuery = new Parse.Query.or(conversationQuery1, conversationQuery2);
  mainQuery.include('user1');
  mainQuery.include('user2');
  mainQuery.ascending('createdAt');
  mainQuery.find().then(
    function(conversations) {
      var responseArray = [];
      async.each(conversations, function(singleConversation, conversationCallback) {
        var messageQuery = new Parse.Query('Message');
        messageQuery.equalTo('conversationId', singleConversation);
        messageQuery.include('sendBy');
        messageQuery.include('sentTo');
        messageQuery.descending('createdAt');
        messageQuery.limit(20);
        messageQuery.find().then(
          function(messages) {
            var messageArray = [];
            async.each(messages, function(singleMessage, messageCallback) {
              messageArray.push({
                  'id': singleMessage.id,
                  'sentBy': singleMessage.get('sentBy'),
                  'sentTo': singleMessage.get('sentBy'),
                  'content': singleMessage.get('content').message,
                  'isObject': singleMessage.get('isMessage')
              });
              messageCallback();
            },
            function(error) {
              if(error) {
                response.success({
                  'message': 'ERROR',
                  'result': error
                });
              } else {
                responseArray.push({
                    'conversation': {
                      'id': singleConversation.id,
                      'with': singleConversation.get('user1').id == user.id ? singleConversation.get('user2') : singleConversation.get('user1')
                    },
                    'messages': messageArray
                  });
                conversationCallback();
              }
            });
          },
          function(error) {
            response.success({
              'message': 'ERROR',
              'result': error
            });
          }
        );
      },
      function(error) {
        if(error) {
          response.success({
            'message': 'ERROR',
            'result': error
          });
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