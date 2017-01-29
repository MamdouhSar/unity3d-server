/**
 * Created by mamdouh on 15/01/17.
 */

Parse.Cloud.define('saveMessage', function(request, response) {
    var message = {
        'conversationId': request.params.conversationId,
        'sentBy': request.params.sentBy,
        'sentTo': request.params.sentTo,
        'content': request.params.content
    };
    var messageObject = new Parse.Object('Message');
    messageObject.set('conversationId', {'__type':'Pointer', 'className': 'Conversation', 'objectId': message.conversationId});
    messageObject.set('sentBy', {'__type': 'Pointer', 'className':'_User', 'objectId': message.sentBy});
    messageObject.set('sentTo', {'__type': 'Pointer', 'className':'_User', 'objectId': message.sentTo});
    messageObject.set('content', message.content);
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
