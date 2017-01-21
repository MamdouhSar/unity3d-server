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

### User Authentication
Using the Parse's Unity3D SDK for authenticating users.

####SignUp
```
var user = new ParseUser()
{
    Username = "my name",
    Password = "my pass",
    Email = "email@example.com"
};

// other fields can be set just like with ParseObject
user["phone"] = "415-392-0202";

Task signUpTask = user.SignUpAsync();
```
####Login
```
ParseUser.LogInAsync("myname", "mypass").ContinueWith(t =>
{
    if (t.IsFaulted || t.IsCanceled)
    {
        // The login failed. Check the error to see why.
    }
    else
    {
        // Login was successful.
    }
})
```
####Logout
```
ParseUser.LogOut();
```
####Check Current User
```
if (ParseUser.CurrentUser != null)
{
    // do stuff with the user
}
else
{
    // show the signup or login screen
}
```

### Cloud Functions
Cloud code function available:
* requestFriend
* acceptFriend
* getAllFriends
* addStory
* getStories
* initConversation
* saveMessage

