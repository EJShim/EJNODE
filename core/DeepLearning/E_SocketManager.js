function E_SocketManager(Mgr)
{

  this.Mgr = Mgr
  this.socket = io();



  this.HandleSignal();
}

E_SocketManager.prototype.EmitData = function(signal, data)
{
  this.socket.emit(signal, data);
}

E_SocketManager.prototype.HandleSignal = function()
{
  var Mgr = this.Mgr;
  this.socket.on("SIGNAL_INITIALIZE", function(data){
    Mgr.Initialize();
  })
}

module.exports = E_SocketManager;
