/**
 * Created by mamdouh on 05/02/17.
 */
Parse.Cloud.define('testPush', function(request, response) {
  Parse.Push.send({
    where: {
      "deviceType": { "$in": [ "ios",  "android"  ]  }
    },
    data: {
      "title": "Ant-man",
      "alert": "This is awesome. It is awesome."
    }
  }, { useMasterKey: true });
});