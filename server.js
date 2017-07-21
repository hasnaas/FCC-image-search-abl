// server.js

var express = require('express');
var mongo= require('mongodb').MongoClient;
var imageSearch = require('node-google-image-search');
var app = express();

//var liste=[];
var dburl=process.env.DBURL;
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
//app.set("views",__dirname + '/views/')
app.get("/",function(request,response){
  response.sendFile(__dirname+'/views/index.html')
});
app.get("/search/:kw", function (request, response) {
  //unused for the moment
  var fullurl=request.protocol + '://' + request.get('host') + request.originalUrl;
    
  var kw=request.params.kw;
  var offset=0;
  if(request.query.offset!==undefined)
    offset=request.query.offset;
  //record the query
  mongo.connect(dburl,function(err,db){
    if(err)throw err;
    db.collection("image-searches").insert({"term":kw,"when":new Date().toISOString()},function(err,data){
      if(err)throw err;
    });
    setTimeout(function(){db.close()},3000);
  })
 //fetch the results
  //https://www.npmjs.com/package/node-google-image-search
  var results = imageSearch(kw, callback, offset, 10);
 
function callback(results) {
    //console.log(results);
  var reponse=[];
  results.forEach(function(r){
    reponse.push({
      "url":r.link,
      "snippet" : r.snippet,
      "thumbnail" : r.image.thumbnailLink,
      "context" : r.image.contextLink
      
    });
  });
  response.send(reponse);
 }
  
  
})    
    
app.get("/latest",function(request,response){
  mongo.connect(dburl,function(err,db){
    if(err)throw err;
    db.collection('image-searches').find({},{"term":1,"when":1,"_id":0}).sort({"when":-1}).toArray(function(err,documents){
      if(err)throw err;
      response.send(documents);
    });
    db.close();
  });
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
