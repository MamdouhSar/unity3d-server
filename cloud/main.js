/**
 * Created by appleuser3 on 1/10/17.
 */
require('./story.js');
require('./friends.js');
require('./conversation.js');
require('./message.js');
require('./authentication.js');
require('./search.js');
require('./admin/users.js');

var async = require('async');

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
  var user = request.object;
  var toLowerCase = function(w) { return w.toLowerCase(); };
  if (Parse.FacebookUtils.isLinked(user)) {
    Parse.Cloud.httpRequest({
      url:'https://graph.facebook.com/me?fields=email,name&access_token='+user.get('authData').facebook.access_token,
      success:function(httpResponse){
        user.setUsername(httpResponse.data.name);
        user.setEmail(httpResponse.data.email);
        user.set('usernameLower', httpResponse.data.name.trim().toLowerCase());
        response.success();
      },
      error:function(httpResponse){
        console.error(httpResponse);
      }
    });
  } else {
    response.success();
  }
});

Parse.Cloud.afterSave('Message', function(request, response) {
  var sentTo = request.object.get("sentTo");
  sentTo.fetch().then(
    function(sentToFetched) {
      var sentBy = request.object.get("sentBy");
      sentBy.fetch().then(
        function(sentByFetched) {
          var pushQuery = new Parse.Query(Parse.Installation);
          pushQuery.equalTo('user', sentToFetched);
          Parse.Push.send({
            where: pushQuery,
            data: {
              alert: "You got a message from " + sentByFetched.get('username'),
              sound: "default"
            }
          },{ useMasterKey: true }).then(
            function(result) {
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
        function (error) {
          response.error(error);
        }
      );
    },
    function(error) {
      response.error(error);
    }
  );
});

Parse.Cloud.afterDelete("Post", function(request, response) {
  var messageQuery = new Parse.Query('Message');
  messageQuery.equalTo('conversationId', request.object);
  messageQuery.limit(999999);
  messageQuery.find().then(
    function(result) {
      Parse.Object.destroyAll(result);
    },
    function(error) {
      console.log(error.message);
    }
  );
});