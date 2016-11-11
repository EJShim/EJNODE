var E_Manager = require("./E_Manager.js");


//Initialize Manager
var Manager = new E_Manager();
//test
console.log($$("ID_VIEW_MAIN"));

//Interaction
$$("ID_VIEW_MAIN").attachEvent("onResize", function(pos){
  console.log($$("ID_VIEW_MAIN"));
})



///////////////////////////////////TEST INTERACTION////////////////////////////////
