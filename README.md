# Unity3D-Server
Unity3d Server built with NodeJS using express, parse server and socket.io.

## User Authentication
Using the Parse's Unity3D SDK for authenticating users.

###SignUp
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
###Login
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
###Logout
```
    ParseUser.LogOut();
```
###Check Current User
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
###Facebook Login
```
    ParseFacebookUtils.LogInAsync(FB.UserId, FB.AccessToken, DateTime.Now);
```
## Cloud Functions
Cloud code functions are considered as the server API to get specific data. It can be used as below:

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

###Friends Cloud Code
there are four functions related to the friends of the user.
####requestFriend
This function takes the user id that is requested to be added as a friend.

```
    IDictionary<string, object> dictionary = new Dictionary<string, object>
    {
        { "id", id }
    };
    
    ParseCloud.CallFunctionAsync<string>("requestFriend", dictionary).ContinueWith(t =>
    {
        var result = t.Result;
        Debug.Log(result);
        /* 
            If the request is successful the result should be as follows:
            {
                'result': 'Request Sent',
                'request': result // Where result is the FriendRequest object
            }
        */
    });
```
####acceptFriend
This function receives the friend request id.
```
    IDictionary<string, object> dictionary = new Dictionary<string, object>
    {
        { "requestId", requestId }
    };
    
    ParseCloud.CallFunctionAsync<string>("acceptFriend", dictionary).ContinueWith(t =>
    {
        var result = t.Result;
        Debug.Log(result);
        /* 
            If the request is successful the result should be as follows:
            {
                'result': 'Friend Added',
                'request': reqSaved, //Request object
                'userAccepted': userFriendSaved, //The User accepted the request
                'userRequested': requestedFriendSaved //The User requested the friendship
            }
        */
    });
```
####getAllFriends
This function does not need any parameters.
```
    ParseCloud.CallFunctionAsync<string>("getAllFriends").ContinueWith(t =>
    {
        var result = t.Result;
        Debug.Log(result);
        /* 
            If the request is successful the result should be as follows:
            {
                'result': responseFriends //Array of users that are friends with the current user
            }
        */
    });
```
####getFriendRequests
This function does not need any parameters.
```
    ParseCloud.CallFunctionAsync<string>("getFriendRequests").ContinueWith(t =>
    {
        var result = t.Result;
        Debug.Log(result);
        /* 
            If the request is successful the result should be as follows:
            {
                'result': friendRequests //array of user not accepted friend requests as FriendRequest Objects
            }
        */
    });
```