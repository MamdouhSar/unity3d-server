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
          pushQuery.equalTo("username",sentToFetched.get('usename'));
          Parse.Push.send({
            where: pushQuery,
            data: {
              alert: "You got a message from " + sentByFetched.get('username'),
              sound: "default"
            }
          },{
            success: function(){
              response.success('true');
            },
            error: function (error) {
              response.error(error);
            }
          });
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