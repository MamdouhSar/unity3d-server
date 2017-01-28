/**
 * Created by mamdouh on 28/01/17.
 */
var async = require('async');

Parse.Cloud.define('getAllUsers', function(request, response) {
  var userQuery = new Parse.Query('User');
  userQuery.find({sessionToken: request.user.getSessionToken()}).then(
    function(result) {
      var resultArray = [];
      async.each(result, function(singleResult, resultCallback) {
        resultArray.push({
          'username': singleResult.get('username'),
          'email': singleResult.get('email'),
          'createdAt': singleResult.get('createdAt')
        });
        resultCallback();
      },
      function(err) {
        if(err) {
          throw err;
        } else {
          response.success(resultArray);
        }
      });
    },
    function(error) {
      console.log(error)
    }
  );
});