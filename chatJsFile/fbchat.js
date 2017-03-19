
//<!--fb login to chatroom -->

var imgurl; var fbName; var isLogin = 0; var myfbID;
var colorTable = []; var colorPeople = [];

colorTable[0] = 'orangered'; colorTable[1] = 'blue';
colorTable[2] = 'crimson'; colorTable[3] = 'darkblue';
colorTable[4] = 'darkviolet'; colorTable[5] = 'forestgreen';
colorTable[6] = 'violet'; colorTable[7] = 'SpringGreen';
colorTable[8] = 'saddlebrown'; colorTable[9] = 'slategrey';

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
    var $frmMessage = $('#send-message');
    var $frmMessagephone = $('#send-messagephone');
    var $boxMessage = $('#message');
    var $boxMessagephone = $('#messagephone');
    var $chat = $('#chat');
    var $chatphone = $('#chatphone');
    var oldscrolltop = 0 ;

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

            socket.emit('new user', response.name);
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

    $frmMessage.submit(function(e){
        e.preventDefault();
        if($boxMessage.val() != ''){
            socket.emit('send message', $boxMessage.val().trim());
            $boxMessage.val('');
            $chat.animate({scrollTop: chat.scrollHeight});
        }
    });
    // phonemessage
    $frmMessagephone.submit(function(e){
        e.preventDefault();
        if($boxMessagephone.val() != ''){
            socket.emit('send message', $boxMessagephone.val().trim());
            $boxMessagephone.val('');
            $chatphone.animate({scrollTop: chatphone.scrollHeight});
        }
    });
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

        var sb = '', usercolor = 'blue';

        document.getElementById("users").innerHTML = " " ;
        document.getElementById("usersphone").innerHTML = " " ;

        for(var d = 0; d < data.length; d++) {
            var thisname = data[d];
            // get user color
            if(isInArray(thisname, colorPeople)){
                var x = colorPeople.indexOf(thisname);
                usercolor = colorTable[x%10];
            }
            else{
                colorPeople.push(thisname);
                var x = colorPeople.indexOf(thisname);
                usercolor = colorTable[x%10];
            }
            // append chat users
            var a = document.createElement('a'); 
            a.style.color=usercolor;
            a.appendChild(document.createTextNode(thisname));
            a.appendChild(document.createElement('br'));

            var a2 = document.createElement('a'); 
            a2.style.color=usercolor;
            a2.appendChild(document.createTextNode(thisname));
            a2.appendChild(document.createTextNode(' '));
            // a.addEventListener('click', function(){
            //     var name = $(this).text();
            //     console.log("click chatroome: " + name);
            //     chatClick(name);
            // });

            document.getElementById("users").appendChild(a);
            document.getElementById("usersphone").appendChild(a2);
        }
    });

    socket.on('chat', function(server,msg){
        var now = new Date();
        var datetime = getNow(now);
        oldscroll = chat.scrollHeight;
        oldscroll2 = chatphone.scrollHeight;
        $chat.append("<b><i>" + " 系統訊息 (" + datetime + ") : </b> " + msg + "  </i><br />");
        $chatphone.append("<b><i>" + " 系統訊息 (" + datetime + ") : </b> " + msg + "  </i><br />");

        if(chat.scrollHeight - chat.clientHeight > 0){  //表示超出視窗
            if(chat.scrollTop + chat.clientHeight == oldscroll){  //表示捲軸已在最下面 讓捲軸自己動
                $chat.animate({scrollTop: chat.scrollHeight});
            }
        }
        if(chatphone.scrollHeight - chatphone.clientHeight > 0){  //表示超出視窗
            if(chatphone.scrollTop + chatphone.clientHeight == oldscroll2){  //表示捲軸已在最下面 讓捲軸自己動
                $chatphone.animate({scrollTop: chatphone.scrollHeight});
            }
        }
    });

    socket.on('new message', function(data){
        var msg = data.msg; var name = data.nick; var flag = 0, usercolor = 'blue';
        //<b style="color:forestgreen;"> name </b>
        if(isInArray(name, colorPeople)){
            var x = colorPeople.indexOf(name);
            usercolor = colorTable[x%10];
        }
        else{
            colorPeople.push(name);
            var x = colorPeople.indexOf(name);
            usercolor = colorTable[x%10];
        }

        oldscroll = chat.scrollHeight;
        oldscroll2 = chatphone.scrollHeight;
        $chat.append("<b style='color:" + usercolor + ";'>" + name + "</b> : " + msg + "<br />");
        $chatphone.append("<b style='color:" + usercolor + ";'>" + name + "</b> : " + msg + "<br />");
        if(chat.scrollHeight - chat.clientHeight > 0){  //表示超出視窗
            if(chat.scrollTop + chat.clientHeight == oldscroll){  //表示捲軸已在最下面 讓捲軸自己動
                $chat.animate({scrollTop: chat.scrollHeight});
            }
        }
        if(chatphone.scrollHeight - chatphone.clientHeight > 0){  //表示超出視窗
            if(chatphone.scrollTop + chatphone.clientHeight == oldscroll2){  //表示捲軸已在最下面 讓捲軸自己動
                $chatphone.animate({scrollTop: chatphone.scrollHeight});
            }
        }
    });
});
