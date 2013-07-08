var express = require('express');

var app = express.createServer(express.logger());

var indexBuffer = new Buffer();

app.get('/', function(request, response) {
   response.send(indexBuffer.toString("utc 8", fs.readFileSync("index.html");
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
