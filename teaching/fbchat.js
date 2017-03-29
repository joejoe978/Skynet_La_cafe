//<!--fb login to chatroom -->

var imgurl; var fbName; var isLogin = 0;

window.fbAsyncInit = function() {
    FB.init({
    appId      : '972723182800586',
    xfbml      : true,
    version    : 'v2.5',
    status     : true, // check login status
    cookie     : true // enable cookies to allow the server to access the session
    }); 
      // FB.getLoginStatus(function(response) {
      //   statusChangeCallback(response);
      // });
};

$(function(){
    $('#fbLogin').click(function(e){
        e.preventDefault();
        Login();
        //socket.emit('new user', $nickBox.val() );
    });

    $('#fbLogout').click(function(e){
        e.preventDefault();
        //console.log("gi");
        Logout();
        //socket.emit('new user', $nickBox.val() );
    });            

    function statusChangeCallback(response) {
        console.log(response);
    
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            //testAPI();
        }
        else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
        } 
        else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
        }
    }

    function checkLoginState() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }

    function Login(){
        // FB.getLoginStatus(function(response) {
        //     statusChangeCallback(response);
        // });
        FB.login(function(response) {
            if (response.authResponse){
                testAPI();
                isLogin = 1;
            } 
            else {
                console.log('User cancelled login or did not fully authorize.');
            }
        },{scope: 'email,user_photos,user_videos'});
    }

    function Logout(){
        FB.logout(function(){document.location.reload();});
    }

    function testAPI() {
        FB.api('/me?fields=name,email,gender', function(response) {
            console.log(JSON.stringify(response));
            imgurl = 'http://graph.facebook.com/' + response.id + '/picture/?type=small';
            var str = "<img src='"+ imgurl +"'/>";
            document.getElementById("fbImg").innerHTML=str;
            //str = "<p style=\"color:white; text-align:center;\">" + response.name + "</p>";
            document.getElementById("username").innerHTML=response.name;
            document.getElementById("fbLogin").innerHTML=' ';
            fbName = response.name;
        });
    }

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
});
