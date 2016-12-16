var jsonfile = require("jsonfile");

function ES_SocketManager(Mgr, server)
{
  this.Mgr=  Mgr;

  this.io = require('socket.io').listen(server, {'forceNew':true });

  this.HandleSignal();

}

ES_SocketManager.prototype.EmitData = function(signal, data)
{
  this.io.emit(signal, data);
}

ES_SocketManager.prototype.HandleSignal = function()
{

  this.io.sockets.on('connection', function(socket){
    console.log("client connected");

    socket.emit("SIGNAL_INITIALIZE", null);

    socket.on("WRITE_NEURAL_NET", function(data){
      var file = "./data.json";
      var obj = data;

      jsonfile.writeFile(file, obj, function(err){
        console.log(err);
      });

    });

  })

}

module.exports = ES_SocketManager;
