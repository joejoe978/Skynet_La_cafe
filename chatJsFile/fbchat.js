
//<!--fb login to chatroom -->

var imgurl; var fbName; var isLogin = 0; var myfbID; 
// var colorTable = []; var colorPeople = [];
var fbUsers = []; fbImgID = [];

window.fbAsyncInit = function() {
    FB.init({
    appId      : '1660216214218383',
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
    var socket = io.connect();
    var oldscrolltop = 0 ;
    var $chat = $('#chat');

    // first time in web, get all member's list
    socket.emit('first time', 1);

    socket.on('Update chat members', function(data){
        
        document.getElementById("users").innerHTML = " " ;
        for(var d = 0; d < data.length; d++) {
            var thisname = data[d];
            fbUsers[d] = data[d];
        }
        var newNode = document.createElement('div');
        newNode.className = 'user';
        newNode.innerHTML = thisname;
        document.getElementById('users').appendChild(newNode); 
    });

    $('#fbLogin').click(function(e){
        e.preventDefault();
        Login();
        //checkLoginState();
    });

    $('#fbLogin2').click(function(e){
        e.preventDefault();
        Login();
        $('#openSkyModal').modal('hide');
        //checkLoginState();
    });

    $('#fbLogout').click(function(e){
        e.preventDefault();
        //console.log("gi");
        Logout();
        //socket.emit('new user', $nickBox.val() );
    });


    // New chatbox function ****************************************************
    $('#myInput').keypress(function(e){
        if (e.keyCode == 13 && e.shiftKey){
            e.preventDefault(); 
            var msg = $(this).val() + '\n';
            $(this).val(msg);
        }
        else if (e.keyCode == 13) {
            e.preventDefault();
            var msg = $(this).val();
            msg = msg.replaceAll('\n', '<br>');
            $(this).val('');
            if(msg){
                // $('<div class="msg_b">'+msg+'</div>').insertBefore('.msg_push');
                // $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
                socket.emit('send message', msg);  // socket send
            }
        }
    });

    String.prototype.replaceAll = function (find, replace) {
        var result = this;
        do {
            var split = result.split(find);
            result = split.join(replace);
        } while (split.length > 1);
        return result;
    };

    // ****************************************************************************

    function statusChangeCallback(response) {
        console.log(response);

        if (response.status === 'connected') {
            testAPI();
        }
        else if (response.status === 'not_authorized') {
            console.log("B");
        }
        else {
            console.log("C");
        }
    }

    function testAPI() {
        FB.api('/me?fields=name,email,gender', function(response) {
            console.log(JSON.stringify(response));
            fbName = response.name;
            myfbID = response.id;
            imgurl = 'http://graph.facebook.com/' + response.id + '/picture?width=75&height=75';

            // create your image at top row
            var a = document.createElement('a'); a.id = response.name; a.href = '#map';
            var img = document.createElement('img'); img.src = imgurl; img.className = 'img-circle';
            img.title = '查看自己位置'; img.id = 'myphoto'; 
            img.addEventListener('click', function() {
                console.log("click me");
                clickme();
            });
            a.appendChild(img); document.getElementById("fbImg").appendChild(a);
            var left = document.getElementById("fbImg");
            left.appendChild(document.createTextNode(' '));

            // create name at navbar
            imgurl = 'http://graph.facebook.com/' + response.id + '/picture/?type=square';

            var a = document.createElement('a');
            a.appendChild(document.createTextNode(response.name));
            document.getElementById("username").appendChild(a);
            var img = document.createElement('img'); img.src = imgurl; img.className = 'img-circle';
            document.getElementById("topImg").appendChild(img);
            document.getElementById("fbLogin").remove();

            // Add all users name and ID ******************************************************
            var userNameID = [2];
            userNameID[0] = response.name;
            userNameID[1] = response.id;
            socket.emit('new user', userNameID);

            // ********************************************************************************

            getPlaceNo(); // update placeNo
            isLogin = 1;

            // create Kylo Ren
            var a = document.createElement('a');
            a.href = '#map';
            var kyloUrl = '/chatJsFile/kyloren2.jpg';
            var img = document.createElement('img'); img.src = kyloUrl; img.className = 'img-circle';
            img.title = "使用原力查看所有人位置"; img.id ='Force'; img.style.marginLeft="15px";
            img.addEventListener('click', function() {
                Force();
            });
            img.addEventListener('mouseover', function() {
                mouseOver();
            });
            img.addEventListener('mouseout', function() {
                mouseOut();
            });
            a.appendChild(img);
            document.getElementById("fbImg").appendChild(a);
        });
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

        // fix iOS Chrome
        // if( navigator.userAgent.match('CriOS') )
        //     window.open('https://www.facebook.com/dialog/oauth?client_id='+appID+'&redirect_uri='+ document.location.href +'&scope=email,public_profile', '', null);
        // else
        //     FB.login(null, {scope: 'email,public_profile'});

        FB.login(function(response) {
            if (response.authResponse){
                testAPI();
                //isLogin = 1;
            }
            else {
                console.log('User cancelled login or did not fully authorize.');
            }
        },{scope: 'email,user_photos,user_videos'});
    }

    function Logout(){
        FB.logout(function(){document.location.reload();});
    }


    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));


    function getZeroTime(data){
        if(data < 10){
            data = '0' + data ;
        }
        return data;
    }

    function getNow(nowtime){
        hours = nowtime.getHours(); hours = getZeroTime(hours);
        min = nowtime.getMinutes() ; min = getZeroTime(min);
        x = hours + ':' + min ;
        return x ;
    }
 
    function chatClick(name){
        //console.log(name);
        var chatmarker, chatLoc = [];

        if(name == fbName){
            chatmarker = userMarker;
            chatLoc[0] = mypos[0];
            chatLoc[1] = mypos[1];
        }
        else{
            for(var x in markersName){
                if(markersName[x] == name){
                    chatmarker = allMarkers[x];
                }
            }
            for(var x in allPeopleLoc){
                if(allPeopleLoc[x][0] == name){
                    chatLoc[0] = allPeopleLoc[x][1];
                    chatLoc[1] = allPeopleLoc[x][2];
                }
            }
        }

        map.panTo(new google.maps.LatLng(
            chatLoc[0],
            chatLoc[1]
        ));
        map.setZoom(15);
        chatmarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ chatmarker.setAnimation(null); }, 1000);
    }

    socket.on('usernames', function(data){
        document.getElementById("users").innerHTML = " " ;

        for(var d = 0; d < data.length; d++) {
            var thisname = data[d];
            fbUsers[d] = data[d];

            // New append chat users *********************************************************
            var newNode = document.createElement('div');
            newNode.className = 'user';
            newNode.innerHTML = thisname;
            document.getElementById('users').appendChild(newNode); 
            // *******************************************************************************
        }
    });

    // Update IDs *************************************************
    socket.on('userIDs', function(data){
        for(var d = 0; d < data.length; d++) {
            fbImgID[d] = data[d];
            console.log("fb ID:" + fbImgID[d]);
        }
    });
    // ************************************************************

    socket.on('chat', function(server,msg){   // XXX已連線
        var now = new Date();
        var datetime = getNow(now);
        
        // New msgbox ****************************************************************************
        oldscroll = chat.scrollHeight;

        var newNode = document.createElement('b');
        newNode.innerHTML = '<br>' + datetime + ' ' + msg + '<br><br>' ;
        document.getElementById('chat').appendChild(newNode); 
    
        // add image

        if(chat.scrollHeight - chat.clientHeight > 0){  //表示超出視窗
            if(chat.scrollTop + chat.clientHeight == oldscroll){  //表示捲軸已在最下面 讓捲軸自己動
                $chat.animate({scrollTop: chat.scrollHeight});
            }
        }
        // ****************************************************************************************
    });
    
    socket.on('new message', function(data){
        var msg = data.msg; var name = data.nick; var flag = 0;
        
        // New msgbox ****************************************************************************
        oldscroll = chat.scrollHeight;

        if(name == null){
            // please log in.
            $("#openSkyModal").modal();
        }
        else if(name == fbName){
            var newNode = document.createElement('div');
            newNode.className = 'msg_b';
            newNode.innerHTML = msg;
            document.getElementById('chat').appendChild(newNode);     
            $chat.animate({scrollTop: chat.scrollHeight});
        }
        else if(name != fbName){ 
            // add msg_a:before
            var userID;

            for(var i=0;i<fbUsers.length;i++){
                if(fbUsers[i] == name){
                    userID = fbImgID[i];
                }
            }

            var newNode = document.createElement('div');
            newNode.className = 'msg_a';
            newNode.innerHTML = msg;
            document.getElementById('chat').appendChild(newNode);

            // $chat.append('<style>.msg_a::before{background-image:url('+url+')}</style>');  最好的解
        }
        
        if(chat.scrollHeight - chat.clientHeight > 0){  //表示超出視窗
            if(chat.scrollTop + chat.clientHeight == oldscroll){  //表示捲軸已在最下面 讓捲軸自己動
                $chat.animate({scrollTop: chat.scrollHeight});
            }
        }
        // ****************************************************************************************
    });
});
