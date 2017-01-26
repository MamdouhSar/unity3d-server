/**
 * Created by mamdouh on 26/01/17.
 */
var async = require('async');

Parse.Cloud.define('searchUser', function(request, response) {
    var searchTerm = request.params.searchTerm;
    var usernameQuery = new Parse.Query(Parse.User());
    usernameQuery.startsWith('username', searchTerm);
    var emailQuery = new Parse.Query(Parse.User());
    emailQuery.startsWith('email', searchTerm);
    var usernameLowerQuery = new Parse.Query(Parse.User());
    usernameLowerQuery.startsWith('usernameLower', searchTerm);
    var mainQuery = Parse.Query.or(usernameQuery, emailQuery, usernameLowerQuery);
    mainQuery.find().then(
        function(results) {
            var searchResult = []
            async.each(results, function(singleResult, resultCallback) {
                searchResult.push({
                    'id': singleResult.id,
                    'username': singleResult.get('username'),
                    'email': singleResult.get('email')
                });
                resultCallback();
            },
            function(err) {
                if(err) {
                    response.success({
                        'message': 'ERROR',
                        'result': err
                    });
                } else {
                    response.success(searchResult);
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