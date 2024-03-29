/**
 * Created by mamdouh on 14/01/17.
 */
var async = require('async');

Parse.Cloud.define('addStory', function(request, response) {
    var user = request.user;
    var storyContent = request.params.content;
    var storyObject = new Parse.Object('Story');
    storyObject.set('addedBy', user);
    storyObject.set('content', storyContent);
    storyObject.save().then(
        function(result) {
            response.success({
                'result': 'Story Saved',
                'story': result
            });
        },
        function(error) {
            response.success({
                'result': 'ERROR',
                'message': error.message
            });
        }
    )
});

Parse.Cloud.define('getStories', function(request, response) {
    var user = request.user;
    var userFriends = request.user.get('friends');
    var storyQuery = new Parse.Query('Story');
    storyQuery.containedIn('addBy', userFriends);
    storyQuery.include('addedBy');
    storyQuery.find().then(
        function(result) {
            var stories = [];
            async.each(result, function(singleStory, storyCallback) {
                stories.push({
                    'addedById': singleStory.get('addedBy').id,
                    'addedByName': singleStory.get('addedBy').get('username'),
                    'content': singleStory.get('content')
                });
                storyCallback();
            },
            function(error) {
                if(error) {
                    response.success({
                        'result': 'ERROR',
                        'message': error
                    });
                }
                else {
                    response.success({
                        'result': stories
                    });
                }
            })
        },
        function(error) {
            response.error(error);
        }
    );
});
