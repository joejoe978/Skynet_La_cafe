var mongodb         =       require('mongodb');
var database        =       'mongodb://localhost:27017/mobileMap';
var MongoClient     =       mongodb.MongoClient;
var http            =       require("http");
var fs              =       require('fs');
var cp              =       require('child_process');
var bodyParser      =       require('body-parser');
var path 			      = 		  require('path');
var express         =       require("express");
var app             =       express();
var server          =       http.createServer(app);
var io              =       require('socket.io').listen(server);
var nicknames = [];
var collection ;

server.listen(5000,function(){
    console.log("Working on port 5000"); 
});

app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.use(bodyParser());
app.use("/css", express.static(__dirname + '/css'));
app.use("/font-awesome", express.static(__dirname + '/font-awesome'));
app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/less", express.static(__dirname + '/less'));
app.use("/mail", express.static(__dirname + '/mail'));
app.use("/chatJsFile", express.static(__dirname + '/chatJsFile'));

MongoClient.connect(database, function (err, db) {
  if (err) {
      console.log('Connect mongoDB error. Error:', err);
  } 
  else {

      io.sockets.on('connection', function(socket) {
        
        // first time get user position
        app.post('/getuserMap', function(req,res){
            collection = db.collection('users');
            collection.find({'name': req.body.name}).toArray(function (err, result) {
                if(result.length){
                    console.log(req.body.name + " has already in database! ");
                }
                else{
                    var userdata = {name:req.body.name, lat:req.body.lat, lng:req.body.lng, fbID:req.body.fbID};
                    collection.insert(userdata, function(err,result){
                        console.log('First insert ' + req.body.name + ' ' + req.body.lat + ' ' + req.body.lng );
                    });
                }
            });
            res.send("ajax 1 success from server");
        })

        // update my position
        app.post('/updateuserMap', function(req,res){
            collection = db.collection('users');
            console.log("update: " + req.body.name + ' ' + req.body.lat + ' ' + req.body.lng);
            collection.update({name:req.body.name},{ $set:{lat:req.body.lat, lng:req.body.lng} });
            res.send("ajax 2 success from server");
        })                            

        // update all user's position
        app.get('/updateAll',function(req,res){
            collection = db.collection('users');
            //console.log("update all users: ");
            var allTable = [];
            collection.find().toArray(function (err, result) {
                for(var x in result){
                    //console.log("updateAll: " + result[x].name);
                    var userTable = [];
                    userTable[0] = result[x].name;
                    userTable[1] = result[x].lat;
                    userTable[2] = result[x].lng;
                    userTable[3] = result[x].fbID;
                    allTable.push(userTable);
                }
                res.send(allTable);
            });
        })

        // get my place number when login
        app.post('/getPlaceNo',function(req,res){
            collection = db.collection('places');
            var placeNo = []; placeNo[0] = 0;
            collection.find({'name': req.body.name},{'allPlace':1}).toArray(function (err, result) {
                //console.log(result[0].allPlace.length);
                if(result.length){
                    placeNo[0] = result[0].allPlace.length ;  
                    res.send(placeNo);
                    console.log(req.body.name + " placeNo: " + placeNo[0]);    
                }
                else{
                  res.send(placeNo);
                  console.log(req.body.name + " placeNo: " + placeNo[0]);
                }
            });
        }); 

        // update all places
        app.post('/updateAllPlace',function(req,res){
            //var table = [];
            collection = db.collection('places');
              collection.find().toArray(function (err, result) {            
                if(result.length){
                    //table[0] = result;
                    res.send(result);
                }
                else{
                    //table[0] = 'None';
                    res.send("None");
                }  
            });
        });
        
        // add new place 
        app.post('/addPlace',function(req,res){
            collection = db.collection('places');
            
            collection.find({'name': req.body.userName}).toArray(function (err, result) {
                if(result.length){
                    collection.update({name:req.body.userName},
                      { $push:{ allPlace: {no:req.body.no, place:req.body.placeName, location:req.body.location, del:req.body.del} } });
                    console.log("update place " + req.body.userName + ' ' + req.body.placeName);      
                }
                else{
                    console.log("First insert place! ");
                    collection.insert({
                        name:req.body.userName, 
                        allPlace: [{no:req.body.no, place:req.body.placeName, location:req.body.location, del:req.body.del}]  
                    }, function(err,result){
                        if (result) {
                            console.log('First insert' + req.body.userName + ' ' + req.body.placeName);
                        } else {
                            console.log('Failed to Insert');
                        } 
                    });
                }
                res.send("success addPlace! ");

                socket.emit('chat', 'SERVER', req.body.userName + " 建立: " + req.body.placeName);
                socket.broadcast.emit('chat', 'SERVER', req.body.userName + " 建立: " + req.body.placeName);
            });
        });
  
        // delete place
        app.post('/deleteMyPlace',function(req,res){
             collection = db.collection('places');
             var name = req.body.userName ;
             var no = req.body.no;  var placeName ; 

             collection.update(
                { name:req.body.userName , 'allPlace.no': no},
                { $set:{ 'allPlace.$.del' : 1 } } 
             );
             console.log("delete place: " + name + no );
             res.send("deletePlace success!" + req.body.userName +req.body.no);

             collection.find({'name': req.body.userName},
              {'allPlace': { $elemMatch: { 'no':no} } }).toArray(function (err, result) {
                console.log(result[0].allPlace[0].place);
                placeName = result[0].allPlace[0].place;
                socket.emit('chat', 'SERVER', name + " 刪除: " + placeName);
                socket.broadcast.emit('chat', 'SERVER', name + " 刪除: " + placeName);
             });
        });


        // chat room 
        socket.on('new user', function(data){
          if (nicknames.indexOf(data) != -1) {

          } else {
            socket.emit('chat', 'SERVER', '歡迎光臨 ' + data);
            socket.broadcast.emit('chat', 'SERVER', data + '已連線');
            
            socket.nickname = data;
            nicknames.push(socket.nickname);
            io.sockets.emit('usernames', nicknames);
          }
        });

        socket.on('send message', function(data){
          if(socket.nickname == null){
            socket.nickname = '訪客';
          }
          io.sockets.emit('new message', { msg: data, nick: socket.nickname });
        });

        socket.on('disconnect', function(data){
          if (!socket.nickname) return;
          io.sockets.emit('chat', 'SERVER', socket.nickname + ' 已離線');
          nicknames.splice(nicknames.indexOf(socket.nickname), 1);
          io.sockets.emit('usernames', nicknames);
        });
      }); //socket finish
  }
});
