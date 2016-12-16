var ES_SocketManager = require("./ES_SocketManager.js");

function ES_Manager(server)
{

  var m_socketMgr = new ES_SocketManager(this, server);

  this.SocketMgr = function()
  {
    return m_socketMgr;
  }

  console.log("Manager Iniitalized");

}

module.exports = ES_Manager;
