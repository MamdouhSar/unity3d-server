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
    
    //Other fields can be set just like with ParseObject
    user["phone"] = "415-392-0202";
    
    Task signUpTask = user.SignUpAsync();
```
###Login
```
    ParseUser.LogInAsync("myname", "mypass").ContinueWith(t =>
    {
        if (t.IsFaulted || t.IsCanceled)
        {
            //The login failed. Check the error to see why.
        }
        else
        {
            //Login was successful.
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
        //Do stuff with the user
    }
    else
    {
        //Show the signup or login screen
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
        //Result is 4.5
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
                'request': result //Where result is the FriendRequest object
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
                'result': friendRequests //Array of user not accepted friend requests as FriendRequest Objects
            }
        */
    });
```
###Story Cloud Code
There are two functions related to the stories of the user.
####addStory
This function receives the content of the story as a parameter.
```
    IDictionary<string, object> dictionary = new Dictionary<string, object>
    {
        { "content", content }
    };
    
    ParseCloud.CallFunctionAsync<string>("addStory", dictionary).ContinueWith(t =>
    {
        var result = t.Result;
        Debug.Log(result);
        /* 
            If the request is successful the result should be as follows:
            {
                'result': 'Story Saved',
                'story': result //Story Object of the saved story
            }
        */
    });
```
####getStories
This function does not need any parameters.
```
    ParseCloud.CallFunctionAsync<string>("getStories").ContinueWith(t =>
    {
        var result = t.Result;
        Debug.Log(result);
        /* 
            If the request is successful the result should be as follows:
            {
                'result': stories //Array of objects with the ID, the content, and the username of the user that added that story
            }
        */
    });
```
###Conversation Cloud Code
There are one function related to the conversation of the user.
####initConversation
This function is used to initialized the conversation between two users. It needs the id of the user the message is sent to.
```
    IDictionary<string, object> dictionary = new Dictionary<string, object>
    {
        { "toId", toId }
    };
    
    ParseCloud.CallFunctionAsync<string>("initConversation", dictionary).ContinueWith(t =>
    {
        var result = t.Result;
        Debug.Log(result);
        /* 
            If the request is successful the result should be as follows:
            {
                'conversation': result,//The object of the conversation
                'conversationId': result.id,//The id of the conversation
                'result': 'Conversation initiated' OR 'Conversation is already initiated'
            }
        */
    });
```
This function is used to send the conversation ID to the socket.io so that it initializes a private web socket between the two users.

#####TODO:
* Push Notification API
* Socket.IO Test