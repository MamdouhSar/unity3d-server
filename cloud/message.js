/**
 * Created by mamdouh on 15/01/17.
 */
var async = require('async');

Parse.Cloud.define('saveMessage', function(request, response) {
    var message = {
        'conversationId': request.params.conversationId,
        'sentBy': request.params.sentBy,
        'sentTo': request.params.sentTo,
        'content': {
            'message': request.params.content
        }
    };
    var messageObject = new Parse.Object('Message');
    messageObject.set('conversationId', {'__type':'Pointer', 'className': 'Conversation', 'objectId': message.conversationId});
    messageObject.set('sentBy', {'__type': 'Pointer', 'className':'_User', 'objectId': message.sentBy});
    messageObject.set('sentTo', {'__type': 'Pointer', 'className':'_User', 'objectId': message.sentTo});
    messageObject.set('content', message.content);
    messageObject.set('read', false);
    messageObject.save().then(
        function(result) {
            response.success({
                'result': 'Message Saved',
                'message': result
            });
        },
        function(error) {
            response.success({
                'result': 'ERROR',
                'message': error.message
            });
        }
    );
});

Parse.Cloud.define('messagesRead', function(request, response) {
  var messageObject = new Parse.Object('Message');
  var conversationId = request.params.conversationId;
  var userId = request.params.userId;
  messageObject.equalTo('conversationId', {'__type':'Pointer', 'className':'Conversation', 'objectId': conversationId});
  messageObject.equalTo('read', false);
  messageObject.equalTo('sentTo', {'__type':'Pointer', 'className':'_User', 'objectId': userId});
  messageObject.find().then(
    function(unreadMessages) {
      async.each(unreadMessages, function(singleMessage, messageCallback) {
        singleMessage.set('read',true);
        singleMessage.save().then(
          function() {
            messageCallback();
          },
          function(error) {
            response.success({
              'message':'ERROR',
              'result': error.message
            });
          }
        );
      },
      function(error) {
        if(error) {
          response.success({
            'message':'ERROR',
            'result': error
          });
        } else {
          response.success({
            'message': 'SUCCESS'
          })
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
