var http            =       require("http");
var express         =       require("express");
var app             =       express();
var server          =       http.createServer(app);


server.listen(5000,function(){
    console.log("Working on port 5000"); 
});

app.get('/',function(req,res){
    res.sendFile(__dirname + "/map_test.html");
});

app.use(express.static(__dirname+''));
