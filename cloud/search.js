/**
* Created by mamdouh on 26/01/17.
*/
var async = require('async');

Parse.Cloud.define('searchUser', function(request, response) {
    var user = request.user;
    var searchTerm = request.params.searchTerm;
    var emailQuery = new Parse.Query('User');
    emailQuery.startsWith('email', searchTerm);
    var usernameLowerQuery = new Parse.Query('usernameLower');
    usernameLowerQuery.startsWith('usernameLower', searchTerm.toLowerCase());
    var mainQuery = Parse.Query.or(emailQuery, usernameLowerQuery);
    mainQuery.find({sessionToken: user.getSessionToken()})
        .then(function(foundUsers) {
          response.success({
            'message':'SUCCESS',
            'result': foundUsers
          });
          /*var responseArray = [];
            async.each(foundUsers, function(singleUser, userCallback) {

            },
            function(error) {
              if(error) {
                response.success({
                  'message': 'ERROR',
                  'result': error
                });
              } else {

              }
            });*/
        },
        function(error) {
            response.success({
                'message': 'ERROR',
                'result': error.message
            });
        });
});