/**
 * Created by appleuser3 on 1/10/17.
 */
require('./story.js');
require('./friends.js');
require('./conversation.js');
require('./message.js');
require('./authentication.js');

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    console.log(JSON.stringify(request));
    console.log(JSON.stringify(request.object));
    var user = request.object;
    if (Parse.FacebookUtils.isLinked(user)) {
        Parse.Cloud.httpRequest({
            url:'https://graph.facebook.com/me?fields=email,name&access_token='+user.get('authData').facebook.access_token,
            success:function(httpResponse){
                console.log('===========================================');
                console.log('============FACEBOOK DATA==================');
                console.log(httpResponse.data.name);
                console.log(httpResponse.data.email);
                console.log('===========================================');
                /*user.set('username', httpResponse.data.name);
                user.set('email', httpResponse.data.email);
                user.save({useMasterKey: true}).then(
                    function(result) {
                        console.log('===========================================');
                        console.log('============FACEBOOK DATA==================');
                        console.log(httpResponse.data.name);
                        console.log(httpResponse.data.email);
                        console.log('===========================================');
                        response.success(JSON.stringify(result));
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                        response.success(JSON.stringify(error));
                    }
                );*/
            },
            error:function(httpResponse){
                console.error(httpResponse);
            }
        });
    }
});