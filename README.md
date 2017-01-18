# unity3d-server
Unity3d Server built with NodeJS using express, parse server and socket.io.

##Usage
Below is an example of how to call a Cloud Code function.

```
IDictionary<string, object> dictionary = new Dictionary<string, object>
{
    { "movie", "The Matrix" }
};

ParseCloud.CallFunctionAsync<float>("averageStars", dictionary).ContinueWith(t => {
  var result = t.Result;
  // result is 4.5
});
```

where `averageStars` is the name of the cloud code function,
and `dictionary` is the object with the needed parameters for that function

### Cloud Functions
Cloud code function available:
* signUp
* logIn
* logOut
* addFriend
* getAllFriends
* addStory
* getStories

####signUp:
The needed parameters are:
* username
* email
* password

If the function was successful, it will return the object of the user created.

####logIn:
The needed parameters are:
* username
* password

If the function is successful, it will change the current user to the one that has logged in.

_To check the current user you can see_ `ParseUser.CurrentUser`

####logOut:
This function does not need parameters, it will change the current user to `null`;
 hence logging the user out. if no user is already logged in, it will return an error.
