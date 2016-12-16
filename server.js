var express = require('express');
var app = express();
var router = require('./router/main')(app);
var ES_Manager = require("./router/ES_Manager.js");



app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

var server = app.listen(80, function(){
    console.log("Express server has started on port 80")
});

var Manager = new ES_Manager(server);
