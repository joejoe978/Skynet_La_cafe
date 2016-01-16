function mouseOver() {
    document.getElementById("Force").src = '/chatJsFile/kyloren3.jpg';
}

function mouseOut() {
    document.getElementById("Force").src = '/chatJsFile/kyloren2.jpg';
}

// set my marker's window
function setWindow(marker){
    var myfbLink = "https://www.facebook.com/" + myfbID ;
    var info = '<a href=' + myfbLink + ' target="_blank">'+ fbName + '</a>' ;
    var infowindow = new google.maps.InfoWindow({
        content: info
    });

    marker.addListener('click',function(){
        closeWindows();
        infowindow.open(map, marker);
        existWindows.push(infowindow);
    });
}

function closeWindows() {
  for (var i=0;i<existWindows.length;i++) {
     existWindows[i].close();
     existWindows.pop();
  }
}

function locError(error) {
    // the current position could not be located
    alert("The current position could not be found!");
}

function displayAndWatch(position) {
    // set current position
    setCurrentPosition(position);
    // watch position
    watchCurrentPosition();
}

function watchCurrentPosition() {
    var positionTimer = navigator.geolocation.watchPosition(
        function (position) {
            setMarkerPosition(userMarker,position);
        });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('googleMap'), {
        center: {lat: 25.047908, lng: 121.517315},
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }

    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
       if (place.geometry.viewport) {
         // Only geocodes have viewport.
         bounds.union(place.geometry.viewport);
       } else {
         bounds.extend(place.geometry.location);
       }
    });
     map.fitBounds(bounds);
    });
}

// ajax1
function setCurrentPosition(pos) { 
    // create my marker
    userMarker = new google.maps.Marker({
        map: map,
        icon:{
            url:imgurl,
            size:new google.maps.Size(60,60),
        },
        position: new google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
        ),
        optimized:false,
        title: fbName,
    });
    mypos[0] = pos.coords.latitude; mypos[1] = pos.coords.longitude;
    
    // give id
    var myoverlay = new google.maps.OverlayView();
    myoverlay.draw = function () {
        this.getPanes().markerLayer.id='markerLayer';
    };
    myoverlay.setMap(map);

    setWindow(userMarker);
    map.panTo(new google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
        ));
    map.setZoom(15);  

    if(insertName==0){  // only do at first time
        insertName = 1;
        $.post("/getuserMap",{
        name:fbName, lat:pos.coords.latitude, lng:pos.coords.longitude, fbID:myfbID},
        function(data,status){
            console.log("Ajax1: \n Data: " + data + "\nStatus: " + status + "\n Position: " +
            pos.coords.latitude + ' ' + pos.coords.longitude + ' ' + myfbID);
            // $("#doorModal").modal('hide');
        });
    }
}

// ajax2
function setMarkerPosition(marker, position) { 
    marker.setPosition(
        new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude)
    );

    mypos[0] = position.coords.latitude; mypos[1] = position.coords.longitude;

    $.post("/updateuserMap",{
        name:fbName, lat:position.coords.latitude, lng:position.coords.longitude},
        function(data,status){
            console.log("Ajax2: \n Data: " + data + "\nStatus: " + status + "\n Position: " +
            position.coords.latitude + ' ' + position.coords.longitude);
        });
}

// get all member's position part1
function updateAll(){
    $.get("/updateAll", function(response){
        for(var x in response){
            if(response[x][0] != fbName){
                setOtherPosition(response[x]);
            }
        }
        var tmp = []; tmp[0] = fbName; tmp[1] = mypos[0]; tmp[2] = mypos[1];
        
        if(forceAwaken == 0){
            //console.log("First push loc: " + tmp[0]);
            allPeopleLoc.push(tmp);
            forceAwaken = 1;
        }
        else{
            for(var x in allPeopleLoc){
                if(allPeopleLoc[x][0] == tmp[0]){  //this people already in loc array
                    allPeopleLoc[x][1] = tmp[1]; 
                    allPeopleLoc[x][2] = tmp[2]; 
                }
            }    
        }
        var myTime = setTimeout(function(){ 
            $("#doorModal").modal('hide'); 
            clearTimeout(myTime);
        }, 3000);
    });
}

// get all member's position part2
function setOtherPosition(people){ 
    var loc = []; loc[0] = people[0]; loc[1] = people[1]; loc[2] = people[2]; 
    var updateFlag = 0; var myIndex;
 
    if(forceAwaken == 0){
        //console.log("First push loc: " + loc[0]);
        allPeopleLoc.push(loc);
        myIndex = allPeopleLoc.indexOf(loc);
    }
    else{
        var flag = 0;
        for(var x in allPeopleLoc){
            if(allPeopleLoc[x][0] == loc[0]){  //this people already in loc array
                flag = 1; 
                allPeopleLoc[x][1] = loc[1]; 
                allPeopleLoc[x][2] = loc[2];
                myIndex = x;
            }
        }
        if(flag == 0){  // new people 
            allPeopleLoc.push(loc);
            myIndex = allPeopleLoc.indexOf(loc);
        }
    }
    
    // If already in marker array, update !
    for(var x in markersName){
        if(markersName[x] == people[0]){ 
            updateFlag = 1;
            allMarkers[x].setPosition(
                new google.maps.LatLng(
                    people[1],
                    people[2])
            );
            //return;
        }
    }

    // people is not in marker array yet, set it!
    if(updateFlag == 0){
        console.log('Set ' + people[0] + '\'s position'); //lat: people[1], lng:people[2], id:people[3]
        image = {
            url: 'https://graph.facebook.com/' + people[3] + '/picture/?type=square',
        };
        var newmarker = new google.maps.Marker({
            map: map,
            icon: image,
            position: new google.maps.LatLng(
                people[1],
                people[2]
            ),
            title: people[0],
            optimized:false,
        });
        
        // give id
        var myoverlay = new google.maps.OverlayView();
        myoverlay.draw = function () {
            this.getPanes().markerLayer.id='markerLayer';
        };
        myoverlay.setMap(map);
        
        // create info window
        var fbLink = "https://www.facebook.com/" + people[3] ;
        var info = '<a href=' + fbLink + ' target="_blank">'+ people[0] + '</a>' ;

        var infowindow = new google.maps.InfoWindow({
            content: info
        });
        newmarker.addListener('click',function(){
            closeWindows();
            infowindow.open(map, newmarker);
            existWindows.push(infowindow);
        });

        // store name and markers in array
        markersName.push(people[0]);
        allMarkers.push(newmarker);

        // create all img at top row
        var a = document.createElement('a');
        a.href = '#map';
        var userImgUrl = 'https://graph.facebook.com/' + people[3] + '/picture?width=75&height=75';
        var img = document.createElement('img'); img.src = userImgUrl; img.className = 'img-circle';
        img.id = people[0]; a.appendChild(img); img.title = people[0]; img.style.marginLeft="15px";
        document.getElementById("fbImg").appendChild(a); 
        document.getElementById(people[0]).addEventListener('click', function () {
            console.log("map to " + people[0]);
            map.panTo(new google.maps.LatLng(
                allPeopleLoc[myIndex][1],
                allPeopleLoc[myIndex][2]
            ));
            map.setZoom(15);  
            closeWindows();
            infowindow.open(map,newmarker); 
            existWindows.push(infowindow);

        }, false);   
    }
    else{
        
    }
    //$("#doorModal").modal('hide');
}

// when user click myself 
function clickme(){
    console.log("map to my position");
    map.panTo(new google.maps.LatLng(
        mypos[0],
        mypos[1]
    ));
    map.setZoom(15);
    
    var myfbLink = "https://www.facebook.com/" + myfbID ;
    var info = '<a href=' + myfbLink + ' target="_blank">'+ fbName + '</a>' ;

    var infowindow = new google.maps.InfoWindow({
        content: info
    });
    closeWindows();
    infowindow.open(map,userMarker); 
    existWindows.push(infowindow);
}

// Average location of every one,  do it
function Force(){
    var bounds = new google.maps.LatLngBounds();
    var loc;

    console.log("Use the Force to look every one");
    
    for(var x in allPeopleLoc){
        loc = new google.maps.LatLng(allPeopleLoc[x][1],allPeopleLoc[x][2]);
        bounds.extend(loc);    
    }
    closeWindows();
    map.fitBounds(bounds);
    map.panToBounds(bounds);    
}

// ask database last place number
function getPlaceNo(){
    $.post("/getPlaceNo",{name: fbName},
        function(data){
            console.log("Last place no: " + data);
            //placeNo = data[0];
            originalNo = data[0];
    });    
}

// set all places built by me before or by others
function updatePlace(){
    var placeLoc, placeName, worldName, mydel;
    document.getElementById.innerHTML= "";

    $.post("/updateAllPlace",{name: fbName},
        function(data){
            if(data != 'None'){
                for(var x in data){
                    for(var y in data[x].allPlace){
                        worldName = data[x].name + data[x].allPlace[y].no;
                        mydel = data[x].allPlace[y].del;
                        // console.log("World name: " + worldPlaceName + " \n World object: " + worldMarkers);
                        // console.log("Local name: " + localPlaceName + " \n Local object: " + placeMarkers);
                        // console.log("Delete name : " + deletePlaceName);

                        if(isInArray(worldName, worldPlaceName) || isInArray(worldName, localPlaceName)){  //This place has been stored
                            if(mydel == 1){ // This place has been deleted
                                if(isInArray(worldName, deletePlaceName) == false){
                                    console.log(worldName + " has been deleted but not in delete array");
                                    var index = worldPlaceName.indexOf(worldName);
                                    console.log(worldName + "\'s index in world is : " + index);
                                    worldMarkers[index].setMap(null); // hide it 
                                    deletePlaceName.push(worldName);
                                    var exist = document.getElementById(worldName);
                                    if(exist != null){
                                        document.getElementById(worldName).remove(); 
                                    }
                                    else{
                                        console.log("this place is null");
                                    }
                                }
                            }
                        }
                        else{ // This place hasn't been stored
                            placeName = data[x].allPlace[y].place ;
                            placeLoc = turnLatLng(data[x].allPlace[y].location);
                            console.log('Now add ' + worldName + " to world array");
                            // worldPlaceName.push(worldName);
                            addNewMarker(data[x].name,data[x].allPlace[y].no,placeName,placeLoc,mydel);
                        }
                    }
                }
            }
    });  
}

// add place markers get from database 
function addNewMarker(username,no,text,location,del){
    var info,icon;
    var id = username + no;  
    worldPlaceName.push(id);
    var index = worldPlaceName.indexOf(id);

    if(username == fbName){
        info =   
        text + '</br></br>' + 
        '<input type="button" onclick="delNewMarker(' + index + ')" value="刪除"></input>' ;
        
        icon = {
            url: '/chatJsFile/clock.png',
            scaledSize: new google.maps.Size(40, 40)
        };
    }    
    else{
        info = text;     
        icon = {
            url: '/chatJsFile/townhouse.png',
            scaledSize: new google.maps.Size(40, 40)
        };
    }

    var infowindow = new google.maps.InfoWindow({
        content : info
    });

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(
            location[0],
            location[1]),
        icon: icon,
        map: map
    });

    marker.addListener('click', function() {
        closeWindows();
        infowindow.open(map, marker);
        existWindows.push(infowindow);
    });
    
    worldMarkers.push(marker);
    
    if(del == 1){
        //var index = worldMarkers.indexOf(marker);
        worldMarkers[index].setMap(null);
        deletePlaceName.push(id);
        console.log("push " + id + " to Delete Array");
        var exist = document.getElementById(id);
        if(exist != null){
            document.getElementById(id).remove(); 
        }
        else{
            console.log("this place is null");
        }
    }
    else{
        var li = document.createElement('li');
        var a =document.createElement('a');
        a.href = '#map'; a.id = id; a.innerHTML = text;
        a.addEventListener('click', function(event) {
            map.panTo(new google.maps.LatLng(
                location[0],
                location[1]
            ));
            map.setZoom(15);
        });
        li.appendChild(a);
        document.getElementById("dropList").appendChild(li); 
    } 
}

// add place marker by me this time
function addMarker(location) {
    if(fbName == null){
        console.log("you are not login! ");
    }
    else{
        var icon = {
            url: '/chatJsFile/coffee.png',
            scaledSize: new google.maps.Size(40, 40)
        };
        var thisNo = placeNo;
        console.log("thisNo: " + thisNo);
        var text = document.getElementById("placeName").value;   
        var infowindow = new google.maps.InfoWindow({
            content: 
            text + '</br></br>' + 
            '<input type="button" onclick="deleteMarker(' + thisNo + ')" value="刪除"></input>' 
        });

        var marker = new google.maps.Marker({
            position: location,
            icon: icon,
            map: map
        });

        marker.addListener('click', function() {
            closeWindows();
            infowindow.open(map, marker);
            existWindows.push(infowindow);
        });
        
        var globalNo = placeNo + originalNo;
        var worldName = fbName + globalNo;

        placeMarkers.push(marker);
        localPlaceName.push(worldName);
        console.log("push " + worldName + " to local place array");
        //worldPlaceName.push(worldName);

        placeNo = placeNo + 1;
        console.log("after add marker by me, now placeNo: "+ placeNo);
        
        var loc = location.toString();
        // console.log("loc: " + loc);
         var myloc = turnLatLng(loc);
        // console.log("myloc: " + myloc);

        $.post("/addPlace",{
            userName:fbName, no:globalNo, placeName: text, location:loc, del:0},
            function(response,status){
                console.log("Response: " + response);
        });

        //<div class="dropdown" id="mapDrop">
        //<ul class="dropdown-menu" id="dropList">
        var li = document.createElement('li');
        var a =document.createElement('a');
        a.href = '#map'; a.id = worldName; a.innerHTML = text;
        a.addEventListener('click', function(event) {
            map.panTo(new google.maps.LatLng(
                myloc[0],
                myloc[1]
            ));
            map.setZoom(15);
        });
        li.appendChild(a);
        document.getElementById("dropList").appendChild(li); 
    }
}

// delete place marker by me this time
function deleteMarker(no) {
    var globalNo = no + originalNo;
    console.log("delete local: " + no + ' , globalname: ' + fbName+globalNo); 
    //console.log("type of no: " + typeof no);
    placeMarkers[no].setMap(null); // hide
    deletePlaceName.push(fbName+globalNo);   
    $.post("/deleteMyPlace",{
        userName:fbName, no:globalNo},
        function(response){
            console.log("Response: " + response);
    });
    var liName = fbName + globalNo;   
    //console.log(document.getElementById(liName));
    document.getElementById(liName).remove();
}

// delete place marker known from database
function delNewMarker(no){
    console.log("del new marker: " + worldPlaceName[no]);
    worldMarkers[no].setMap(null); 
    deletePlaceName.push(worldPlaceName[no]);
    var ans = worldPlaceName[no].match(/[a-zA-Z]+|[0-9]+/g);
    ans = Number(ans);
    //console.log("ans:" + ans + ' type: ' + typeof ans);   
    $.post("/deleteMyPlace",{
        userName:fbName, no:ans},
        function(response){
            console.log("Response: " + response);
    }); 
    var liName = fbName + ans;   
    document.getElementById(liName).remove();
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function turnLatLng(x){
    x = x.substring(1, x.length - 1);
    var location = x.split(',');
    return location;    
}

function createPlace(){
    mapListener = map.addListener('click', function(event) {
      if(fbName == null){
          console.log("you are not login! ");
          alert("您尚未登入facebook！ 請先登入！");
      }
      else{
          document.getElementById("placeName").value='';   
          addLocation = event.latLng ;
          $("#createModal").modal('show');
          //addMarker(event.latLng);  
      }
    });

    //var str = "<input onclick='stopCreate();' type=button value='取消建立'>" ;
    var str = '<button class="btn btn-danger" type="button" onclick="stopCreate();" >取消</button>';
    document.getElementById("floating-panel").innerHTML=str;
    

    var bar = document.getElementById("pac-input");
    bar.placeholder = '點擊任意處建立';
    // str = "<p>點擊任意處建立地點</p>";
    // document.getElementById("text-panel").innerHTML=str;
}

function stopCreate(){
    google.maps.event.clearListeners(map, 'click');
    
    //var str = "<input onclick='createPlace();' type=button value='建立集合點'>" ;
    str = '<button class="btn btn-danger" type="button" onclick="createPlace();" >建立</button>';
    document.getElementById("floating-panel").innerHTML=str; 
    // document.getElementById("text-panel").innerHTML='';  
    var bar = document.getElementById("pac-input");
    bar.placeholder = '搜尋地點...';
}
