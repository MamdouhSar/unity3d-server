/**
 * Created by mamdouh on 15/01/17.
 */

Parse.Cloud.define('initConversation', function(request, response) {
    var conversationQuery1 = new Parse.Query('Conversation');
    conversationQuery1.equalTo('user1', request.user);
    conversationQuery1.equalTo('user2', {'__type':'Pointer', 'className':'User', 'objectId': request.params.toId});
    var conversationQuery2 = new Parse.Query('Conversation');
    conversationQuery2.equalTo('user1', {'__type':'Pointer', 'className':'User', 'objectId': request.params.toId});
    conversationQuery2.equalTo('user1', request.user);
    var mainConversationQuery = Parse.Query.or(conversationQuery1, conversationQuery2);
    mainConversationQuery.find().then(
        function(result) {
            if(result.length == 0) {
                var newConversation = new Parse.Object('Conversation');
                newConversation.set('user1', request.user);
                newConversation.set('user2', {'__type':'Pointer', 'className':'User', 'objectId': request.params.toId});
                newConversation.save().then(
                    function(result) {
                        response.success({
                            'Result': result,
                            'Message': 'Conversation initiated'
                        })
                    },
                    function(error) {
                        response.error(error);
                    }
                );
            } else {
                response.success({
                    'Result': result[0],
                    'ConversationID': result[0].id,
                    'Message': 'Conversation is already initiated'
                })
            }
        },
        function(error) {
            response.error(error);
        }
    );
});
